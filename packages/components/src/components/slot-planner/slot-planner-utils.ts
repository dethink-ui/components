import {
  fromAbsolute,
  parseDate,
  parseDateTime,
  toZoned,
  type ZonedDateTime,
} from "@internationalized/date";
import {
  defaultSlotPlannerTaxonomy,
  slotPlannerOccurrenceStatuses,
  type SlotPlannerCountTemplate,
  type SlotPlannerOccurrenceStatus,
  type SlotPlannerSlotData,
  type SlotPlannerSlotPayload,
  type SlotPlannerTaxonomy,
  type SlotPlannerTaxonomyInput,
} from "./slot-planner-contract";

/** One concrete, fully resolved occurrence of a (possibly recurring) slot. */
export type SlotPlannerOccurrence<
  TData extends SlotPlannerSlotPayload = SlotPlannerSlotPayload,
> = {
  slotId: string;
  /** ISO date (`YYYY-MM-DD`) of the occurrence in the slot's time zone. */
  occurrenceDate: string;
  /** Wall-clock start time (`HH:mm`) after applying any override. */
  startTime: string;
  durationMinutes: number;
  timeZone: string;
  capacity: number;
  bookedCount: number;
  requestedCount: number;
  status: SlotPlannerOccurrenceStatus;
  isRecurring: boolean;
  slot: SlotPlannerSlotData<TData>;
};

/** Occurrences grouped by ISO date, each day sorted by wall-clock start. */
export type SlotPlannerOccurrencesByDate<
  TData extends SlotPlannerSlotPayload = SlotPlannerSlotPayload,
> = Record<string, SlotPlannerOccurrence<TData>[]>;

type ResolvedOccurrenceFields = {
  occurrenceDate: string;
  startTime: string;
  durationMinutes: number;
  bookedCount: number;
  requestedCount: number;
  capacity: number;
};

/** Merges a partial taxonomy over the defaults, nesting the record fields. */
export function resolveSlotPlannerTaxonomy(
  input?: SlotPlannerTaxonomyInput,
): SlotPlannerTaxonomy {
  if (!input) {
    return defaultSlotPlannerTaxonomy;
  }

  return {
    ...defaultSlotPlannerTaxonomy,
    ...input,
    statusLabels: {
      ...defaultSlotPlannerTaxonomy.statusLabels,
      ...input.statusLabels,
    },
    violationMessages: {
      ...defaultSlotPlannerTaxonomy.violationMessages,
      ...input.violationMessages,
    },
  };
}

/** Replaces every known `{token}`; unknown tokens are left verbatim. */
export function formatSlotPlannerTemplate(
  template: string,
  tokens: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, token: string) =>
    token in tokens ? String(tokens[token]) : match,
  );
}

/**
 * Picks the CLDR plural category for `count` (falling back to `other`) and
 * interpolates `{tokens}`, with `{count}` always available.
 */
export function formatSlotPlannerCountTemplate(
  template: SlotPlannerCountTemplate,
  count: number,
  tokens: Record<string, string | number> = {},
  locale?: string,
): string {
  const category = new Intl.PluralRules(locale ?? "en").select(count);

  return formatSlotPlannerTemplate(template[category] ?? template.other, {
    count,
    ...tokens,
  });
}

function getOccurrenceEndEpoch(
  timeZone: string,
  resolved: Pick<
    ResolvedOccurrenceFields,
    "occurrenceDate" | "startTime" | "durationMinutes"
  >,
) {
  const start = toZoned(
    parseDateTime(`${resolved.occurrenceDate}T${resolved.startTime}`),
    timeZone,
  );

  return start.add({ minutes: resolved.durationMinutes }).toDate().getTime();
}

/**
 * Derives the render-time status of one resolved occurrence per the contract
 * precedence: cancelled → blocked → draft → expired → booked → requested →
 * requestable. Override-cancelled occurrences never reach this function —
 * expansion excludes them entirely.
 */
export function deriveOccurrenceStatus(
  slot: SlotPlannerSlotData,
  resolved: ResolvedOccurrenceFields,
  nowIso: string,
): SlotPlannerOccurrenceStatus {
  if (slot.state === "cancelled") {
    return "cancelled";
  }

  if (slot.state === "blocked") {
    return "blocked";
  }

  if (slot.state === "draft") {
    return "draft";
  }

  if (getOccurrenceEndEpoch(slot.timeZone, resolved) < Date.parse(nowIso)) {
    return "expired";
  }

  if (resolved.bookedCount >= resolved.capacity) {
    return "booked";
  }

  if (resolved.requestedCount > 0) {
    return "requested";
  }

  return "requestable";
}

/**
 * Expands one slot into its occurrences within `[rangeStart, rangeEnd]`
 * (inclusive ISO dates). Recurring slots step from `slot.date` by the series
 * frequency; per-occurrence overrides replace fields, and `cancelled: true`
 * excludes the occurrence entirely. Booking counts resolve per occurrence:
 * override counts win, slot-level counts apply only on `slot.date`, and every
 * other occurrence defaults to 0.
 */
export function expandSlotOccurrences<
  TData extends SlotPlannerSlotPayload = SlotPlannerSlotPayload,
