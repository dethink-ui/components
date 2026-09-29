import {
  formatFilterDate,
  formatFilterDuration,
  isFilterDate,
  isFilterDuration,
} from "./filter-dates";
import {
  multiOptionFilterOperators,
  optionFilterOperators,
  textFilterOperators,
} from "./filter-operators";
import {
  booleanFilterOperators,
  dateFilterOperators,
  numberFilterOperators,
} from "./filter-typed-operators";
import type {
  BuiltInFilterFieldType,
  FilterField,
  FilterFieldTypeDefinition,
  FilterOperatorDefinition,
  FilterValue,
} from "./filter-types";

/** Identity helper for a custom operator, typed for editors and AI schema. */
export function defineFilterOperator(
  operator: FilterOperatorDefinition,
): FilterOperatorDefinition {
  return operator;
}

/**
 * Defines a custom field type, such as a `user` type with its own
 * operators, value text and editor. Pass it as a field's `type`.
 */
export function defineFilterFieldType(
  definition: FilterFieldTypeDefinition,
): FilterFieldTypeDefinition {
  return definition;
}

function formatOptions(value: FilterValue, field: FilterField) {
  const values = Array.isArray(value) ? value : [value];

  return values.map((item) => {
    const text = String(item);

    return (
      field.options?.find((option) => option.value === text)?.label ?? text
    );
  });
}

function formatNumber(
  value: FilterValue,
  field: FilterField,
  { locale }: { locale: string },
) {
  const format = new Intl.NumberFormat(locale, field.numberFormat);

  if (Array.isArray(value)) {
    return [value.map((item) => format.format(Number(item))).join(" – ")];
  }

  return [format.format(Number(value))];
}

function formatDate(
  value: FilterValue,
  _field: FilterField,
  { locale, operator }: { locale: string; operator?: FilterOperatorDefinition },
) {
  if (Array.isArray(value)) {
    return [
      value
        .map((item) =>
          isFilterDate(item) ? formatFilterDate(item, locale) : "",
        )
        .join(" – "),
    ];
  }

  if (operator?.valueKind === "period" && isFilterDate(value)) {
    // "this week", "last month", "next year".
    return value.kind === "relative"
      ? [
          new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(
            value.amount,
            value.unit,
          ),
        ]
      : [formatFilterDate(value, locale)];
  }

  if (isFilterDuration(value)) {
    return [formatFilterDuration(value, locale)];
  }

  return isFilterDate(value)
    ? [formatFilterDate(value, locale)]
    : [String(value)];
}

export const builtInFilterFieldTypes: Record<
  BuiltInFilterFieldType,
  FilterFieldTypeDefinition
> = {
  text: {
    id: "text",
    operators: textFilterOperators,
    defaultOperator: "contains",
    formatValue: (value) => [`"${String(value)}"`],
  },
  number: {
    id: "number",
    operators: numberFilterOperators,
    defaultOperator: "eq",
    formatValue: formatNumber,
  },
  date: {
    id: "date",
    operators: dateFilterOperators,
    defaultOperator: "inLast",
    formatValue: formatDate,
  },
  boolean: {
    id: "boolean",
    operators: booleanFilterOperators,
    defaultOperator: "is",
    formatValue: (value, field) => [
      value === true ? (field.trueLabel ?? "Yes") : (field.falseLabel ?? "No"),
    ],
  },
  option: {
    id: "option",
    operators: optionFilterOperators,
    defaultOperator: "isAnyOf",
    formatValue: formatOptions,
  },
  multiOption: {
    id: "multiOption",
    operators: multiOptionFilterOperators,
    defaultOperator: "includesAny",
    formatValue: formatOptions,
  },
};

/** The type definition behind a field, built-in or custom. */
export function resolveFilterFieldType(
  field: Pick<FilterField, "type">,
): FilterFieldTypeDefinition {
  return typeof field.type === "string"
    ? (builtInFilterFieldTypes[field.type] ?? builtInFilterFieldTypes.text)
    : field.type;
}

/** Built-in operators by type. */
export const filterOperatorsByType = Object.fromEntries(
  Object.entries(builtInFilterFieldTypes).map(([type, definition]) => [
    type,
    definition.operators,
  ]),
) as Record<BuiltInFilterFieldType, FilterOperatorDefinition[]>;

/** Built-in default operator by type. */
export const defaultFilterOperatorByType = Object.fromEntries(
  Object.entries(builtInFilterFieldTypes).map(([type, definition]) => [
    type,
    definition.defaultOperator,
  ]),
) as Record<BuiltInFilterFieldType, string>;
