import { parseDate } from "@internationalized/date";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  countSlotPlannerPublishedOccurrences,
  validateSlotPlannerSlot,
  validateSlotPlannerSlots,
} from "./slot-planner-constraints";
import type {
  SlotPlannerBatchChangePayload,
  SlotPlannerConstraints,
  SlotPlannerCreatePayload,
  SlotPlannerDeleteOccurrencePayload,
  SlotPlannerDeleteSeriesPayload,
  SlotPlannerOccurrenceRef,
  SlotPlannerOccurrenceStatus,
  SlotPlannerSlotData,
  SlotPlannerSlotPayload,
  SlotPlannerTaxonomy,
  SlotPlannerTaxonomyInput,
  SlotPlannerUpdatePayload,
  SlotPlannerViolation,
} from "./slot-planner-contract";
import {
  applySlotPlannerBatch,
  applySlotPlannerMutation,
  createSlotFromEditorValues,
  updateSlotFromEditorValues,
  upsertSlotPlannerOccurrenceOverride,
  type SlotPlannerEditorResult,
  type SlotPlannerEditorSeriesValues,
  type SlotPlannerMutation,
} from "./slot-planner-crud";
import {
  expandSlotsForRange,
  formatSlotPlannerCountTemplate,
  formatSlotPlannerTemplate,
  getSlotPlannerIsoDateInZone,
  getSlotPlannerWeekDays,
  resolveSlotPlannerTaxonomy,
  summarizeSlotPlannerDay,
  type SlotPlannerOccurrence,
  type SlotPlannerOccurrencesByDate,
} from "./slot-planner-utils";

export type SlotPlannerView = "week" | "day";

/** One in-flight or failed mutation, keyed per slot id + occurrence date. */
export type SlotPlannerCrudOperation = {
  key: string;
  /** Fires the app callback with its (identical-on-retry) payload. */
  execute: () => void | Promise<void>;
  /** Applies internal state, announces, and moves focus after success. */
  onSuccess: () => void;
};

/**
 * Tracks per-key pending and error state for CRUD callbacks. Callbacks that
 * return promises drive pending affordances and settle into success (apply)
 * or a stored retry that re-fires the identical payload. Non-promise returns
 * succeed synchronously. The thrown error / rejection reason for the latest
 * failure of each key is captured in `errorByKey` and forwarded to the
 * optional `onError` callback.
 */
export function useSlotPlannerCrud(
  onError?: (key: string, error: unknown) => void,
) {
  const [pendingKeys, setPendingKeys] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [retryByKey, setRetryByKey] = useState<ReadonlyMap<string, () => void>>(
    () => new Map(),
  );
  const [errorByKey, setErrorByKey] = useState<ReadonlyMap<string, unknown>>(
    () => new Map(),
  );
  // Latest-ref so `run` can stay stable while still calling the freshest
  // `onError` supplied by the consumer.
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const clearError = useCallback((key: string) => {
    setRetryByKey((previous) => {
      if (!previous.has(key)) {
        return previous;
      }

      const next = new Map(previous);

      next.delete(key);

      return next;
    });
    setErrorByKey((previous) => {
      if (!previous.has(key)) {
        return previous;
      }

      const next = new Map(previous);

      next.delete(key);

      return next;
    });
  }, []);

  const run = useCallback(
    (operation: SlotPlannerCrudOperation) => {
      const { key } = operation;
      const removePending = () => {
        setPendingKeys((previous) => {
          const next = new Set(previous);

          next.delete(key);

          return next;
        });
      };
      const recordFailure = (error: unknown) => {
        setRetryByKey((previous) => {
          const next = new Map(previous);

          next.set(key, () => run(operation));

          return next;
        });
        setErrorByKey((previous) => {
          const next = new Map(previous);

          next.set(key, error);

          return next;
        });
        onErrorRef.current?.(key, error);
      };

      clearError(key);

      let result: void | Promise<void>;

      try {
        result = operation.execute();
      } catch (error) {
        recordFailure(error);

        return;
      }

      if (result && typeof result.then === "function") {
        setPendingKeys((previous) => new Set(previous).add(key));
        result.then(
          () => {
            removePending();
            operation.onSuccess();
          },
          (reason: unknown) => {
            removePending();
            recordFailure(reason);
          },
        );

        return;
      }

      operation.onSuccess();
    },
    [clearError],
  );

  return { clearError, errorByKey, pendingKeys, retryByKey, run };
}

function getEnvironmentTimeZone() {
  return new Intl.DateTimeFormat().resolvedOptions().timeZone;
}

