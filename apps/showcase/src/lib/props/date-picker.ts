import type { PropRow } from "@/components/props-table";

export const datePickerProps: PropRow[] = [
  {
    prop: "value",
    type: "DatePickerValue | null",
    defaultValue: "—",
    description:
      "Controlled selected date — a CalendarDate from @internationalized/date.",
  },
  {
    prop: "defaultValue",
    type: "DatePickerValue | null",
    defaultValue: "—",
    description: "Initial selection for uncontrolled usage.",
  },
  {
    prop: "onValueChange",
    type: "(value: DatePickerValue | null) => void",
    defaultValue: "—",
    description: "Fires when the selection changes or is cleared.",
  },
  {
    prop: "label",
    type: "ReactNode",
    defaultValue: "—",
    description: "Field label rendered above the segmented input.",
  },
  {
    prop: "description",
    type: "ReactNode",
    defaultValue: "—",
    description: "Muted helper text below the field.",
  },
  {
    prop: "errorMessage",
    type: "ReactNode",
    defaultValue: "—",
    description: "Validation message shown when the field is invalid.",
  },
  {
    prop: "name",
    type: "string",
    defaultValue: "—",
    description:
      "Name of the hidden input submitted with the serialized ISO date.",
  },
  {
    prop: "required / disabled / readOnly / invalid",
    type: "boolean",
    defaultValue: "false",
    description: "Standard form field states.",
  },
  {
    prop: "clearable",
    type: "boolean",
    defaultValue: "false",
    description: "Shows a clear button when a date is selected.",
  },
  {
    prop: "minValue / maxValue",
    type: "DateValue",
    defaultValue: "—",
    description: "Inclusive selection bounds enforced in field and calendar.",
  },
  {
    prop: "isDateUnavailable",
    type: "(date: DateValue) => boolean",
    defaultValue: "—",
    description: "Marks individual dates unavailable in the popover calendar.",
  },
  {
    prop: "locale",
    type: "string",
    defaultValue: "runtime locale",
    description: "BCP 47 tag controlling segment order and formatting.",
  },
  {
    prop: "weekStartsOn",
    type: '"sun" | "mon" | … | "sat"',
    defaultValue: "locale default",
    description: "First day of the week in the popover calendar.",
  },
];
