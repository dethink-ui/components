import { isCalendarDay } from "./filter-dates";
import {
  scanQuoted,
  splitFilterQueryList,
  type FilterQuerySpan,
} from "./filter-query-lexer";
import type {
  FilterDate,
  FilterDateUnit,
  FilterField,
  FilterOperatorDefinition,
  FilterValue,
} from "./filter-types";

/**
 * Value syntax for the text query, chosen by the operator's `valueKind`:
 * text and lists (`a,"b c"`), numbers and ranges (`5..10`), calendar days
 * (`2026-09-28`, `today`, `-7d`, `+2w`), durations (`7d`), periods (`0w` is
 * this week, `-1m` last month) and yes/no. Custom kinds read as text, or as
 * a list for "multiple" operators.
 */

export type FilterQueryErrorCode =
  | "unclosed-quote"
  | "unclosed-group"
  | "unexpected-close"
  | "empty-group"
  | "missing-operand"
  | "unknown-field"
  | "unknown-operator"
  | "missing-value"
  | "invalid-value"
  | "unknown-option"
  | "no-default-field"
  | "max-depth";

export interface FilterQueryError extends FilterQuerySpan {
  code: FilterQueryErrorCode;
  message: string;
}

type ValueResult =
  | { ok: true; value: FilterValue | undefined }
  | { ok: false; error: FilterQueryError };

const UNIT_BY_LETTER: Record<string, FilterDateUnit> = {
  d: "day",
  w: "week",
  m: "month",
  y: "year",
};
const LETTER_BY_UNIT: Record<FilterDateUnit, string> = {
  day: "d",
  week: "w",
  month: "m",
  year: "y",
};
const NUMBER_PATTERN = /^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i;
const RELATIVE_PATTERN = /^([+-]?)(\d+)([dwmy])$/;
const DURATION_PATTERN = /^(\d+)([dwmy])$/;
const DAY_WORDS: Record<string, number> = {
  today: 0,
  yesterday: -1,
  tomorrow: 1,
};

function fail(
  code: FilterQueryErrorCode,
  message: string,
  start: number,
  end: number,
): { ok: false; error: FilterQueryError } {
  return { ok: false, error: { code, message, start, end } };
}

function unquote(text: string) {
  return text.slice(1, -1).replace(/\\(.)/g, "$1");
}

/** A string value: one word, or a whole quoted string. */
function readString(
  text: string,
  start: number,
  field: FilterField,
): { ok: true; value: string } | { ok: false; error: FilterQueryError } {
  const end = start + text.length;

  if (text.startsWith('"')) {
    const close = scanQuoted(text, 0);

    if (close === -1) {
      return fail("unclosed-quote", "Close the quote", start, end);
    }

    if (close !== text.length) {
      return fail(
        "invalid-value",
        "Put a space or comma after the closing quote",
        start + close,
        end,
      );
    }

    const value = unquote(text);

    return value === ""
      ? fail("missing-value", `Add a value for ${field.label}`, start, end)
      : { ok: true, value };
  }

  if (text === "") {
    return fail("missing-value", `Add a value for ${field.label}`, start, end);
  }

  const quote = text.indexOf('"');

  if (quote !== -1) {
    return fail(
      "invalid-value",
      "Quote the whole value",
      start + quote,
      start + quote + 1,
    );
  }

  return { ok: true, value: text };
}

function readOption(
  text: string,
  start: number,
  field: FilterField,
): { ok: true; value: string } | { ok: false; error: FilterQueryError } {
  const read = readString(text, start, field);

  if (!read.ok || !field.options?.length) {
    return read;
  }

  const lower = read.value.toLowerCase();
  const option =
    field.options.find((candidate) => candidate.value === read.value) ??
    field.options.find(
      (candidate) =>
        candidate.value.toLowerCase() === lower ||
        candidate.label.toLowerCase() === lower,
    );

  return option
    ? { ok: true, value: option.value }
    : fail(
        "unknown-option",
        `Unknown ${field.label} "${read.value}"`,
        start,
        start + text.length,
      );
}

function readList(
  text: string,
  start: number,
  field: FilterField,
): ValueResult {
  const values: string[] = [];

  for (const item of splitFilterQueryList(text, start)) {
    const read = readOption(item.text, item.start, field);

    if (!read.ok) {
      return read;
    }

    values.push(read.value);
  }

  return { ok: true, value: values };
}

function readNumber(text: string) {
  return NUMBER_PATTERN.test(text) ? Number(text) : undefined;
}

function readDate(text: string): FilterDate | undefined {
  const lower = text.toLowerCase();

  if (lower in DAY_WORDS) {
    return { kind: "relative", amount: DAY_WORDS[lower] ?? 0, unit: "day" };
  }

  const relative = RELATIVE_PATTERN.exec(text);

  if (relative) {
    const amount = Number(relative[2]) * (relative[1] === "-" ? -1 : 1);

    return {
      kind: "relative",
      // Avoid -0 so "-0d" and "0d" are the same value.
      amount: amount === 0 ? 0 : amount,
      unit: UNIT_BY_LETTER[relative[3] ?? "d"] ?? "day",
    };
  }

  return isCalendarDay(text) ? { kind: "absolute", date: text } : undefined;
}

