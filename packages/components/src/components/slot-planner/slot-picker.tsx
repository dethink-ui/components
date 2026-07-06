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
import {
  slotPlannerOccurrenceStatuses,
  type SlotPlannerBookRequestPayload,
  type SlotPlannerSlotData,
  type SlotPlannerSlotPayload,
  type SlotPlannerTaxonomy,
  type SlotPlannerTaxonomyInput,
} from "./slot-planner-contract";
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
  view?: SlotPlannerView;
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
  onRetry,
  onRequest,
}: {
  occurrence: SlotPickerOccurrence<TData>;
  taxonomy: SlotPlannerTaxonomy;
  locale: string;
  pending: boolean;
  /** Present only while the last book request for this occurrence failed. */
  onRetry?: (() => void) | undefined;
  /** Present only on available (requestable) occurrences. */
  onRequest?: (() => void) | undefined;
}) {
  const { note, tags } = getConventionalSlotData(occurrence.slot.data);
  const showProviderContext = occurrence.timeZone !== occurrence.viewerTimeZone;
  const remainingSeats = occurrence.capacity - occurrence.bookedCount;

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
          className="text-xs text-muted-foreground"
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
          className="text-sm leading-6 text-muted-foreground"
        >
          {note}
        </p>
      ) : null}
      {occurrence.status === "requestable" && occurrence.capacity > 1 ? (
        <p
          data-slot="slot-picker-remaining-seats"
          className="text-xs text-muted-foreground"
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
          className="text-xs font-medium text-muted-foreground"
        >
          {taxonomy.slotFull}
        </p>
      ) : null}
      {onRequest ? (
        <button
          type="button"
          data-slot="slot-picker-request"
          className={slotPlannerSlotActionButtonClasses}
          disabled={pending}
          onClick={onRequest}
        >
          {formatSlotPlannerTemplate(taxonomy.requestSlot, {
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
    view = "week",
    focusedDate,
    defaultFocusedDate,
    onFocusedDateChange,
    now,
    locale = "en",
    title,
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
  const rangeStart = view === "week" ? weekDays[0]! : currentFocusedDate;
  const rangeEnd = view === "week" ? weekDays[6]! : currentFocusedDate;
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
  const selectedOccurrences =
    occurrencesByViewerDate[currentFocusedDate] ?? [];
  const isPastDay = currentFocusedDate < todayIso;

  // Book requests reuse the CRUD pending/error/retry machinery, keyed per
  // provider-zone occurrence identity.
  const { pendingKeys, retryByKey, run } = useSlotPlannerCrud();
  const [announcement, setAnnouncement] = useState("");

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
  }, [resolvedTaxonomy, retryByKey]);

  const requestOccurrence = (occurrence: SlotPickerOccurrence<TData>) => {
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

  const moveWeek = (weeks: number) => {
    setFocusedDate(parseDate(currentFocusedDate).add({ weeks }).toString());
  };
  const goToPreviousWeek = () => moveWeek(-1);
  const goToNextWeek = () => moveWeek(1);
  const goToThisWeek = () => setFocusedDate(todayIso);

  const tabRefs = useRef(new Map<string, HTMLButtonElement>());
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

  const defaultEmptyDay = (
    <p
      data-slot="slot-picker-empty-day"
      className="text-sm text-muted-foreground"
    >
      {resolvedTaxonomy.emptyDay}
    </p>
  );

  const availableCount = selectedOccurrences.filter(
    (occurrence) => occurrence.status === "requestable",
  ).length;

  const dayPanel = (
    <div
      role={view === "week" ? "tabpanel" : undefined}
      id={view === "week" ? panelId : undefined}
      aria-labelledby={
        view === "week" ? getTabId(currentFocusedDate) : undefined
      }
      tabIndex={view === "week" ? 0 : -1}
      data-slot="slot-picker-day-panel"
      data-past={isPastDay ? "true" : undefined}
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
          <>
            {availableCount === 0 ? (
              <p
                data-slot="slot-picker-all-unavailable"
                className="text-sm text-muted-foreground"
              >
                {formatSlotPlannerTemplate(
                  resolvedTaxonomy.noAvailableSlots,
                  nounTemplateTokens,
                )}
              </p>
            ) : null}
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
                const available = occurrence.status === "requestable";
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
                const request = available
                  ? () => requestOccurrence(occurrence)
                  : undefined;
                const defaultCardContent = (
                  <SlotPickerSlotCardContent
                    occurrence={occurrence}
                    taxonomy={resolvedTaxonomy}
                    locale={locale}
                    pending={pending}
                    onRetry={retry}
                    onRequest={request}
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
        data-view={view}
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
        {view === "week" ? (
          <>
            <div
              data-slot="slot-picker-toolbar"
              className={slotPlannerToolbarClasses}
            >
              <div data-slot="slot-picker-title" className="text-lg font-semibold">
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
            </div>
            <div
              role="tablist"
              aria-label={formatSlotPlannerTemplate(
                resolvedTaxonomy.announceWeekChanged,
                { weekStart: longDateFormatter.format(toUtcDate(weekDays[0]!)) },
              )}
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
                      <span className="text-xs font-medium text-muted-foreground">
                        {weekdayFormatter.format(toUtcDate(date))}
                      </span>
                      <span className="text-sm font-semibold">
                        {dayMonthFormatter.format(toUtcDate(date))}
                      </span>
                      {slotPickerVisibleStatuses
                        .filter((status) => summary[status] > 0)
                        .map((status) => (
                          <span
                            key={status}
                            data-slot="slot-picker-day-summary"
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
                              {
                                statusLabel:
                                  resolvedTaxonomy.statusLabels[status],
                              },
                              locale,
                            )}
                          </span>
                        ))}
                    </SlotPlannerDayTabContent>
                  </button>
                );
              })}
            </div>
          </>
        ) : null}
        {dayPanel}
        <div
          aria-live="polite"
          data-slot="slot-picker-live-region"
          className="sr-only"
        >
          {announcement}
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
