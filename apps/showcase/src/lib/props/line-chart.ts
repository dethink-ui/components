import type { PropRow } from "@/components/props-table";

export const lineChartProps: PropRow[] = [
  {
    prop: "data",
    type: "Array<Record<string, unknown>>",
    defaultValue: "—",
    description:
      "One record per x position, in order. Non-numeric values leave a gap.",
  },
  {
    prop: "index",
    type: "string",
    defaultValue: "—",
    description: 'Record key holding the x value, such as "month".',
  },
  {
    prop: "series",
    type: "Array<{ key, label, color? }>",
    defaultValue: "—",
    description:
      "Lines on one y-axis. color is a palette slot or CSS color; it defaults to the slot for the series' position, so filtering never repaints survivors.",
  },
  {
    prop: "curve",
    type: '"monotone" | "linear" | "step"',
    defaultValue: '"monotone"',
    description: "Monotone never overshoots the data.",
  },
  {
    prop: "height",
    type: "number | string",
    defaultValue: "288",
    description: "Plot height. Width always fills the container.",
  },
  {
    prop: "yDomain / includeZero",
    type: "[number, number] / boolean",
    defaultValue: "— / true",
    description:
      "Fix the value domain, or let the niced data extent drop zero.",
  },
  {
    prop: "formatValue / formatOptions",
    type: "(value) => string / Intl.NumberFormatOptions & { locale? }",
    defaultValue: "Compact en-US",
    description: "Formats axis ticks, tooltip, readout and table values.",
  },
  {
    prop: "formatIndex / indexLabel",
    type: "(value, index) => string / string",
    defaultValue: "String(value) / index",
    description: "Labels x values and names the table's first column.",
  },
  {
    prop: "legend",
    type: "boolean",
    defaultValue: "series.length >= 2",
    description:
      "Toggle buttons that show or hide series; hovering one dims the others.",
  },
  {
    prop: "hiddenSeries / defaultHiddenSeries / onHiddenSeriesChange",
    type: "string[] / string[] / (hidden) => void",
    defaultValue: "— / [] / —",
    description:
      "Controlled or uncontrolled series filtering. The last visible series cannot be hidden.",
  },
  {
    prop: "showTable / defaultShowTable / onShowTableChange",
    type: "boolean / boolean / (show) => void",
    defaultValue: "— / false / —",
    description:
      "Swap the plot for a visible data table. The table is always present for assistive technology.",
  },
  {
    prop: "tableToggle",
    type: "boolean",
    defaultValue: "true",
    description: "Render the Table view toggle button.",
  },
  {
    prop: "loading / loadingLabel / emptyLabel",
    type: "boolean / ReactNode / ReactNode",
    defaultValue: 'false / "Loading…" / "No data"',
    description: "Refetches keep the previous render at reduced opacity.",
  },
  {
    prop: "animate",
    type: "boolean",
    defaultValue: "true",
    description: "Draw-in on mount. Always off under reduced motion.",
  },
];
