import { formatFilterDate, formatFilterDuration } from "./filter-dates";
import { getFilterOperators } from "./filter-model";
import {
  findFilterQueryField,
  parseFilterQuery,
  getFilterQueryToken,
  matchFilterQueryOperators,
  type FilterQueryOptions,
} from "./filter-query";
import {
  lexFilterQuery,
  splitFilterQueryList,
  splitFilterQueryTerm,
  type FilterQueryToken,
} from "./filter-query-lexer";
import { printFilterQueryValue } from "./filter-query-values";
import type {
  FilterDate,
  FilterDuration,
  FilterField,
  FilterFields,
  FilterOperatorDefinition,
  FilterValue,
} from "./filter-types";

export type FilterQuerySegmentKind =
  "field" | "operator" | "value" | "keyword" | "negation" | "paren" | "text";

/** A highlighted range of query text. Gaps between segments are spaces. */
export interface FilterQuerySegment {
  kind: FilterQuerySegmentKind;
  start: number;
  end: number;
}

/**
 * Highlight ranges for query text: field names, operator tokens, values,
 * keywords, negation and parentheses. Works on incomplete text.
 */
export function getFilterQuerySegments<TData>(
  text: string,
  fields: FilterFields<TData>,
): FilterQuerySegment[] {
  const segments: FilterQuerySegment[] = [];

  for (const token of lexFilterQuery(text).tokens) {
    if (token.kind !== "term") {
      segments.push({
        kind:
          token.kind === "not"
            ? "negation"
            : token.kind === "or" || token.kind === "and"
              ? "keyword"
              : "paren",
        start: token.start,
        end: token.end,
      });
      continue;
    }

    const parts = splitFilterQueryTerm(token);

    if (!parts.field) {
      segments.push({ kind: "text", start: token.start, end: token.end });
      continue;
    }

    // The field name and its colon.
    segments.push({
      kind: "field",
      start: parts.field.start,
      end: parts.rest.start,
    });

    const field = findFilterQueryField(fields, parts.field.text);
    const operatorToken = field
      ? matchFilterQueryOperators(field, parts.rest.text)[0]?.token
      : undefined;
    const valueStart = parts.rest.start + (operatorToken?.length ?? 0);

    if (valueStart > parts.rest.start) {
      segments.push({
        kind: "operator",
        start: parts.rest.start,
        end: valueStart,
      });
    }

    if (parts.rest.end > valueStart) {
      segments.push({ kind: "value", start: valueStart, end: parts.rest.end });
    }
  }

  return segments;
}

export interface FilterQuerySuggestion {
  /** Unique within one list of suggestions. */
  id: string;
  kind: "field" | "operator" | "value";
  label: string;
  /** Secondary text, e.g. the token or field type. */
  detail?: string;
  /** Applying the suggestion replaces text[start, end) with `insert`. */
  start: number;
  end: number;
  insert: string;
}

const DATE_PRESETS: FilterDate[] = [
  { kind: "relative", amount: 0, unit: "day" },
  { kind: "relative", amount: -1, unit: "day" },
  { kind: "relative", amount: -7, unit: "day" },
  { kind: "relative", amount: -30, unit: "day" },
];
const DURATION_PRESETS: FilterDuration[] = [
  { amount: 7, unit: "day" },
  { amount: 30, unit: "day" },
  { amount: 1, unit: "week" },
  { amount: 3, unit: "month" },
];
const PERIOD_PRESETS: FilterDate[] = [
  { kind: "relative", amount: 0, unit: "week" },
  { kind: "relative", amount: -1, unit: "week" },
  { kind: "relative", amount: 0, unit: "month" },
  { kind: "relative", amount: -1, unit: "month" },
  { kind: "relative", amount: 0, unit: "year" },
];

function valueChoices(
  field: FilterField,
  operator: FilterOperatorDefinition,
  locale: string,
): { value: FilterValue; label: string; single: FilterValue }[] {
  const periodFormat = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  switch (operator.valueKind) {
    case "list":
      return (field.options ?? []).map((option) => ({
        value: option.value,
        label: option.label,
        single: [option.value],
      }));
    case "boolean":
      return [true, false].map((value) => ({
        value,
        label: value ? (field.trueLabel ?? "Yes") : (field.falseLabel ?? "No"),
        single: value,
      }));
    case "date":
      return DATE_PRESETS.map((date) => ({
        value: date,
        label: formatFilterDate(date, locale),
        single: date,
      }));
    case "duration":
      return DURATION_PRESETS.map((duration) => ({
        value: duration,
        label: formatFilterDuration(duration, locale),
        single: duration,
      }));
    case "period":
      return PERIOD_PRESETS.map((period) => ({
        value: period,
        label:
          period.kind === "relative"
            ? periodFormat.format(period.amount, period.unit)
            : "",
        single: period,
      }));
    default:
      return [];
  }
}

