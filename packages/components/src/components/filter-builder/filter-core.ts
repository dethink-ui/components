import {
  defaultFilterOperatorByType,
  filterOperatorsByType,
  isEmptyFilterValue,
} from "./filter-operators";
import type {
  Filter,
  FilterCombinator,
  FilterCondition,
  FilterDiff,
  FilterField,
  FilterFields,
  FilterGroup,
  FilterIssue,
  FilterNode,
  FilterOperatorDefinition,
  FilterValue,
} from "./filter-types";

let filterIdCounter = 0;

/** Creates a node id. Ids are keys, not DOM ids, so they never affect SSR. */
export function createFilterId(prefix = "node") {
  filterIdCounter += 1;

  return `${prefix}-${filterIdCounter.toString(36)}${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

/** Identity helper that keeps field keys and row types inferred. */
export function defineFilterFields<TData>(
  fields: readonly FilterField<TData>[],
): readonly FilterField<TData>[] {
  return fields;
}

export function createFilter({
  children = [],
  combinator = "and",
  id,
  not,
}: {
  children?: FilterNode[];
  combinator?: FilterCombinator;
  id?: string;
  not?: boolean;
} = {}): FilterGroup {
  return {
    type: "group",
    id: id ?? createFilterId("group"),
    combinator,
    ...(not ? { not } : {}),
    children,
  };
}

export function createFilterCondition({
  field,
  id,
  not,
  operator,
  value,
}: {
  field: string;
  id?: string;
  not?: boolean;
  operator: string;
  value?: FilterValue;
}): FilterCondition {
  return {
    type: "condition",
    id: id ?? createFilterId("condition"),
    field,
    operator,
    ...(value === undefined ? {} : { value }),
    ...(not ? { not } : {}),
  };
}

export function getFilterField<TData>(
  fields: FilterFields<TData>,
  key: string,
): FilterField<TData> | undefined {
  return fields.find((field) => field.key === key);
}

export function getFilterOperators(
  field: Pick<FilterField, "operators" | "type">,
): FilterOperatorDefinition[] {
  const operators = filterOperatorsByType[field.type] ?? [];

  if (!field.operators) {
    return operators;
  }

  return field.operators.flatMap((id) => {
    const operator = operators.find((candidate) => candidate.id === id);

    return operator ? [operator] : [];
  });
}

export function getFilterOperator(
  field: Pick<FilterField, "operators" | "type">,
  operatorId: string,
) {
  return getFilterOperators(field).find(
    (operator) => operator.id === operatorId,
  );
}

export function getDefaultFilterOperator(
  field: Pick<FilterField, "defaultOperator" | "operators" | "type">,
) {
  const operators = getFilterOperators(field);
  const preferred =
    field.defaultOperator ?? defaultFilterOperatorByType[field.type];

  return (
    operators.find((operator) => operator.id === preferred) ?? operators[0]
  );
}

/** Label for an operator, using its single-value form when one value is set. */
export function getFilterOperatorLabel(
  operator: FilterOperatorDefinition,
  value?: FilterValue,
) {
  if (operator.singleLabel && Array.isArray(value) && value.length === 1) {
    return operator.singleLabel;
  }

  return operator.label;
}

/** Whether the condition filters rows: known field, operator and a value. */
export function isFilterConditionActive<TData>(
  condition: FilterCondition,
  fields: FilterFields<TData>,
) {
  const field = getFilterField(fields, condition.field);
  const operator = field
    ? getFilterOperator(field, condition.operator)
    : undefined;

  if (!operator) {
    return false;
  }

  return operator.arity === "none" || !isEmptyFilterValue(condition.value);
}

export function isFilterEmpty(filter: FilterNode) {
  return filter.type === "group" && filter.children.length === 0;
}

export function findFilterNode(
  node: FilterNode,
  id: string,
): FilterNode | undefined {
  if (node.id === id) {
    return node;
  }

  if (node.type === "group") {
    for (const child of node.children) {
      const found = findFilterNode(child, id);

      if (found) {
        return found;
      }
    }
  }

  return undefined;
}

/** All conditions in document order. */
export function getFilterConditions(node: FilterNode): FilterCondition[] {
  return node.type === "condition"
    ? [node]
    : node.children.flatMap(getFilterConditions);
}

function mapGroups(
  group: FilterGroup,
  visit: (group: FilterGroup) => FilterGroup,
): FilterGroup {
  return visit({
    ...group,
    children: group.children.map((child) =>
      child.type === "group" ? mapGroups(child, visit) : child,
    ),
  });
}

export function addFilterNode(
  filter: Filter,
  node: FilterNode,
  { index, parentId = filter.id }: { index?: number; parentId?: string } = {},
): Filter {
  return mapGroups(filter, (group) => {
    if (group.id !== parentId) {
      return group;
    }

    const children = [...group.children];

    children.splice(index ?? children.length, 0, node);

    return { ...group, children };
  });
}

export function updateFilterCondition(
  filter: Filter,
  id: string,
  patch: Partial<Omit<FilterCondition, "id" | "type">>,
): Filter {
  return mapGroups(filter, (group) => ({
    ...group,
    children: group.children.map((child) => {
      if (child.type !== "condition" || child.id !== id) {
        return child;
      }

      const next: FilterCondition = { ...child, ...patch };

      if (patch.value === undefined && "value" in patch) {
        delete next.value;
      }

      return next;
    }),
  }));
}

export function updateFilterGroup(
  filter: Filter,
  id: string,
  patch: Partial<Pick<FilterGroup, "combinator" | "not">>,
): Filter {
  return mapGroups(filter, (group) =>
    group.id === id ? { ...group, ...patch } : group,
  );
}

/** Removes a node and any non-root groups left empty by the removal. */
export function removeFilterNode(filter: Filter, id: string): Filter {
  const prune = (group: FilterGroup): FilterGroup => ({
    ...group,
    children: group.children.flatMap((child): FilterNode[] => {
      if (child.id === id) {
        return [];
      }

      if (child.type === "group") {
        const next = prune(child);

        return next.children.length === 0 ? [] : [next];
      }

      return [child];
    }),
  });

  return prune(filter);
}

export function clearFilter(filter: Filter): Filter {
  return { ...filter, children: [] };
}

/**
 * Canonical form: removes empty non-root groups, unwraps single-child
 * groups and merges nested groups that share their parent's combinator.
 */
export function normalizeFilter(filter: Filter): Filter {
  const normalizeGroup = (
    group: FilterGroup,
    isRoot: boolean,
  ): FilterNode[] => {
    const children = group.children.flatMap((child): FilterNode[] => {
      if (child.type === "condition") {
        return [child];
      }

      const normalized = normalizeGroup(child, false);

      if (normalized.length === 0) {
        return [];
      }

      const [only] = normalized;

      if (normalized.length === 1 && only && !child.not) {
        return [only];
      }

      if (!child.not && child.combinator === group.combinator) {
        return normalized;
      }

      return [{ ...child, children: normalized }];
    });

    return isRoot ? [{ ...group, children }] : children;
  };

  return normalizeGroup(filter, true)[0] as Filter;
}

export function validateFilter<TData>(
  filter: FilterNode,
  fields: FilterFields<TData>,
): FilterIssue[] {
  return getFilterConditions(filter).flatMap((condition): FilterIssue[] => {
    const field = getFilterField(fields, condition.field);

    if (!field) {
      return [
        {
          nodeId: condition.id,
          code: "unknown-field",
          message: `Unknown field "${condition.field}".`,
        },
      ];
    }

    const operator = getFilterOperator(field, condition.operator);

    if (!operator) {
      return [
        {
          nodeId: condition.id,
          code: "unknown-operator",
          message: `Operator "${condition.operator}" is not available for ${field.label}.`,
        },
      ];
    }

    if (operator.arity === "none") {
      return [];
    }

    if (isEmptyFilterValue(condition.value)) {
      return [
        {
          nodeId: condition.id,
          code: "missing-value",
          message: `${field.label} needs a value.`,
        },
      ];
    }

    const isList = Array.isArray(condition.value);

    if (
      (operator.arity === "multiple" && !isList) ||
      (operator.arity === "single" && isList)
    ) {
      return [
        {
          nodeId: condition.id,
          code: "invalid-value",
          message: `${field.label} has a value of the wrong shape.`,
        },
      ];
    }

    if (field.options && Array.isArray(condition.value)) {
      const unknown = condition.value.filter(
        (value) => !field.options?.some((option) => option.value === value),
      );

      if (unknown.length > 0) {
        return [
          {
            nodeId: condition.id,
            code: "unknown-option",
            message: `${field.label} has unknown values: ${unknown.join(", ")}.`,
          },
        ];
      }
    }

    return [];
  });
}

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

export interface FilterDescribeLabels {
  and: string;
  or: string;
  not: string;
  missingValue: string;
  empty: string;
}

export const defaultFilterDescribeLabels: FilterDescribeLabels = {
  and: "and",
  or: "or",
  not: "not",
  missingValue: "(no value)",
  empty: "No filters",
};

export interface DescribeFilterOptions {
  labels?: Partial<FilterDescribeLabels>;
}

/** Human-readable value text, with option values mapped to their labels. */
export function formatFilterValue(
  field: Pick<FilterField, "options" | "type"> | undefined,
  value: FilterValue | undefined,
) {
  if (isEmptyFilterValue(value) || value === undefined) {
    return [];
  }

  const values = Array.isArray(value) ? value : [value];

  return values.map((item) => {
    const option = field?.options?.find(
      (candidate) => candidate.value === String(item),
    );

    if (option) {
      return option.label;
    }

    return field?.type === "text" ? `"${String(item)}"` : String(item);
  });
}

export function describeFilterCondition<TData>(
  condition: FilterCondition,
  fields: FilterFields<TData>,
  { labels: labelOverrides }: DescribeFilterOptions = {},
) {
  const labels = { ...defaultFilterDescribeLabels, ...labelOverrides };
  const field = getFilterField(fields, condition.field);
  const operator = field
    ? getFilterOperator(field, condition.operator)
    : undefined;
  const fieldLabel = field?.label ?? condition.field;
  const operatorLabel = operator
    ? getFilterOperatorLabel(operator, condition.value)
    : condition.operator;
  const values = formatFilterValue(field, condition.value);
  const valueText =
    operator?.arity === "none"
      ? ""
      : values.length > 0
        ? ` ${values.join(", ")}`
        : ` ${labels.missingValue}`;
  const sentence = `${fieldLabel} ${operatorLabel}${valueText}`;

  return condition.not ? `${labels.not} (${sentence})` : sentence;
}

/** Describes a filter as one sentence for screen readers and AI previews. */
export function describeFilter<TData>(
  filter: FilterNode,
  fields: FilterFields<TData>,
  options: DescribeFilterOptions = {},
): string {
  const labels = { ...defaultFilterDescribeLabels, ...options.labels };

  const describeNode = (node: FilterNode, nested: boolean): string => {
    if (node.type === "condition") {
      return describeFilterCondition(node, fields, options);
    }

    const text = node.children
      .map((child) => describeNode(child, true))
      .join(`, ${labels[node.combinator]} `);
    const wrapped = nested && node.children.length > 1 ? `(${text})` : text;

    return node.not
      ? `${labels.not} ${nested ? wrapped : `(${wrapped})`}`
      : wrapped;
  };

  return isFilterEmpty(filter) ? labels.empty : describeNode(filter, false);
}

function nodeSignature(node: FilterNode) {
  if (node.type === "group") {
    // Membership (not order) changes results, so moving a node between groups
    // reports both groups as changed.
    return JSON.stringify([
      node.combinator,
      Boolean(node.not),
      node.children.map((child) => child.id).sort(),
    ]);
  }

  return JSON.stringify([
    node.field,
    node.operator,
    node.value ?? null,
    Boolean(node.not),
  ]);
}

function indexNodes(node: FilterNode, map = new Map<string, FilterNode>()) {
  map.set(node.id, node);

  if (node.type === "group") {
    for (const child of node.children) {
      indexNodes(child, map);
    }
  }

  return map;
}

/** Nodes added, removed and changed between two filters, matched by id. */
export function diffFilter(before: FilterNode, after: FilterNode): FilterDiff {
  const beforeNodes = indexNodes(before);
  const afterNodes = indexNodes(after);
  const diff: FilterDiff = { added: [], removed: [], changed: [] };

  for (const [id, node] of afterNodes) {
    const previous = beforeNodes.get(id);

    if (!previous) {
      diff.added.push(node);
    } else if (nodeSignature(previous) !== nodeSignature(node)) {
      diff.changed.push({ before: previous, after: node });
    }
  }

  for (const [id, node] of beforeNodes) {
    if (!afterNodes.has(id)) {
      diff.removed.push(node);
    }
  }

  return diff;
}
