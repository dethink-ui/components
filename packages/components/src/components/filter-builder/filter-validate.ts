import { isEmptyFilterValue } from "./filter-operators";
import {
  getFilterField,
  getFilterOperator,
  getFilterConditions,
} from "./filter-model";
import { DEFAULT_FILTER_MAX_DEPTH } from "./filter-commands";
import type { FilterFields, FilterIssue, FilterNode } from "./filter-types";

export function validateFilter<TData>(
  filter: FilterNode,
  fields: FilterFields<TData>,
  { maxDepth = DEFAULT_FILTER_MAX_DEPTH }: { maxDepth?: number } = {},
): FilterIssue[] {
  const depthIssues: FilterIssue[] = [];
  const checkDepth = (node: FilterNode, depth: number) => {
    if (node.type !== "group") {
      return;
    }

    if (depth > maxDepth) {
      depthIssues.push({
        nodeId: node.id,
        code: "max-depth",
        message: `Groups can be nested ${maxDepth} levels deep.`,
      });
    }

    for (const child of node.children) {
      checkDepth(child, depth + 1);
    }
  };

  checkDepth(filter, 1);

  return [...depthIssues, ...validateConditions(filter, fields)];
}

function validateConditions<TData>(
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
