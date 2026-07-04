import type { PropRow } from "@/components/props-table";

export const asyncSelectProps: PropRow[] = [
  {
    prop: "selectionMode",
    type: '"single" | "multiple"',
    defaultValue: '"single"',
    description: "Whether the component renders Combobox or MultiSelect behavior.",
  },
  {
    prop: "value / defaultValue / onValueChange",
    type: "string | null | string[]",
    defaultValue: "—",
    description: "Controlled or uncontrolled selected value shape.",
  },
  {
    prop: "inputValue / defaultInputValue / onInputValueChange",
    type: "string / string / (text) => void",
    defaultValue: '""',
    description:
      "App-owned query state. AsyncSelect never fetches; your app owns the server call.",
  },
  {
    prop: "items / selectedItems",
    type: "Iterable<AsyncSelectItemData>",
    defaultValue: "—",
    description:
      "Current result window and optional selected item data for stable labels.",
  },
  {
    prop: "loading / error / onRetry",
    type: "boolean / ReactNode / () => void",
    defaultValue: "false / — / —",
    description: "Explicit async status flags and retry action.",
  },
  {
    prop: "emptyMessage / loadingMessage / minQueryMessage",
    type: "ReactNode",
    defaultValue: "built-in copy",
    description: "Messages rendered in the status region.",
  },
  {
    prop: "minQueryLength",
    type: "number",
    defaultValue: "0",
    description: "Minimum query length before results should be shown.",
  },
  {
    prop: "disabledKeys",
    type: "Iterable<string>",
    defaultValue: "—",
    description: "Result values that cannot be selected.",
  },
  {
    prop: "label / description / errorMessage",
    type: "ReactNode",
    defaultValue: "—",
    description: "Field label, helper text, and validation message slots.",
  },
  {
    prop: "name",
    type: "string",
    defaultValue: "—",
    description:
      "Hidden input name for native forms; multiple mode submits repeated values.",
  },
];
