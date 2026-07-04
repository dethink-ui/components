import type { PropRow } from "@/components/props-table";

export const calendarProps: PropRow[] = [
  {
    prop: "value",
    type: "DateValue | null",
    defaultValue: "—",
    description:
      "Controlled selected date, built with @internationalized/date (for RangeCalendar: { start, end }).",
  },
  {
    prop: "defaultValue",
    type: "DateValue | null",
    defaultValue: "—",
    description: "Initial selection for uncontrolled usage.",
  },
  {
    prop: "onValueChange",
    type: "(value) => void",
    defaultValue: "—",
    description:
      "Fires with the new date (or range) whenever the selection changes.",
  },
  {
    prop: "minValue / maxValue",
    type: "DateValue",
    defaultValue: "—",
    description: "Inclusive bounds; dates outside them cannot be selected.",
  },
  {
    prop: "isDateUnavailable",
    type: "(date: DateValue) => boolean",
    defaultValue: "—",
    description:
      "Marks individual dates unavailable — rendered struck through and unselectable.",
  },
  {
    prop: "disabled",
    type: "boolean",
    defaultValue: "false",
    description: "Disables the whole calendar.",
  },
  {
    prop: "invalid",
    type: "boolean",
    defaultValue: "false",
    description: "Marks the current selection invalid for form validation.",
  },
  {
    prop: "isReadOnly",
    type: "boolean",
    defaultValue: "false",
    description:
      "Selection is visible and focusable but cannot change (react-aria passthrough).",
  },
  {
    prop: "locale",
    type: "string",
    defaultValue: "runtime locale",
    description:
      'BCP 47 tag (for example "de-DE") controlling month/weekday formatting.',
  },
  {
    prop: "weekStartsOn",
    type: '"sun" | "mon" | … | "sat"',
    defaultValue: "locale default",
    description: "First day of the week, overriding the locale.",
  },
  {
    prop: "weekdayStyle",
    type: '"narrow" | "short" | "long"',
    defaultValue: '"short"',
    description: "Weekday header format.",
  },
];