function getSlotPlannerOccurrenceKey(slotId: string, occurrenceDate: string) {
  return `${slotId}::${occurrenceDate}`;
}

/** Pending/error key of create operations targeting a given ISO date. */
export function getSlotPlannerCreateKey(dateIso: string) {
  return `create::${dateIso}`;
}

/** Pending/error key of batch (copy/clear) operations fired from an ISO date. */
export function getSlotPlannerBatchKey(dateIso: string) {
  return `batch:${dateIso}`;
}

/**
 * Builds the non-recurring copy of one draft/requestable occurrence for
 * copy-day and copy-week. The resolved wall-clock start and duration (after
 * overrides), buffers, zone, and `data` are copied; recurrence and
 * booked/requested counts are dropped and the copy is always requestable.
 */
function buildCopiedSlot<TData extends SlotPlannerSlotPayload>(
  occurrence: SlotPlannerOccurrence<TData>,
  targetDate: string,
  id: string,
): SlotPlannerSlotData<TData> {
  const source = occurrence.slot;

  return {
    id,
    date: targetDate,
    startTime: occurrence.startTime,
    durationMinutes: occurrence.durationMinutes,
    timeZone: source.timeZone,
    state: "requestable",
    ...(source.capacity !== undefined ? { capacity: source.capacity } : {}),
    ...(source.bufferBeforeMinutes !== undefined
      ? { bufferBeforeMinutes: source.bufferBeforeMinutes }
      : {}),
    ...(source.bufferAfterMinutes !== undefined
      ? { bufferAfterMinutes: source.bufferAfterMinutes }
      : {}),
    ...(source.data !== undefined ? { data: source.data } : {}),
  };
}

function defaultGenerateSlotId() {
  return crypto.randomUUID();
}

function isMutableAvailabilityStatus(status: SlotPlannerOccurrenceStatus) {
  return (
    status === "draft" || status === "requestable" || status === "requested"
  );
}

/**
 * Options accepted by `useSlotPlanner`. A strict subset of
 * `SlotPlannerProps`: everything non-visual the planner needs — the slot
 * collection, focus, taxonomy, constraints, and the mutation callbacks.
 */
export interface UseSlotPlannerOptions<
  TData extends SlotPlannerSlotPayload = SlotPlannerSlotPayload,
> {
  /** Controlled slot collection. */
  slots?: SlotPlannerSlotData<TData>[];
  /** Initial slot collection for uncontrolled usage. */
  defaultSlots?: SlotPlannerSlotData<TData>[];
  /** Controlled focused ISO date (`YYYY-MM-DD`). */
  focusedDate?: string;
  /** Initial focused ISO date for uncontrolled usage. Defaults to today. */
  defaultFocusedDate?: string;
  onFocusedDateChange?: (dateIso: string) => void;
  onCreateSlot?: (
    payload: SlotPlannerCreatePayload<TData>,
  ) => void | Promise<void>;
  onUpdateSlot?: (
    payload: SlotPlannerUpdatePayload<TData>,
  ) => void | Promise<void>;
  onDeleteOccurrence?: (
    payload: SlotPlannerDeleteOccurrencePayload,
  ) => void | Promise<void>;
  onDeleteSeries?: (
    payload: SlotPlannerDeleteSeriesPayload,
  ) => void | Promise<void>;
  /** Declarative rules; see `SlotPlannerProps.constraints`. */
  constraints?: SlotPlannerConstraints;
  /** Fires for copy-day, copy-week, and clear-day batch operations. */
  onBatchChange?: (
    payload: SlotPlannerBatchChangePayload<TData>,
  ) => void | Promise<void>;
  /**
   * Fires when a mutation callback throws or its promise rejects, with the
   * failing operation's key and the thrown error / rejection reason. The retry
   * affordance (`retryByKey`) still surfaces regardless; this is an additive
   * hook for logging or toast surfaces.
   */
  onMutationError?: (key: string, error: unknown) => void;
  /** Ids for slots created through the editor. Defaults to crypto.randomUUID. */
  generateSlotId?: () => string;
  taxonomy?: SlotPlannerTaxonomyInput;
  /** Expansion range: the focused week or the focused day only. */
  view?: SlotPlannerView;
  /** ISO date-time treated as "now"; injectable for deterministic renders. */
  now?: string;
  /** IANA zone used for manage-mode "today" and past-day state. */
  timeZone?: string;
  locale?: string;
}

