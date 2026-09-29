import { resolveFilterFieldType } from "./filter-field-types";
import { isEmptyFilterValue } from "./filter-operators";
import type {
  FilterCombinator,
  FilterCondition,
  FilterField,
  FilterFields,
  FilterGroup,
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
  const operators = resolveFilterFieldType(field).operators;

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
    field.defaultOperator ?? resolveFilterFieldType(field).defaultOperator;

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

/** Whether a value can be used with an operator: present and well-shaped. */
export function isFilterValueUsable(
  operator: FilterOperatorDefinition,
  value: FilterValue | undefined,
) {
  if (operator.arity === "none") {
    return true;
  }

  if (value === undefined || isEmptyFilterValue(value)) {
    return false;
  }

  return operator.isValueValid ? operator.isValueValid(value) : true;
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

  return isFilterValueUsable(operator, condition.value);
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
