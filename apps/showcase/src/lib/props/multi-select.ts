import type { PropRow } from "@/components/props-table";

export const multiSelectProps: PropRow[] = [
  {
    prop: "value / defaultValue / onValueChange",
    type: "string[] / string[] / (value) => void",
    defaultValue: "[]",
    description: "Controlled or uncontrolled selected option values.",
  },
  {
    prop: "inputValue / defaultInputValue / onInputValueChange",
    type: "string / string / (text) => void",
    defaultValue: '""',
    description: "Controlled or uncontrolled text for the searchable input.",
  },
  {
    prop: "children",
    type: "MultiSelectItem nodes | (item) => MultiSelectItem",
    defaultValue: "—",
    description:
      "Static options, or a render function when passing item data.",
  },
  {
    prop: "items / selectedItems",
    type: "Iterable<MultiSelectItemData>",
    defaultValue: "—",
    description:
      "Data-driven options and optional selected item data for stable chip labels.",
  },
  {
    prop: "disabledKeys",
    type: "Iterable<string>",
    defaultValue: "—",
    description: "Option values that cannot be selected.",
  },
  {
    prop: "label / description / errorMessage",
    type: "ReactNode",
    defaultValue: "—",
    description: "Field label, helper text, and validation message slots.",
  },
  {
    prop: "placeholder / searchPlaceholder / emptyMessage",
    type: "ReactNode",
    defaultValue: "—",
    description: "Copy for the empty control, chip input, and no-results state.",
  },
  {
    prop: "controlSize",
    type: '"sm" | "md" | "lg"',
    defaultValue: '"md"',
    description: "Control height and typography scale.",
  },
  {
    prop: "required / disabled / readOnly / invalid",
    type: "boolean",
    defaultValue: "false",
    description: "Standard form field states.",
  },
  {
    prop: "name",
    type: "string",
    defaultValue: "—",
    description: "Repeated hidden input name for native form submission.",
  },
];

export const multiSelectItemProps: PropRow[] = [
  {
    prop: "value",
    type: "string",
    defaultValue: "—",
    description: "Unique option value used for selection and form submission.",
  },
  {
    prop: "children",
    type: "ReactNode",
    defaultValue: "—",
    description: "Visible option label.",
  },
  {
    prop: "textValue",
    type: "string",
    defaultValue: "—",
    description: "Plain text used when option children are rich nodes.",
  },
  {
    prop: "disabled",
    type: "boolean",
    defaultValue: "false",
    description: "Disables this option.",
  },
];
