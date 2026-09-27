import type { PropRow } from "@/components/props-table";

export const statTileProps: PropRow[] = [
  {
    prop: "label",
    type: "ReactNode",
    defaultValue: "—",
    description:
      "Sentence-case metric name without a trailing colon. Names the tile's group.",
  },
  {
    prop: "value",
    type: "number | string | null",
    defaultValue: "—",
    description:
      "Numbers format compactly (1,284 · 12.9K · $4.2M); strings render as given; null shows a dash.",
  },
  {
    prop: "formatValue / formatOptions",
    type: "(value) => string / Intl.NumberFormatOptions & { locale }",
    defaultValue: "compact",
    description:
      "Replace the formatter, or tune it with currency, percent and locale options.",
  },
  {
    prop: "delta",
    type: "number | DeltaBadgeProps",
    defaultValue: "—",
    description:
      "A signed change, or full DeltaBadge props such as positiveDirection.",
  },
  {
    prop: "comparison",
    type: "string",
    defaultValue: "—",
    description:
      'Shown beside the delta and included in its announcement, e.g. "vs last month".',
  },
  {
    prop: "trend / trendColor / trendVariant",
    type: 'ChartValue[] / ChartColor / "line" | "area" | "bar"',
    defaultValue: '— / "chart-1" / "area"',
    description: "Recent values drawn as a Sparkline.",
  },
  {
    prop: "trendPlacement",
    type: '"bottom" | "end"',
    defaultValue: '"bottom"',
    description: "Full-width under the value, or compact beside it.",
  },
  {
    prop: "trendLabel",
    type: "string",
    defaultValue: '"{label} trend"',
    description: "Accessible name for the trend when the label is not text.",
  },
  {
    prop: "icon / caption",
    type: "ReactNode",
    defaultValue: "—",
    description:
      "Decorative icon beside the label; supporting text under the value.",
  },
  {
    prop: "loading",
    type: "boolean",
    defaultValue: "false",
    description:
      "Keeps the layout and swaps content for skeletons; sets aria-busy.",
  },
  {
    prop: "href / target / rel",
    type: "string",
    defaultValue: "—",
    description:
      "Render the tile as a link. New-tab links get noopener noreferrer.",
  },
  {
    prop: "interactive",
    type: "boolean",
    defaultValue: "false",
    description:
      "Hover and focus styling when you wrap the tile in your own router link.",
  },
  {
    prop: "size",
    type: '"sm" | "md" | "lg"',
    defaultValue: '"md"',
    description: "Scales the value and trend height.",
  },
];

export const kpiGroupProps: PropRow[] = [
  {
    prop: "variant",
    type: '"separate" | "joined"',
    defaultValue: '"separate"',
    description:
      "Separate cards with a gap, or one framed panel with hairline dividers.",
  },
  {
    prop: "minTileWidth",
    type: "string",
    defaultValue: '"13rem"',
    description:
      "Narrowest tile width before the row wraps. Tiles stretch to fill each row.",
  },
  {
    prop: "aria-label / aria-labelledby",
    type: "string",
    defaultValue: "—",
    description: "When present, the row becomes a named group.",
  },
];
