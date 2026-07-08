/**
 * SlotPlanner public data contract.
 *
 * Every type in this module is JSON-serializable by convention: values are
 * plain in-memory objects (typically deserialized API payloads) built from
 * ISO 8601 date/time strings, IANA time-zone identifiers, numbers, strings,
 * booleans, arrays, and plain nested objects. SlotPlanner never parses or
 * emits JSON text itself, and callback payloads round-trip losslessly
 * through `JSON.stringify`/`JSON.parse`.
 *
 * Recurring slots are modeled as wall-clock time bound to an IANA zone so
 * series survive DST transitions predictably.
 *
 * Stored versus derived state: `SlotPlannerSlotState` is the stored
 * definition lifecycle of a slot. Time- and booking-dependent conditions
 * (requested, booked, expired) are never stored — they are derived per
 * occurrence at render time as `SlotPlannerOccurrenceStatus`.
 */

/** Stored definition lifecycle of a slot. */
export const slotPlannerSlotStates = [
  "draft",
  "requestable",
  "blocked",
  "cancelled",
] as const;

export type SlotPlannerSlotState = (typeof slotPlannerSlotStates)[number];

/**
 * Render-time status of one occurrence. Derived — never stored — by this
 * precedence:
 *
 * 1. `cancelled` — the slot state is `cancelled`, or the occurrence's
 *    override has `cancelled: true`
 * 2. `blocked` — the slot state is `blocked`
 * 3. `draft` — the slot state is `draft`
 * 4. `expired` — the occurrence's end is in the past
 * 5. `booked` — the occurrence's booked count has reached `capacity`
 * 6. `requested` — the occurrence's requested count is greater than zero
 * 7. `requestable`
 *
 * Booking counts resolve per occurrence: an override's `bookedCount` /
 * `requestedCount` wins; otherwise the slot-level counts apply only to the
 * occurrence on the slot's own `date`; every other occurrence defaults to 0.
 */
export const slotPlannerOccurrenceStatuses = [
  "draft",
  "requestable",
  "requested",
  "booked",
  "blocked",
  "expired",
  "cancelled",
] as const;

export type SlotPlannerOccurrenceStatus =
  (typeof slotPlannerOccurrenceStatuses)[number];

export type SlotPlannerRecurrenceFrequency = "weekly" | "biweekly";

/**
 * Open payload bag attached to a slot. Opaque to SlotPlanner itself: default
 * renderers read only the conventional keys in
 * `SlotPlannerConventionalSlotData` and ignore everything else, while custom
 * renderers receive the full bag untouched. Must stay JSON-serializable.
 */
export type SlotPlannerSlotPayload = Record<string, unknown>;

/**
 * Conventional `data` keys understood by the default renderers. Consumers
 * are free to use any other keys alongside these.
 */
export type SlotPlannerConventionalSlotData = {
  /** Session-type tags rendered as chips on the default slot card. */
  tags?: string[];
  /** Free-form note rendered on the default slot card when present. */
  note?: string;
};

/**
 * Override for a single occurrence of a recurring slot, keyed by the
 * occurrence's ISO date (`YYYY-MM-DD`) in the slot's time zone.
 *
 * `cancelled: true` is the only occurrence-removal mechanism; whole-series
 * cancellation uses the slot-level `state: "cancelled"` instead.
 */
export type SlotPlannerOccurrenceOverride = {
  /** ISO date (`YYYY-MM-DD`) of the occurrence being overridden. */
  occurrenceDate: string;
  /** Removes this occurrence from the series when true. */
  cancelled?: boolean;
  /** Wall-clock start (`HH:mm`) replacing the series start for this date. */
  startTime?: string;
  durationMinutes?: number;
  /** Seats booked for this occurrence, replacing the 0 default. */
  bookedCount?: number;
  /** Seats requested (pending) for this occurrence, replacing the 0 default. */
  requestedCount?: number;
};

export type SlotPlannerRecurrence = {
  frequency: SlotPlannerRecurrenceFrequency;
  /**
   * ISO date (`YYYY-MM-DD`) of the last day, inclusive, on which an
   * occurrence may fall. The series is open-ended when omitted.
   */
  until?: string;
  overrides?: SlotPlannerOccurrenceOverride[];
};

/**
 * A bookable slot definition. Single slots occur once on `date`; recurring
 * slots treat `date` as the first occurrence and repeat per `recurrence`.
 * Times are wall-clock values interpreted in `timeZone`.
 */
