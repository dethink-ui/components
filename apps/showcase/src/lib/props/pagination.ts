import type { PropRow } from "@/components/props-table";

export const paginationProps: PropRow[] = [
  {
    prop: "page",
    type: "number",
    defaultValue: "—",
    description:
      "Current one-based page. Values are clamped to the known pageCount when pageCount is supplied.",
  },
  {
    prop: "pageCount",
    type: "number",
    defaultValue: "—",
    description:
      "Known total pages for bounded pagination. Omit for cursor-style or unknown-total lists.",
  },
  {
    prop: "hasNextPage",
    type: "boolean",
    defaultValue: "false",
    description:
      "Enables next-page controls in unbounded mode without inventing a final page.",
  },
  {
    prop: "onPageChange",
    type: "(page: number) => void",
    defaultValue: "—",
    description:
      "Callback mode for client-owned state updates. Generated controls render as buttons.",
  },
  {
    prop: "hrefForPage",
    type: "(page: number) => string | undefined",
    defaultValue: "—",
    description:
      "Link mode for route-backed pagination. Targets without URLs fall back to onPageChange or render disabled.",
  },
  {
    prop: "compact",
    type: "boolean",
    defaultValue: "false",
    description:
      "Reduces page-window density for cards, mobile layouts, and table footers.",
  },
  {
    prop: "showFirstLast / hideDisabledControls",
    type: "boolean",
    defaultValue: "false / false",
    description:
      "Adds first/last controls and chooses whether impossible boundary controls are disabled or hidden.",
  },
  {
    prop: "siblingCount / boundaryCount",
    type: "number",
    defaultValue: "1 / 1",
    description:
      "Controls how many pages render around the current page and at the known page boundaries.",
  },
  {
    prop: "size",
    type: '"sm" | "md" | "lg"',
    defaultValue: '"md"',
    description: "Tokenized control size for dense tables, default pages, or larger touch targets.",
  },
  {
    prop: "status",
    type: "ReactNode | false",
    defaultValue: "generated",
    description:
      "Visible page summary. Pass false when the surrounding UI already provides the status text.",
  },
  {
    prop: "labels",
    type: "PaginationLabels",
    defaultValue: "built-in English labels",
    description:
      "Custom accessible labels for the nav landmark, page controls, boundary controls, ellipses, status, and narrow Back/Next text.",
  },
  {
    prop: "children",
    type: "ReactNode",
    defaultValue: "—",
    description:
      "Compound anatomy escape hatch when consumers need full manual composition.",
  },
];
