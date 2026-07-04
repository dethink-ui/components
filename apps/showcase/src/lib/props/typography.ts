import type { PropRow } from "@/components/props-table";

export const typographyProps: PropRow[] = [
  {
    prop: "Heading — level",
    type: "1–6",
    defaultValue: "2",
    description: "Semantic heading element in the document outline.",
  },
  {
    prop: "Heading — visualLevel",
    type: "1–6",
    defaultValue: "level",
    description:
      "Visual size independent of semantics — keep the outline correct while styling freely.",
  },
  {
    prop: "Text — as",
    type: '"p" | "span" | "div" | "small" | "label" | "strong" | "em"',
    defaultValue: '"p"',
    description: "Element the text renders as (label supports htmlFor).",
  },
  {
    prop: "Text — size",
    type: '"xs" | "sm" | "md" | "lg" | "xl"',
    defaultValue: '"md"',
    description: "Body text scale with matched line heights.",
  },
  {
    prop: "tone",
    type: '"default" | "muted" | "subtle" | "primary" | "success" | "warning" | "destructive"',
    defaultValue: '"default"',
    description: "Semantic color drawn from the token system.",
  },
  {
    prop: "weight / align",
    type: "regular–bold / start–end/justify",
    defaultValue: "regular / inherit",
    description: "Font weight and text alignment.",
  },
  {
    prop: "truncate / lineClamp",
    type: "boolean / 1–6",
    defaultValue: "—",
    description: "Single-line ellipsis or multi-line clamping.",
  },
  {
    prop: "Typography — variant",
    type: '"display" | "heading" | "title" | "subtitle" | "body" | "caption" | "label"',
    defaultValue: '"body"',
    description:
      "Preset text styles on a polymorphic element for one-off needs outside Heading/Text.",
  },
];
