import type { PropRow } from "@/components/props-table";

export const boxProps: PropRow[] = [
  {
    prop: "p / px / py / pt / pb / ps / pe",
    type: "spacing token",
    defaultValue: "—",
    description: "Padding on any side, logical-property aware for RTL.",
  },
  {
    prop: "m / mx / my / mt / mb / ms / me",
    type: "spacing token",
    defaultValue: "—",
    description: "Margin on any side.",
  },
  {
    prop: "surface",
    type: '"transparent" | "background" | "muted" | "primary" | "destructive" | "success" | "warning" | "info"',
    defaultValue: '"transparent"',
    description: "Tokenized background with matching foreground.",
  },
  {
    prop: "border / radius",
    type: "border tone / radius token",
    defaultValue: '"none"',
    description: "Border color treatment and corner radius.",
  },
  {
    prop: "display / gap / overflow",
    type: "display value / spacing / overflow value",
    defaultValue: "—",
    description: "Layout behavior of the box itself.",
  },
  {
    prop: "as / asChild",
    type: "element / boolean",
    defaultValue: '"div" / false',
    description: "Semantic element, or merge styles onto the child.",
  },
];

export const containerProps: PropRow[] = [
  {
    prop: "size",
    type: '"sm" | "md" | "lg" | "xl" | "2xl" | "full"',
    defaultValue: '"xl"',
    description: "Max content width.",
  },
  {
    prop: "gutter",
    type: '"none" | "sm" | "md" | "lg" | "xl"',
    defaultValue: '"md"',
    description: "Horizontal padding inside the viewport.",
  },
  {
    prop: "align / as / asChild",
    type: "start–end / element / boolean",
    defaultValue: "center",
    description: "Horizontal placement, semantic element, or child merging.",
  },
];

export const stackProps: PropRow[] = [
  {
    prop: "direction",
    type: '"vertical" | "horizontal"',
    defaultValue: '"vertical"',
    description: "Flow axis.",
  },
  {
    prop: "gap",
    type: '"none" | "1"–"12"',
    defaultValue: '"4"',
    description: "Tokenized spacing between children.",
  },
  {
    prop: "align / justify / wrap",
    type: "alignment values",
    defaultValue: "stretch / start / nowrap",
    description: "Cross-axis alignment, main-axis distribution, wrapping.",
  },
  {
    prop: "as / asChild",
    type: "element / boolean",
    defaultValue: '"div" / false',
    description: "Semantic element or child merging.",
  },
];

export const flexProps: PropRow[] = [
  {
    prop: "direction / wrap / gap",
    type: "row|column / nowrap|wrap / spacing",
    defaultValue: "row / nowrap / none",
    description: "Core flexbox axis configuration.",
  },
  {
    prop: "align / justify / content",
    type: "flex alignment values",
    defaultValue: "stretch / start",
    description: "Item and content alignment.",
  },
  {
    prop: "FlexItem — grow / shrink / basis",
    type: '"0" | "1" / "0" | "1" / size',
    defaultValue: "0 / 1 / auto",
    description: "Per-item flex behavior without arbitrary classes.",
  },
];

export const gridProps: PropRow[] = [
  {
    prop: "columns / rows",
    type: '"1"–"12" (+ responsive) / "1"–"6"',
    defaultValue: "—",
    description: "Track counts.",
  },
  {
    prop: "gap",
    type: '"none" | "1"–"12"',
    defaultValue: '"none"',
    description: "Tokenized gap for both axes.",
  },
  {
    prop: "GridItem — colSpan / rowSpan",
    type: '"1"–"6" | "full"',
    defaultValue: '"1"',
    description: "Span control per cell.",
  },
  {
    prop: "align / justify / content",
    type: "grid alignment values",
    defaultValue: "stretch",
    description: "Item and content alignment.",
  },
];

export const separatorProps: PropRow[] = [
  {
    prop: "orientation",
    type: '"horizontal" | "vertical"',
    defaultValue: '"horizontal"',
    description: "Axis of the rule.",
  },
  {
    prop: "tone / thickness",
    type: '"default" | "muted" | "strong" / "1" | "2"',
    defaultValue: '"default" / "1"',
    description: "Visual weight.",
  },
  {
    prop: "spacing",
    type: '"none" | "1"–"8"',
    defaultValue: '"none"',
    description: "Margin along the perpendicular axis.",
  },
  {
    prop: "decorative",
    type: "boolean",
    defaultValue: "true",
    description:
      "Decorative rules are hidden from assistive tech; semantic ones announce as separators.",
  },
];
