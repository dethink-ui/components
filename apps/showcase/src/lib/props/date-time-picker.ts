import type { PropRow } from "@/components/props-table";

export const dateTimePickerProps: PropRow[] = [
  {
    prop: "value",
    type: "DateTimePickerValue | null",
    defaultValue: "—",
    description:
      "Controlled value — a CalendarDateTime or ZonedDateTime from @internationalized/date.",
  },
  {
    prop: "defaultValue",
    type: "DateTimePickerValue | null",
    defaultValue: "—",
    description: "Initial value for uncontrolled usage.",
  },
  {
    prop: "onValueChange",
    type: "(value: DateTimePickerValue | null) => void",
    defaultValue: "—",
    description: "Fires when the value changes or is cleared.",
  },
  {
    prop: "granularity",
    type: '"hour" | "minute" | "second"',
    defaultValue: '"minute"',
    description: "Smallest time segment shown in the field.",
  },
  {
    prop: "hourCycle",
    type: "12 | 24",
    defaultValue: "locale default",
    description: "Forces 12-hour or 24-hour time display.",
  },
  {
    prop: "timeZone",
    type: "string",
    defaultValue: "—",
    description:
      "IANA zone used for display; ZonedDateTime values carry their own zone.",
  },
  {
    prop: "hideTimeZone",
    type: "boolean",
    defaultValue: "false",
    description: "Hides the time-zone segment for zoned values.",
  },
  {
    prop: "presets",
    type: "DateTimePickerPreset[]",
    defaultValue: "[]",
    description:
      "Quick-pick options ({ label, value }) rendered inside the popover.",
  },
  {
    prop: "timeSelector",
    type: "boolean",
    defaultValue: "false",
    description:
      "Replaces free-form time entry with a dropdown grid of time options.",
  },
  {
    prop: "timeStep",
    type: "5 | 10 | 15 | 30 | 60",
    defaultValue: "30",
    description: "Minute interval used to generate time-selector options.",
  },
  {
    prop: "timeOptions",
    type: "DateTimePickerTimeOption[]",
    defaultValue: "—",
    description:
      "Explicit time options ({ hour, minute, second, label }) overriding the generated grid.",
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
      "Name of the hidden input submitted with the serialized ISO value.",
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
    description: "Shows a clear button when a value is set.",
  },
  {
    prop: "minValue / maxValue",
    type: "DateValue",
    defaultValue: "—",
    description:
      "Inclusive bounds enforced in the field, calendar, and time selector.",
  },
  {
    prop: "isDateUnavailable",
    type: "(date: DateValue) => boolean",
    defaultValue: "—",
    description: "Marks individual dates unavailable in the popover calendar.",
  },
  {
    prop: "locale / weekStartsOn",
    type: "string / weekday",
    defaultValue: "runtime locale",
    description:
      "Formatting locale and first day of the week in the popover calendar.",
  },
];
