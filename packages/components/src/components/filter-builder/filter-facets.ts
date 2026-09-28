import { createFilterPredicate, readFilterFieldValue } from "./filter-evaluate";
import {
  findFilterNode,
  getDefaultFilterOperator,
  getFilterConditions,
  getFilterField,
  getFilterOperator,
  isFilterConditionActive,
} from "./filter-model";
import {
  multiOptionFilterOperators,
  optionFilterOperators,
} from "./filter-operators";
import { booleanFilterOperators } from "./filter-typed-operators";
import type {
  FilterCondition,
  FilterEvaluateOptions,
  FilterField,
  FilterFields,
  FilterNode,
  FilterOperatorDefinition,
} from "./filter-types";

function facetKeys(value: unknown): string[] {
  if (value === null || value === undefined || value === "") {
    return [];
  }

  return Array.isArray(value) ? value.map(String) : [String(value)];
}

/**
 * Built-in operators where picking one value keeps exactly the rows whose
 * value (or one of its items) is that value, so a per-value row count is what
 * the pick would show. Matched by definition, not id: a custom operator
 * named "is" may compare differently (e.g. case-insensitively), and negative
 * or custom operators get no counts.
 */
const FACET_OPERATORS = new Set<FilterOperatorDefinition | undefined>(
  [
    ...optionFilterOperators,
    ...multiOptionFilterOperators,
    ...booleanFilterOperators,
  ].filter(
    (operator) =>
      operator.id === "isAnyOf" ||
      operator.id === "includesAny" ||
      operator.id === "includesAll" ||
      (operator.id === "is" && operator.valueKind === "boolean"),
  ),
);

function isFacetOperator<TData>(
  field: FilterField<TData>,
  operatorId?: string,
) {
  return (
    operatorId !== undefined &&
    FACET_OPERATORS.has(getFilterOperator(field, operatorId))
  );
}

/** Where the value being picked goes, so counts match the resulting filter. */
export interface FilterFacetTarget {
  /** Condition whose value is being picked; its current value is ignored. */
  conditionId?: string;
  /**
   * Group a new condition will join while `conditionId` is not in the filter
   * yet, for example during the add flow. Defaults to the root.
   */
  parentId?: string;
  /** Operator the value is picked for. Defaults to the condition's own. */
  operator?: string;
}

export interface FilterFacetOptions extends FilterEvaluateOptions {
  target?: FilterFacetTarget;
}

/** Nodes from `node` down to the node with `id`, inclusive. */
function findFilterPath(
  node: FilterNode,
  id: string,
): FilterNode[] | undefined {
  if (node.id === id) {
    return [node];
  }

  if (node.type === "group") {
    for (const child of node.children) {
      const path = findFilterPath(child, id);

      if (path) {
        return [node, ...path];
      }
    }
  }

  return undefined;
}

/**
 * Whether a group requires all of its children to match, so a condition
 * under it filters the whole result. `extra` counts a child about to be
 * added: an OR group with one child is fine, but adding a second makes it a
 * real OR.
 */
function isConjunctive(node: FilterNode, extra = 0) {
  return (
    node.type === "group" &&
    !node.not &&
    (node.combinator === "and" || node.children.length + extra <= 1)
  );
}

function isFacetCondition<TData>(
  filter: FilterNode,
  field: FilterField<TData>,
  condition: FilterCondition,
  operator = condition.operator,
) {
  const path = findFilterPath(filter, condition.id) ?? [];

  return (
    !condition.not &&
    isFacetOperator(field, operator) &&
    path.slice(0, -1).every((group) => isConjunctive(group))
  );
}

/**
 * Whether a value picked for `target` has countable results, and which
 * conditions to leave out while counting.
 */
function resolveFacetScope<TData>(
  filter: FilterNode,
  field: FilterField<TData>,
  target: FilterFacetTarget | undefined,
): ((condition: FilterCondition) => boolean) | undefined {
  if (!target) {
    const own = getFilterConditions(filter).filter(
      (condition) => condition.field === field.key,
    );

    return own.every((condition) => isFacetCondition(filter, field, condition))
      ? (condition) => condition.field === field.key
      : undefined;
  }

  const existing = target.conditionId
    ? findFilterNode(filter, target.conditionId)
    : undefined;

  if (existing?.type === "condition") {
    return isFacetCondition(filter, field, existing, target.operator)
      ? (condition) => condition.id === existing.id
      : undefined;
  }

  // Not in the filter yet: it will join `parentId`, one more child there.
  const path = findFilterPath(filter, target.parentId ?? filter.id);
  const operator = target.operator ?? getDefaultFilterOperator(field)?.id;

  return path &&
    isFacetOperator(field, operator) &&
    path.every((group, index) =>
      isConjunctive(group, index === path.length - 1 ? 1 : 0),
    )
    ? () => false
    : undefined;
}

