import type { PropRow } from "@/components/props-table";
export const sliderProps: PropRow[] = [
  {
    prop: "value / defaultValue",
    type: "number | [number, number]",
    defaultValue: "min",
    description:
      "A scalar or an ordered two-thumb range. Use matching value shapes throughout the component lifetime.",
  },
  {
    prop: "onValueChange / onValueCommit",
    type: "(value) => void",
    defaultValue: "—",
    description:
      "Receive values during interaction or when an adjustment completes.",
  },
  {
    prop: "min / max / step",
    type: "number",
    defaultValue: "0 / 100 / 1",
    description: "Numeric bounds and increment size.",
  },
  {
    prop: "label / description",
    type: "ReactNode",
    defaultValue: "—",
    description:
      "Visible accessible label and helper text. aria-label and aria-labelledby are also supported.",
  },
  {
    prop: "name / thumbLabels",
    type: "string | [string, string] / [string, string]",
    defaultValue: "— / Minimum, Maximum",
    description:
      "Form field names and distinct accessible names for range thumbs.",
  },
  {
    prop: "size / valueDisplay",
    type: '"sm" | "md" | "lg" / "inline" | "floating" | "none"',
    defaultValue: "md / inline",
    description:
      "Visual sizing and output presentation. Floating mode retains a stable inline summary for ranges.",
  },
  {
    prop: "disabled / formatOptions",
    type: "boolean / Intl.NumberFormatOptions",
    defaultValue: "false / —",
    description:
      "Disable interaction or format numeric output and announcements.",
  },
  {
    prop: "className / classNames",
    type: "string / SliderSlots",
    defaultValue: "—",
    description:
      "Customize the root, track, fill, thumb, marks, or output with portable Tailwind classes.",
  },
];
