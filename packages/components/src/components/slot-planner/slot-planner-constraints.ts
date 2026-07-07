import { parseDate, parseDateTime, toZoned } from "@internationalized/date";
import type {
  SlotPlannerConstraints,
  SlotPlannerOccurrenceStatus,
  SlotPlannerSlotData,
  SlotPlannerSlotPayload,
  SlotPlannerViolation,
  SlotPlannerViolationCode,
} from "./slot-planner-contract";
import {
  expandSlotOccurrences,
  getSlotPlannerIsoDateInZone,
  getSlotPlannerWeekDays,
  type SlotPlannerOccurrence,
} from "./slot-planner-utils";

/**
 * Pure, JSON-in/JSON-out validation context for the constraints engine. No
 * React, no Motion, no component state — apps can run the same checks on a
 * server before persisting.
 */
export type SlotPlannerValidationContext<
  TData extends SlotPlannerSlotPayload = SlotPlannerSlotPayload,
> = {
  /** Existing collection; any slot with the candidate's id is ignored. */
  slots: SlotPlannerSlotData<TData>[];
  constraints?: SlotPlannerConstraints;
  /** ISO date-time treated as "now". */
  now: string;
};

/** Occurrence statuses that count against daily/weekly requestable caps. */
const publishedOccurrenceStatuses = new Set<SlotPlannerOccurrenceStatus>([
  "requestable",
  "requested",
  "booked",
]);

const MS_PER_MINUTE = 60_000;
const MS_PER_DAY = 86_400_000;

/** Longest expansion window, in days, for open-ended recurring candidates. */
const MAX_VALIDATION_WINDOW_DAYS = 366;

/** ISO weekday number (1 = Monday … 7 = Sunday) of an ISO date. */
function getIsoWeekday(dateIso: string): number {
  return ((parseDate(dateIso).toDate("UTC").getUTCDay() + 6) % 7) + 1;
}

function getOccurrenceStartEpoch(occurrence: {
  occurrenceDate: string;
  startTime: string;
  timeZone: string;
}): number {
  return toZoned(
    parseDateTime(`${occurrence.occurrenceDate}T${occurrence.startTime}`),
    occurrence.timeZone,
  )
    .toDate()
    .getTime();
}

type BufferedInterval = { start: number; end: number };

/**
 * Epoch interval `[start − bufferBefore, end + bufferAfter]` of one
 * occurrence, so overlap comparisons work across time zones.
 */
function getBufferedInterval(
  occurrence: SlotPlannerOccurrence,
): BufferedInterval {
  const start = getOccurrenceStartEpoch(occurrence);
  const slot = occurrence.slot;

  return {
    start: start - (slot.bufferBeforeMinutes ?? 0) * MS_PER_MINUTE,
    end:
      start +
      (occurrence.durationMinutes + (slot.bufferAfterMinutes ?? 0)) *
        MS_PER_MINUTE,
  };
}

/** Half-open intersection: back-to-back buffered intervals do not overlap. */
function intervalsOverlap(a: BufferedInterval, b: BufferedInterval): boolean {
  return a.start < b.end && b.start < a.end;
}

/**
 * Expands the candidate into the occurrences to validate. Non-recurring
 * candidates validate their single occurrence on `date` (wherever it falls,
 * so horizon/notice checks still see it). Recurring candidates validate a
 * bounded window: from max(slot date, today) to the earliest of
 * `recurrence.until`, the booking horizon end, or today + 366 days.
 */
function getCandidateOccurrences<TData extends SlotPlannerSlotPayload>(
  candidate: SlotPlannerSlotData<TData>,
  constraints: SlotPlannerConstraints | undefined,
  nowIso: string,
): SlotPlannerOccurrence<TData>[] {
  if (!candidate.recurrence) {
    return expandSlotOccurrences(
      candidate,
      candidate.date,
      candidate.date,
      nowIso,
    );
  }

  const today = parseDate(
    getSlotPlannerIsoDateInZone(Date.parse(nowIso), candidate.timeZone),
  );
  const seriesStart = parseDate(candidate.date);
  const windowStart = seriesStart.compare(today) > 0 ? seriesStart : today;
  let windowEnd = today.add({ days: MAX_VALIDATION_WINDOW_DAYS });

  if (constraints?.bookingHorizonDays !== undefined) {
    const horizonEnd = today.add({ days: constraints.bookingHorizonDays });

    if (horizonEnd.compare(windowEnd) < 0) {
      windowEnd = horizonEnd;
    }
  }

  if (candidate.recurrence.until) {
    const until = parseDate(candidate.recurrence.until);

    if (until.compare(windowEnd) < 0) {
      windowEnd = until;
    }
  }

  if (windowEnd.compare(windowStart) < 0) {
    return [];
  }

  return expandSlotOccurrences(
    candidate,
    windowStart.toString(),
    windowEnd.toString(),
    nowIso,
  );
}

