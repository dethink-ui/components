import { parseDate } from "@internationalized/date";
import {
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
import { MotionConfig, useReducedMotion } from "motion/react";
import { cn } from "../../utils/cn";
import { Button } from "../button";
import { IconButton } from "../icon-button";
import {
  slotPlannerOccurrenceStatuses,
  type SlotPlannerBookRequestPayload,
  type SlotPlannerSlotData,
  type SlotPlannerSlotPayload,
  type SlotPlannerTaxonomy,
  type SlotPlannerTaxonomyInput,
} from "./slot-planner-contract";
import {
  CalendarIcon,
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
  slotPlannerToolbarClasses,
  slotPlannerWeekPanelContentClasses,
  toUtcDate,
  useSlotPlannerRailOrientation,
} from "./slot-planner-dom-shared";
import {
  SlotPlannerDayTabContent,
  SlotPlannerDayTabIndicator,
  SlotPlannerWeekSlide,
} from "./slot-planner-motion";
import type { SlotPlannerEmptyDayRenderContext } from "./slot-planner-renderers";
import {
  expandSlotsForViewerZone,
  formatSlotPlannerCountTemplate,
  formatSlotPlannerTemplate,
  getSlotPlannerIsoDateInZone,
  getSlotPlannerWeekDays,
  resolveSlotPlannerTaxonomy,
  summarizeSlotPlannerDay,
  type SlotPickerOccurrence,
} from "./slot-planner-utils";
import { useSlotPlannerCrud, type SlotPlannerView } from "./use-slot-planner";

/**
 * Context of one book-mode slot card. The renderer output becomes the
 * children of the structural `<li data-slot="slot-picker-slot-card">`
 * wrapper; the wrapper keeps its `data-status` / `data-available` /
 * `data-pending` / `data-error` attributes.
 */
export type SlotPickerSlotCardRenderContext<
  TData extends SlotPlannerSlotPayload = SlotPlannerSlotPayload,
> = {
  /** Renders the shipped default card content for decoration. */
  renderDefault: () => ReactNode;
  taxonomy: SlotPlannerTaxonomy;
  /** The occurrence, projected into the viewer's time zone. */
  occurrence: SlotPickerOccurrence<TData>;
  /** True when the occurrence is requestable by this viewer. */
  available: boolean;
  /** True while this occurrence's book-request promise is pending. */
  pending: boolean;
  /** Request acknowledged during this mounted picker session; not server-owned identity. */
  requestSent?: boolean;
  /** True while the last book request for this occurrence failed. */
  error: boolean;
  /** Re-fires the failed request's identical payload. Present on error. */
  retry?: () => void;
  /** Fires the book request. Present only on available occurrences. */
  request?: () => void;
};

/**
 * Optional render props for SlotPicker surfaces. Omitted surfaces keep their
 * shipped defaults; every context exposes `renderDefault()` so a renderer
 * can decorate the default instead of rebuilding it. Structural invariants
 * (day-rail tab semantics, the slot-card `<li>` wrapper, the live region)
 * stay outside the render slots.
 */
export interface SlotPickerRenderers<
  TData extends SlotPlannerSlotPayload = SlotPlannerSlotPayload,
> {
  slotCard?: (context: SlotPickerSlotCardRenderContext<TData>) => ReactNode;
  emptyDay?: (context: SlotPlannerEmptyDayRenderContext) => ReactNode;
}

export interface SlotPickerProps<
  TData extends SlotPlannerSlotPayload = SlotPlannerSlotPayload,
> extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "title"> {
  /**
   * The slot collection to browse. Read-only in book mode: SlotPicker never
   * mutates it — a request only fires `onBookRequest` and the app updates
   * the collection (e.g. bumps `requestedCount`) after handling it.
   */
  slots: SlotPlannerSlotData<TData>[];
  /**
   * IANA zone the occurrences are projected into for display and day
   * grouping. Defaults to the environment zone
   * (`Intl.DateTimeFormat().resolvedOptions().timeZone`); pass explicitly
   * for deterministic renders and SSR.
   */
  viewerTimeZone?: string;
  /**
   * Fires when the viewer requests an available occurrence. The payload's
   * `occurrenceDate` stays the PROVIDER-zone occurrence date — it identifies
   * the occurrence in the shared slot model; the viewer-zone date is
   * presentation only. A returned promise drives the per-occurrence
   * pending/error/retry affordances.
   */
  onBookRequest?: (
    payload: SlotPlannerBookRequestPayload,
  ) => void | Promise<void>;
  taxonomy?: SlotPlannerTaxonomyInput;
  /** Controlled view projection. Pair with `onViewChange` for the default switcher. */
  view?: SlotPlannerView;
  /** Initial view for uncontrolled usage. */
  defaultView?: SlotPlannerView;
  onViewChange?: (view: SlotPlannerView) => void;
  /** Controlled focused VIEWER-zone ISO date (`YYYY-MM-DD`). */
  focusedDate?: string;
  /**
   * Initial focused viewer-zone ISO date for uncontrolled usage. Defaults
   * to the viewer-zone "today" derived from `now`.
   */
  defaultFocusedDate?: string;
  onFocusedDateChange?: (dateIso: string) => void;
  /** ISO date-time treated as "now"; injectable for deterministic renders. */
  now?: string;
  locale?: string;
  title?: ReactNode;
  loading?: boolean;
  error?: ReactNode;
  /**
   * Forces the reduced-motion rendering path. Defaults to the viewer's
   * `prefers-reduced-motion` preference.
   */
  reducedMotion?: boolean;
  renderers?: SlotPickerRenderers<TData>;
}

/** Statuses a book-mode viewer can see (draft/cancelled are never shown). */
const slotPickerVisibleStatuses = slotPlannerOccurrenceStatuses.filter(
  (status) => status !== "draft" && status !== "cancelled",
);

function getSlotPickerOccurrenceKey(slotId: string, occurrenceDate: string) {
  return `${slotId}::${occurrenceDate}`;
}

function getSlotPickerRemainingSeats(occurrence: SlotPickerOccurrence) {
  return Math.max(
    0,
    occurrence.capacity - occurrence.bookedCount - occurrence.requestedCount,
  );
}

function isSlotPickerOccurrenceAvailable(occurrence: SlotPickerOccurrence) {
  return (
    occurrence.status === "requestable" ||
    (occurrence.status === "requested" &&
      getSlotPickerRemainingSeats(occurrence) > 0)
  );
}

/**
 * Default book-mode slot-card content. Rendered inside the structural `<li>`
 * wrapper — directly, or through a custom `slotCard` renderer's
 * `renderDefault()`.
 */
function SlotPickerSlotCardContent<
  TData extends SlotPlannerSlotPayload = SlotPlannerSlotPayload,
>({
  occurrence,
  taxonomy,
  locale,
  pending,
  requestSent = false,
  onRetry,
  onRequest,
}: {
  occurrence: SlotPickerOccurrence<TData>;
  taxonomy: SlotPlannerTaxonomy;
  locale: string;
  pending: boolean;
  requestSent?: boolean;
  /** Present only while the last book request for this occurrence failed. */
  onRetry?: (() => void) | undefined;
  /** Present only on available (requestable) occurrences. */
  onRequest?: (() => void) | undefined;
}) {
  const { note, tags } = getConventionalSlotData(occurrence.slot.data);
  const showProviderContext = occurrence.timeZone !== occurrence.viewerTimeZone;
  const remainingSeats = getSlotPickerRemainingSeats(occurrence);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-[var(--dt-space-2)]">
        <span
          data-slot="slot-picker-slot-time"
          className="text-sm font-semibold"
        >
          {`${occurrence.viewerStartTime} – ${occurrence.viewerEndTime}`}
        </span>
        <span
          data-slot="slot-picker-status-badge"
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
      {showProviderContext ? (
        <p
          data-slot="slot-picker-provider-time"
          className="text-muted-foreground text-xs"
        >
          {formatSlotPlannerTemplate(taxonomy.providerTimeContext, {
            time: occurrence.startTime,
            timeZone: occurrence.timeZone,
          })}
        </p>
      ) : null}
      {tags.length > 0 ? (
        <div className="flex flex-wrap items-center gap-[var(--dt-space-1)]">
          {tags.map((tag) => (
            <span
              key={tag}
              data-slot="slot-picker-tag-chip"
              className={slotPlannerChipClasses}
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}
      {note ? (
        <p
          data-slot="slot-picker-slot-note"
          className="text-muted-foreground text-sm leading-6"
        >
          {note}
        </p>
      ) : null}
      {onRequest && occurrence.capacity > 1 ? (
        <p
          data-slot="slot-picker-remaining-seats"
          className="text-muted-foreground text-xs"
        >
          {formatSlotPlannerCountTemplate(
            taxonomy.remainingSeats,
            remainingSeats,
            { remaining: remainingSeats },
            locale,
          )}
        </p>
      ) : null}
      {occurrence.status === "booked" ? (
        <p
          data-slot="slot-picker-slot-full"
          className="text-muted-foreground text-xs font-medium"
        >
          {taxonomy.slotFull}
        </p>
      ) : null}
      {onRequest ? (
        <button
          type="button"
          data-slot="slot-picker-request"
          className={slotPlannerSlotActionButtonClasses}
          aria-disabled={pending || requestSent || undefined}
          data-disabled={pending || requestSent || undefined}
          onClick={() => {
            // `aria-disabled` keeps the button focusable across the request
            // (native `disabled` would drop keyboard focus to the body); the
            // guard stops a second activation from firing mid-request.
            if (pending || requestSent) {
              return;
            }

            onRequest();
          }}
        >
          {requestSent
            ? taxonomy.bookRequestSent
            : formatSlotPlannerTemplate(taxonomy.requestSlot, {
                slot: taxonomy.slot,
                slotPlural: taxonomy.slotPlural,
              })}
        </button>
      ) : null}
      {pending ? (
        <p
          data-slot="slot-picker-request-pending"
          className={slotPlannerSavePendingClasses}
        >
          {taxonomy.bookRequestPending}
        </p>
      ) : null}
      {onRetry ? (
        <div
          data-slot="slot-picker-request-error"
          className={slotPlannerSaveErrorClasses}
        >
          <span>{taxonomy.bookRequestError}</span>
          <button
            type="button"
            data-slot="slot-picker-retry"
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

function SlotPickerInner<
  TData extends SlotPlannerSlotPayload = SlotPlannerSlotPayload,
>(
  {
    className,
    slots,
    viewerTimeZone,
    onBookRequest,
    taxonomy,
    view: controlledView,
    defaultView = "week",
    onViewChange,
    focusedDate,
    defaultFocusedDate,
    onFocusedDateChange,
    now,
    locale = "en",
    title,
    loading = false,
    error,
    reducedMotion,
    renderers,
    ...props
  }: SlotPickerProps<TData>,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const baseId = useId();
  const panelId = `${baseId}-panel`;
  const prefersReducedMotion = useReducedMotion();
  const resolvedReducedMotion = reducedMotion ?? prefersReducedMotion === true;
  const motionEnabled = !resolvedReducedMotion;
  const [internalView, setInternalView] = useState(defaultView);
  const currentView = controlledView ?? internalView;
  const setView = useCallback(
    (nextView: SlotPlannerView) => {
      if (controlledView === undefined) {
        setInternalView(nextView);
      }

      if (nextView !== currentView) {
        onViewChange?.(nextView);
      }
    },
    [controlledView, currentView, onViewChange],
  );

  // Both fallbacks are captured once so an unmounted-and-remounted render
  // stays internally consistent; pass the props for deterministic renders.
  const [environmentTimeZone] = useState(
    () => new Intl.DateTimeFormat().resolvedOptions().timeZone,
  );
  const resolvedViewerTimeZone = viewerTimeZone ?? environmentTimeZone;
  const [fallbackNow] = useState(() => new Date().toISOString());
  const resolvedNow = now ?? fallbackNow;
  const todayIso = getSlotPlannerIsoDateInZone(
    Date.parse(resolvedNow),
    resolvedViewerTimeZone,
  );

  const resolvedTaxonomy = useMemo(
    () => resolveSlotPlannerTaxonomy(taxonomy),
    [taxonomy],
  );
  const nounTemplateTokens = {
    slot: resolvedTaxonomy.slot,
    slotPlural: resolvedTaxonomy.slotPlural,
  };

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
  const rangeStart = currentView === "week" ? weekDays[0]! : currentFocusedDate;
  const rangeEnd = currentView === "week" ? weekDays[6]! : currentFocusedDate;
  // Occurrences are expanded in the provider zone and bucketed by the
  // VIEWER-zone date of their start instant; draft/cancelled never surface.
  const occurrencesByViewerDate = useMemo(
    () =>
      expandSlotsForViewerZone(
        slots,
        rangeStart,
        rangeEnd,
        resolvedNow,
        resolvedViewerTimeZone,
      ),
    [rangeEnd, rangeStart, resolvedNow, resolvedViewerTimeZone, slots],
  );
  const selectedOccurrences = occurrencesByViewerDate[currentFocusedDate] ?? [];
  const isPastDay = currentFocusedDate < todayIso;

  // Book requests reuse the CRUD pending/error/retry machinery, keyed per
  // provider-zone occurrence identity.
  const { pendingKeys, retryByKey, run } = useSlotPlannerCrud();
  const [sentRequests, setSentRequests] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  // The nonce advances on every announcement so identical consecutive
  // messages still mutate the live region's DOM (via the keyed span) instead
  // of being dropped by React's bail-out.
  const [announcementState, setAnnouncementState] = useState<{
    text: string;
    nonce: number;
  }>(() => ({ nonce: 0, text: "" }));
  const setAnnouncement = useCallback((text: string) => {
    setAnnouncementState((previous) => ({
      nonce: previous.nonce + 1,
      text,
    }));
  }, []);
  const announcement = announcementState.text;
  const announcementNonce = announcementState.nonce;

  // Announces failures politely: a key newly appearing in retryByKey means
  // its book-request promise rejected.
  const previousRetryKeysRef = useRef<ReadonlySet<string>>(new Set());

  useEffect(() => {
    const previous = previousRetryKeysRef.current;
    const currentKeys = new Set(retryByKey.keys());

    previousRetryKeysRef.current = currentKeys;

    for (const key of currentKeys) {
      if (!previous.has(key)) {
        setAnnouncement(
          formatSlotPlannerTemplate(resolvedTaxonomy.bookRequestError, {
            slot: resolvedTaxonomy.slot,
            slotPlural: resolvedTaxonomy.slotPlural,
          }),
        );

        return;
      }
    }
  }, [resolvedTaxonomy, retryByKey, setAnnouncement]);

  const requestOccurrence = (occurrence: SlotPickerOccurrence<TData>) => {
    const key = getSlotPickerOccurrenceKey(
      occurrence.slotId,
      occurrence.occurrenceDate,
    );
    if (sentRequests.has(key)) return;
    const payload: SlotPlannerBookRequestPayload = {
      slotId: occurrence.slotId,
      occurrenceDate: occurrence.occurrenceDate,
      seats: 1,
      viewerTimeZone: resolvedViewerTimeZone,
    };

    // Pending is announced immediately; a synchronous (or resolved) callback
    // overwrites it with the success announcement in the same pass.
    setAnnouncement(
      formatSlotPlannerTemplate(
        resolvedTaxonomy.bookRequestPending,
        nounTemplateTokens,
      ),
    );
    run({
      key: getSlotPickerOccurrenceKey(
        occurrence.slotId,
        occurrence.occurrenceDate,
      ),
      execute: () => onBookRequest?.(payload),
      onSuccess: () => {
        setSentRequests((previous) => new Set(previous).add(key));
        setAnnouncement(
          formatSlotPlannerTemplate(
            resolvedTaxonomy.announceBookRequested,
            nounTemplateTokens,
          ),
        );
      },
    });
  };

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

  // Logical week-navigation direction, mirrored from the manage-mode
  // SlotPlanner so both modes animate week changes identically.
  const weekStart = weekDays[0]!;
  const [weekNavigation, setWeekNavigation] = useState<{
    start: string;
    direction: -1 | 0 | 1;
  }>({ start: weekStart, direction: 0 });
  const weekDirection =
    weekNavigation.start === weekStart
      ? weekNavigation.direction
      : weekStart > weekNavigation.start
        ? 1
        : -1;
  if (weekNavigation.start !== weekStart) {
    setWeekNavigation({ start: weekStart, direction: weekDirection });
  }
  const [isRtl, setIsRtl] = useState(false);

  useEffect(() => {
    if (rootRef.current) {
      setIsRtl(getSlotPlannerDirection(rootRef.current) === "rtl");
    }
  }, []);

  const weekSlideFactor = weekDirection * (isRtl ? -1 : 1);

  const moveWeek = (weeks: number) => {
    setFocusedDate(parseDate(currentFocusedDate).add({ weeks }).toString());
  };
  const goToPreviousWeek = () => moveWeek(-1);
  const goToNextWeek = () => moveWeek(1);
  const goToThisWeek = () => setFocusedDate(todayIso);

  const tabRefs = useRef(new Map<string, HTMLButtonElement>());
  const getTabId = (date: string) => `${baseId}-tab-${date}`;
  const railOrientation = useSlotPlannerRailOrientation();
  const handleRailKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const direction = getSlotPlannerDirection(event.currentTarget);
    const forwardKey = direction === "rtl" ? "ArrowLeft" : "ArrowRight";
    const backwardKey = direction === "rtl" ? "ArrowRight" : "ArrowLeft";
    const currentIndex = weekDays.indexOf(currentFocusedDate);
    let nextIndex: number;

    // ArrowUp/ArrowDown mirror the vertical (`md:` and up) rail layout, and
    // stay accepted in the horizontal layout so navigation never depends on
    // which axis the tablist happens to render along.
    if (event.key === forwardKey || event.key === "ArrowDown") {
      nextIndex = (currentIndex + 1) % weekDays.length;
    } else if (event.key === backwardKey || event.key === "ArrowUp") {
      nextIndex = (currentIndex + weekDays.length - 1) % weekDays.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = weekDays.length - 1;
    } else {
      return;
    }

    event.preventDefault();

    const nextDate = weekDays[nextIndex]!;

    setFocusedDate(nextDate);
    tabRefs.current.get(nextDate)?.focus();
  };

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
    () =>
      new Intl.DateTimeFormat(locale, { dateStyle: "full", timeZone: "UTC" }),
    [locale],
  );

  const formattedFocusedDate = longDateFormatter.format(
    toUtcDate(currentFocusedDate),
  );

  // Mirrors the manage-mode planner's week-change announcement: navigating to
  // a new week (week view) or a new day (day view) is announced politely.
  // Pure view toggles and the first mount stay silent, and switching to a
  // week already announced by the other view never re-fires.
  const announcedNavRef = useRef<{
    view: SlotPlannerView;
    anchor: string;
  } | null>(null);

  useEffect(() => {
    const anchor = currentView === "day" ? currentFocusedDate : weekStart;
    const previous = announcedNavRef.current;

    announcedNavRef.current = { anchor, view: currentView };

    if (!previous || previous.view !== currentView) {
      return;
    }

    if (previous.anchor === anchor) {
      return;
    }

    setAnnouncement(
      currentView === "day"
        ? formattedFocusedDate
        : formatSlotPlannerTemplate(resolvedTaxonomy.announceWeekChanged, {
            slot: resolvedTaxonomy.slot,
            slotPlural: resolvedTaxonomy.slotPlural,
            weekStart,
          }),
    );
  }, [
    currentFocusedDate,
    currentView,
    formattedFocusedDate,
    resolvedTaxonomy,
    setAnnouncement,
    weekStart,
  ]);

  const defaultEmptyDay = (
    <p
      data-slot="slot-picker-empty-day"
      className="text-muted-foreground text-sm"
    >
      {resolvedTaxonomy.emptyDay}
    </p>
  );
  const hasExternalError =
    error !== undefined && error !== null && error !== false;
  const externalErrorContent =
    typeof error === "boolean" ? resolvedTaxonomy.error : error;
  const defaultLoading = (
    <p
      role="status"
      data-slot="slot-picker-loading"
      className="text-muted-foreground text-sm"
    >
      {resolvedTaxonomy.loading}
    </p>
  );
  const defaultError = (
    <div
      role="alert"
      data-slot="slot-picker-error"
      className={slotPlannerSaveErrorClasses}
    >
      {externalErrorContent ?? resolvedTaxonomy.error}
    </div>
  );
  const returnToCurrentLabel =
    currentView === "day" ? resolvedTaxonomy.today : resolvedTaxonomy.thisWeek;
  const returnToCurrentDisabled =
    currentView === "day" && currentFocusedDate === todayIso;
  const moveDay = (days: number) => {
    setFocusedDate(parseDate(currentFocusedDate).add({ days }).toString());
  };
  const goToPreviousPeriod =
    currentView === "day" ? () => moveDay(-1) : goToPreviousWeek;
  const goToNextPeriod =
    currentView === "day" ? () => moveDay(1) : goToNextWeek;
  const previousPeriodLabel =
    currentView === "day"
      ? resolvedTaxonomy.previousDay
      : resolvedTaxonomy.previousWeek;
  const nextPeriodLabel =
    currentView === "day"
      ? resolvedTaxonomy.nextDay
      : resolvedTaxonomy.nextWeek;

  const availableCount = selectedOccurrences.filter((occurrence) =>
    isSlotPickerOccurrenceAvailable(occurrence),
  ).length;

  const dayPanel = (
    <div
      role={currentView === "week" ? "tabpanel" : undefined}
      id={currentView === "week" ? panelId : undefined}
      aria-labelledby={
        currentView === "week" ? getTabId(currentFocusedDate) : undefined
      }
      tabIndex={currentView === "week" ? 0 : -1}
      data-slot="slot-picker-day-panel"
      data-past={isPastDay ? "true" : undefined}
      data-loading={loading ? "true" : undefined}
      data-error={hasExternalError ? "true" : undefined}
      className={slotPlannerDayPanelClasses}
    >
      <SlotPlannerWeekSlide
        motionEnabled={motionEnabled}
        slideFactor={weekSlideFactor}
        weekKey={weekStart}
        className={slotPlannerWeekPanelContentClasses}
      >
        <h3
          data-slot="slot-picker-day-heading"
          className="text-base font-semibold"
        >
          {formattedFocusedDate}
        </h3>
        {isPastDay ? (
          <p
            data-slot="slot-picker-past-day"
            className="text-muted-foreground text-sm"
          >
            {resolvedTaxonomy.pastDay}
          </p>
        ) : null}
        {loading ? (
          defaultLoading
        ) : hasExternalError ? (
          defaultError
        ) : selectedOccurrences.length === 0 ? (
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
          <>
            {availableCount === 0 ? (
              <p
                data-slot="slot-picker-all-unavailable"
                className="text-muted-foreground text-sm"
              >
                {formatSlotPlannerTemplate(
                  resolvedTaxonomy.noAvailableSlots,
                  nounTemplateTokens,
                )}
              </p>
            ) : null}
            {/* eslint-disable-next-line jsx-a11y/no-redundant-roles -- Explicit list semantics preserve VoiceOver support when CSS removes list styling. */}
            <ul
              role="list"
              data-slot="slot-picker-slot-list"
              className="m-[var(--dt-space-0)] flex list-none flex-col gap-[var(--dt-space-2)] p-[var(--dt-space-0)]"
            >
              {selectedOccurrences.map((occurrence) => {
                const key = getSlotPickerOccurrenceKey(
                  occurrence.slotId,
                  occurrence.occurrenceDate,
                );
                const available = isSlotPickerOccurrenceAvailable(occurrence);
                const requestSent = sentRequests.has(key);
                const pending = pendingKeys.has(key);
                const storedRetry = retryByKey.get(key);
                const retry = storedRetry
                  ? () => {
                      setAnnouncement(
                        formatSlotPlannerTemplate(
                          resolvedTaxonomy.bookRequestPending,
                          nounTemplateTokens,
                        ),
                      );
                      storedRetry();
                    }
                  : undefined;
                const request =
                  available && !requestSent
                    ? () => requestOccurrence(occurrence)
                    : undefined;
                const defaultCardContent = (
                  <SlotPickerSlotCardContent
                    occurrence={occurrence}
                    taxonomy={resolvedTaxonomy}
                    locale={locale}
                    pending={pending}
                    requestSent={requestSent}
                    onRetry={retry}
                    onRequest={requestSent ? () => {} : request}
                  />
                );

                return (
                  // The <li> wrapper and its data attributes are structural;
                  // unavailable occurrences render no interactive control at
                  // all — availability is conveyed by the status text.
                  <li
                    key={key}
                    data-slot="slot-picker-slot-card"
                    data-status={occurrence.status}
                    data-available={available ? "true" : undefined}
                    data-pending={pending ? "true" : undefined}
                    data-error={storedRetry ? "true" : undefined}
                    className={cn(
                      slotPlannerSlotCardClasses,
                      !available && "bg-muted/40 text-muted-foreground",
                    )}
                  >
                    {renderers?.slotCard
                      ? renderers.slotCard({
                          available,
                          error: storedRetry !== undefined,
                          occurrence,
                          pending,
                          requestSent,
                          renderDefault: () => defaultCardContent,
                          ...(request ? { request } : {}),
                          ...(retry ? { retry } : {}),
                          taxonomy: resolvedTaxonomy,
                        })
                      : defaultCardContent}
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </SlotPlannerWeekSlide>
    </div>
  );

  return (
    <MotionConfig reducedMotion={resolvedReducedMotion ? "always" : "user"}>
      <div
        {...props}
        ref={mergedRef}
        data-slot="slot-picker"
        data-view={currentView}
        data-viewer-time-zone={resolvedViewerTimeZone}
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
        <div
          data-slot="slot-picker-toolbar"
          className={slotPlannerToolbarClasses}
        >
          <div
            data-slot="slot-picker-title"
            className="min-w-0 truncate text-base font-semibold sm:text-lg"
          >
            {title}
            <p className="text-muted-foreground mt-1 text-xs font-normal">
              {resolvedViewerTimeZone.replaceAll("_", " ")}
            </p>
          </div>
          <div className="col-span-2 row-start-2 flex min-w-0 items-center justify-start gap-[var(--dt-space-1)] sm:col-span-1 sm:col-start-auto sm:row-auto sm:justify-center">
            <IconButton
              aria-label={previousPeriodLabel}
              size="sm"
              variant="outline"
              onClick={goToPreviousPeriod}
            >
              <ChevronIcon direction="backward" />
            </IconButton>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<CalendarIcon />}
              className="shadow-sm"
              disabled={returnToCurrentDisabled}
              onClick={goToThisWeek}
            >
              {returnToCurrentLabel}
            </Button>
            <IconButton
              aria-label={nextPeriodLabel}
              size="sm"
              variant="outline"
              onClick={goToNextPeriod}
            >
              <ChevronIcon direction="forward" />
            </IconButton>
          </div>
          <div
            role="group"
            aria-label={resolvedTaxonomy.viewSwitcherLabel}
            data-slot="slot-picker-view-switch"
            className="border-border bg-background col-start-2 row-start-1 flex items-center gap-[var(--dt-space-1)] justify-self-end rounded-md border p-0.5 sm:col-auto sm:row-auto"
          >
            {(["week", "day"] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={currentView === option}
                data-slot="slot-picker-view-switch-option"
                data-view={option}
                className={cn(
                  "text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring focus-visible:ring-offset-background inline-flex h-7 items-center rounded px-[var(--dt-space-2)] text-xs font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none motion-safe:transition-colors motion-safe:duration-150",
                  currentView === option &&
                    "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                )}
                onClick={() => setView(option)}
              >
                {option === "week"
                  ? resolvedTaxonomy.weekView
                  : resolvedTaxonomy.dayView}
              </button>
            ))}
          </div>
        </div>
        {currentView === "week" ? (
          <div
            data-slot="slot-picker-week-layout"
            className="grid min-w-0 gap-[var(--dt-space-3)] md:grid-cols-[10rem_minmax(0,1fr)]"
          >
            {/* eslint-disable-next-line jsx-a11y/interactive-supports-focus -- The tablist delegates keyboard events to its roving, focusable tab buttons. */}
            <div
              role="tablist"
              aria-label={resolvedTaxonomy.weekRailLabel}
              aria-orientation={railOrientation}
              data-slot="slot-picker-day-rail"
              className={slotPlannerDayRailClasses}
              onKeyDown={handleRailKeyDown}
            >
              {weekDays.map((date) => {
                const selected = date === currentFocusedDate;
                const summary = summarizeSlotPlannerDay(
                  occurrencesByViewerDate[date] ?? [],
                );

                return (
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
                    data-slot="slot-picker-day-tab"
                    data-selected={selected ? "true" : undefined}
                    data-today={date === todayIso ? "true" : undefined}
                    data-past={date < todayIso ? "true" : undefined}
                    className={slotPlannerDayTabClasses}
                    onClick={() => setFocusedDate(date)}
                  >
                    {selected ? (
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
                      <span className="text-muted-foreground text-xs font-medium">
                        {weekdayFormatter.format(toUtcDate(date))}
                      </span>
                      <span className="text-sm font-semibold">
                        {dayMonthFormatter.format(toUtcDate(date))}
                      </span>
                      {slotPickerVisibleStatuses
                        .filter((status) => summary[status] > 0)
                        .map((status) => {
                          const summaryText = formatSlotPlannerCountTemplate(
                            resolvedTaxonomy.statusCountSummary,
                            summary[status],
                            {
                              statusLabel:
                                resolvedTaxonomy.statusLabels[status],
                            },
                            locale,
                          );

                          return (
                            <span
                              key={status}
                              title={summaryText}
                              data-slot="slot-picker-day-summary"
                              data-status={status}
                              className="text-muted-foreground flex w-full min-w-0 items-center gap-[var(--dt-space-1)] overflow-hidden text-xs whitespace-nowrap"
                            >
                              <span
                                aria-hidden="true"
                                className={cn(
                                  "size-1.5 shrink-0 rounded-full",
                                  slotPlannerStatusDotClasses[status],
                                )}
                              />
                              <span
                                data-slot="slot-picker-day-summary-text"
                                className="min-w-0 truncate"
                              >
                                {summaryText}
                              </span>
                            </span>
                          );
                        })}
                    </SlotPlannerDayTabContent>
                  </button>
                );
              })}
            </div>
            {dayPanel}
          </div>
        ) : (
          dayPanel
        )}
        <div
          aria-live="polite"
          data-slot="slot-picker-live-region"
          className="sr-only"
        >
          {/* Keyed on the nonce so a repeated identical message still swaps the
              text node and gets announced instead of being a silent no-op. */}
          <span key={announcementNonce}>{announcement}</span>
        </div>
      </div>
    </MotionConfig>
  );
}

export const SlotPicker = forwardRef(SlotPickerInner) as (<
  TData extends SlotPlannerSlotPayload = SlotPlannerSlotPayload,
>(
  props: SlotPickerProps<TData> & RefAttributes<HTMLDivElement>,
) => ReactElement | null) & { displayName?: string };

SlotPicker.displayName = "SlotPicker";
