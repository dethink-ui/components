import type { PropRow } from "@/components/props-table";

export const sparklineProps: PropRow[] = [
  {
    prop: "data",
    type: "Array<number | null | undefined>",
    defaultValue: "—",
    description: "Values in order. Missing values leave a gap in the line.",
  },
  {
    prop: "variant",
    type: '"line" | "area" | "bar"',
    defaultValue: '"line"',
    description: "Line, line with a gradient wash, or rounded bars.",
  },
  {
    prop: "color",
    type: '"chart-1" … "chart-8" | string',
    defaultValue: '"chart-1"',
    description:
      "Palette slot resolved to --dt-color-chart-N, or any CSS color.",
  },
  {
    prop: "curve",
    type: '"monotone" | "linear" | "step"',
    defaultValue: '"monotone"',
    description: "Monotone smoothing never overshoots the data.",
  },
  {
    prop: "markers",
    type: 'boolean | Array<"first" | "last" | "min" | "max">',
    defaultValue: '["last"]',
    description:
      "Point markers for line and area. true shows min, max and last.",
  },
  {
    prop: "emphasis",
    type: '"last" | "none"',
    defaultValue: '"last"',
    description: "Bar variant: mute every bar except the latest period.",
  },
  {
    prop: "domain",
    type: "[number, number]",
    defaultValue: "Data extent",
    description:
      "Fixed value range, for comparing sparklines on a shared scale. Bars always include zero.",
  },
  {
    prop: "label / formatValue",
    type: "string / (value: number) => string",
    defaultValue: '"Trend" / compact',
    description:
      "Start of the accessible summary and how its values are written.",
  },
  {
    prop: "decorative",
    type: "boolean",
    defaultValue: "false",
    description:
      "Hide from assistive technology when nearby text already carries the data.",
  },
  {
    prop: "animate",
    type: "boolean",
    defaultValue: "true",
    description: "Draw-in on mount. Always off under reduced motion.",
  },
];