export type SlotPlannerSlotData<
  TData extends SlotPlannerSlotPayload = SlotPlannerSlotPayload,
> = {
  id: string;
  /** ISO date (`YYYY-MM-DD`) of the first or only occurrence. */
  date: string;
  /** Wall-clock start time (`HH:mm`, 24-hour). */
  startTime: string;
  durationMinutes: number;
  /** IANA zone (e.g. `Europe/London`) the wall-clock times are bound to. */
  timeZone: string;
  /**
   * Stored definition lifecycle. Occurrence availability (requested,
   * booked, expired) is derived per `SlotPlannerOccurrenceStatus`, never
   * stored here.
   */
  state: SlotPlannerSlotState;
  recurrence?: SlotPlannerRecurrence;
  /** Seats available per occurrence. Defaults to 1. */
  capacity?: number;
  /**
   * Seats booked for the occurrence on this slot's own `date`. Other
   * occurrences of a series carry their counts on overrides. Defaults to 0.
   */
  bookedCount?: number;
  /**
   * Seats requested (pending confirmation) for the occurrence on this
   * slot's own `date`. Same per-occurrence rule as `bookedCount`.
   * Defaults to 0.
   */
  requestedCount?: number;
  bufferBeforeMinutes?: number;
  bufferAfterMinutes?: number;
  /** Open, JSON-serializable payload for custom renderers. */
  data?: TData;
};

/** Identity of one concrete occurrence of a (possibly recurring) slot. */
export type SlotPlannerOccurrenceRef = {
  slotId: string;
  /** ISO date (`YYYY-MM-DD`) of the occurrence in the slot's time zone. */
  occurrenceDate: string;
};

/**
 * Declarative rules validated by the exported constraints utility and
 * surfaced inline by SlotPlanner. Enforcement authority stays with the app.
 */
export type SlotPlannerConstraints = {
  /** Maximum requestable occurrences per day. */
  dailyRequestableCap?: number;
  /** Maximum requestable occurrences per week. */
  weeklyRequestableCap?: number;
  minDurationMinutes?: number;
  maxDurationMinutes?: number;
  /** Durations must be a multiple of this increment (e.g. 15). */
  durationIncrementMinutes?: number;
  /** Minimum lead time between "now" and a bookable occurrence start. */
  minNoticeMinutes?: number;
  /** How far ahead, in days, occurrences may be booked. */
  bookingHorizonDays?: number;
  /** ISO dates (`YYYY-MM-DD`) on which no slot may occur. */
  blackoutDates?: string[];
  /**
   * ISO weekday numbers (1 = Monday … 7 = Sunday) on which slots may occur.
   * All days are working days when omitted.
   */
  workingDays?: number[];
};

/** Machine-readable constraint violation kinds. */
export const slotPlannerViolationCodes = [
  "daily-cap",
  "weekly-cap",
  "overlap",
  "min-duration",
  "max-duration",
  "duration-increment",
  "min-notice",
  "booking-horizon",
  "blackout-date",
  "non-working-day",
  "invalid-wall-clock-time",
] as const;

export type SlotPlannerViolationCode =
  (typeof slotPlannerViolationCodes)[number];

/**
 * Structured constraint violation. Apps filter and log by `code`; the
 * taxonomy's `violationMessages` render codes to human-readable text for the
 * inline UI, with `params` available as `{tokens}`.
 */
export type SlotPlannerViolation = {
  code: SlotPlannerViolationCode;
  params?: Record<string, string | number>;
};

/**
 * Count-aware message template keyed by CLDR plural categories (as produced
 * by `Intl.PluralRules`). `other` is the required fallback; the remaining
 * categories are optional refinements. `{tokens}` are replaced with runtime
 * values.
 */
export type SlotPlannerCountTemplate = {
  zero?: string;
  one?: string;
  two?: string;
  few?: string;
  many?: string;
  other: string;
};

/**
 * Every noun, verb, and announcement SlotPlanner renders, across manage and
 * book modes. Values are plain strings or count templates; `{tokens}` are
 * replaced with runtime values, including `{slot}`/`{slotPlural}` (the
 * configured nouns) and `{statusLabel}`/`{requestableLabel}` (resolved
 * entries from `statusLabels`, so summaries can never drift from the
 * labels). Override any subset via the `taxonomy` prop; the defaults speak
 * neutral slot language.
 */
