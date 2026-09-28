import type {
  FilterFieldType,
  FilterOperatorDefinition,
  FilterValue,
} from "./filter-types";

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

function toStringList(value: FilterValue | undefined) {
  if (Array.isArray(value)) {
    return value;
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
  match: (rowText: string, query: string) => boolean,
): FilterOperatorDefinition {
  return {
    id,
    label,
    arity: "single",
    evaluate: (rowValue, value) => match(toText(rowValue), toText(value)),
  };
}

const isEmpty: FilterOperatorDefinition = {
  id: "isEmpty",
  label: "is empty",
  arity: "none",
  evaluate: (rowValue) => isEmptyFilterValue(rowValue),
};

const isNotEmpty: FilterOperatorDefinition = {
  id: "isNotEmpty",
  label: "is not empty",
  arity: "none",
  evaluate: (rowValue) => !isEmptyFilterValue(rowValue),
};

export const textFilterOperators: FilterOperatorDefinition[] = [
  textOperator("contains", "contains", (row, query) => row.includes(query)),
  textOperator(
    "notContains",
    "does not contain",
    (row, query) => !row.includes(query),
  ),
  textOperator("is", "is", (row, query) => row === query),
  textOperator("isNot", "is not", (row, query) => row !== query),
  textOperator("startsWith", "starts with", (row, query) =>
    row.startsWith(query),
  ),
  textOperator("endsWith", "ends with", (row, query) => row.endsWith(query)),
  isEmpty,
  isNotEmpty,
];

export const optionFilterOperators: FilterOperatorDefinition[] = [
  {
    id: "isAnyOf",
    label: "is any of",
    singleLabel: "is",
    arity: "multiple",
    evaluate: (rowValue, value) => {
      const selected = toStringList(value);

      return rowValueList(rowValue).some((item) => selected.includes(item));
    },
  },
  {
    id: "isNoneOf",
    label: "is none of",
    singleLabel: "is not",
    arity: "multiple",
    evaluate: (rowValue, value) => {
      const selected = toStringList(value);

      return !rowValueList(rowValue).some((item) => selected.includes(item));
    },
  },
  isEmpty,
  isNotEmpty,
];

export const multiOptionFilterOperators: FilterOperatorDefinition[] = [
  {
    id: "includesAny",
    label: "includes any of",
    singleLabel: "includes",
    arity: "multiple",
    evaluate: (rowValue, value) => {
      const items = rowValueList(rowValue);

      return toStringList(value).some((item) => items.includes(item));
    },
  },
  {
    id: "includesAll",
    label: "includes all of",
    singleLabel: "includes",
    arity: "multiple",
    evaluate: (rowValue, value) => {
      const items = rowValueList(rowValue);

      return toStringList(value).every((item) => items.includes(item));
    },
  },
  {
    id: "excludesAll",
    label: "includes none of",
    singleLabel: "does not include",
    arity: "multiple",
    evaluate: (rowValue, value) => {
      const items = rowValueList(rowValue);

      return !toStringList(value).some((item) => items.includes(item));
    },
  },
  isEmpty,
  isNotEmpty,
];

export const filterOperatorsByType: Record<
  FilterFieldType,
  FilterOperatorDefinition[]
> = {
  text: textFilterOperators,
  option: optionFilterOperators,
  multiOption: multiOptionFilterOperators,
};

export const defaultFilterOperatorByType: Record<FilterFieldType, string> = {
  text: "contains",
  option: "isAnyOf",
  multiOption: "includesAny",
};
