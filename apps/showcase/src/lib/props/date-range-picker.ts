import type { PropRow } from "@/components/props-table";

export const dateRangePickerProps: PropRow[] = [
  {
    prop: "value",
    type: "DateRangePickerValue | null",
    defaultValue: "—",
    description:
      "Controlled range — { start, end } CalendarDates from @internationalized/date.",
  },
  {
    prop: "defaultValue",
    type: "DateRangePickerValue | null",
    defaultValue: "—",
    description: "Initial range for uncontrolled usage.",
  },
  {
    prop: "onValueChange",
    type: "(value: DateRangePickerValue | null) => void",
    defaultValue: "—",
    description: "Fires when the range changes or is cleared.",
  },
  {
    prop: "label / description / errorMessage",
    type: "ReactNode",
    defaultValue: "—",
    description: "The field label, help text, and error message.",
  },
  {
    prop: "name",
    type: "string",
    defaultValue: "—",
    description:
      'Base name for the hidden inputs — submits as "<name>Start" and "<name>End".',
  },
  {
    prop: "startName / endName",
    type: "string",
    defaultValue: "—",
    description:
      "Explicit hidden input names for the start and end dates; override the base name.",
  },
  {
    prop: "required / disabled / readOnly / invalid",
    type: "boolean",
    defaultValue: "false",
    description: "Makes the field required, disabled, read-only, or invalid.",
  },
  {
    prop: "clearable",
    type: "boolean",
    defaultValue: "false",
    description: "Shows a clear button when a range is selected.",
  },
  {
    prop: "minValue / maxValue",
    type: "DateValue",
    defaultValue: "—",
    description: "Inclusive bounds enforced across both ends of the range.",
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
