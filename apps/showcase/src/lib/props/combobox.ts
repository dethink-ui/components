import type { PropRow } from "@/components/props-table";

export const comboboxProps: PropRow[] = [
  {
    prop: "popupContent",
    type: "ReactNode",
    defaultValue: "—",
    description:
      "Optional async feedback rendered inside the popup beside the result list.",
  },
  {
    prop: "value",
    type: "string | null",
    defaultValue: "—",
    description:
      "The selected value. Use with onValueChange when your app manages the selection.",
  },
  {
    prop: "defaultValue",
    type: "string | null",
    defaultValue: "—",
    description:
      "The starting selection when the component manages its own state.",
  },
  {
    prop: "onValueChange",
    type: "(value: string | null) => void",
    defaultValue: "—",
    description:
      "Called with the selected value, or null when the selection is cleared.",
  },
  {
    prop: "inputValue / defaultInputValue / onInputValueChange",
    type: "string / string / (text) => void",
    defaultValue: "—",
    description:
      "Use inputValue with onInputValueChange to manage the search text, or defaultInputValue to set its starting text.",
  },
  {
    prop: "children",
    type: "ComboboxItem nodes | (item) => ComboboxItem",
    defaultValue: "—",
    description:
      "Add ComboboxItem elements, or a function that renders each entry in items.",
  },
  {
    prop: "items / defaultItems",
    type: "Iterable<ComboboxItemData>",
    defaultValue: "—",
    description:
      "The available options. Use defaultItems for built-in filtering, or items when your app filters the list.",
  },
  {
    prop: "menuTrigger",
    type: '"input" | "focus" | "manual"',
    defaultValue: '"input"',
    description:
      "Sets when the list opens: on typing, on focus, or only from the button.",
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
      "Chooses whether the form submits the selected option value or the typed text.",
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
    description: "Input placeholder before any text is typed.",
  },
  {
    prop: "controlSize",
    type: '"sm" | "md" | "lg"',
    defaultValue: '"md"',
    description: "Sets the input height and text size.",
  },
  {
    prop: "required / disabled / readOnly / invalid",
    type: "boolean",
    defaultValue: "false",
    description: "Makes the field required, disabled, read-only, or invalid.",
  },
  {
    prop: "name",
    type: "string",
    defaultValue: "—",
    description: "The field name used when submitting a form.",
  },
];