/** Per-action options accepted by the delete dispatchers. */
export interface UseSlotPlannerActionOptions {
  /**
   * Fires after the callback succeeds and internal state (uncontrolled) has
   * applied — the component layer uses it to schedule focus recovery.
   */
  onApplied?: () => void;
}

/** Focused-day daily-cap meter data. */
export type SlotPlannerDailyCapInfo = {
  /** Published (requestable/requested/booked) occurrences on the day. */
  used: number;
  cap: number;
  reached: boolean;
};

/** Focused-week weekly-cap meter data. */
export type SlotPlannerWeeklyCapInfo = {
  /** Published (requestable/requested/booked) occurrences in the focused week. */
  used: number;
  cap: number;
  reached: boolean;
};

/**
 * Everything `useSlotPlanner` returns: resolved state and data (all
 * JSON-friendly) plus action dispatchers. The dispatchers wrap the same
 * validate → callback → apply → announce machinery the shipped component
 * uses, so a fully custom layout keeps identical payload and controlled /
 * uncontrolled semantics.
 */
export interface UseSlotPlannerReturn<
  TData extends SlotPlannerSlotPayload = SlotPlannerSlotPayload,
> {
  /** Taxonomy after merging the partial input over the defaults. */
  taxonomy: SlotPlannerTaxonomy;
  /** Local ISO date (`YYYY-MM-DD`) derived from `now`. */
  todayIso: string;
  /** Currently focused ISO date. */
  focusedDate: string;
  setFocusedDate: (dateIso: string) => void;
  /** The focused week's 7 ISO dates, Monday first. */
  weekDays: string[];
  goToPreviousWeek: () => void;
  goToNextWeek: () => void;
  /** Moves the focus back to today. */
  goToThisWeek: () => void;
  /** Resolved slot collection (the controlled prop or internal state). */
  slots: SlotPlannerSlotData<TData>[];
  /** Expanded occurrences for the visible range, grouped by ISO date. */
  occurrencesByDate: SlotPlannerOccurrencesByDate<TData>;
  /** The focused day's occurrences, sorted by wall-clock start. */
  selectedOccurrences: SlotPlannerOccurrence<TData>[];
  /** Counts one visible day's occurrences per derived status. */
  summarizeDay: (
    dateIso: string,
  ) => Record<SlotPlannerOccurrenceStatus, number>;
  /** Focused-day cap info; undefined without a `dailyRequestableCap`. */
  dailyCap: SlotPlannerDailyCapInfo | undefined;
  /** Focused-week cap info; undefined without a `weeklyRequestableCap`. */
  weeklyCap: SlotPlannerWeeklyCapInfo | undefined;
  /** Validates a candidate against the current collection and "now". */
  validate: (candidate: SlotPlannerSlotData<TData>) => SlotPlannerViolation[];
  /**
   * Validates and dispatches a create from editor values. Returns the
   * violations that blocked it, or `[]` once the callback has been fired.
   * Targets the focused date unless `target.date` overrides it.
   */
  createSlot: (
    values: SlotPlannerEditorSeriesValues,
    target?: { date?: string },
  ) => SlotPlannerViolation[];
  /**
   * Validates and dispatches an occurrence- or series-scope update built
   * from an editor result. Returns the blocking violations, or `[]`.
   */
  updateSlot: (
    occurrence: SlotPlannerOccurrence<TData>,
    result: SlotPlannerEditorResult,
  ) => SlotPlannerViolation[];
  deleteOccurrence: (
    occurrence: SlotPlannerOccurrence<TData>,
    options?: UseSlotPlannerActionOptions,
  ) => void;
  deleteSeries: (
    occurrence: SlotPlannerOccurrence<TData>,
    options?: UseSlotPlannerActionOptions,
  ) => void;
  /** Copies the focused day's copyable occurrences to the target dates. */
  copyDay: (targetDates: string[]) => void;
  /** Copies the focused week's copyable occurrences one week forward. */
  copyWeek: () => void;
  /** Clears the focused day, keeping locked occurrences. */
  clearDay: () => void;
  /** Keys with an in-flight callback promise. */
  pendingKeys: ReadonlySet<string>;
  /** Retry dispatchers stored per failed key; re-fire identical payloads. */
  retryByKey: ReadonlyMap<string, () => void>;
  clearError: (key: string) => void;
  /**
   * Thrown error / rejection reason of the latest failure per key. An entry is
   * present exactly while its `retryByKey` retry is; cleared on retry/success.
   */
  errors: ReadonlyMap<string, unknown>;
  /** Stable pending/error key of one occurrence. */
  occurrenceKey: (ref: SlotPlannerOccurrenceRef) => string;
  /** Pending/error key of create operations targeting the focused date. */
  createKey: string;
  /** Pending/error key of batch operations fired from the focused date. */
  batchKey: string;
  /** Latest polite live-region message, phrased through the taxonomy. */
  announcement: string;
  /**
   * Advances on every announcement, including repeats of an identical
   * message. Renderers key the live region on it so repeated announcements
   * still mutate the DOM and are read out.
   */
  announcementNonce: number;
}