/** Splits `from..to`; undefined when there is no "..". */
function readPair<T>(
  text: string,
  read: (part: string) => T | undefined,
): [T, T] | undefined {
  const index = text.indexOf("..");

  if (index === -1) {
    return undefined;
  }

  const from = read(text.slice(0, index));
  const to = read(text.slice(index + 2));

  return from === undefined || to === undefined ? undefined : [from, to];
}

const EXPECTED: Record<string, string> = {
  number: "Expected a number",
  numberRange: "Expected a range like 5..10",
  date: "Expected a date like 2026-09-28, today or -7d",
  dateRange: "Expected a date range like -7d..today",
  duration: "Expected a duration like 7d, 2w or 3m",
  period: "Expected a period like 0w (this week) or -1m (last month)",
  boolean: "Expected yes or no",
};

function readTyped(kind: string, text: string): FilterValue | undefined {
  switch (kind) {
    case "number":
      return readNumber(text);
    case "numberRange":
      return readPair(text, readNumber);
    case "date":
      return readDate(text);
    case "dateRange":
      return readPair(text, readDate);
    case "duration": {
      const match = DURATION_PATTERN.exec(text);
      const amount = Number(match?.[1]);

      return match && amount >= 1
        ? { amount, unit: UNIT_BY_LETTER[match[2] ?? "d"] ?? "day" }
        : undefined;
    }
    case "period": {
      const date = readDate(text);

      return date?.kind === "relative" && date.unit !== "day"
        ? date
        : undefined;
    }
    case "boolean": {
      const lower = text.toLowerCase();

      return lower === "yes" || lower === "true"
        ? true
        : lower === "no" || lower === "false"
          ? false
          : undefined;
    }
    default:
      return undefined;
  }
}

/** Parses the value text of one condition for `operator`. */
export function parseFilterQueryValue(
  text: string,
  start: number,
  field: FilterField,
  operator: FilterOperatorDefinition,
): ValueResult {
  const end = start + text.length;

  if (operator.arity === "none") {
    return text === ""
      ? { ok: true, value: undefined }
      : fail("invalid-value", `"${operator.label}" takes no value`, start, end);
  }

  const kind = operator.valueKind ?? "";
  let result: ValueResult;

  if (kind in EXPECTED) {
    if (text === "") {
      return fail(
        "missing-value",
        `Add a value for ${field.label}`,
        start,
        end,
      );
    }

    const value = readTyped(kind, text);

    result =
      value === undefined
        ? fail("invalid-value", EXPECTED[kind] ?? "Invalid value", start, end)
        : { ok: true, value };
  } else if (kind === "list" || operator.arity === "multiple") {
    result = readList(text, start, field);
  } else if (operator.arity === "range") {
    const value = readPair(text, readNumber);

    result = value
      ? { ok: true, value }
      : fail("invalid-value", EXPECTED.numberRange ?? "", start, end);
  } else {
    result = readString(text, start, field);
  }

  if (
    result.ok &&
    result.value !== undefined &&
    operator.isValueValid &&
    !operator.isValueValid(result.value)
  ) {
    return fail(
      "invalid-value",
      `Not a valid value for ${field.label}`,
      start,
      end,
    );
  }

  return result;
}

function printString(value: string, quote: boolean) {
  return !quote && /^[^\s"(),]+$/.test(value)
    ? value
    : `"${value.replace(/[\\"]/g, "\\$&")}"`;
}

function printDate(date: FilterDate) {
  if (date.kind === "absolute") {
    return date.date;
  }

  if (date.amount === 0 && date.unit === "day") {
    return "today";
  }

  const sign = date.amount > 0 ? "+" : date.amount < 0 ? "-" : "";

  return `${sign}${Math.abs(date.amount)}${LETTER_BY_UNIT[date.unit]}`;
}

/**
 * Value text for a condition. Strings are bare words when safe; `quote`
 * forces quotes, which the printer uses when a bare word would read back
 * differently (e.g. a value that looks like an operator token).
 */
export function printFilterQueryValue(
  value: FilterValue | undefined,
  operator: FilterOperatorDefinition,
  quote = false,
): string {
  if (value === undefined || operator.arity === "none") {
    return "";
  }

  switch (operator.valueKind) {
    case "number":
      return String(value);
    case "numberRange":
    case "dateRange":
      if (Array.isArray(value)) {
        return value
          .map((item) =>
            typeof item === "object" && item !== null && "kind" in item
              ? printDate(item)
              : String(item),
          )
          .join("..");
      }
      break;
    case "date":
    case "period":
      if (typeof value === "object" && "kind" in value) {
        return printDate(value);
      }
      break;
    case "duration":
      if (typeof value === "object" && "unit" in value && !("kind" in value)) {
        return `${value.amount}${LETTER_BY_UNIT[value.unit]}`;
      }
      break;
    case "boolean":
      return value === true ? "yes" : value === false ? "no" : String(value);
    default:
      break;
  }

  if (Array.isArray(value)) {
    return operator.arity === "range"
      ? value.map(String).join("..")
      : value.map((item) => printString(String(item), quote)).join(",");
  }

  return printString(
    typeof value === "object" ? JSON.stringify(value) : String(value),
    quote,
  );
}
