import type {
  FilterDate,
  FilterDateUnit,
  FilterDuration,
  FilterEvaluateOptions,
  FilterEvaluationContext,
  FilterWeekday,
} from "./filter-types";

/**
 * Calendar-day helpers. Dates are compared as ISO calendar days
 * (YYYY-MM-DD) in one time zone, so daylight-saving shifts never move a row
 * across a day boundary. Arithmetic runs on UTC midnights, which have no DST.
 */

const DAY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const DAY_MS = 86_400_000;
const zoneFormatters = new Map<string, Intl.DateTimeFormat>();

/** A YYYY-MM-DD string naming a real date, so "2026-02-31" is rejected. */
export function isCalendarDay(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }

  const match = DAY_PATTERN.exec(value);

  if (!match) {
    return false;
  }

  const [, year, month, day] = match.map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  // Date.UTC maps years 0-99 to 1900-1999, so compare with setUTCFullYear.
  date.setUTCFullYear(year);

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function isFilterDate(value: unknown): value is FilterDate {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const candidate = value as Partial<Record<string, unknown>>;

  return candidate.kind === "absolute"
    ? isCalendarDay(candidate.date)
    : candidate.kind === "relative" &&
        Number.isFinite(candidate.amount) &&
        isDateUnit(candidate.unit);
}

export function isFilterDuration(value: unknown): value is FilterDuration {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const candidate = value as Partial<Record<string, unknown>>;

  return (
    !("kind" in candidate) &&
    typeof candidate.amount === "number" &&
    Number.isFinite(candidate.amount) &&
    candidate.amount >= 0 &&
    isDateUnit(candidate.unit)
  );
}

function isDateUnit(value: unknown): value is FilterDateUnit {
  return (
    value === "day" || value === "week" || value === "month" || value === "year"
  );
}

function pad(value: number, length = 2) {
  return String(value).padStart(length, "0");
}

function dayToUtc(day: string) {
  const [, year, month, date] = DAY_PATTERN.exec(day) ?? [];

  return Date.UTC(Number(year), Number(month) - 1, Number(date));
}

function utcToDay(time: number) {
  const date = new Date(time);

  return `${pad(date.getUTCFullYear(), 4)}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

function zoneFormatter(timeZone: string) {
  let formatter = zoneFormatters.get(timeZone);

  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    zoneFormatters.set(timeZone, formatter);
  }

  return formatter;
}

/** The calendar day of an instant in a time zone. */
export function calendarDayInZone(time: number, timeZone = "UTC") {
  const parts = zoneFormatter(timeZone).formatToParts(new Date(time));
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((item) => item.type === type)?.value);

  return `${pad(part("year"), 4)}-${pad(part("month"))}-${pad(part("day"))}`;
}

/**
 * Reads a row value as a calendar day. Date-only strings are taken as-is;
 * Dates, timestamps and ISO date-times are placed in `timeZone`.
 */
export function toCalendarDay(value: unknown, timeZone = "UTC") {
  if (value instanceof Date) {
    const time = value.getTime();

    return Number.isNaN(time) ? undefined : calendarDayInZone(time, timeZone);
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return calendarDayInZone(value, timeZone);
  }

  if (typeof value === "string") {
    if (DAY_PATTERN.test(value)) {
      return isCalendarDay(value) ? value : undefined;
    }

    const time = Date.parse(value);

    return Number.isNaN(time) ? undefined : calendarDayInZone(time, timeZone);
  }

  return undefined;
}

/** Adds calendar units. Month and year steps clamp to the month's end. */
export function shiftCalendarDay(
  day: string,
  amount: number,
  unit: FilterDateUnit,
) {
  if (unit === "day" || unit === "week") {
    return utcToDay(
      dayToUtc(day) + amount * DAY_MS * (unit === "week" ? 7 : 1),
    );
  }

  const date = new Date(dayToUtc(day));
  const months = unit === "year" ? amount * 12 : amount;
  const target = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1),
  );
  const lastDay = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();

  target.setUTCDate(Math.min(date.getUTCDate(), lastDay));

  return utcToDay(target.getTime());
}

export function startOfCalendarPeriod(
  day: string,
  unit: FilterDateUnit,
  weekStartsOn: FilterWeekday = 1,
) {
  if (unit === "day") {
    return day;
  }

  if (unit === "week") {
    const weekday = new Date(dayToUtc(day)).getUTCDay();

    return shiftCalendarDay(day, -((weekday - weekStartsOn + 7) % 7), "day");
  }

  return unit === "month"
    ? `${day.slice(0, 7)}-01`
    : `${day.slice(0, 4)}-01-01`;
}

export function endOfCalendarPeriod(
  day: string,
  unit: FilterDateUnit,
  weekStartsOn: FilterWeekday = 1,
) {
  return shiftCalendarDay(
    shiftCalendarDay(startOfCalendarPeriod(day, unit, weekStartsOn), 1, unit),
    -1,
    "day",
  );
}

/** Resolves a filter date to a calendar day relative to `today`. */
export function resolveFilterDate(date: FilterDate, today: string) {
  return date.kind === "absolute"
    ? date.date
    : shiftCalendarDay(today, date.amount, date.unit);
}

export function createFilterEvaluationContext({
  now,
  timeZone = "UTC",
  weekStartsOn = 1,
}: FilterEvaluateOptions = {}): FilterEvaluationContext {
  const time = now === undefined ? Date.now() : new Date(now).getTime();

  return {
    now: time,
    today: calendarDayInZone(time, timeZone),
    timeZone,
    weekStartsOn,
  };
}

/** Readable filter date: "today", "7 days ago", or "Sep 28, 2026". */
export function formatFilterDate(date: FilterDate, locale = "en-US") {
  if (date.kind === "absolute") {
    return new Intl.DateTimeFormat(locale, {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    }).format(dayToUtc(date.date));
  }

  // "auto" gives "today"/"yesterday" for days but "last week" for -1 week,
  // which reads as a range; spell weeks and longer out.
  return new Intl.RelativeTimeFormat(locale, {
    numeric: date.unit === "day" ? "auto" : "always",
  }).format(date.amount, date.unit);
}

/** Readable duration: "7 days", "1 month". */
export function formatFilterDuration(
  duration: FilterDuration,
  locale = "en-US",
) {
  return new Intl.NumberFormat(locale, {
    style: "unit",
    unit: duration.unit,
    unitDisplay: "long",
  }).format(duration.amount);
}
