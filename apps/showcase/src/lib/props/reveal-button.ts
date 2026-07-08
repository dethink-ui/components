import type { PropRow } from "@/components/props-table";

export const revealButtonProps: PropRow[] = [
  {
    prop: "icon",
    type: "ReactNode",
    defaultValue: "—",
    description:
      "Decorative icon shown in the collapsed control and replaced by the spinner while loading.",
  },
  {
    prop: "label",
    type: "string",
    defaultValue: "—",
    description:
      "Required text used for both the button's accessible name and the revealed visual label.",
  },
  {
    prop: "variant",
    type: '"solid" | "soft" | "outline" | "ghost" | "destructive"',
    defaultValue: '"ghost"',
    description: "Visual treatment matching Button and IconButton variants.",
  },
  {
    prop: "size",
    type: '"xs" | "sm" | "md" | "lg" | "xl"',
    defaultValue: '"md"',
    description:
      "Collapsed square control size; the revealed label adds logical inline space.",
  },
  {
    prop: "labelVisibility",
    type: '"hover" | "always"',
    defaultValue: '"hover"',
    description:
      "Reveals on hover and focus by default, or keeps the label visible for high-clarity contexts.",
  },
  {
    prop: "motion",
    type: '"none" | "subtle" | "standard"',
    defaultValue: '"standard"',
    description:
      "Controls reveal and press motion. none removes transform-heavy motion.",
  },
  {
    prop: "loading",
    type: "boolean",
    defaultValue: "false",
    description:
      "Spinner replaces the icon, aria-busy is set, and activation is blocked.",
  },
  {
    prop: "…native button props",
    type: "ButtonHTMLAttributes",
    defaultValue: "—",
    description:
      "Renders a real button: onClick, disabled, aria-pressed, type, form, and related props.",
  },
];