export type SlotPlannerTaxonomy = {
  /** Singular noun for a slot, e.g. "slot", "session", "appointment". */
  slot: string;
  slotPlural: string;
  /** Labels for derived occurrence statuses (chips, summaries, filters). */
  statusLabels: Record<SlotPlannerOccurrenceStatus, string>;
  addSlot: string;
  editSlot: string;
  deleteSlot: string;
  deleteSeries: string;
  recurringWeekly: string;
  recurringBiweekly: string;
  copyDay: string;
  copyWeek: string;
  clearDay: string;
  viewSwitcherLabel: string;
  weekView: string;
  dayView: string;
  /** Legend for the copy-day target-date checkbox group. */
  copyDayTargetsLegend: string;
  copyWeekConfirmTitle: string;
  /** Tokens: `{slot}`, `{slotPlural}`. */
  copyWeekConfirmBody: string;
  clearDayConfirmTitle: string;
  /** Tokens: `{slot}`, `{slotPlural}`. */
  clearDayConfirmBody: string;
  /** Confirm action for copy operations. */
  apply: string;
  previousWeek: string;
  nextWeek: string;
  previousDay: string;
  nextDay: string;
  thisWeek: string;
  today: string;
  /**
   * Day-card summary for one status count, e.g. "2 requestable". Tokens:
   * `{count}`, `{statusLabel}`. Plural category keyed on `{count}`.
   */
  statusCountSummary: SlotPlannerCountTemplate;
  /**
   * Daily cap meter. Tokens: `{used}`, `{cap}`, `{requestableLabel}`,
   * `{slot}`, `{slotPlural}`. Plural category keyed on `{cap}`.
   */
  dailyCapSummary: SlotPlannerCountTemplate;
  /** Weekly cap meter; same tokens as `dailyCapSummary`. */
  weeklyCapSummary: SlotPlannerCountTemplate;
  /** Book-mode remaining seats. Tokens: `{remaining}`. */
  remainingSeats: SlotPlannerCountTemplate;
  /** Duration chip text. Tokens: `{count}`. */
  durationSummary: SlotPlannerCountTemplate;
  /** Buffer metadata text. Tokens: `{count}`. */
  bufferSummary: SlotPlannerCountTemplate;
  emptyDay: string;
  pastDay: string;
  loading: string;
  error: string;
  /** Book-mode request action label. Tokens: `{slot}`. */
  requestSlot: string;
  /** Book-mode label for an occurrence with no seats left. */
  slotFull: string;
  /**
   * Book-mode secondary line giving the provider-zone wall-clock context of
   * an occurrence, shown when the viewer's zone differs from the slot's
   * zone. Tokens: `{time}` (provider wall-clock start), `{timeZone}` (the
   * slot's IANA zone).
   */
  providerTimeContext: string;
  /**
   * Book-mode message shown when the focused day has occurrences but none
   * of them are requestable. Tokens: `{slot}`, `{slotPlural}`.
   */
  noAvailableSlots: string;
  /** Affordance shown while a mutation callback promise is pending. */
  savePending: string;
  /** Affordance shown when a mutation callback promise rejects. */
  saveError: string;
  retry: string;
  /** Affordance shown while a book-request callback promise is pending. */
  bookRequestPending: string;
  /** Affordance shown when a book-request callback promise rejects. */
  bookRequestError: string;
  /** Editor dialog title when creating. Tokens: `{slot}`. */
  editorCreateTitle: string;
  /** Editor dialog title when editing. Tokens: `{slot}`. */
  editorEditTitle: string;
  /** Legend for the occurrence-versus-series edit scope choice. */
  editScopeLegend: string;
  editScopeOccurrence: string;
  editScopeSeries: string;
  fieldDate: string;
  fieldStartTime: string;
  fieldDurationMinutes: string;
  fieldCapacity: string;
  fieldTimeZone: string;
  fieldBufferBeforeMinutes: string;
  fieldBufferAfterMinutes: string;
  fieldTags: string;
  fieldNote: string;
  fieldRecurrence: string;
  recurrenceNone: string;
  /** Label for the repeat-until date, shown only for recurring slots. */
  recurrenceUntil: string;
  save: string;
  cancel: string;
  confirmDelete: string;
  /** Choice deleting a single occurrence of a recurring {slot}. */
  deleteOccurrence: string;
  /** Tokens: `{slot}`. */
  deleteOccurrenceConfirmTitle: string;
  /** Tokens: `{slot}`. */
  deleteSeriesConfirmTitle: string;
  /** Tokens: `{slot}`. */
  deleteSeriesConfirmBody: string;
  /**
   * Human-readable rendering of structured constraint violations. Violation
   * `params` are available as `{tokens}`.
   */
  violationMessages: Record<SlotPlannerViolationCode, string>;
  /** Heading for the editor's inline violation list. */
  violationsHeading: string;
  /** Template announced after creation, e.g. "{slot} added". */
  announceCreated: string;
  announceUpdated: string;
  announceDeleted: string;
  announceSeriesDeleted: string;
  /** Template announced on week change, e.g. "Showing week of {weekStart}". */
  announceWeekChanged: string;
  announceDailyCapReached: string;
  announceWeeklyCapReached: string;
  /**
   * Accepted half of a batch announcement, e.g. "2 slots added". Plural
   * category keyed on the accepted count.
   */
  announceBatchApplied: SlotPlannerCountTemplate;
  /**
   * Rejected half of a batch announcement, e.g. "1 slot rejected". Announced
   * after `announceBatchApplied` (joined with ". ") when a batch has
   * rejections. Plural category keyed on the rejected count.
   */
  announceBatchRejected: SlotPlannerCountTemplate;
  announceDayCleared: string;
  /** Announced after a book request is submitted. Tokens: `{slot}`. */
  announceBookRequested: string;
};