/**
 * Counts one day's "published" occurrences — derived status `requestable`,
 * `requested`, or `booked` — across the whole collection. Used by the daily
 * cap meter and the cap checks.
 */
export function countSlotPlannerPublishedOccurrences<
  TData extends SlotPlannerSlotPayload = SlotPlannerSlotPayload,
>(
  slots: SlotPlannerSlotData<TData>[],
  dateIso: string,
  nowIso: string,
): number {
  let count = 0;

  for (const slot of slots) {
    for (const occurrence of expandSlotOccurrences(
      slot,
      dateIso,
      dateIso,
      nowIso,
    )) {
      if (publishedOccurrenceStatuses.has(occurrence.status)) {
        count += 1;
      }
    }
  }

  return count;
}

/**
 * Validates one candidate slot against the collection, constraints, and
 * "now". Reports violations for every failed check (not first-failure-only),
 * with each violation code reported at most once per candidate (the first
 * offending occurrence's params win). Slots in the context that share the
 * candidate's id are ignored, so updates validate against the rest of the
 * collection.
 *
 * Checks without a `SlotPlannerConstraints` field — `overlap` and
 * `invalid-wall-clock-time` — always run; the rest run only when their
 * constraint field is set.
 *
 * DST note: non-existent wall-clock times (spring-forward gaps) and ambiguous
 * times (fall-back repeated hours) violate `invalid-wall-clock-time`; the UI
 * should surface them rather than silently accepting a resolved instant.
 */
export function validateSlotPlannerSlot<
  TData extends SlotPlannerSlotPayload = SlotPlannerSlotPayload,
