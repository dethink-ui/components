import {
  defineFilterFieldType,
  defineFilterFields,
  defineFilterOperator,
  type FilterNode,
} from ".";

/** A custom type with its own token: `owner:@ada`. */
export const userType = defineFilterFieldType({
  id: "user",
  operators: [
    defineFilterOperator({
      id: "is",
      label: "is",
      token: "@",
      arity: "single",
      valueKind: "user",
      isValueValid: (value) => typeof value === "string",
      evaluate: (rowValue, value) => rowValue === value,
    }),
    // No token: written as `owner:near:ada`.
    defineFilterOperator({
      id: "near",
      label: "works near",
      arity: "multiple",
      valueKind: "team",
      evaluate: () => true,
    }),
  ],
});

export const queryFields = defineFilterFields([
  { key: "title", label: "Title", type: "text" },
  {
    key: "status",
    label: "Status",
    type: "option",
    options: [
      { value: "open", label: "Open" },
      { value: "blocked", label: "Blocked" },
      { value: "done", label: "Done" },
      { value: "in progress", label: "In progress" },
      { value: "empty", label: "Empty" },
    ],
  },
  {
    key: "labels",
    label: "Labels",
    type: "multiOption",
    options: [
      { value: "bug", label: "Bug" },
      { value: "ui", label: "UI" },
      { value: "api", label: "API" },
    ],
  },
  { key: "amount", label: "Amount", type: "number" },
  { key: "created", label: "Created", type: "date" },
  { key: "urgent", label: "Urgent", type: "boolean" },
  { key: "owner", label: "Owner", type: userType },
]);

/** Removes ids, so parsed and expected filters compare by content. */
export function stripIds(node: FilterNode): unknown {
  if (node.type === "condition") {
    const { id: _id, ...rest } = node;

    return rest;
  }

  const { id: _id, children, ...rest } = node;

  return { ...rest, children: children.map(stripIds) };
}