/** Partial taxonomy accepted by the `taxonomy` prop and merged over defaults. */
export type SlotPlannerTaxonomyInput = Partial<
  Omit<SlotPlannerTaxonomy, "statusLabels" | "violationMessages">
> & {
  statusLabels?: Partial<Record<SlotPlannerOccurrenceStatus, string>>;
  violationMessages?: Partial<Record<SlotPlannerViolationCode, string>>;
};

export const defaultSlotPlannerTaxonomy: SlotPlannerTaxonomy = {
  slot: "slot",
  slotPlural: "slots",
  statusLabels: {
    draft: "draft",
    requestable: "requestable",
    requested: "requested",
    booked: "booked",
    blocked: "blocked",
    expired: "expired",
    cancelled: "cancelled",
  },
  addSlot: "Add slot to this day",
  editSlot: "Edit slot",
  deleteSlot: "Delete slot",
  deleteSeries: "Delete series",
  recurringWeekly: "Recurring weekly",
  recurringBiweekly: "Recurring biweekly",
  copyDay: "Copy day",
  copyWeek: "Copy week",
  clearDay: "Clear day",
  viewSwitcherLabel: "Planner view",
  weekView: "Week",
  dayView: "Day",
  copyDayTargetsLegend: "Copy to",
  copyWeekConfirmTitle: "Copy this week forward?",
  copyWeekConfirmBody: "Copies every {slot} from this week to next week.",
  clearDayConfirmTitle: "Clear this day?",
  clearDayConfirmBody:
    "This removes every {slot} on this day. Locked {slotPlural} are kept.",
  apply: "Apply",
  previousWeek: "Previous week",
  nextWeek: "Next week",
  previousDay: "Previous day",
  nextDay: "Next day",
  thisWeek: "This week",
  today: "Today",
  statusCountSummary: {
    other: "{count} {statusLabel}",
  },
  dailyCapSummary: {
    one: "Daily cap: {used} / {cap} {requestableLabel} {slot}",
    other: "Daily cap: {used} / {cap} {requestableLabel} {slotPlural}",
  },
  weeklyCapSummary: {
    one: "Weekly cap: {used} / {cap} {requestableLabel} {slot}",
    other: "Weekly cap: {used} / {cap} {requestableLabel} {slotPlural}",
  },
  remainingSeats: {
    one: "{remaining} seat left",
    other: "{remaining} seats left",
  },
  durationSummary: {
    one: "{count} min",
    other: "{count} min",
  },
  bufferSummary: {
    one: "{count} min buffer",
    other: "{count} min buffer",
  },
  emptyDay: "No slots on this day",
  pastDay: "This day is in the past",
  loading: "Loading slots",
  error: "Unable to load slots",
  requestSlot: "Request {slot}",
  slotFull: "Full",
  providerTimeContext: "{time} {timeZone}",
  noAvailableSlots: "No {slotPlural} available on this day",
  savePending: "Saving",
  saveError: "Save failed",
  retry: "Retry",
  bookRequestPending: "Requesting",
  bookRequestError: "Request failed",
  editorCreateTitle: "Add {slot}",
  editorEditTitle: "Edit {slot}",
  editScopeLegend: "Apply changes to",
  editScopeOccurrence: "This occurrence only",
  editScopeSeries: "Entire series",
  fieldDate: "Date",
  fieldStartTime: "Start time",
  fieldDurationMinutes: "Duration (minutes)",
  fieldCapacity: "Capacity",
  fieldTimeZone: "Time zone",
  fieldBufferBeforeMinutes: "Buffer before (minutes)",
  fieldBufferAfterMinutes: "Buffer after (minutes)",
  fieldTags: "Tags",
  fieldNote: "Note",
  fieldRecurrence: "Repeats",
  recurrenceNone: "Does not repeat",
  recurrenceUntil: "Repeat until",
  save: "Save",
  cancel: "Cancel",
  confirmDelete: "Delete",
  deleteOccurrence: "Delete this occurrence",
  deleteOccurrenceConfirmTitle: "Delete this {slot}?",
  deleteSeriesConfirmTitle: "Delete this {slot} series?",
  deleteSeriesConfirmBody: "This deletes every occurrence of this {slot}.",
  violationMessages: {
    "daily-cap": "Daily cap reached",
    "weekly-cap": "Weekly cap reached",
    overlap: "Overlaps another {slot}",
    "min-duration": "Shorter than the minimum duration",
    "max-duration": "Longer than the maximum duration",
    "duration-increment": "Duration must be a multiple of {increment} minutes",
    "min-notice": "Starts sooner than the minimum notice period",
    "booking-horizon": "Starts beyond the booking horizon",
    "blackout-date": "Falls on a blackout date",
    "non-working-day": "Falls on a non-working day",
    "invalid-wall-clock-time": "Time does not exist on this date in {timeZone}",
  },
  violationsHeading: "Fix before saving",
  announceCreated: "{slot} added",
  announceUpdated: "{slot} updated",
  announceDeleted: "{slot} deleted",
  announceSeriesDeleted: "{slot} series deleted",
  announceWeekChanged: "Showing week of {weekStart}",
  announceDailyCapReached: "Daily cap reached",
  announceWeeklyCapReached: "Weekly cap reached",
  announceBatchApplied: {
    one: "{count} {slot} added",
    other: "{count} {slotPlural} added",
  },
  announceBatchRejected: {
    one: "{count} {slot} rejected",
    other: "{count} {slotPlural} rejected",
  },
  announceDayCleared: "Day cleared",
  announceBookRequested: "{slot} requested",
};

