import { isEmptyFilterValue } from "./filter-operators";
import { getFilterOperator } from "./filter-model";
import type { FilterField, FilterFields, FilterNode } from "./filter-types";

function readFieldValue<TData>(field: FilterField<TData>, row: TData) {
  if (field.accessor) {
    return field.accessor(row);
  }

  return row && typeof row === "object"
    ? (row as Record<string, unknown>)[field.key]
    : undefined;
}

/**
 * Compiles a filter into a row predicate. Incomplete or unknown conditions
 * are skipped, so a chip that is still being edited never hides every row.
 */
export function createFilterPredicate<TData>(
  filter: FilterNode,
  fields: FilterFields<TData>,
): (row: TData) => boolean {
  const fieldMap = new Map(fields.map((field) => [field.key, field]));

  const compile = (node: FilterNode): ((row: TData) => boolean) | null => {
    if (node.type === "condition") {
      const field = fieldMap.get(node.field);
      const operator = field
        ? getFilterOperator(field, node.operator)
        : undefined;

      if (
        !field ||
        !operator ||
        (operator.arity !== "none" && isEmptyFilterValue(node.value))
      ) {
        return null;
      }

      const test = (row: TData) =>
        operator.evaluate(readFieldValue(field, row), node.value);

      return node.not ? (row) => !test(row) : test;
    }

    const children = node.children.flatMap((child) => {
      const compiled = compile(child);

      return compiled ? [compiled] : [];
    });

    if (children.length === 0) {
      return null;
    }

    const test =
      node.combinator === "and"
        ? (row: TData) => children.every((child) => child(row))
        : (row: TData) => children.some((child) => child(row));

    return node.not ? (row) => !test(row) : test;
  };

  return compile(filter) ?? (() => true);
}

export function evaluateFilter<TData>(
  filter: FilterNode,
  row: TData,
  fields: FilterFields<TData>,
) {
  return createFilterPredicate(filter, fields)(row);
}

/**
 * Builds a TanStack `globalFilterFn` that reads the filter from the table's
 * `globalFilter` state. Pass the filter itself as `globalFilter`: TanStack
 * re-filters when that state changes, so a new filter never leaves stale rows.
 * Compiled predicates are cached per filter object.
 */
export function toTanstackFilterFn<TData>(fields: FilterFields<TData>) {
  const cache = new WeakMap<FilterNode, (row: TData) => boolean>();

  return (
    row: { original: TData },
    _columnId: string,
    filter: FilterNode | null | undefined,
  ) => {
    if (!filter) {
      return true;
    }

    let predicate = cache.get(filter);

    if (!predicate) {
      predicate = createFilterPredicate(filter, fields);
      cache.set(filter, predicate);
    }

    return predicate(row.original);
  };
}
