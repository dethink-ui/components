import type { PropRow } from "@/components/props-table";

export const linkProps: PropRow[] = [
  {
    prop: "href",
    type: "string",
    defaultValue: "—",
    description: "Required unless asChild delegates it to the child element.",
  },
  {
    prop: "variant",
    type: '"default" | "muted" | "nav" | "destructive"',
    defaultValue: '"default"',
    description: "Color treatment; nav is quiet until hover for menus.",
  },
  {
    prop: "underline",
    type: '"hover" | "always" | "none"',
    defaultValue: '"hover"',
    description: "Underline behavior.",
  },
  {
    prop: "asChild",
    type: "boolean",
    defaultValue: "false",
    description:
      "Merge styling onto the single child — the seam for framework router links.",
  },
  {
    prop: "…native anchor props",
    type: "AnchorHTMLAttributes",
    defaultValue: "—",
    description: "target, rel, download, aria-current, and the rest.",
  },
];