export type SlotPlannerCreatePayload<
  TData extends SlotPlannerSlotPayload = SlotPlannerSlotPayload,
> = {
  slot: SlotPlannerSlotData<TData>;
};

export type SlotPlannerUpdatePayload<
  TData extends SlotPlannerSlotPayload = SlotPlannerSlotPayload,
> = {
  slot: SlotPlannerSlotData<TData>;
  previous: SlotPlannerSlotData<TData>;
};

export type SlotPlannerDeleteOccurrencePayload = SlotPlannerOccurrenceRef;

export type SlotPlannerDeleteSeriesPayload = {
  slotId: string;
};

export type SlotPlannerBookRequestPayload = SlotPlannerOccurrenceRef & {
  /** Seats requested. Defaults to 1. */
  seats?: number;
  /** IANA zone the requester was viewing when selecting the occurrence. */
  viewerTimeZone?: string;
};

/**
 * Batch payload emitted by copy-day, copy-week, and clear-day operations.
 * `createdSlots` and the ids keyed in `violations` are disjoint: a slot is
 * either created or rejected with its violations, never both.
 */
export type SlotPlannerBatchChangePayload<
  TData extends SlotPlannerSlotPayload = SlotPlannerSlotPayload,
> = {
  createdSlots: SlotPlannerSlotData<TData>[];
  deletedSlotIds: string[];
  /**
   * Full replacements for existing slots, keyed by id. Recurring occurrences
   * cleared by clear-day land here as `cancelled: true` override upserts —
   * a series is never deleted wholesale by a batch operation.
   */
  updatedSlots?: SlotPlannerSlotData<TData>[];
  /** Structured violations keyed by rejected slot id. */
  violations: Record<string, SlotPlannerViolation[]>;
};
