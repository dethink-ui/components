import {
  Fragment,
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ForwardedRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  type RefAttributes,
} from "react";
import { AnimatePresence, MotionConfig, useReducedMotion } from "motion/react";
import { cn } from "../../utils/cn";
import {
  slotPlannerOccurrenceStatuses,
  type SlotPlannerBatchChangePayload,
  type SlotPlannerConstraints,
  type SlotPlannerCreatePayload,
  type SlotPlannerDeleteOccurrencePayload,
  type SlotPlannerDeleteSeriesPayload,
  type SlotPlannerOccurrenceStatus,
  type SlotPlannerSlotData,
  type SlotPlannerSlotPayload,
  type SlotPlannerTaxonomy,
  type SlotPlannerTaxonomyInput,
  type SlotPlannerUpdatePayload,
  type SlotPlannerViolation,
} from "./slot-planner-contract";
import type {
  SlotPlannerEditorResult,
  SlotPlannerEditorSeriesValues,
} from "./slot-planner-crud";
import {
  ChevronIcon,
  getConventionalSlotData,
  getSlotPlannerDirection,
  slotPlannerChipClasses,
  slotPlannerDayPanelClasses,
  slotPlannerDayRailClasses,
  slotPlannerDayTabClasses,
  slotPlannerDayTabContentClasses,
  slotPlannerRootClasses,
  slotPlannerSaveErrorClasses,
  slotPlannerSavePendingClasses,
  slotPlannerSlotActionButtonClasses,
  slotPlannerSlotCardClasses,
  slotPlannerStatusBadgeClasses,
  slotPlannerStatusDotClasses,
  slotPlannerToolbarButtonClasses,
  slotPlannerToolbarClasses,
  slotPlannerWeekPanelContentClasses,
  toUtcDate,
} from "./slot-planner-dom-shared";
import {
  SlotPlannerBatchConfirmDialog,
  SlotPlannerCopyDayDialog,
  SlotPlannerDeleteDialog,
  SlotPlannerEditorDialog,
} from "./slot-planner-editor";
import {
  SlotPlannerCapMeterFill,
  SlotPlannerDayTabContent,
  SlotPlannerDayTabIndicator,
  SlotPlannerSlotListItem,
  SlotPlannerWeekSlide,
} from "./slot-planner-motion";
import type {
  SlotPlannerRenderers,
  SlotPlannerTagRenderContext,
} from "./slot-planner-renderers";
import {
  formatSlotPlannerCountTemplate,
  formatSlotPlannerTemplate,
  type SlotPlannerOccurrence,
} from "./slot-planner-utils";
import { useSlotPlanner, type SlotPlannerView } from "./use-slot-planner";

export interface SlotPlannerProps<
  TData extends SlotPlannerSlotPayload = SlotPlannerSlotPayload,
> extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "title"> {
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
  /**
   * Declarative rules validated on editor saves and batch operations, and
   * surfaced by the daily cap meter. Enforcement authority stays with the
   * app; the planner blocks its own affordances only.
   */
  constraints?: SlotPlannerConstraints;
  /** Fires for copy-day, copy-week, and clear-day batch operations. */
  onBatchChange?: (
    payload: SlotPlannerBatchChangePayload<TData>,
  ) => void | Promise<void>;
  /** Ids for slots created through the editor. Defaults to crypto.randomUUID. */
  generateSlotId?: () => string;
  taxonomy?: SlotPlannerTaxonomyInput;
  view?: SlotPlannerView;
  /** ISO date-time treated as "now"; injectable for deterministic renders. */
  now?: string;
  title?: ReactNode;
  locale?: string;
  /**
   * Forces the reduced-motion rendering path. Defaults to the viewer's
   * `prefers-reduced-motion` preference. When reduced, every animation
   * collapses to an instant state change; all state stays communicated by
   * text and data attributes either way.
   */
  reducedMotion?: boolean;
  /**
   * Optional render props, one per surface, each with a `renderDefault()`
   * escape hatch. Structural invariants (day-rail tab semantics, the
   * slot-card `<li>` wrapper, the live region, dialog focus containment,
   * post-delete focus recovery) stay outside the render slots.
   */
  renderers?: SlotPlannerRenderers<TData>;
}

const slotPlannerAddSlotButtonClasses =
  "inline-flex h-8 items-center justify-center self-start rounded-md border border-dashed border-border bg-background px-[var(--dt-space-3)] text-sm font-medium text-foreground shadow-sm motion-safe:transition-colors motion-safe:duration-150 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50";

const lockedOccurrenceStatuses = new Set<SlotPlannerOccurrenceStatus>([
  "requested",
  "booked",
  "blocked",
  "expired",
  "cancelled",
]);

function getWallClockEndTime(startTime: string, durationMinutes: number) {
  const [hours = 0, minutes = 0] = startTime.split(":").map(Number);
  const total = (hours * 60 + minutes + durationMinutes) % (24 * 60);
  const endHours = String(Math.floor(total / 60)).padStart(2, "0");
  const endMinutes = String(total % 60).padStart(2, "0");

  return `${endHours}:${endMinutes}`;
}

function getSeriesEditorValues(
  slot: SlotPlannerSlotData,
): SlotPlannerEditorSeriesValues {
  const { note, tags } = getConventionalSlotData(slot.data);

  return {
    startTime: slot.startTime,
    durationMinutes: slot.durationMinutes,
    bufferBeforeMinutes: slot.bufferBeforeMinutes ?? 0,
    bufferAfterMinutes: slot.bufferAfterMinutes ?? 0,
    timeZone: slot.timeZone,
    tags,
    note,
    recurrence: slot.recurrence?.frequency ?? "none",
    recurrenceUntil: slot.recurrence?.until ?? "",
  };
}