/**
 * Counts rows per value of `fieldKey` under the rest of the filter, so an
 * option's count says how many rows picking it would show. Array values
 * count once per item. Booleans count as "true"/"false".
 *
 * Pass `options.target` for the condition being edited (or the group a new
 * one joins); only that condition is left out. Without a target, every
 * condition on the field is left out. Returns undefined when counts would be
 * wrong: the value sits under an OR group or a negated group, the condition
 * is negated, or its operator is negative ("is not"), a text match, or
 * custom (even one reusing a built-in id).
 */
export function computeFilterFacets<TData>(
  rows: readonly TData[],
  filter: FilterNode,
  fields: FilterFields<TData>,
  fieldKey: string,
  { target, ...options }: FilterFacetOptions = {},
): Map<string, number> | undefined {
  const counts = new Map<string, number>();
  const field = getFilterField(fields, fieldKey);

  if (!field) {
    return counts;
  }

  const exclude = resolveFacetScope(filter, field, target);

  if (!exclude) {
    return undefined;
  }

  const predicate = createFilterPredicate(filter, fields, {
    ...options,
    exclude,
  });

  for (const row of rows) {
    if (!predicate(row)) {
      continue;
    }

    for (const key of facetKeys(readFilterFieldValue(field, row))) {
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }

  return counts;
}

function countMatches<TData>(
  rows: readonly TData[],
  predicate: (row: TData) => boolean,
) {
  let count = 0;

  for (const row of rows) {
    if (predicate(row)) {
      count += 1;
    }
  }

  return count;
}

/** Number of matching rows. */
export function countFilterMatches<TData>(
  rows: readonly TData[],
  filter: FilterNode,
  fields: FilterFields<TData>,
  options?: FilterEvaluateOptions,
) {
  return countMatches(rows, createFilterPredicate(filter, fields, options));
}

/**
 * For each active condition, how many rows it removes: the matches without
 * that condition minus the matches with it. Removing a condition inside an
 * OR group can add fewer rows than it hides alone, so this is the real effect
 * of taking the chip away. A negative value means the condition adds rows
 * (an OR branch), and removing it would hide them.
 */
export function computeFilterImpact<TData>(
  rows: readonly TData[],
  filter: FilterNode,
  fields: FilterFields<TData>,
  options?: FilterEvaluateOptions,
) {
  const impact = new Map<string, number>();
  const matches = countFilterMatches(rows, filter, fields, options);

  for (const condition of getFilterConditions(filter)) {
    if (!isFilterConditionActive(condition, fields)) {
      continue;
    }

    const without = countMatches(
      rows,
      createFilterPredicate(filter, fields, {
        ...options,
        exclude: (candidate) => candidate.id === condition.id,
      }),
    );

    impact.set(condition.id, without - matches);
  }

  return impact;
}

export interface FilterRescue {
  condition: FilterCondition;
  /** Rows that match once the condition is removed. */
  count: number;
}

/**
 * When nothing matches, the condition whose removal brings back the most
 * rows (the most restrictive one). Undefined when rows already match or no
 * single removal helps.
 */
export function findFilterRescue<TData>(
  rows: readonly TData[],
  filter: FilterNode,
  fields: FilterFields<TData>,
  options?: FilterEvaluateOptions,
): FilterRescue | undefined {
  if (
    rows.length === 0 ||
    countFilterMatches(rows, filter, fields, options) > 0
  ) {
    return undefined;
  }

  let best: FilterRescue | undefined;

  for (const [id, count] of computeFilterImpact(
    rows,
    filter,
    fields,
    options,
  )) {
    if (count > 0 && (!best || count > best.count)) {
      const condition = getFilterConditions(filter).find(
        (candidate) => candidate.id === id,
      );

      if (condition) {
        best = { condition, count };
      }
    }
  }

  return best;
}
