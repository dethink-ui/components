import type { PropRow } from "@/components/props-table";

export const breadcrumbProps: PropRow[] = [
  {
    prop: "items",
    type: "BreadcrumbItemData[]",
    defaultValue: "—",
    description:
      "Data-driven path items with key, label, href, onAction, current, disabled, and optional icon.",
  },
  {
    prop: "children",
    type: "ReactNode",
    defaultValue: "—",
    description:
      "Compound anatomy for custom router links, custom separators, and manual overflow composition.",
  },
  {
    prop: "size",
    type: '"sm" | "md" | "lg"',
    defaultValue: '"md"',
    description:
      "Density-aware text and control sizing for headers and toolbars.",
  },
  {
    prop: "separator",
    type: '"chevron" | "slash" | "dot" | "none" | ReactNode',
    defaultValue: '"chevron"',
    description:
      'Decorative separator rendered outside the accessible breadcrumb name. Pass a ReactNode such as <span>{"<>"}</span> for custom separators.',
  },
  {
    prop: "maxItems",
    type: "number",
    defaultValue: "—",
    description: "Collapses long data-driven paths into an overflow trigger.",
  },
  {
    prop: "collapseFrom",
    type: '"start" | "middle" | "end"',
    defaultValue: '"middle"',
    description: "Chooses where hidden ancestors are collapsed.",
  },
  {
    prop: "preserveRoot",
    type: "boolean",
    defaultValue: "true",
    description: "Keeps the root item visible when a path is collapsed.",
  },
  {
    prop: "preserveCurrent",
    type: "boolean",
    defaultValue: "true",
    description: "Keeps the current item visible when a path is collapsed.",
  },
  {
    prop: "overflowLabel",
    type: "string",
    defaultValue: '"Show breadcrumb path"',
    description: "Accessible label for the collapsed ancestor trigger.",
  },
  {
    prop: "…nav props",
    type: "HTMLAttributes<HTMLElement>",
    defaultValue: "—",
    description:
      "Includes aria-label and aria-labelledby for the nav landmark.",
  },
];
