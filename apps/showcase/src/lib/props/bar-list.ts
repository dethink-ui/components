import type { PropRow } from "@/components/props-table";

export const barListProps: PropRow[] = [
  {
    prop: "data",
    type: "Array<{ key?, label, value, href?, icon?, color? }>",
    defaultValue: "—",
    description:
      "Rows to rank. href makes a row a link; color overrides the bar for that row.",
  },
  {
    prop: "sort",
    type: '"descending" | "ascending" | "none"',
    defaultValue: '"descending"',
    description: "Ties always keep their input order.",
  },
  {
    prop: "limit",
    type: "number",
    defaultValue: "—",
    description: "Rows shown before a Show more toggle.",
  },
  {
    prop: "expanded / defaultExpanded / onExpandedChange",
    type: "boolean / boolean / (expanded) => void",
    defaultValue: "— / false / —",
    description: "Controlled or uncontrolled expansion of limited lists.",
  },
  {
    prop: "color",
    type: '"chart-1" … "chart-8" | string',
    defaultValue: '"chart-1"',
    description: "One color for every bar. A single series stays one color.",
  },
  {
    prop: "max",
    type: "number",
    defaultValue: "Largest value",
    description:
      "Value that fills the track, for shares (1) or comparing lists on one scale.",
  },
  {
    prop: "formatValue / formatOptions",
    type: "(value) => string / Intl.NumberFormatOptions & { locale }",
    defaultValue: "compact",
    description: "Replace or tune the value formatter.",
  },
  {
    prop: "labelHeader / valueHeader",
    type: "ReactNode",
    defaultValue: "—",
    description: 'Column headings, such as "Page" and "Visitors".',
  },
  {
    prop: "onItemClick",
    type: "(item, index) => void",
    defaultValue: "—",
    description:
      "Turns rows without an href into buttons, for drill-down or filtering.",
  },
  {
    prop: "emptyLabel / showMoreLabel / showLessLabel",
    type: "ReactNode / (hidden) => ReactNode / ReactNode",
    defaultValue: '"No data" / "Show N more" / "Show less"',
    description: "Localize the empty state and toggle text.",
  },
  {
    prop: "size",
    type: '"sm" | "md"',
    defaultValue: '"md"',
    description: "Row and bar height. Bars never exceed 24px.",
  },
  {
    prop: "animate",
    type: "boolean",
    defaultValue: "true",
    description:
      "Bars grow from the start edge. Always off under reduced motion.",
  },
];
