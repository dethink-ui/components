import { resolveFilterFieldType } from "./filter-field-types";
import { isEmptyFilterValue } from "./filter-operators";
import {
  getFilterField,
  getFilterOperator,
  getFilterOperatorLabel,
} from "./filter-model";
import type {
  FilterCondition,
  FilterDiff,
  FilterField,
  FilterFields,
  FilterNode,
  FilterOperatorDefinition,
  FilterValue,
} from "./filter-types";

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
  /** Locale for numbers and dates. Defaults to "en-US" for SSR stability. */
  locale?: string;
}

/**
 * Readable value text from the field type's formatter: option labels,
 * formatted numbers, "7 days ago", "this week", "Yes"… One string per listed
 * value; ranges read as one "from – to" string.
 */
export function formatFilterValue(
  field: FilterField | undefined,
  value: FilterValue | undefined,
  {
    locale = "en-US",
    operator,
  }: { locale?: string; operator?: FilterOperatorDefinition } = {},
) {
  if (value === undefined || isEmptyFilterValue(value)) {
    return [];
  }

  if (!field) {
    return (Array.isArray(value) ? value : [value]).map((item) =>
      typeof item === "object" ? JSON.stringify(item) : String(item),
    );
  }

  const format = resolveFilterFieldType(field).formatValue;

  if (!format) {
    return (Array.isArray(value) ? value : [value]).map(String);
  }

  return format(value, field, { locale, operator });
}

export function describeFilterCondition<TData>(
  condition: FilterCondition,
  fields: FilterFields<TData>,
  { labels: labelOverrides, locale }: DescribeFilterOptions = {},
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
  const values = formatFilterValue(
    field as FilterField | undefined,
    condition.value,
    {
      locale,
      operator,
    },
  );
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

    const parts = node.children
      .map((child) => describeNode(child, true))
      .filter((part) => part !== "");

    if (parts.length === 0) {
      return "";
    }

    const text = parts.join(`, ${labels[node.combinator]} `);
    const wrapped = nested && parts.length > 1 ? `(${text})` : text;

    return node.not
      ? `${labels.not} ${nested ? wrapped : `(${wrapped})`}`
      : wrapped;
  };

  return describeNode(filter, false) || labels.empty;
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
