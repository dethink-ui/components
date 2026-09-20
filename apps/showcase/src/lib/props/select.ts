import type { PropRow } from "@/components/props-table";

export const selectProps: PropRow[] = [
  {
    prop: "value",
    type: "string",
    defaultValue: "—",
    description:
      "The selected value. Use with onValueChange when your app manages the selection.",
  },
  {
    prop: "defaultValue",
    type: "string",
    defaultValue: "—",
    description:
      "The starting selection when the component manages its own state.",
  },
  {
    prop: "onValueChange",
    type: "(value: string) => void",
    defaultValue: "—",
    description: "Called with the value the user selects.",
  },
  {
    prop: "children",
    type: "SelectItem nodes | (item) => SelectItem",
    defaultValue: "—",
    description:
      "Add SelectItem elements, or a function that renders each entry in items.",
  },
  {
    prop: "items",
    type: "Iterable<SelectItemData>",
    defaultValue: "—",
    description:
      "A list of options. Each needs a value; use the children function to render it.",
  },
  {
    prop: "disabledKeys",
    type: "Iterable<string>",
    defaultValue: "—",
    description: "The values of options users cannot select.",
  },
  {
    prop: "label / description / errorMessage",
    type: "ReactNode",
    defaultValue: "—",
    description: "The field label, help text, and error message.",
  },
  {
    prop: "placeholder",
    type: "string",
    defaultValue: "—",
    description: "Text shown in the trigger before a selection exists.",
  },
  {
    prop: "controlSize",
    type: '"sm" | "md" | "lg"',
    defaultValue: '"md"',
    description: "Sets the button height and text size.",
  },
  {
    prop: "required / disabled / readOnly / invalid",
    type: "boolean",
    defaultValue: "false",
    description: "Makes the field required, disabled, read-only, or invalid.",
  },
  {
    prop: "open / defaultOpen / onOpenChange",
    type: "boolean / boolean / (open) => void",
    defaultValue: "—",
    description:
      "Use open with onOpenChange to manage the list, or defaultOpen to set its starting state.",
  },
  {
    prop: "name",
    type: "string",
    defaultValue: "—",
    description: "The field name used when submitting a form.",
  },
];

export const selectItemProps: PropRow[] = [
  {
    prop: "value",
    type: "string",
    defaultValue: "—",
    description:
      "A unique value for this option. Returned by onValueChange and submitted with the form.",
  },
  {
    prop: "textValue",
    type: "string",
    defaultValue: "text content",
    description:
      "Text used to find this option when the user types. Set it when the option includes more than plain text.",
  },
  {
    prop: "disabled",
    type: "boolean",
    defaultValue: "false",
    description: "Disables this option only.",
  },
];