>(
  slot: SlotPlannerSlotData<TData>,
  rangeStartIso: string,
  rangeEndIso: string,
  nowIso: string,
): SlotPlannerOccurrence<TData>[] {
  const rangeStart = parseDate(rangeStartIso);
  const rangeEnd = parseDate(rangeEndIso);
  const seriesStart = parseDate(slot.date);
  const recurrence = slot.recurrence;
  const occurrenceDates: string[] = [];

  if (recurrence) {
    const seriesEnd = recurrence.until ? parseDate(recurrence.until) : undefined;
    const lastDate =
      seriesEnd && seriesEnd.compare(rangeEnd) < 0 ? seriesEnd : rangeEnd;
    const stepDays = recurrence.frequency === "weekly" ? 7 : 14;

    for (
      let current = seriesStart;
      current.compare(lastDate) <= 0;
      current = current.add({ days: stepDays })
    ) {
      if (current.compare(rangeStart) >= 0) {
        occurrenceDates.push(current.toString());
      }
    }
  } else if (
    seriesStart.compare(rangeStart) >= 0 &&
    seriesStart.compare(rangeEnd) <= 0
  ) {
    occurrenceDates.push(slot.date);
  }

  const occurrences: SlotPlannerOccurrence<TData>[] = [];

  for (const occurrenceDate of occurrenceDates) {
    const override = recurrence?.overrides?.find(
      (candidate) => candidate.occurrenceDate === occurrenceDate,
    );

    if (override?.cancelled) {
      continue;
    }

    const onSlotDate = occurrenceDate === slot.date;
    const resolved: ResolvedOccurrenceFields = {
      occurrenceDate,
      startTime: override?.startTime ?? slot.startTime,
      durationMinutes: override?.durationMinutes ?? slot.durationMinutes,
      bookedCount:
        override?.bookedCount ?? (onSlotDate ? (slot.bookedCount ?? 0) : 0),
      requestedCount:
        override?.requestedCount ??
        (onSlotDate ? (slot.requestedCount ?? 0) : 0),
      capacity: slot.capacity ?? 1,
    };

    occurrences.push({
      slotId: slot.id,
      ...resolved,
      timeZone: slot.timeZone,
      status: deriveOccurrenceStatus(slot, resolved, nowIso),
      isRecurring: recurrence !== undefined,
      slot,
    });
  }

  return occurrences;
}

/**
 * The 7 ISO dates of the Monday-start week containing `focusedDateIso`,
 * Monday first.
 */
export function getSlotPlannerWeekDays(focusedDateIso: string): string[] {
  const focusedDate = parseDate(focusedDateIso);
  const mondayOffset = (focusedDate.toDate("UTC").getUTCDay() + 6) % 7;
  const monday = focusedDate.subtract({ days: mondayOffset });

  return Array.from({ length: 7 }, (_, index) =>
    monday.add({ days: index }).toString(),
  );
}

/** Counts one day's occurrences per derived status. */
export function summarizeSlotPlannerDay(
  occurrences: SlotPlannerOccurrence[],
): Record<SlotPlannerOccurrenceStatus, number> {
  const summary = Object.fromEntries(
    slotPlannerOccurrenceStatuses.map((status) => [status, 0]),
  ) as Record<SlotPlannerOccurrenceStatus, number>;

  for (const occurrence of occurrences) {
    summary[occurrence.status] += 1;
  }

  return summary;
}

/**
 * One occurrence projected into a viewer's time zone for book mode. The
 * underlying occurrence fields keep their provider-zone meaning —
 * `occurrenceDate`, `startTime`, and `timeZone` still identify and describe
 * the occurrence in the shared slot model — while the `viewer*` fields carry
 * the presentation values in the viewer's zone. The projection is computed
 * on the occurrence's epoch instant, so it lands on a different viewer-zone
 * calendar date when the zone offset crosses midnight.
 */
export type SlotPickerOccurrence<
  TData extends SlotPlannerSlotPayload = SlotPlannerSlotPayload,
> = SlotPlannerOccurrence<TData> & {
  /** IANA zone the viewer fields are projected into. */
  viewerTimeZone: string;
  /** ISO date (`YYYY-MM-DD`) of the occurrence start in the viewer's zone. */
  viewerDate: string;
  /** Wall-clock start (`HH:mm`) in the viewer's zone. */
  viewerStartTime: string;
  /** Wall-clock end (`HH:mm`) in the viewer's zone. */
  viewerEndTime: string;
  /** Epoch milliseconds of the occurrence start instant. */
  startEpochMs: number;
};

/** Projected occurrences grouped by viewer-zone ISO date, sorted by instant. */
export type SlotPickerOccurrencesByDate<
  TData extends SlotPlannerSlotPayload = SlotPlannerSlotPayload,
> = Record<string, SlotPickerOccurrence<TData>[]>;

function zonedIsoDate(zoned: ZonedDateTime) {
  const month = String(zoned.month).padStart(2, "0");
  const day = String(zoned.day).padStart(2, "0");

  return `${zoned.year}-${month}-${day}`;
}

