import type { PropRow } from "@/components/props-table";

export const deltaBadgeProps: PropRow[] = [
  {
    prop: "value",
    type: "number | null",
    defaultValue: "—",
    description:
      "Signed change. The default formatter treats it as percentage points: 12.4 → +12.4%.",
  },
  {
    prop: "positiveDirection",
    type: '"up" | "down"',
    defaultValue: '"up"',
    description:
      "Which direction is good. Use down for churn, latency, cost and errors.",
  },
  {
    prop: "neutralThreshold",
    type: "number",
    defaultValue: "0",
    description: "Changes at or below this magnitude read as flat and neutral.",
  },
  {
    prop: "formatValue",
    type: "(magnitude: number) => string",
    defaultValue: "percent",
    description:
      "Formats the absolute change. The sign, icon and direction word are added for you.",
  },
  {
    prop: "comparison",
    type: "string",
    defaultValue: "—",
    description:
      'Appended to the screen-reader sentence, e.g. "Up 12.4% vs last month".',
  },
  {
    prop: "variant",
    type: '"soft" | "outline" | "plain"',
    defaultValue: '"soft"',
    description:
      "Tinted badge, outlined badge, or inline text with a colored icon.",
  },
  {
    prop: "size",
    type: '"xs" | "sm" | "md"',
    defaultValue: '"sm"',
    description: "Matches Badge sizing.",
  },
];
