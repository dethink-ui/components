import type { PropRow } from "@/components/props-table";

export const comboboxProps: PropRow[] = [
  {
    prop: "value",
    type: "string | null",
    defaultValue: "—",
    description: "Controlled selected item value. Pair with onValueChange.",
  },
  {
    prop: "defaultValue",
    type: "string | null",
    defaultValue: "—",
    description: "Initial selection for uncontrolled usage.",
  },
  {
    prop: "onValueChange",
    type: "(value: string | null) => void",
    defaultValue: "—",
    description: "Fires with the selected item's value, or null when cleared.",
  },
  {
    prop: "inputValue / defaultInputValue / onInputValueChange",
    type: "string / string / (text) => void",
    defaultValue: "—",
    description: "Controlled or uncontrolled text of the filter input.",
  },
  {
    prop: "children",
    type: "ComboboxItem nodes | (item) => ComboboxItem",
    defaultValue: "—",
    description:
      "Static ComboboxItem children, or a render function when passing items.",
  },
  {
    prop: "items / defaultItems",
    type: "Iterable<ComboboxItemData>",
    defaultValue: "—",
    description:
      "Dynamic option data ({ value, label?, textValue? }); items opts out of built-in filtering for externally filtered lists.",
  },
  {
    prop: "menuTrigger",
    type: '"input" | "focus" | "manual"',
    defaultValue: '"input"',
    description: "What opens the listbox: typing, focus, or only the button.",
  },
  {
    prop: "allowsCustomValue",
    type: "boolean",
    defaultValue: "false",
    description: "Keeps free text that matches no option as the value.",
  },
  {
    prop: "formValue",
    type: '"key" | "text"',
    defaultValue: '"key"',
    description:
      "Whether the hidden input submits the option value or the typed text.",
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
    description: "Input placeholder before any text is typed.",
  },
  {
    prop: "controlSize",
    type: '"sm" | "md" | "lg"',
    defaultValue: '"md"',
    description: "Input height and typography scale.",
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
    description: "Hidden input name for native form submission.",
  },
];