function zonedWallTime(zoned: ZonedDateTime) {
  const hour = String(zoned.hour).padStart(2, "0");
  const minute = String(zoned.minute).padStart(2, "0");

  return `${hour}:${minute}`;
}

/** ISO date (`YYYY-MM-DD`) of an epoch instant in an IANA zone. */
export function getSlotPlannerIsoDateInZone(
  epochMs: number,
  timeZone: string,
): string {
  return zonedIsoDate(fromAbsolute(epochMs, timeZone));
}

/**
 * Projects one resolved occurrence into a viewer's zone. The provider-zone
 * wall clock resolves to an epoch instant first, so the viewer date and
 * times are exact across DST transitions on either side.
 */
export function projectSlotPlannerOccurrenceToZone<
  TData extends SlotPlannerSlotPayload = SlotPlannerSlotPayload,
>(
  occurrence: SlotPlannerOccurrence<TData>,
  viewerTimeZone: string,
): SlotPickerOccurrence<TData> {
  const start = toZoned(
    parseDateTime(`${occurrence.occurrenceDate}T${occurrence.startTime}`),
    occurrence.timeZone,
  );
  const startEpochMs = start.toDate().getTime();
  const endEpochMs = start
    .add({ minutes: occurrence.durationMinutes })
    .toDate()
    .getTime();
  const viewerStart = fromAbsolute(startEpochMs, viewerTimeZone);
  const viewerEnd = fromAbsolute(endEpochMs, viewerTimeZone);

  return {
    ...occurrence,
    startEpochMs,
    viewerDate: zonedIsoDate(viewerStart),
    viewerEndTime: zonedWallTime(viewerEnd),
    viewerStartTime: zonedWallTime(viewerStart),
    viewerTimeZone,
  };
}

/**
 * A viewer-zone calendar date can differ from the provider-zone occurrence
 * date by at most this many days: real IANA offsets span UTC-12 to UTC+14,
 * so an instant can shift up to two calendar dates between zones.
 */
const VIEWER_RANGE_PAD_DAYS = 2;

/**
 * Book-mode expansion: expands every slot, projects each occurrence into the
 * viewer's zone, and keeps the occurrences whose VIEWER date falls within
 * `[rangeStart, rangeEnd]` (inclusive viewer-zone ISO dates). The provider
 * expansion range is padded so occurrences that cross a date boundary into
 * the viewer range are not missed. Draft and cancelled occurrences are
 * excluded entirely — consumers never see them. Days are sorted by instant.
 */
export function expandSlotsForViewerZone<
  TData extends SlotPlannerSlotPayload = SlotPlannerSlotPayload,
>(
  slots: SlotPlannerSlotData<TData>[],
  rangeStartIso: string,
  rangeEndIso: string,
  nowIso: string,
  viewerTimeZone: string,
): SlotPickerOccurrencesByDate<TData> {
  const providerRangeStart = parseDate(rangeStartIso)
    .subtract({ days: VIEWER_RANGE_PAD_DAYS })
    .toString();
  const providerRangeEnd = parseDate(rangeEndIso)
    .add({ days: VIEWER_RANGE_PAD_DAYS })
    .toString();
  const byViewerDate: SlotPickerOccurrencesByDate<TData> = {};

  for (const slot of slots) {
    for (const occurrence of expandSlotOccurrences(
      slot,
      providerRangeStart,
      providerRangeEnd,
      nowIso,
    )) {
      if (occurrence.status === "draft" || occurrence.status === "cancelled") {
        continue;
      }

      const projected = projectSlotPlannerOccurrenceToZone(
        occurrence,
        viewerTimeZone,
      );

      if (
        projected.viewerDate < rangeStartIso ||
        projected.viewerDate > rangeEndIso
      ) {
        continue;
      }

      (byViewerDate[projected.viewerDate] ??= []).push(projected);
    }
  }

  for (const occurrences of Object.values(byViewerDate)) {
    occurrences.sort(
      (a, b) =>
        a.startEpochMs - b.startEpochMs || a.slotId.localeCompare(b.slotId),
    );
  }

  return byViewerDate;
}

/**
 * Expands every slot into `[rangeStart, rangeEnd]` and groups the occurrences
 * by ISO date, each day sorted by wall-clock start time.
 */
export function expandSlotsForRange<
  TData extends SlotPlannerSlotPayload = SlotPlannerSlotPayload,
>(
  slots: SlotPlannerSlotData<TData>[],
  rangeStartIso: string,
  rangeEndIso: string,
  nowIso: string,
): SlotPlannerOccurrencesByDate<TData> {
  const byDate: SlotPlannerOccurrencesByDate<TData> = {};

  for (const slot of slots) {
    for (const occurrence of expandSlotOccurrences(
      slot,
      rangeStartIso,
      rangeEndIso,
      nowIso,
    )) {
      (byDate[occurrence.occurrenceDate] ??= []).push(occurrence);
    }
  }

  for (const occurrences of Object.values(byDate)) {
    occurrences.sort(
      (a, b) =>
        a.startTime.localeCompare(b.startTime) || a.slotId.localeCompare(b.slotId),
    );
  }

  return byDate;
}