function fieldSuggestions(
  fields: FilterFields,
  partial: string,
  start: number,
  end: number,
): FilterQuerySuggestion[] {
  const lower = partial.toLowerCase();

  return fields
    .filter(
      (field) =>
        field.key.toLowerCase().startsWith(lower) ||
        field.label.toLowerCase().startsWith(lower),
    )
    .map((field) => ({
      id: `field:${field.key}`,
      kind: "field",
      label: field.label,
      detail: `${field.key}:`,
      start,
      end,
      insert: `${field.key}:`,
    }));
}

function termAt(tokens: FilterQueryToken[], caret: number) {
  return tokens.find(
    (token) =>
      token.kind === "term" && token.start < caret && caret <= token.end,
  );
}

/**
 * Autocomplete for the text at `caret`: field names while typing a word,
 * then values (options, yes/no, date presets) and operator tokens after
 * `field:`. Values in a list complete the item under the caret.
 */
export function getFilterQuerySuggestions<TData>(
  text: string,
  caret: number,
  fields: FilterFields<TData>,
  { locale = "en-US" }: FilterQueryOptions & { locale?: string } = {},
): FilterQuerySuggestion[] {
  const schema = fields as FilterFields;
  const token = termAt(lexFilterQuery(text).tokens, caret);

  if (!token) {
    return fieldSuggestions(schema, "", caret, caret);
  }

  const parts = splitFilterQueryTerm(token);

  if (!parts.field || caret < parts.rest.start) {
    if (token.text.startsWith('"')) {
      return [];
    }

    return fieldSuggestions(
      schema,
      text.slice(token.start, caret),
      token.start,
      parts.field ? parts.rest.start : token.end,
    );
  }

  const field = findFilterQueryField(schema, parts.field.text);

  if (!field) {
    return [];
  }

  const typed = text.slice(parts.rest.start, caret);
  // The operator whose own token starts what is typed (longest first).
  const match = matchFilterQueryOperators(field, typed).find(
    ({ operator, token: candidate }) =>
      candidate === getFilterQueryToken(operator),
  );
  const operatorToken = match?.token ?? "";
  const valueStart = parts.rest.start + operatorToken.length;
  const suggestions: FilterQuerySuggestion[] = [];

  if (match && match.operator.arity !== "none") {
    const valueText = text.slice(valueStart, parts.rest.end);
    const items = splitFilterQueryList(valueText, valueStart);
    const multiple =
      match.operator.valueKind === "list" ||
      match.operator.arity === "multiple";
    const item = multiple
      ? (items.find((candidate) => candidate.end >= caret) ?? items.at(-1))
      : { text: valueText, start: valueStart, end: parts.rest.end };
    const partial = item
      ? text.slice(item.start, Math.max(item.start, caret)).replace(/^"/, "")
      : "";
    const lower = partial.toLowerCase();
    const listed = new Set(
      multiple
        ? items.filter((other) => other !== item).map((other) => other.text)
        : [],
    );

    const start = item?.start ?? valueStart;
    const end = item?.end ?? parts.rest.end;
    const operator = match.operator;
    // Whether the term reads back with the intended operator once `insert`
    // replaces the value: "status:empty" would be the "is empty" operator.
    const readsBack = (insert: string) => {
      const term =
        text.slice(token.start, start) + insert + text.slice(end, token.end);
      const parsed = parseFilterQuery(term, schema);
      const [condition] = parsed.ok ? parsed.filter.children : [];

      return (
        condition?.type === "condition" && condition.operator === operator.id
      );
    };

    for (const choice of valueChoices(field, operator, locale)) {
      const printed = printFilterQueryValue(choice.single, operator);

      if (
        listed.has(printed) ||
        !(
          printed.toLowerCase().startsWith(lower) ||
          choice.label.toLowerCase().startsWith(lower)
        )
      ) {
        continue;
      }

      const quoted = printFilterQueryValue(choice.single, operator, true);
      const insert =
        quoted !== printed && !readsBack(printed) && readsBack(quoted)
          ? quoted
          : printed;

      if (listed.has(insert)) {
        continue;
      }

      suggestions.push({
        id: `value:${insert}`,
        kind: "value",
        label: choice.label,
        detail: insert,
        start,
        end,
        insert,
      });
    }
  }

  // Operator tokens that extend what is typed: all of them after `field:`,
  // ">=" after ">", "empty" after "e".
  for (const operator of getFilterOperators(field)) {
    const operatorText = getFilterQueryToken(operator);

    if (operatorText.length > typed.length && operatorText.startsWith(typed)) {
      suggestions.push({
        id: `operator:${operator.id}`,
        kind: "operator",
        label: operator.label,
        detail: operatorText,
        start: parts.rest.start,
        end: caret,
        insert: operatorText,
      });
    }
  }

  return suggestions;
}