// Editor defaults for a new slot; the time zone falls back to the viewer's
// zone since the planner has no zone of its own. Client-only (create opens
// from a pointer/keyboard event), so resolvedOptions never runs during SSR.
function getCreateEditorValues(): SlotPlannerEditorSeriesValues {
  return {
    startTime: "09:00",
    durationMinutes: 60,
    bufferBeforeMinutes: 0,
    bufferAfterMinutes: 0,
    timeZone: new Intl.DateTimeFormat().resolvedOptions().timeZone,
    tags: [],
    note: "",
    recurrence: "none",
    recurrenceUntil: "",
  };
}

/**
 * Default slot-card content. Rendered inside the structural `<li>` wrapper —
 * directly, or through a custom `slotCard` renderer's `renderDefault()`.
 */
function SlotPlannerSlotCardContent<
  TData extends SlotPlannerSlotPayload = SlotPlannerSlotPayload,
>({
  occurrence,
  taxonomy,
  pending = false,
  onRetry,
  onEdit,
  onDelete,
  editButtonRef,
  renderTag,
}: {
  occurrence: SlotPlannerOccurrence<TData>;
  taxonomy: SlotPlannerTaxonomy;
  pending?: boolean;
  /** Present only while the last mutation for this occurrence failed. */
  onRetry?: () => void;
  /** Absent on locked occurrences: no edit affordance renders at all. */
  onEdit?: () => void;
  onDelete?: () => void;
  editButtonRef?: (node: HTMLButtonElement | null) => void;
  /** Custom renderer for one tag chip. */
  renderTag?: (context: SlotPlannerTagRenderContext<TData>) => ReactNode;
}) {
  const { note, tags } = getConventionalSlotData(occurrence.slot.data);
  const recurrenceLabel = occurrence.isRecurring
    ? occurrence.slot.recurrence?.frequency === "weekly"
      ? taxonomy.recurringWeekly
      : taxonomy.recurringBiweekly
    : null;
  const bufferBeforeMinutes = occurrence.slot.bufferBeforeMinutes ?? 0;
  // The taxonomy has no duration/buffer templates yet, so these two lines
  // follow the slice's prescribed "{n} min" formats verbatim.
  const metaLine =
    bufferBeforeMinutes > 0
      ? `${bufferBeforeMinutes} min buffer · ${occurrence.timeZone}`
      : occurrence.timeZone;
  const renderTagChip = (tag: string) => (
    <span data-slot="slot-planner-tag-chip" className={slotPlannerChipClasses}>
      {tag}
    </span>
  );

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-[var(--dt-space-2)]">
        <span
          data-slot="slot-planner-slot-time"
          className="text-sm font-semibold"
        >
          {`${occurrence.startTime} – ${getWallClockEndTime(
            occurrence.startTime,
            occurrence.durationMinutes,
          )}`}
        </span>
        <span
          data-slot="slot-planner-status-badge"
          data-status={occurrence.status}
          className={slotPlannerStatusBadgeClasses}
        >
          <span
            aria-hidden="true"
            className={cn(
              "size-1.5 rounded-full",
              slotPlannerStatusDotClasses[occurrence.status],
            )}
          />
          {taxonomy.statusLabels[occurrence.status]}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-[var(--dt-space-1)]">
        <span data-slot="slot-planner-duration-chip" className={slotPlannerChipClasses}>
          {`${occurrence.durationMinutes} min`}
        </span>
        {recurrenceLabel ? (
          <span
            data-slot="slot-planner-recurrence-chip"
            className={slotPlannerChipClasses}
          >
            {recurrenceLabel}
          </span>
        ) : null}
        {tags.map((tag) => (
          <Fragment key={tag}>
            {renderTag
              ? renderTag({
                  occurrence,
                  renderDefault: () => renderTagChip(tag),
                  tag,
                  taxonomy,
                })
              : renderTagChip(tag)}
          </Fragment>
        ))}
      </div>
      {note ? (
        <p
          data-slot="slot-planner-slot-note"
          className="text-sm leading-6 text-muted-foreground"
        >
          {note}
        </p>
      ) : null}
      <p
        data-slot="slot-planner-slot-meta"
        className="text-xs text-muted-foreground"
      >
        {metaLine}
      </p>
      {onEdit || onDelete ? (
        <div
          data-slot="slot-planner-slot-actions"
          className="flex flex-wrap items-center gap-[var(--dt-space-2)]"
        >
          {onEdit ? (
            <button
              ref={editButtonRef}
              type="button"
              data-slot="slot-planner-edit-slot"
              className={slotPlannerSlotActionButtonClasses}
              disabled={pending}
              onClick={onEdit}
            >
              {taxonomy.editSlot}
            </button>
          ) : null}
          {onDelete ? (
            <button
              type="button"
              data-slot="slot-planner-delete-slot"
              className={slotPlannerSlotActionButtonClasses}
              disabled={pending}
              onClick={onDelete}
            >
              {taxonomy.deleteSlot}
            </button>
          ) : null}
        </div>
      ) : null}
      {pending ? (
        <p
          data-slot="slot-planner-save-pending"
          className={slotPlannerSavePendingClasses}
        >
          {taxonomy.savePending}
        </p>
      ) : null}
      {onRetry ? (
        <div
          data-slot="slot-planner-save-error"
          className={slotPlannerSaveErrorClasses}
        >
          <span>{taxonomy.saveError}</span>
          <button
            type="button"
            data-slot="slot-planner-retry"
            className={slotPlannerSlotActionButtonClasses}
            onClick={onRetry}
          >
            {taxonomy.retry}
          </button>
        </div>
      ) : null}
    </>
  );
}

