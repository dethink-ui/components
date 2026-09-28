import {
  endOfCalendarPeriod,
  isFilterDate,
  isFilterDuration,
  resolveFilterDate,
  shiftCalendarDay,
  startOfCalendarPeriod,
  toCalendarDay,
} from "./filter-dates";
import {
  isEmptyFilterOperator,
  isNotEmptyFilterOperator,
} from "./filter-operators";
import type {
  FilterDate,
  FilterEvaluationContext,
  FilterOperatorDefinition,
  FilterValue,
} from "./filter-types";

function toNumber(value: unknown) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function isNumber(value: FilterValue) {
  return typeof value === "number" && Number.isFinite(value);
}

function isNumberRange(value: FilterValue) {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    value.every((item) => typeof item === "number" && Number.isFinite(item))
  );
}

function numberOperator(
  id: string,
  label: string,
  token: string,
  compare: (row: number, value: number) => boolean,
): FilterOperatorDefinition {
  return {
    id,
    label,
    token,
    arity: "single",
    valueKind: "number",
    isValueValid: isNumber,
    evaluate: (rowValue, value) => {
      const row = toNumber(rowValue);

      return row !== undefined && typeof value === "number"
        ? compare(row, value)
        : false;
    },
  };
}

export const numberFilterOperators: FilterOperatorDefinition[] = [
  numberOperator("eq", "is", "", (row, value) => row === value),
  numberOperator("neq", "is not", "!=", (row, value) => row !== value),
  numberOperator("gt", "is more than", ">", (row, value) => row > value),
  numberOperator("gte", "is at least", ">=", (row, value) => row >= value),
  numberOperator("lt", "is less than", "<", (row, value) => row < value),
  numberOperator("lte", "is at most", "<=", (row, value) => row <= value),
  {
    id: "between",
    token: "",
    label: "is between",
    arity: "range",
    valueKind: "numberRange",
    isValueValid: isNumberRange,
    evaluate: (rowValue, value) => {
      const row = toNumber(rowValue);

      if (row === undefined || !Array.isArray(value)) {
        return false;
      }

      const [from, to] = value as [number, number];

      // Inclusive, and order-insensitive so "10 – 5" still means 5 to 10.
      return row >= Math.min(from, to) && row <= Math.max(from, to);
    },
  },
  isEmptyFilterOperator,
  isNotEmptyFilterOperator,
];

function isDateRange(value: FilterValue) {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    value.every((item) => isFilterDate(item))
  );
}

function isPositiveDuration(value: FilterValue) {
  return (
    isFilterDuration(value) &&
    Number.isInteger(value.amount) &&
    value.amount >= 1
  );
}

function isPeriod(value: FilterValue) {
  return (
    isFilterDate(value) &&
    value.kind === "relative" &&
    Number.isInteger(value.amount) &&
    value.unit !== "day"
  );
}

function dateOperator(
  id: string,
  label: string,
  token: string,
  compare: (row: string, day: string) => boolean,
): FilterOperatorDefinition {
  return {
    id,
    label,
    token,
    arity: "single",
    valueKind: "date",
    isValueValid: isFilterDate,
    evaluate: (rowValue, value, context) => {
      const row = toCalendarDay(rowValue, context.timeZone);

      return row !== undefined && isFilterDate(value)
        ? compare(row, resolveFilterDate(value, context.today))
        : false;
    },
  };
}

function rowDay(rowValue: unknown, context: FilterEvaluationContext) {
  return toCalendarDay(rowValue, context.timeZone);
}

export const dateFilterOperators: FilterOperatorDefinition[] = [
  dateOperator("is", "is", "", (row, day) => row === day),
  dateOperator("before", "is before", "<", (row, day) => row < day),
  dateOperator("after", "is after", ">", (row, day) => row > day),
  {
    id: "between",
    token: "",
    label: "is between",
    arity: "range",
    valueKind: "dateRange",
    isValueValid: isDateRange,
    evaluate: (rowValue, value, context) => {
      const row = rowDay(rowValue, context);

      if (row === undefined || !Array.isArray(value)) {
        return false;
      }

      const [from, to] = (value as [FilterDate, FilterDate]).map((date) =>
        resolveFilterDate(date, context.today),
      ) as [string, string];

      return row >= (from < to ? from : to) && row <= (from < to ? to : from);
    },
  },
  {
    // The last N units up to and including today: "the last 7 days" is
    // today and the 6 days before it.
    id: "inLast",
    token: "last:",
    label: "is in the last",
    arity: "single",
    valueKind: "duration",
    isValueValid: isPositiveDuration,
    evaluate: (rowValue, value, context) => {
      const row = rowDay(rowValue, context);

      return row !== undefined && isFilterDuration(value)
        ? row > shiftCalendarDay(context.today, -value.amount, value.unit) &&
            row <= context.today
        : false;
    },
  },
  {
    id: "inNext",
    token: "next:",
    label: "is in the next",
    arity: "single",
    valueKind: "duration",
    isValueValid: isPositiveDuration,
    evaluate: (rowValue, value, context) => {
      const row = rowDay(rowValue, context);

      return row !== undefined && isFilterDuration(value)
        ? row >= context.today &&
            row < shiftCalendarDay(context.today, value.amount, value.unit)
        : false;
    },
  },
  {
    // A whole calendar period: this week (amount 0), last month (-1)…
    id: "inPeriod",
    token: "in:",
    label: "is in",
    arity: "single",
    valueKind: "period",
    isValueValid: isPeriod,
    evaluate: (rowValue, value, context) => {
      const row = rowDay(rowValue, context);

      if (
        row === undefined ||
        !isFilterDate(value) ||
        value.kind !== "relative"
      ) {
        return false;
      }

      const anchor = shiftCalendarDay(context.today, value.amount, value.unit);

      return (
        row >=
          startOfCalendarPeriod(anchor, value.unit, context.weekStartsOn) &&
        row <= endOfCalendarPeriod(anchor, value.unit, context.weekStartsOn)
      );
    },
  },
  isEmptyFilterOperator,
  isNotEmptyFilterOperator,
];

export const booleanFilterOperators: FilterOperatorDefinition[] = [
  {
    id: "is",
    label: "is",
    token: "",
    arity: "single",
    valueKind: "boolean",
    isValueValid: (value) => typeof value === "boolean",
    // Only real booleans match: an unset value is neither yes nor no.
    evaluate: (rowValue, value) =>
      typeof rowValue === "boolean" && rowValue === value,
  },
  isEmptyFilterOperator,
  isNotEmptyFilterOperator,
];
