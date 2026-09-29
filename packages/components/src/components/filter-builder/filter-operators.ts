import type { FilterOperatorDefinition, FilterValue } from "./filter-types";

export function isEmptyFilterValue(value: unknown) {
  return (
    value === null ||
    value === undefined ||
    value === "" ||
    (Array.isArray(value) && value.length === 0)
  );
}

function toText(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (Array.isArray(value)) {
    return value.map(toText).join(" ");
  }

  return String(value).toLowerCase();
}

function isStringList(value: FilterValue) {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}

function toStringList(value: FilterValue | undefined): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item));
  }

  return isEmptyFilterValue(value) ? [] : [String(value)];
}

function rowValueList(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item));
  }

  return isEmptyFilterValue(value) ? [] : [String(value)];
}

function textOperator(
  id: string,
  label: string,
  token: string,
  match: (rowText: string, query: string) => boolean,
): FilterOperatorDefinition {
  return {
    id,
    label,
    token,
    arity: "single",
    valueKind: "text",
    isValueValid: (value) => typeof value === "string",
    evaluate: (rowValue, value) => match(toText(rowValue), toText(value)),
  };
}

export const isEmptyFilterOperator: FilterOperatorDefinition = {
  id: "isEmpty",
  label: "is empty",
  token: "empty",
  arity: "none",
  evaluate: (rowValue) => isEmptyFilterValue(rowValue),
};

export const isNotEmptyFilterOperator: FilterOperatorDefinition = {
  id: "isNotEmpty",
  label: "is not empty",
  token: "!empty",
  arity: "none",
  evaluate: (rowValue) => !isEmptyFilterValue(rowValue),
};

export const textFilterOperators: FilterOperatorDefinition[] = [
  textOperator("contains", "contains", "", (row, query) => row.includes(query)),
  textOperator(
    "notContains",
    "does not contain",
    "!",
    (row, query) => !row.includes(query),
  ),
  textOperator("is", "is", "=", (row, query) => row === query),
  textOperator("isNot", "is not", "!=", (row, query) => row !== query),
  textOperator("startsWith", "starts with", "^", (row, query) =>
    row.startsWith(query),
  ),
  textOperator("endsWith", "ends with", "$", (row, query) =>
    row.endsWith(query),
  ),
  isEmptyFilterOperator,
  isNotEmptyFilterOperator,
];

export const optionFilterOperators: FilterOperatorDefinition[] = [
  {
    id: "isAnyOf",
    token: "",
    label: "is any of",
    singleLabel: "is",
    arity: "multiple",
    valueKind: "list",
    isValueValid: isStringList,
    evaluate: (rowValue, value) => {
      const selected = toStringList(value);

      return rowValueList(rowValue).some((item) => selected.includes(item));
    },
  },
  {
    id: "isNoneOf",
    token: "!",
    label: "is none of",
    singleLabel: "is not",
    arity: "multiple",
    valueKind: "list",
    isValueValid: isStringList,
    evaluate: (rowValue, value) => {
      const selected = toStringList(value);

      return !rowValueList(rowValue).some((item) => selected.includes(item));
    },
  },
  isEmptyFilterOperator,
  isNotEmptyFilterOperator,
];

export const multiOptionFilterOperators: FilterOperatorDefinition[] = [
  {
    id: "includesAny",
    token: "",
    label: "includes any of",
    singleLabel: "includes",
    arity: "multiple",
    valueKind: "list",
    isValueValid: isStringList,
    evaluate: (rowValue, value) => {
      const items = rowValueList(rowValue);

      return toStringList(value).some((item) => items.includes(item));
    },
  },
  {
    id: "includesAll",
    token: "&",
    label: "includes all of",
    singleLabel: "includes",
    arity: "multiple",
    valueKind: "list",
    isValueValid: isStringList,
    evaluate: (rowValue, value) => {
      const items = rowValueList(rowValue);

      return toStringList(value).every((item) => items.includes(item));
    },
  },
  {
    id: "excludesAll",
    token: "!",
    label: "includes none of",
    singleLabel: "does not include",
    arity: "multiple",
    valueKind: "list",
    isValueValid: isStringList,
    evaluate: (rowValue, value) => {
      const items = rowValueList(rowValue);

      return !toStringList(value).some((item) => items.includes(item));
    },
  },
  isEmptyFilterOperator,
  isNotEmptyFilterOperator,
];