function SlotPlannerInner<
  TData extends SlotPlannerSlotPayload = SlotPlannerSlotPayload,
>(
  {
    className,
    slots,
    defaultSlots,
    focusedDate,
    defaultFocusedDate,
    onFocusedDateChange,
    onCreateSlot,
    onUpdateSlot,
    onDeleteOccurrence,
    onDeleteSeries,
    constraints,
    onBatchChange,
    generateSlotId,
    taxonomy,
    view = "week",
    now,
    title,
    locale = "en",
    reducedMotion,
    renderers,
    ...props
  }: SlotPlannerProps<TData>,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const baseId = useId();
  const panelId = `${baseId}-panel`;
  const prefersReducedMotion = useReducedMotion();
  const resolvedReducedMotion = reducedMotion ?? prefersReducedMotion === true;
  const motionEnabled = !resolvedReducedMotion;

  // Mutations recorded at dispatch time (create/edit) or from batch payloads
  // (copy day/week), keyed `slotId::occurrenceDate`. Once the mutation has
  // settled successfully and the occurrence renders on the focused day, the
  // entry is promoted to a highlight pulse; batch entries also carry the
  // stagger index of their entrance.
  const recentMutationsRef = useRef(
    new Map<
      string,
      { slotId: string; occurrenceDate: string; staggerIndex: number }
    >(),
  );
  const recordRecentMutation = useCallback(
    (slotId: string, occurrenceDate: string, staggerIndex = 0) => {
      recentMutationsRef.current.set(`${slotId}::${occurrenceDate}`, {
        occurrenceDate,
        slotId,
        staggerIndex,
      });
    },
    [],
  );
  const handleCreateSlotWithHighlight = (
    payload: SlotPlannerCreatePayload<TData>,
  ) => {
    recordRecentMutation(payload.slot.id, payload.slot.date);

    return onCreateSlot?.(payload);
  };
  const handleBatchChangeWithHighlight = (
    payload: SlotPlannerBatchChangePayload<TData>,
  ) => {
    const countsByDate = new Map<string, number>();

    for (const slot of payload.createdSlots) {
      const staggerIndex = countsByDate.get(slot.date) ?? 0;

      countsByDate.set(slot.date, staggerIndex + 1);
      recordRecentMutation(slot.id, slot.date, staggerIndex);
    }

    return onBatchChange?.(payload);
  };

  // All non-visual state and dispatch lives in the headless hook; this
  // component owns DOM structure, refs, focus, and the motion layer only.
  const planner = useSlotPlanner<TData>({
    constraints,
    defaultFocusedDate,
    defaultSlots,
    focusedDate,
    generateSlotId,
    locale,
    now,
    onBatchChange: handleBatchChangeWithHighlight,
    onCreateSlot: handleCreateSlotWithHighlight,
    onDeleteOccurrence,
    onDeleteSeries,
    onFocusedDateChange,
    onUpdateSlot,
    slots,
    taxonomy,
    view,
  });
  const {
    announcement,
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
    summarizeDay,
    taxonomy: resolvedTaxonomy,
    todayIso,
    updateSlot,
    weekDays,
  } = planner;
  const nounTemplateTokens = {
    slot: resolvedTaxonomy.slot,
    slotPlural: resolvedTaxonomy.slotPlural,
  };
  const isPastDay = currentFocusedDate < todayIso;

  const rootRef = useRef<HTMLDivElement | null>(null);
  const mergedRef = useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node;

      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    [ref],
  );

  // Logical week-navigation direction, derived from the week-start change so
  // controlled and uncontrolled focus updates both animate. The RTL factor
  // inverts the slide axis; ISO dates compare lexicographically.
  const weekStart = weekDays[0]!;
  const previousWeekStartRef = useRef(weekStart);
  const weekDirectionRef = useRef<0 | 1 | -1>(0);

  if (previousWeekStartRef.current !== weekStart) {
    weekDirectionRef.current =
      weekStart > previousWeekStartRef.current ? 1 : -1;
    previousWeekStartRef.current = weekStart;
  }

  const weekDirection = weekDirectionRef.current;
  const [isRtl, setIsRtl] = useState(false);

  useEffect(() => {
    if (rootRef.current) {
      setIsRtl(getSlotPlannerDirection(rootRef.current) === "rtl");
    }
  }, []);

  const weekSlideFactor = weekDirection * (isRtl ? -1 : 1);

  // Highlight pulses per occurrence key; the nonce re-pulses repeat edits.
  const [highlightNonces, setHighlightNonces] = useState<
    ReadonlyMap<string, number>
  >(() => new Map());
  const clearHighlight = useCallback((key: string) => {
    setHighlightNonces((previous) => {
      if (!previous.has(key)) {
        return previous;
      }

      const next = new Map(previous);

      next.delete(key);

      return next;
    });
  }, []);

  // Promotes recorded mutations to highlight pulses once the mutation has
  // settled successfully (not pending, not failed) and its occurrence is
  // rendered on the focused day — including slots from copy batches, which
  // are consumed when navigation makes them visible.
  useEffect(() => {
    const recent = recentMutationsRef.current;

    if (recent.size === 0) {
      return;
    }

    const visibleKeys = new Set(
      selectedOccurrences.map(
        (occurrence) => `${occurrence.slotId}::${occurrence.occurrenceDate}`,
      ),
    );
    const consumed: string[] = [];

    for (const [key, entry] of recent) {
      const crudKey = occurrenceKey(entry);

      if (pendingKeys.has(crudKey) || retryByKey.has(crudKey)) {
        continue;
      }

      if (visibleKeys.has(key)) {
        consumed.push(key);
      }
    }

    if (consumed.length === 0) {
      return;
    }

    for (const key of consumed) {
      recent.delete(key);
    }

    if (motionEnabled) {
      setHighlightNonces((previous) => {
        const next = new Map(previous);

        for (const key of consumed) {
          next.set(key, (previous.get(key) ?? 0) + 1);
        }

        return next;
      });
    }
  });

  const tabRefs = useRef(new Map<string, HTMLButtonElement>());
  const [editorState, setEditorState] = useState<
    | { mode: "create"; date: string }
    | { mode: "edit"; occurrence: SlotPlannerOccurrence<TData> }
    | null
  >(null);
  const [editorViolations, setEditorViolations] = useState<
    SlotPlannerViolation[] | null
  >(null);
  const [batchDialog, setBatchDialog] = useState<
    "copy-day" | "copy-week" | "clear-day" | null
  >(null);
  const [deleteTarget, setDeleteTarget] =
    useState<SlotPlannerOccurrence<TData> | null>(null);
  const editButtonRefs = useRef(new Map<string, HTMLButtonElement>());
  const cardRefs = useRef(new Map<string, HTMLLIElement>());
  const addSlotButtonRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Deletion moves focus to the nearest remaining card. Candidates are
  // captured before the mutation and resolved against the DOM after it
  // commits: the default renderer's edit button wins; custom slot cards
  // without one fall back to the structural <li> wrapper, then the add-slot
  // affordance, then the day panel.
  const scheduleFocusAfterDelete = useCallback((candidateKeys: string[]) => {
    if (typeof window === "undefined") {
      return;
    }

    window.setTimeout(() => {
      for (const candidateKey of candidateKeys) {
        const button = editButtonRefs.current.get(candidateKey);

        if (button?.isConnected) {
          button.focus();

          return;
        }
      }

      for (const candidateKey of candidateKeys) {
        const card = cardRefs.current.get(candidateKey);

        if (card?.isConnected) {
          card.focus();

          return;
        }
      }

      if (addSlotButtonRef.current?.isConnected) {
        addSlotButtonRef.current.focus();

        return;
      }

      panelRef.current?.focus();
    }, 0);
  }, []);

  const computeDeleteFocusCandidates = (
    deleted: SlotPlannerOccurrence<TData>,
    scope: "occurrence" | "series",
  ) => {
    const deletedKey = occurrenceKey(deleted);
    const index = selectedOccurrences.findIndex(
      (occurrence) => occurrenceKey(occurrence) === deletedKey,
    );

    if (index === -1) {
      return [];
    }

    return [
      ...selectedOccurrences.slice(index + 1),
      ...selectedOccurrences.slice(0, index).reverse(),
    ]
      .filter((occurrence) =>
        scope === "series" ? occurrence.slotId !== deleted.slotId : true,
      )
      .map((occurrence) => occurrenceKey(occurrence));
  };

  // Validation happens in the hook's dispatchers; on violations the editor
  // stays open and renders them, and saving again revalidates.
  const handleEditorSubmit = (result: SlotPlannerEditorResult) => {
    const state = editorState;

    if (!state) {
      return;
    }

    let violations: SlotPlannerViolation[];

    if (state.mode === "create") {
      if (result.scope !== "series") {
        return;
      }

      violations = createSlot(result.values, { date: state.date });
    } else {
      violations = updateSlot(state.occurrence, result);

      if (violations.length === 0) {
        // Created slots are recorded in the wrapped onCreateSlot (the
        // generated id is only known there); edits are recorded here.
        recordRecentMutation(
          state.occurrence.slotId,
          state.occurrence.occurrenceDate,
        );
      }
    }

    if (violations.length > 0) {
      setEditorViolations(violations);

      return;
    }

    setEditorViolations(null);
    setEditorState(null);
  };

  const handleConfirmDeleteOccurrence = () => {
    const occurrence = deleteTarget;

    if (!occurrence) {
      return;
    }

    setDeleteTarget(null);

    const candidates = computeDeleteFocusCandidates(occurrence, "occurrence");

    deleteOccurrence(occurrence, {
      onApplied: () => scheduleFocusAfterDelete(candidates),
    });
  };

  const handleConfirmDeleteSeries = () => {
    const occurrence = deleteTarget;

    if (!occurrence) {
      return;
    }

    setDeleteTarget(null);

    const candidates = computeDeleteFocusCandidates(occurrence, "series");

    deleteSeries(occurrence, {
      onApplied: () => scheduleFocusAfterDelete(candidates),
    });
  };

  const openCopyDay = () => {
    clearError(batchKey);
    setBatchDialog("copy-day");
  };
  const openCopyWeek = () => {
    clearError(batchKey);
    setBatchDialog("copy-week");
  };
  const openClearDay = () => {
    clearError(batchKey);
    setBatchDialog("clear-day");
  };

  const createPending = pendingKeys.has(createKey);
  const createRetry = retryByKey.get(createKey);
  const batchPending = pendingKeys.has(batchKey);
  const batchRetry = retryByKey.get(batchKey);

  const weekdayFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" }),
    [locale],
  );
  const dayMonthFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "short",
        timeZone: "UTC",
      }),
    [locale],
  );
  const longDateFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { dateStyle: "full", timeZone: "UTC" }),
    [locale],
  );

  const getTabId = (date: string) => `${baseId}-tab-${date}`;
  const handleRailKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const direction = getSlotPlannerDirection(event.currentTarget);
    const forwardKey = direction === "rtl" ? "ArrowLeft" : "ArrowRight";
    const backwardKey = direction === "rtl" ? "ArrowRight" : "ArrowLeft";
    const currentIndex = weekDays.indexOf(currentFocusedDate);
    let nextIndex: number;

    if (event.key === forwardKey) {
      nextIndex = (currentIndex + 1) % weekDays.length;
    } else if (event.key === backwardKey) {
      nextIndex = (currentIndex + weekDays.length - 1) % weekDays.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = weekDays.length - 1;
    } else {
      return;
    }

    event.preventDefault();

    const nextDate = weekDays[nextIndex];

    setFocusedDate(nextDate);
    tabRefs.current.get(nextDate)?.focus();
  };

  const formattedFocusedDate = longDateFormatter.format(
    toUtcDate(currentFocusedDate),
  );
  const defaultDayHeader = (
    <h3
      data-slot="slot-planner-day-heading"
      className="text-base font-semibold"
    >
      {formattedFocusedDate}
    </h3>
  );

  const capText = dailyCap
    ? formatSlotPlannerCountTemplate(
        resolvedTaxonomy.dailyCapSummary,
        dailyCap.cap,
        {
          cap: dailyCap.cap,
          requestableLabel: resolvedTaxonomy.statusLabels.requestable,
          slot: resolvedTaxonomy.slot,
          slotPlural: resolvedTaxonomy.slotPlural,
          used: dailyCap.used,
        },
        locale,
      )
    : "";
  const capReachedMessage = dailyCap?.reached
    ? formatSlotPlannerTemplate(
        resolvedTaxonomy.violationMessages["daily-cap"],
        {
          cap: dailyCap.cap,
          date: currentFocusedDate,
          slot: resolvedTaxonomy.slot,
          slotPlural: resolvedTaxonomy.slotPlural,
        },
      )
    : undefined;
  const capRatio = dailyCap
    ? dailyCap.cap > 0
      ? dailyCap.used / dailyCap.cap
      : 1
    : 0;
  const defaultCapMeter = dailyCap ? (
    <div
      data-slot="slot-planner-cap-meter"
      data-cap-reached={dailyCap.reached ? "true" : undefined}
      className="flex flex-col gap-[var(--dt-space-1)] text-xs text-muted-foreground"
    >
      <p className="flex flex-wrap items-center gap-x-[var(--dt-space-2)]">
        <span>{capText}</span>
        {capReachedMessage ? (
          // Cap-reached is stated in text, never by color alone.
          <span
            data-slot="slot-planner-cap-meter-message"
            className="font-medium text-destructive"
          >
            {capReachedMessage}
          </span>
        ) : null}
      </p>
      {/* Decorative fill bar; the text above stays canonical. */}
      <div
        aria-hidden="true"
        data-slot="slot-planner-cap-meter-track"
        className="h-1 w-full overflow-hidden rounded-full bg-muted"
      >
        <SlotPlannerCapMeterFill
          motionEnabled={motionEnabled}
          ratio={capRatio}
        />
      </div>
    </div>
  ) : null;

  const defaultEmptyDay = (
    <p
      data-slot="slot-planner-empty-day"
      className="text-sm text-muted-foreground"
    >
      {resolvedTaxonomy.emptyDay}
    </p>
  );

  const dayPanel = (
    <div
      ref={panelRef}
      role={view === "week" ? "tabpanel" : undefined}
      id={view === "week" ? panelId : undefined}
      aria-labelledby={view === "week" ? getTabId(currentFocusedDate) : undefined}
      tabIndex={view === "week" ? 0 : -1}
      data-slot="slot-planner-day-panel"
      data-past={isPastDay ? "true" : undefined}
      className={slotPlannerDayPanelClasses}
    >
      <SlotPlannerWeekSlide
        motionEnabled={motionEnabled}
        slideFactor={weekSlideFactor}
        weekKey={weekStart}
        className={slotPlannerWeekPanelContentClasses}
      >
      {renderers?.dayHeader
        ? renderers.dayHeader({
            date: currentFocusedDate,
            formattedDate: formattedFocusedDate,
            isPast: isPastDay,
            isToday: currentFocusedDate === todayIso,
            occurrences: selectedOccurrences,
            renderDefault: () => defaultDayHeader,
            taxonomy: resolvedTaxonomy,
          })
        : defaultDayHeader}
      {dailyCap
        ? renderers?.capMeter
          ? renderers.capMeter({
              cap: dailyCap.cap,
              date: currentFocusedDate,
              reached: dailyCap.reached,
              ...(capReachedMessage !== undefined
                ? { reachedMessage: capReachedMessage }
                : {}),
              renderDefault: () => defaultCapMeter,
              taxonomy: resolvedTaxonomy,
              text: capText,
              used: dailyCap.used,
            })
          : defaultCapMeter
        : null}
      {!isPastDay ? (
        <div
          data-slot="slot-planner-day-actions"
          data-pending={batchPending ? "true" : undefined}
          data-error={batchRetry ? "true" : undefined}
          className="flex flex-wrap items-center gap-[var(--dt-space-2)]"
        >
          <button
            type="button"
            data-slot="slot-planner-copy-day"
            className={slotPlannerSlotActionButtonClasses}
            disabled={batchPending}
            onClick={openCopyDay}
          >
            {resolvedTaxonomy.copyDay}
          </button>
          <button
            type="button"
            data-slot="slot-planner-copy-week"
            className={slotPlannerSlotActionButtonClasses}
            disabled={batchPending}
            onClick={openCopyWeek}
          >
            {resolvedTaxonomy.copyWeek}
          </button>
          <button
            type="button"
            data-slot="slot-planner-clear-day"
            className={slotPlannerSlotActionButtonClasses}
            disabled={batchPending}
            onClick={openClearDay}
          >
            {resolvedTaxonomy.clearDay}
          </button>
          {batchPending ? (
            <span
              data-slot="slot-planner-save-pending"
              className={slotPlannerSavePendingClasses}
            >
              {resolvedTaxonomy.savePending}
            </span>
          ) : null}
          {batchRetry ? (
            <span
              data-slot="slot-planner-save-error"
              className={slotPlannerSaveErrorClasses}
            >
              <span>{resolvedTaxonomy.saveError}</span>
              <button
                type="button"
                data-slot="slot-planner-retry"
                className={slotPlannerSlotActionButtonClasses}
                onClick={batchRetry}
              >
                {resolvedTaxonomy.retry}
              </button>
            </span>
          ) : null}
        </div>
      ) : null}
      {isPastDay ? (
        <p
          data-slot="slot-planner-past-day"
          className="text-sm text-muted-foreground"
        >
          {resolvedTaxonomy.pastDay}
        </p>
      ) : null}
      {selectedOccurrences.length === 0 ? (
        renderers?.emptyDay ? (
          renderers.emptyDay({
            date: currentFocusedDate,
            isPast: isPastDay,
            renderDefault: () => defaultEmptyDay,
            taxonomy: resolvedTaxonomy,
          })
        ) : (
          defaultEmptyDay
        )
      ) : (
        // The list is keyed by the focused date so switching days swaps the
        // whole list instantly; enter/exit animations only run for slots
        // appearing or disappearing within the visible day.
        <ul
          key={currentFocusedDate}
          role="list"
          data-slot="slot-planner-slot-list"
          className="m-[var(--dt-space-0)] flex list-none flex-col gap-[var(--dt-space-2)] p-[var(--dt-space-0)]"
        >
          <AnimatePresence>
          {selectedOccurrences.map((occurrence) => {
            const key = occurrenceKey(occurrence);
            const locked = lockedOccurrenceStatuses.has(occurrence.status);
            const pending = pendingKeys.has(key);
            const retry = retryByKey.get(key);
            const edit = locked
              ? undefined
              : () => {
                  clearError(key);
                  setEditorViolations(null);
                  setEditorState({ mode: "edit", occurrence });
                };
            const remove = locked
              ? undefined
              : () => {
                  clearError(key);
                  setDeleteTarget(occurrence);
                };
            const defaultCardContent = (
              <SlotPlannerSlotCardContent
                occurrence={occurrence}
                taxonomy={resolvedTaxonomy}
                pending={pending}
                onRetry={retry}
                onEdit={edit}
                onDelete={remove}
                editButtonRef={(node) => {
                  if (node) {
                    editButtonRefs.current.set(key, node);
                  } else {
                    editButtonRefs.current.delete(key);
                  }
                }}
                renderTag={renderers?.tag}
              />
            );

            const recentEntry = recentMutationsRef.current.get(key);

            return (
              // The <li> wrapper and its data attributes are structural; it
              // is programmatically focusable so post-delete focus recovery
              // works with custom slot cards that render no edit button.
              // The motion layer animates the wrapper itself, so custom
              // slot cards are animated identically to the default.
              <SlotPlannerSlotListItem
                key={key}
                ref={(node) => {
                  if (node) {
                    cardRefs.current.set(key, node);
                  } else {
                    cardRefs.current.delete(key);
                  }
                }}
                motionEnabled={motionEnabled}
                entrance={recentEntry !== undefined}
                staggerIndex={recentEntry?.staggerIndex ?? 0}
                highlightNonce={highlightNonces.get(key) ?? 0}
                onHighlightComplete={() => clearHighlight(key)}
                tabIndex={-1}
                data-status={occurrence.status}
                data-locked={locked ? "true" : undefined}
                data-pending={pending ? "true" : undefined}
                data-error={retry ? "true" : undefined}
                className={slotPlannerSlotCardClasses}
              >
                {renderers?.slotCard
                  ? renderers.slotCard({
                      ...(edit ? { edit } : {}),
                      error: retry !== undefined,
                      locked,
                      occurrence,
                      pending,
                      ...(remove ? { remove } : {}),
                      renderDefault: () => defaultCardContent,
                      ...(retry ? { retry } : {}),
                      taxonomy: resolvedTaxonomy,
                    })
                  : defaultCardContent}
              </SlotPlannerSlotListItem>
            );
          })}
          </AnimatePresence>
        </ul>
      )}
      {!isPastDay ? (
        <>
          <button
            ref={addSlotButtonRef}
            type="button"
            data-slot="slot-planner-add-slot"
            data-pending={createPending ? "true" : undefined}
            data-error={createRetry ? "true" : undefined}
            className={slotPlannerAddSlotButtonClasses}
            disabled={createPending}
            onClick={() => {
              clearError(createKey);
              setEditorViolations(null);
              setEditorState({ mode: "create", date: currentFocusedDate });
            }}
          >
            {resolvedTaxonomy.addSlot}
          </button>
          {createPending ? (
            <p
              data-slot="slot-planner-save-pending"
              className={slotPlannerSavePendingClasses}
            >
              {resolvedTaxonomy.savePending}
            </p>
          ) : null}
          {createRetry ? (
            <div
              data-slot="slot-planner-save-error"
              className={slotPlannerSaveErrorClasses}
            >
              <span>{resolvedTaxonomy.saveError}</span>
              <button
                type="button"
                data-slot="slot-planner-retry"
                className={slotPlannerSlotActionButtonClasses}
                onClick={createRetry}
              >
                {resolvedTaxonomy.retry}
              </button>
            </div>
          ) : null}
        </>
      ) : null}
      </SlotPlannerWeekSlide>
    </div>
  );

  const defaultToolbar = (
    <>
      <div
        data-slot="slot-planner-title"
        className="text-lg font-semibold"
      >
        {title}
      </div>
      <div className="flex items-center gap-[var(--dt-space-1)]">
        <button
          type="button"
          aria-label={resolvedTaxonomy.previousWeek}
          className={slotPlannerToolbarButtonClasses}
          onClick={goToPreviousWeek}
        >
          <ChevronIcon direction="backward" />
        </button>
        <button
          type="button"
          className={slotPlannerToolbarButtonClasses}
          onClick={goToThisWeek}
        >
          {resolvedTaxonomy.thisWeek}
        </button>
        <button
          type="button"
          aria-label={resolvedTaxonomy.nextWeek}
          className={slotPlannerToolbarButtonClasses}
          onClick={goToNextWeek}
        >
          <ChevronIcon direction="forward" />
        </button>
      </div>
    </>
  );

  return (
    // reducedMotion="always" hard-disables transform animation inside Motion
    // as defense in depth; the wrappers above already collapse to plain
    // elements when motionEnabled is false.
    <MotionConfig reducedMotion={resolvedReducedMotion ? "always" : "user"}>
    <div
      {...props}
      ref={mergedRef}
      data-slot="slot-planner"
      data-view={view}
      data-reduced-motion={resolvedReducedMotion ? "true" : undefined}
      data-week-direction={
        weekDirection === 1
          ? "forward"
          : weekDirection === -1
            ? "backward"
            : "none"
      }
      className={cn(slotPlannerRootClasses, className)}
    >
      {view === "week" ? (
        <>
          <div data-slot="slot-planner-toolbar" className={slotPlannerToolbarClasses}>
            {renderers?.toolbar
              ? renderers.toolbar({
                  clearDay: openClearDay,
                  copyDay: openCopyDay,
                  copyWeek: openCopyWeek,
                  focusedDate: currentFocusedDate,
                  goToNextWeek,
                  goToPreviousWeek,
                  goToThisWeek,
                  renderDefault: () => defaultToolbar,
                  setFocusedDate,
                  taxonomy: resolvedTaxonomy,
                  title,
                  todayIso,
                  weekDays,
                })
              : defaultToolbar}
          </div>
          <div
            role="tablist"
            aria-label={formatSlotPlannerTemplate(
              resolvedTaxonomy.announceWeekChanged,
              { weekStart: longDateFormatter.format(toUtcDate(weekDays[0])) },
            )}
            data-slot="slot-planner-day-rail"
            className={slotPlannerDayRailClasses}
            onKeyDown={handleRailKeyDown}
          >
            {weekDays.map((date) => {
              const selected = date === currentFocusedDate;
              const summary = summarizeDay(date);
              const defaultDayCard = (
                <>
                  <span className="text-xs font-medium text-muted-foreground">
                    {weekdayFormatter.format(toUtcDate(date))}
                  </span>
                  <span className="text-sm font-semibold">
                    {dayMonthFormatter.format(toUtcDate(date))}
                  </span>
                  {slotPlannerOccurrenceStatuses
                    .filter((status) => summary[status] > 0)
                    .map((status) => (
                      <span
                        key={status}
                        data-slot="slot-planner-day-summary"
                        data-status={status}
                        className="flex items-center gap-[var(--dt-space-1)] text-xs text-muted-foreground"
                      >
                        <span
                          aria-hidden="true"
                          className={cn(
                            "size-1.5 rounded-full",
                            slotPlannerStatusDotClasses[status],
                          )}
                        />
                        {formatSlotPlannerCountTemplate(
                          resolvedTaxonomy.statusCountSummary,
                          summary[status],
                          { statusLabel: resolvedTaxonomy.statusLabels[status] },
                          locale,
                        )}
                      </span>
                    ))}
                </>
              );

              return (
                // The tab element, its ARIA wiring, and the roving tabindex
                // are structural; a custom dayCard renders only its children.
                <button
                  key={date}
                  ref={(node) => {
                    if (node) {
                      tabRefs.current.set(date, node);
                    } else {
                      tabRefs.current.delete(date);
                    }
                  }}
                  type="button"
                  role="tab"
                  id={getTabId(date)}
                  aria-selected={selected}
                  aria-controls={panelId}
                  aria-current={date === todayIso ? "date" : undefined}
                  tabIndex={selected ? 0 : -1}
                  data-slot="slot-planner-day-tab"
                  data-selected={selected ? "true" : undefined}
                  data-today={date === todayIso ? "true" : undefined}
                  data-past={date < todayIso ? "true" : undefined}
                  className={slotPlannerDayTabClasses}
                  onClick={() => setFocusedDate(date)}
                >
                  {selected ? (
                    // Decorative shared-layout indicator; the non-motion
                    // selection state stays on aria-selected/data-selected.
                    <SlotPlannerDayTabIndicator
                      layoutId={`${baseId}-day-tab-indicator`}
                      motionEnabled={motionEnabled}
                    />
                  ) : null}
                  <SlotPlannerDayTabContent
                    motionEnabled={motionEnabled}
                    slideFactor={weekSlideFactor}
                    className={slotPlannerDayTabContentClasses}
                  >
                    {renderers?.dayCard
                      ? renderers.dayCard({
                          date,
                          isPast: date < todayIso,
                          isToday: date === todayIso,
                          occurrences: occurrencesByDate[date] ?? [],
                          renderDefault: () => defaultDayCard,
                          selected,
                          summary,
                          taxonomy: resolvedTaxonomy,
                        })
                      : defaultDayCard}
                  </SlotPlannerDayTabContent>
                </button>
              );
            })}
          </div>
        </>
      ) : null}
      {dayPanel}
      {editorState ? (
        <SlotPlannerEditorDialog
          mode={editorState.mode}
          date={
            editorState.mode === "create"
              ? editorState.date
              : editorState.occurrence.occurrenceDate
          }
          isRecurring={
            editorState.mode === "edit" && editorState.occurrence.isRecurring
          }
          seriesValues={
            editorState.mode === "create"
              ? getCreateEditorValues()
              : getSeriesEditorValues(editorState.occurrence.slot)
          }
          occurrenceValues={
            editorState.mode === "create"
              ? { startTime: "09:00", durationMinutes: 60 }
              : {
                  startTime: editorState.occurrence.startTime,
                  durationMinutes: editorState.occurrence.durationMinutes,
                }
          }
          taxonomy={resolvedTaxonomy}
          violations={editorViolations ?? undefined}
          onDismiss={() => {
            setEditorViolations(null);
            setEditorState(null);
          }}
          onSubmit={handleEditorSubmit}
          renderContent={renderers?.slotEditor}
        />
      ) : null}
      {batchDialog === "copy-day" ? (
        <SlotPlannerCopyDayDialog
          targets={weekDays
            .filter((date) => date !== currentFocusedDate)
            .map((date) => ({
              date,
              label: `${weekdayFormatter.format(
                toUtcDate(date),
              )} ${dayMonthFormatter.format(toUtcDate(date))}`,
            }))}
          taxonomy={resolvedTaxonomy}
          onDismiss={() => setBatchDialog(null)}
          onApply={(targetDates) => {
            setBatchDialog(null);
            copyDay(targetDates);
          }}
        />
      ) : null}
      {batchDialog === "copy-week" ? (
        <SlotPlannerBatchConfirmDialog
          title={formatSlotPlannerTemplate(
            resolvedTaxonomy.copyWeekConfirmTitle,
            nounTemplateTokens,
          )}
          body={formatSlotPlannerTemplate(
            resolvedTaxonomy.copyWeekConfirmBody,
            nounTemplateTokens,
          )}
          confirmLabel={resolvedTaxonomy.apply}
          taxonomy={resolvedTaxonomy}
          onDismiss={() => setBatchDialog(null)}
          onConfirm={() => {
            setBatchDialog(null);
            copyWeek();
          }}
        />
      ) : null}
      {batchDialog === "clear-day" ? (
        <SlotPlannerBatchConfirmDialog
          title={formatSlotPlannerTemplate(
            resolvedTaxonomy.clearDayConfirmTitle,
            nounTemplateTokens,
          )}
          body={formatSlotPlannerTemplate(
            resolvedTaxonomy.clearDayConfirmBody,
            nounTemplateTokens,
          )}
          confirmLabel={resolvedTaxonomy.clearDay}
          destructive
          taxonomy={resolvedTaxonomy}
          onDismiss={() => setBatchDialog(null)}
          onConfirm={() => {
            setBatchDialog(null);
            clearDay();
          }}
        />
      ) : null}
      {deleteTarget ? (
        <SlotPlannerDeleteDialog
          isRecurring={deleteTarget.isRecurring}
          taxonomy={resolvedTaxonomy}
          onDismiss={() => setDeleteTarget(null)}
          onDeleteOccurrence={handleConfirmDeleteOccurrence}
          onDeleteSeries={handleConfirmDeleteSeries}
        />
      ) : null}
      <div
        aria-live="polite"
        data-slot="slot-planner-live-region"
        className="sr-only"
      >
        {announcement}
      </div>
    </div>
    </MotionConfig>
  );
}

export const SlotPlanner = forwardRef(SlotPlannerInner) as (<
  TData extends SlotPlannerSlotPayload = SlotPlannerSlotPayload,
>(
  props: SlotPlannerProps<TData> & RefAttributes<HTMLDivElement>,
) => ReactElement | null) & { displayName?: string };

SlotPlanner.displayName = "SlotPlanner";
