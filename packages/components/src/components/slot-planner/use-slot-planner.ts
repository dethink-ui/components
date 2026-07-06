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
 * succeed synchronously.
 */
export function useSlotPlannerCrud() {
  const [pendingKeys, setPendingKeys] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [retryByKey, setRetryByKey] = useState<
    ReadonlyMap<string, () => void>
  >(() => new Map());

  const clearError = useCallback((key: string) => {
    setRetryByKey((previous) => {
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
      const storeRetry = () => {
        setRetryByKey((previous) => {
          const next = new Map(previous);

          next.set(key, () => run(operation));

          return next;
        });
      };

      clearError(key);

      let result: void | Promise<void>;

      try {
        result = operation.execute();
      } catch {
        storeRetry();

        return;
      }

      if (result && typeof result.then === "function") {
        setPendingKeys((previous) => new Set(previous).add(key));
        result.then(
          () => {
            removePending();
            operation.onSuccess();
          },
          () => {
            removePending();
            storeRetry();
          },
        );

        return;
      }

      operation.onSuccess();
    },
    [clearError],
  );

  return { clearError, pendingKeys, retryByKey, run };
}

function getLocalIsoDate(dateTime: Date) {
  const month = String(dateTime.getMonth() + 1).padStart(2, "0");
  const day = String(dateTime.getDate()).padStart(2, "0");

  return `${dateTime.getFullYear()}-${month}-${day}`;
}

function getSlotPlannerOccurrenceKey(slotId: string, occurrenceDate: string) {
  return `${slotId}::${occurrenceDate}`;
}

function getSlotPlannerCreateKey(dateIso: string) {
  return `create::${dateIso}`;
}

function getSlotPlannerBatchKey(dateIso: string) {
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

function isCopyableStatus(status: SlotPlannerOccurrenceStatus) {
  return status === "draft" || status === "requestable";
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
  /** Ids for slots created through the editor. Defaults to crypto.randomUUID. */
  generateSlotId?: () => string;
  taxonomy?: SlotPlannerTaxonomyInput;
  /** Expansion range: the focused week or the focused day only. */
  view?: SlotPlannerView;
  /** ISO date-time treated as "now"; injectable for deterministic renders. */
  now?: string;
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
  /** Stable pending/error key of one occurrence. */
  occurrenceKey: (ref: SlotPlannerOccurrenceRef) => string;
  /** Pending/error key of create operations targeting the focused date. */
  createKey: string;
  /** Pending/error key of batch operations fired from the focused date. */
  batchKey: string;
  /** Latest polite live-region message, phrased through the taxonomy. */
  announcement: string;
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
    onUpdateSlot,
    slots,
    taxonomy,
    view = "week",
  } = options;

  const [fallbackNow] = useState(() => new Date().toISOString());
  const resolvedNow = now ?? fallbackNow;
  const todayIso = getLocalIsoDate(new Date(resolvedNow));
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

  const { clearError, pendingKeys, retryByKey, run } = useSlotPlannerCrud();
  const [announcement, setAnnouncement] = useState("");

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
  // Announces the daily cap only when a mutation flips the focused day from
  // under-cap to at-cap; navigating onto an already-full day stays silent.
  const capStateRef = useRef<{ date: string; reached: boolean } | null>(null);

  useEffect(() => {
    const previous = capStateRef.current;

    capStateRef.current = { date: currentFocusedDate, reached: dailyCapReached };

    if (
      previous &&
      previous.date === currentFocusedDate &&
      !previous.reached &&
      dailyCapReached
    ) {
      const capMessage = formatSlotPlannerTemplate(
        resolvedTaxonomy.announceDailyCapReached,
        {
          slot: resolvedTaxonomy.slot,
          slotPlural: resolvedTaxonomy.slotPlural,
        },
      );

      setAnnouncement((current) =>
        current ? `${current}. ${capMessage}` : capMessage,
      );
    }
  }, [currentFocusedDate, dailyCapReached, resolvedTaxonomy]);

  const summarizeDay = useCallback(
    (dateIso: string) => summarizeSlotPlannerDay(occurrencesByDate[dateIso] ?? []),
    [occurrencesByDate],
  );

  const moveWeek = (weeks: number) => {
    setFocusedDate(parseDate(currentFocusedDate).add({ weeks }).toString());
  };

  const generateId = generateSlotId ?? defaultGenerateSlotId;

  const validate = (candidate: SlotPlannerSlotData<TData>) =>
    validateSlotPlannerSlot(candidate, {
      constraints,
      now: resolvedNow,
      slots: resolvedSlots,
    });

  const createSlot = (
    values: SlotPlannerEditorSeriesValues,
    target?: { date?: string },
  ): SlotPlannerViolation[] => {
    const date = target?.date ?? currentFocusedDate;
    const slot = createSlotFromEditorValues<TData>(values, {
      id: generateId(),
      date,
    });
    const violations = validate(slot);

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

  const updateSlot = (
    occurrence: SlotPlannerOccurrence<TData>,
    result: SlotPlannerEditorResult,
  ): SlotPlannerViolation[] => {
    const previous = occurrence.slot;
    const nextSlot =
      result.scope === "occurrence"
        ? upsertSlotPlannerOccurrenceOverride(previous, {
            occurrenceDate: occurrence.occurrenceDate,
            startTime: result.startTime,
            durationMinutes: result.durationMinutes,
          })
        : updateSlotFromEditorValues(previous, result.values);
    const violations = validate(nextSlot);

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

  const deleteOccurrence = (
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

  const deleteSeries = (
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

  const announceBatchResult = (payload: SlotPlannerBatchChangePayload<TData>) => {
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

  const copyDay = (targetDates: string[]) => {
    const sources = selectedOccurrences.filter((occurrence) =>
      isCopyableStatus(occurrence.status),
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

  const copyWeek = () => {
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
        .filter((occurrence) => isCopyableStatus(occurrence.status))
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

  const clearDay = () => {
    const deletedSlotIds: string[] = [];
    const updatedSlots: SlotPlannerSlotData<TData>[] = [];

    for (const occurrence of selectedOccurrences) {
      // Locked statuses (requested, booked, blocked, expired, cancelled)
      // are skipped and kept.
      if (!isCopyableStatus(occurrence.status)) {
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

  return {
    announcement,
    batchKey: getSlotPlannerBatchKey(currentFocusedDate),
    clearDay,
    clearError,
    copyDay,
    copyWeek,
    createKey: getSlotPlannerCreateKey(currentFocusedDate),
    createSlot,
    dailyCap,
    deleteOccurrence,
    deleteSeries,
    focusedDate: currentFocusedDate,
    goToNextWeek: () => moveWeek(1),
    goToPreviousWeek: () => moveWeek(-1),
    goToThisWeek: () => setFocusedDate(todayIso),
    occurrenceKey: (occurrenceRef) =>
      getSlotPlannerOccurrenceKey(
        occurrenceRef.slotId,
        occurrenceRef.occurrenceDate,
      ),
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
  };
}