>(
  candidate: SlotPlannerSlotData<TData>,
  context: SlotPlannerValidationContext<TData>,
): SlotPlannerViolation[] {
  const { constraints, now } = context;
  const otherSlots = context.slots.filter((slot) => slot.id !== candidate.id);
  const nowEpoch = Date.parse(now);
  const byCode = new Map<SlotPlannerViolationCode, SlotPlannerViolation>();
  const addViolation = (
    code: SlotPlannerViolationCode,
    params: Record<string, string | number>,
  ) => {
    if (!byCode.has(code)) {
      byCode.set(code, { code, params });
    }
  };

  const occurrences = getCandidateOccurrences(candidate, constraints, now);
  const durations = new Set<number>([candidate.durationMinutes]);

  for (const occurrence of occurrences) {
    durations.add(occurrence.durationMinutes);
  }

  for (const durationMinutes of durations) {
    if (
      constraints?.minDurationMinutes !== undefined &&
      durationMinutes < constraints.minDurationMinutes
    ) {
      addViolation("min-duration", {
        durationMinutes,
        minDurationMinutes: constraints.minDurationMinutes,
      });
    }

    if (
      constraints?.maxDurationMinutes !== undefined &&
      durationMinutes > constraints.maxDurationMinutes
    ) {
      addViolation("max-duration", {
        durationMinutes,
        maxDurationMinutes: constraints.maxDurationMinutes,
      });
    }

    if (
      constraints?.durationIncrementMinutes !== undefined &&
      durationMinutes % constraints.durationIncrementMinutes !== 0
    ) {
      addViolation("duration-increment", {
        durationMinutes,
        increment: constraints.durationIncrementMinutes,
      });
    }
  }

  const blackoutDates = new Set(constraints?.blackoutDates ?? []);
  const workingDays = constraints?.workingDays;

  for (const occurrence of occurrences) {
    const date = occurrence.occurrenceDate;

    if (blackoutDates.has(date)) {
      addViolation("blackout-date", { date });
    }

    if (workingDays !== undefined) {
      const weekday = getIsoWeekday(date);

      if (!workingDays.includes(weekday)) {
        addViolation("non-working-day", { date, weekday });
      }
    }

    // `reject` catches both skipped and repeated wall-clock times around DST
    // transitions, matching the PRD's "surface, don't silently shift" rule.
    try {
      toZoned(
        parseDateTime(`${date}T${occurrence.startTime}`),
        occurrence.timeZone,
        "reject",
      );
    } catch {
      addViolation("invalid-wall-clock-time", {
        date,
        startTime: occurrence.startTime,
        timeZone: occurrence.timeZone,
      });
    }

    if (constraints?.bookingHorizonDays !== undefined) {
      const horizonEpoch =
        nowEpoch + constraints.bookingHorizonDays * MS_PER_DAY;

      if (getOccurrenceStartEpoch(occurrence) > horizonEpoch) {
        addViolation("booking-horizon", {
          bookingHorizonDays: constraints.bookingHorizonDays,
          date,
          startTime: occurrence.startTime,
        });
      }
    }
  }

  if (constraints?.minNoticeMinutes !== undefined && occurrences.length > 0) {
    const first = occurrences[0]!;

    if (
      getOccurrenceStartEpoch(first) <
      nowEpoch + constraints.minNoticeMinutes * MS_PER_MINUTE
    ) {
      addViolation("min-notice", {
        date: first.occurrenceDate,
        minNoticeMinutes: constraints.minNoticeMinutes,
        startTime: first.startTime,
      });
    }
  }

  // Buffer-aware overlap, epoch-based so it works across time zones. Other
  // slots expand over [date − 1, date + 1] because an occurrence in another
  // zone can overlap in real time while carrying a neighboring ISO date.
  for (const occurrence of occurrences) {
    if (byCode.has("overlap")) {
      break;
    }

    const candidateInterval = getBufferedInterval(occurrence);
    const neighborStart = parseDate(occurrence.occurrenceDate)
      .subtract({ days: 1 })
      .toString();
    const neighborEnd = parseDate(occurrence.occurrenceDate)
      .add({ days: 1 })
      .toString();

    for (const other of otherSlots) {
      const otherOccurrences = expandSlotOccurrences(
        other,
        neighborStart,
        neighborEnd,
        now,
      );
      const overlapping = otherOccurrences.find(
        (otherOccurrence) =>
          otherOccurrence.status !== "cancelled" &&
          otherOccurrence.status !== "expired" &&
          intervalsOverlap(
            candidateInterval,
            getBufferedInterval(otherOccurrence),
          ),
      );

      if (overlapping) {
        addViolation("overlap", {
          date: occurrence.occurrenceDate,
          otherSlotId: overlapping.slotId,
        });
        break;
      }
    }
  }

  const publishedOccurrences = occurrences.filter((occurrence) =>
    publishedOccurrenceStatuses.has(occurrence.status),
  );

  if (constraints?.dailyRequestableCap !== undefined) {
    const cap = constraints.dailyRequestableCap;
    const candidateCountByDate = new Map<string, number>();

    for (const occurrence of publishedOccurrences) {
      candidateCountByDate.set(
        occurrence.occurrenceDate,
        (candidateCountByDate.get(occurrence.occurrenceDate) ?? 0) + 1,
      );
    }

    for (const [date, candidateCount] of candidateCountByDate) {
      const used = countSlotPlannerPublishedOccurrences(otherSlots, date, now);

      if (used + candidateCount > cap) {
        addViolation("daily-cap", { cap, date });
        break;
      }
    }
  }

  if (constraints?.weeklyRequestableCap !== undefined) {
    const cap = constraints.weeklyRequestableCap;
    const candidateCountByWeek = new Map<string, number>();

    for (const occurrence of publishedOccurrences) {
      const weekStart = getSlotPlannerWeekDays(occurrence.occurrenceDate)[0]!;

      candidateCountByWeek.set(
        weekStart,
        (candidateCountByWeek.get(weekStart) ?? 0) + 1,
      );
    }

    for (const [weekStart, candidateCount] of candidateCountByWeek) {
      const used = getSlotPlannerWeekDays(weekStart).reduce(
        (total, date) =>
          total + countSlotPlannerPublishedOccurrences(otherSlots, date, now),
        0,
      );

      if (used + candidateCount > cap) {
        addViolation("weekly-cap", { cap, weekStart });
        break;
      }
    }
  }

  return [...byCode.values()];
}

/**
 * Validates candidates in order. A candidate that passes joins the context
 * for later candidates, so intra-batch overlaps and cap totals are caught.
 * Only ids with at least one violation appear in the result.
 */
export function validateSlotPlannerSlots<
  TData extends SlotPlannerSlotPayload = SlotPlannerSlotPayload,
>(
  candidates: SlotPlannerSlotData<TData>[],
  context: SlotPlannerValidationContext<TData>,
): Record<string, SlotPlannerViolation[]> {
  const result: Record<string, SlotPlannerViolation[]> = {};
  const workingSlots = [...context.slots];

  for (const candidate of candidates) {
    const violations = validateSlotPlannerSlot(candidate, {
      ...context,
      slots: workingSlots,
    });

    if (violations.length > 0) {
      result[candidate.id] = violations;
    } else {
      workingSlots.push(candidate);
    }
  }

  return result;
}
