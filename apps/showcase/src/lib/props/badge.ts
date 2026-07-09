import type { PropRow } from "@/components/props-table";

export const badgeProps: PropRow[] = [
  {
    prop: "variant",
    type: '"solid" | "soft" | "outline" | "subtle"',
    defaultValue: '"soft"',
    description: "Visual weight of the badge.",
  },
  {
    prop: "tone",
    type: '"neutral" | "primary" | "success" | "warning" | "destructive" | "info"',
    defaultValue: '"neutral"',
    description: "Semantic color tone resolved through design tokens.",
  },
  {
    prop: "size",
    type: '"xs" | "sm" | "md" | "lg"',
    defaultValue: '"md"',
    description: "Badge height, padding, gap, and text size.",
  },
  {
    prop: "icon",
    type: "ReactNode",
    description:
      "Decorative icon placed according to iconPlacement unless explicit leading or trailing icons are set.",
  },
  {
    prop: "iconPlacement",
    type: '"leading" | "trailing"',
    defaultValue: '"leading"',
    description: "Position for the icon prop.",
  },
  {
    prop: "leadingIcon",
    type: "ReactNode",
    description: "Decorative icon rendered before the badge label.",
  },
  {
    prop: "trailingIcon",
    type: "ReactNode",
    description: "Decorative icon rendered after the badge label.",
  },
  {
    prop: "children",
    type: "ReactNode",
    description: "Visible badge label. Keep it short enough for dense rows.",
  },
];