/**
 * Headless SlotPlanner state: week navigation, occurrence expansion,
 * constraint validation, CRUD/batch dispatch with pending/error/retry
 * tracking, and taxonomy-phrased announcements. No JSX, no DOM, no Motion —
 * the shipped `SlotPlanner` component is a renderer over this hook, and a
 * fully custom layout can consume it directly.
 */
export function useSlotPlanner<
  TData extends SlotPlannerSlotPayload = SlotPlannerSlotPayload,
>(options: UseSlotPlannerOptions<TData>): UseSlotPlannerReturn<TData> {
  const {
    constraints,
    defaultFocusedDate,
    defaultSlots,
    focusedDate,
    generateSlotId,
    locale = "en",
    now,
    onBatchChange,
    onCreateSlot,
    onDeleteOccurrence,
    onDeleteSeries,
    onFocusedDateChange,
    onMutationError,
    onUpdateSlot,
    slots,
    taxonomy,
    timeZone,
    view = "week",
  } = options;

  const [fallbackNow] = useState(() => new Date().toISOString());
  const [fallbackTimeZone] = useState(getEnvironmentTimeZone);
  const resolvedTimeZone = timeZone ?? fallbackTimeZone;
  const resolvedNow = now ?? fallbackNow;
  const todayIso = getSlotPlannerIsoDateInZone(
    Date.parse(resolvedNow),
    resolvedTimeZone,
  );
  const resolvedTaxonomy = useMemo(
    () => resolveSlotPlannerTaxonomy(taxonomy),
    [taxonomy],
  );
  const [internalSlots, setInternalSlots] = useState<
    SlotPlannerSlotData<TData>[]
  >(() => defaultSlots ?? []);
  const resolvedSlots = slots ?? internalSlots;
  // Ref so promise callbacks resolve controlled-ness at settle time, not at
  // the render that fired the mutation.
  const slotsControlledRef = useRef(slots !== undefined);
  slotsControlledRef.current = slots !== undefined;
  const [internalFocusedDate, setInternalFocusedDate] = useState(
    () => defaultFocusedDate ?? todayIso,
  );
  const currentFocusedDate = focusedDate ?? internalFocusedDate;
  const setFocusedDate = useCallback(
    (nextDate: string) => {
      if (focusedDate === undefined) {
        setInternalFocusedDate(nextDate);
      }

      if (nextDate !== currentFocusedDate) {
        onFocusedDateChange?.(nextDate);
      }
    },
    [currentFocusedDate, focusedDate, onFocusedDateChange],
  );

  const weekDays = useMemo(
    () => getSlotPlannerWeekDays(currentFocusedDate),
    [currentFocusedDate],
  );
  const rangeStart = view === "week" ? weekDays[0]! : currentFocusedDate;
  const rangeEnd = view === "week" ? weekDays[6]! : currentFocusedDate;
  const occurrencesByDate = useMemo(
    () => expandSlotsForRange(resolvedSlots, rangeStart, rangeEnd, resolvedNow),
    [rangeEnd, rangeStart, resolvedNow, resolvedSlots],
  );
  const selectedOccurrences = occurrencesByDate[currentFocusedDate] ?? [];

  const { clearError, errorByKey, pendingKeys, retryByKey, run } =
    useSlotPlannerCrud(onMutationError);
  // The nonce advances on every announcement so identical consecutive
  // messages still change state (and, via `announcementNonce`, still mutate
  // the live region's DOM) instead of being dropped by React's bail-out.
  const [announcementState, setAnnouncementState] = useState<{
    text: string;
    nonce: number;
  }>(() => ({ nonce: 0, text: "" }));
  const setAnnouncement = useCallback(
    (next: string | ((current: string) => string)) => {
      setAnnouncementState((previous) => ({
        nonce: previous.nonce + 1,
        text: typeof next === "function" ? next(previous.text) : next,
      }));
    },
    [],
  );
  const announcement = announcementState.text;

  const applyMutation = useCallback((mutation: SlotPlannerMutation<TData>) => {
    // Controlled collections are never self-mutated: the app owns them and
    // updates the `slots` prop after handling the callback.
    if (!slotsControlledRef.current) {
      setInternalSlots((previous) =>
        applySlotPlannerMutation(previous, mutation),
      );
    }
  }, []);

  const announce = useCallback(
    (template: string) => {
      setAnnouncement(
        formatSlotPlannerTemplate(template, {
          slot: resolvedTaxonomy.slot,
          slotPlural: resolvedTaxonomy.slotPlural,
        }),
      );
    },
    [resolvedTaxonomy],
  );

  const capLimit = constraints?.dailyRequestableCap;
  const dailyCapUsed = useMemo(
    () =>
      capLimit === undefined
        ? 0
        : countSlotPlannerPublishedOccurrences(
            resolvedSlots,
            currentFocusedDate,
            resolvedNow,
          ),
    [capLimit, currentFocusedDate, resolvedNow, resolvedSlots],
  );
  const dailyCapReached = capLimit !== undefined && dailyCapUsed >= capLimit;
  const dailyCap: SlotPlannerDailyCapInfo | undefined =
    capLimit === undefined
      ? undefined
      : { cap: capLimit, reached: dailyCapReached, used: dailyCapUsed };
  const weeklyCapLimit = constraints?.weeklyRequestableCap;
  const weeklyCapUsed = useMemo(
    () =>
      weeklyCapLimit === undefined
        ? 0
        : weekDays.reduce(
            (total, date) =>
              total +
              countSlotPlannerPublishedOccurrences(
                resolvedSlots,
                date,
                resolvedNow,
              ),
            0,
          ),
    [resolvedNow, resolvedSlots, weekDays, weeklyCapLimit],
  );
  const weeklyCapReached =
    weeklyCapLimit !== undefined && weeklyCapUsed >= weeklyCapLimit;
  const weeklyCap: SlotPlannerWeeklyCapInfo | undefined =
    weeklyCapLimit === undefined
      ? undefined
      : { cap: weeklyCapLimit, reached: weeklyCapReached, used: weeklyCapUsed };
  // Announces caps only when a mutation flips the same focused range from
  // under-cap to at-cap; navigating onto an already-full range stays silent.
  const capStateRef = useRef<{
    date: string;
    dailyReached: boolean;
    weekStart: string;
    weeklyReached: boolean;
  } | null>(null);

  useEffect(() => {
    const previous = capStateRef.current;
    const weekStart = weekDays[0]!;

    capStateRef.current = {
      dailyReached: dailyCapReached,
      date: currentFocusedDate,
      weeklyReached: weeklyCapReached,
      weekStart,
    };

    if (!previous) {
      return;
    }

    const messages: string[] = [];
    const nounTokens = {
      slot: resolvedTaxonomy.slot,
      slotPlural: resolvedTaxonomy.slotPlural,
    };

    if (
      previous.date === currentFocusedDate &&
      !previous.dailyReached &&
      dailyCapReached
    ) {
      messages.push(
        formatSlotPlannerTemplate(
          resolvedTaxonomy.announceDailyCapReached,
          nounTokens,
        ),
      );
    }

    if (
      previous.weekStart === weekStart &&
      !previous.weeklyReached &&
      weeklyCapReached
    ) {
      messages.push(
        formatSlotPlannerTemplate(
          resolvedTaxonomy.announceWeeklyCapReached,
          nounTokens,
        ),
      );
    }

    if (messages.length > 0) {
      setAnnouncement((current) =>
        current ? `${current}. ${messages.join(". ")}` : messages.join(". "),
      );
    }
  }, [
    currentFocusedDate,
    dailyCapReached,
    resolvedTaxonomy,
    weekDays,
    weeklyCapReached,
  ]);

  const summarizeDay = useCallback(
    (dateIso: string) =>
      summarizeSlotPlannerDay(occurrencesByDate[dateIso] ?? []),
    [occurrencesByDate],
  );

  const moveWeek = (weeks: number) => {
    setFocusedDate(parseDate(currentFocusedDate).add({ weeks }).toString());
  };

  const announcedWeekStartRef = useRef(weekDays[0]!);

  useEffect(() => {
    const weekStart = weekDays[0]!;

    if (announcedWeekStartRef.current === weekStart) {
      return;
    }

    announcedWeekStartRef.current = weekStart;
    setAnnouncement(
      formatSlotPlannerTemplate(resolvedTaxonomy.announceWeekChanged, {
        slot: resolvedTaxonomy.slot,
        slotPlural: resolvedTaxonomy.slotPlural,
        weekStart,
      }),
    );
  }, [resolvedTaxonomy, weekDays]);

  const generateId = generateSlotId ?? defaultGenerateSlotId;

  // Dispatcher bodies are re-created each render as closures over the current
  // values, then routed through `latestRef` below so the *returned* dispatchers
  // can be stable (empty-dependency `useCallback`) without going stale.
  const runValidation = (candidate: SlotPlannerSlotData<TData>) =>
    validateSlotPlannerSlot(candidate, {
      constraints,
      now: resolvedNow,
      slots: resolvedSlots,
    });

  const createSlotImpl = (
    values: SlotPlannerEditorSeriesValues,
    target?: { date?: string },
  ): SlotPlannerViolation[] => {
    const date = target?.date ?? currentFocusedDate;
    const slot = createSlotFromEditorValues<TData>(values, {
      id: generateId(),
      date,
    });
    const violations = runValidation(slot);

    if (violations.length > 0) {
      return violations;
    }

    const payload: SlotPlannerCreatePayload<TData> = { slot };

    run({
      key: getSlotPlannerCreateKey(date),
      execute: () => onCreateSlot?.(payload),
      onSuccess: () => {
        applyMutation({ type: "create", slot });
        announce(resolvedTaxonomy.announceCreated);
      },
    });

    return [];
  };

  const updateSlotImpl = (
    occurrence: SlotPlannerOccurrence<TData>,
    result: SlotPlannerEditorResult,
  ): SlotPlannerViolation[] => {
    const previous = occurrence.slot;
    const nextSlot =
      result.scope === "occurrence"
        ? previous.recurrence
          ? upsertSlotPlannerOccurrenceOverride(previous, {
              occurrenceDate: occurrence.occurrenceDate,
              startTime: result.startTime,
              durationMinutes: result.durationMinutes,
            })
          : // Non-recurring slots have no per-occurrence overrides, so the
            // occurrence edit applies directly to the single slot instead of
            // writing an override that would be a silent no-op.
            {
              ...previous,
              startTime: result.startTime,
              durationMinutes: result.durationMinutes,
            }
        : updateSlotFromEditorValues(previous, result.values);
    const violations = runValidation(nextSlot);

    if (violations.length > 0) {
      return violations;
    }

    const payload: SlotPlannerUpdatePayload<TData> = {
      slot: nextSlot,
      previous,
    };

    run({
      key: getSlotPlannerOccurrenceKey(
        occurrence.slotId,
        occurrence.occurrenceDate,
      ),
      execute: () => onUpdateSlot?.(payload),
      onSuccess: () => {
        applyMutation({ type: "update", slot: nextSlot });
        announce(resolvedTaxonomy.announceUpdated);
      },
    });

    return [];
  };

  const deleteOccurrenceImpl = (
    occurrence: SlotPlannerOccurrence<TData>,
    actionOptions?: UseSlotPlannerActionOptions,
  ) => {
    const payload: SlotPlannerDeleteOccurrencePayload = {
      slotId: occurrence.slotId,
      occurrenceDate: occurrence.occurrenceDate,
    };

    run({
      key: getSlotPlannerOccurrenceKey(
        occurrence.slotId,
        occurrence.occurrenceDate,
      ),
      execute: () => onDeleteOccurrence?.(payload),
      onSuccess: () => {
        applyMutation({ type: "delete-occurrence", ...payload });
        announce(resolvedTaxonomy.announceDeleted);
        actionOptions?.onApplied?.();
      },
    });
  };

  const deleteSeriesImpl = (
    occurrence: SlotPlannerOccurrence<TData>,
    actionOptions?: UseSlotPlannerActionOptions,
  ) => {
    const payload: SlotPlannerDeleteSeriesPayload = {
      slotId: occurrence.slotId,
    };

    run({
      key: getSlotPlannerOccurrenceKey(
        occurrence.slotId,
        occurrence.occurrenceDate,
      ),
      execute: () => onDeleteSeries?.(payload),
      onSuccess: () => {
        applyMutation({ type: "delete-series", slotId: payload.slotId });
        announce(resolvedTaxonomy.announceSeriesDeleted);
        actionOptions?.onApplied?.();
      },
    });
  };

  const announceBatchResult = (
    payload: SlotPlannerBatchChangePayload<TData>,
  ) => {
    const nounTokens = {
      slot: resolvedTaxonomy.slot,
      slotPlural: resolvedTaxonomy.slotPlural,
    };
    const applied = formatSlotPlannerCountTemplate(
      resolvedTaxonomy.announceBatchApplied,
      payload.createdSlots.length,
      nounTokens,
      locale,
    );
    const rejectedCount = Object.keys(payload.violations).length;

    setAnnouncement(
      rejectedCount > 0
        ? `${applied}. ${formatSlotPlannerCountTemplate(
            resolvedTaxonomy.announceBatchRejected,
            rejectedCount,
            nounTokens,
            locale,
          )}`
        : applied,
    );
  };

  // Copy/clear operations share one run() key per focused date, so the
  // pending/error affordance renders on the day-action row that fired it.
  const runBatch = (
    payload: SlotPlannerBatchChangePayload<TData>,
    onApplied: (payload: SlotPlannerBatchChangePayload<TData>) => void,
  ) => {
    run({
      key: getSlotPlannerBatchKey(currentFocusedDate),
      execute: () => onBatchChange?.(payload),
      onSuccess: () => {
        // Controlled collections fire the callback but never self-mutate.
        if (!slotsControlledRef.current) {
          setInternalSlots((previous) =>
            applySlotPlannerBatch(previous, payload),
          );
        }

        onApplied(payload);
      },
    });
  };

  const buildCopyPayload = (
    candidates: SlotPlannerSlotData<TData>[],
  ): SlotPlannerBatchChangePayload<TData> => {
    const violations = validateSlotPlannerSlots(candidates, {
      constraints,
      now: resolvedNow,
      slots: resolvedSlots,
    });

    return {
      createdSlots: candidates.filter(
        (candidate) => !(candidate.id in violations),
      ),
      deletedSlotIds: [],
      violations,
    };
  };

  const copyDayImpl = (targetDates: string[]) => {
    const sources = selectedOccurrences.filter((occurrence) =>
      isMutableAvailabilityStatus(occurrence.status),
    );
    const candidates = [...targetDates]
      .sort()
      .flatMap((targetDate) =>
        sources.map((occurrence) =>
          buildCopiedSlot(occurrence, targetDate, generateId()),
        ),
      );

    runBatch(buildCopyPayload(candidates), announceBatchResult);
  };

  const copyWeekImpl = () => {
    // Day view still copies the whole focused week, so the week's
    // occurrences are expanded on demand rather than reusing the view range.
    const weekOccurrences = expandSlotsForRange(
      resolvedSlots,
      weekDays[0]!,
      weekDays[6]!,
      resolvedNow,
    );
    const candidates = weekDays.flatMap((day) =>
      (weekOccurrences[day] ?? [])
        .filter((occurrence) => isMutableAvailabilityStatus(occurrence.status))
        .map((occurrence) =>
          buildCopiedSlot(
            occurrence,
            parseDate(day).add({ days: 7 }).toString(),
            generateId(),
          ),
        ),
    );

    runBatch(buildCopyPayload(candidates), announceBatchResult);
  };

  const clearDayImpl = () => {
    const deletedSlotIds: string[] = [];
    const updatedSlots: SlotPlannerSlotData<TData>[] = [];

    for (const occurrence of selectedOccurrences) {
      // Locked statuses (booked, blocked, expired, cancelled) are skipped
      // and kept.
      if (!isMutableAvailabilityStatus(occurrence.status)) {
        continue;
      }

      if (occurrence.isRecurring) {
        updatedSlots.push(
          upsertSlotPlannerOccurrenceOverride(occurrence.slot, {
            cancelled: true,
            occurrenceDate: occurrence.occurrenceDate,
          }),
        );
      } else {
        deletedSlotIds.push(occurrence.slotId);
      }
    }

    const payload: SlotPlannerBatchChangePayload<TData> = {
      createdSlots: [],
      deletedSlotIds,
      ...(updatedSlots.length > 0 ? { updatedSlots } : {}),
      violations: {},
    };

    runBatch(payload, () => {
      announce(resolvedTaxonomy.announceDayCleared);
    });
  };

  // Latest-ref of the freshly-closed-over dispatcher bodies, refreshed every
  // render. The returned dispatchers below read through it, so their own
  // identities stay stable while still running against current state.
  const latestRef = useRef<{
    clearDayImpl: () => void;
    copyDayImpl: (targetDates: string[]) => void;
    copyWeekImpl: () => void;
    createSlotImpl: (
      values: SlotPlannerEditorSeriesValues,
      target?: { date?: string },
    ) => SlotPlannerViolation[];
    deleteOccurrenceImpl: (
      occurrence: SlotPlannerOccurrence<TData>,
      options?: UseSlotPlannerActionOptions,
    ) => void;
    deleteSeriesImpl: (
      occurrence: SlotPlannerOccurrence<TData>,
      options?: UseSlotPlannerActionOptions,
    ) => void;
    moveWeek: (weeks: number) => void;
    runValidation: (
      candidate: SlotPlannerSlotData<TData>,
    ) => SlotPlannerViolation[];
    setFocusedDate: (dateIso: string) => void;
    todayIso: string;
    updateSlotImpl: (
      occurrence: SlotPlannerOccurrence<TData>,
      result: SlotPlannerEditorResult,
    ) => SlotPlannerViolation[];
  }>(null!);
  latestRef.current = {
    clearDayImpl,
    copyDayImpl,
    copyWeekImpl,
    createSlotImpl,
    deleteOccurrenceImpl,
    deleteSeriesImpl,
    moveWeek,
    runValidation,
    setFocusedDate,
    todayIso,
    updateSlotImpl,
  };

  const validate = useCallback(
    (candidate: SlotPlannerSlotData<TData>) =>
      latestRef.current.runValidation(candidate),
    [],
  );
  const createSlot = useCallback(
    (values: SlotPlannerEditorSeriesValues, target?: { date?: string }) =>
      latestRef.current.createSlotImpl(values, target),
    [],
  );
  const updateSlot = useCallback(
    (
      occurrence: SlotPlannerOccurrence<TData>,
      result: SlotPlannerEditorResult,
    ) => latestRef.current.updateSlotImpl(occurrence, result),
    [],
  );
  const deleteOccurrence = useCallback(
    (
      occurrence: SlotPlannerOccurrence<TData>,
      actionOptions?: UseSlotPlannerActionOptions,
    ) => latestRef.current.deleteOccurrenceImpl(occurrence, actionOptions),
    [],
  );
  const deleteSeries = useCallback(
    (
      occurrence: SlotPlannerOccurrence<TData>,
      actionOptions?: UseSlotPlannerActionOptions,
    ) => latestRef.current.deleteSeriesImpl(occurrence, actionOptions),
    [],
  );
  const copyDay = useCallback(
    (targetDates: string[]) => latestRef.current.copyDayImpl(targetDates),
    [],
  );
  const copyWeek = useCallback(() => latestRef.current.copyWeekImpl(), []);
  const clearDay = useCallback(() => latestRef.current.clearDayImpl(), []);
  const goToNextWeek = useCallback(() => latestRef.current.moveWeek(1), []);
  const goToPreviousWeek = useCallback(
    () => latestRef.current.moveWeek(-1),
    [],
  );
  const goToThisWeek = useCallback(
    () => latestRef.current.setFocusedDate(latestRef.current.todayIso),
    [],
  );
  const occurrenceKey = useCallback(
    (occurrenceRef: SlotPlannerOccurrenceRef) =>
      getSlotPlannerOccurrenceKey(
        occurrenceRef.slotId,
        occurrenceRef.occurrenceDate,
      ),
    [],
  );

  const batchKey = getSlotPlannerBatchKey(currentFocusedDate);
  const createKey = getSlotPlannerCreateKey(currentFocusedDate);

  return useMemo<UseSlotPlannerReturn<TData>>(
    () => ({
      announcement,
      announcementNonce: announcementState.nonce,
      batchKey,
      clearDay,
      clearError,
      copyDay,
      copyWeek,
      createKey,
      createSlot,
      dailyCap,
      deleteOccurrence,
      deleteSeries,
      errors: errorByKey,
      focusedDate: currentFocusedDate,
      goToNextWeek,
      goToPreviousWeek,
      goToThisWeek,
      occurrenceKey,
      occurrencesByDate,
      pendingKeys,
      retryByKey,
      selectedOccurrences,
      setFocusedDate,
      slots: resolvedSlots,
      summarizeDay,
      taxonomy: resolvedTaxonomy,
      todayIso,
      updateSlot,
      validate,
      weekDays,
      weeklyCap,
    }),
    [
      announcement,
      announcementState.nonce,
      batchKey,
      clearDay,
      clearError,
      copyDay,
      copyWeek,
      createKey,
      createSlot,
      dailyCap,
      deleteOccurrence,
      deleteSeries,
      errorByKey,
      currentFocusedDate,
      goToNextWeek,
      goToPreviousWeek,
      goToThisWeek,
      occurrenceKey,
      occurrencesByDate,
      pendingKeys,
      retryByKey,
      selectedOccurrences,
      setFocusedDate,
      resolvedSlots,
      summarizeDay,
      resolvedTaxonomy,
      todayIso,
      updateSlot,
      validate,
      weekDays,
      weeklyCap,
    ],
  );
}
