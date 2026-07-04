import type { PropRow } from "@/components/props-table";

export const selectProps: PropRow[] = [
  {
    prop: "value",
    type: "string",
    defaultValue: "—",
    description: "Controlled selected item value. Pair with onValueChange.",
  },
  {
    prop: "defaultValue",
    type: "string",
    defaultValue: "—",
    description: "Initial selection for uncontrolled usage.",
  },
  {
    prop: "onValueChange",
    type: "(value: string) => void",
    defaultValue: "—",
    description: "Fires with the selected item's value.",
  },
  {
    prop: "children",
    type: "SelectItem nodes | (item) => SelectItem",
    defaultValue: "—",
    description:
      "Static SelectItem children, or a render function when passing items.",
  },
  {
    prop: "items",
    type: "Iterable<SelectItemData>",
    defaultValue: "—",
    description:
      "Dynamic option data ({ value, label?, textValue? }) rendered through the children function.",
  },
  {
    prop: "disabledKeys",
    type: "Iterable<string>",
    defaultValue: "—",
    description: "Values of options that render disabled.",
  },
  {
    prop: "label / description / errorMessage",
    type: "ReactNode",
    defaultValue: "—",
    description: "Field label, helper text, and validation message slots.",
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
    description: "Trigger height and typography scale.",
  },
  {
    prop: "required / disabled / readOnly / invalid",
    type: "boolean",
    defaultValue: "false",
    description: "Standard form field states.",
  },
  {
    prop: "open / defaultOpen / onOpenChange",
    type: "boolean / boolean / (open) => void",
    defaultValue: "—",
    description: "Controlled or uncontrolled listbox visibility.",
  },
  {
    prop: "name",
    type: "string",
    defaultValue: "—",
    description: "Hidden input name for native form submission.",
  },
];

export const selectItemProps: PropRow[] = [
  {
    prop: "value",
    type: "string",
    defaultValue: "—",
    description: "Unique value submitted and passed to onValueChange.",
  },
  {
    prop: "textValue",
    type: "string",
    defaultValue: "text content",
    description:
      "Plain-text form of the option for typeahead when children are rich nodes.",
  },
  {
    prop: "disabled",
    type: "boolean",
    defaultValue: "false",
    description: "Disables this option only.",
  },
];
