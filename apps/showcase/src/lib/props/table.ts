import type { PropRow } from "@/components/props-table";

export const tableProps: PropRow[] = [
  {
    prop: "Table — density",
    type: '"compact" | "default" | "comfortable"',
    defaultValue: '"default"',
    description: "Row height and padding scale for the whole table.",
  },
  {
    prop: "Table — containerClassName",
    type: "string",
    defaultValue: "—",
    description:
      "Styles the scroll container that keeps wide tables from breaking the page.",
  },
  {
    prop: "TableHead / TableCell — align",
    type: '"start" | "center" | "end"',
    defaultValue: '"start"',
    description: "Column alignment; use end for numeric columns.",
  },
  {
    prop: "TableRow — tone",
    type: '"default" | "muted"',
    defaultValue: '"default"',
    description: "Muted background for secondary rows.",
  },
  {
    prop: "TableRow — selected / hoverable",
    type: "boolean",
    defaultValue: "—",
    description: "Selected background and hover treatment via data attributes.",
  },
  {
    prop: "TableCaption — placement",
    type: '"top" | "bottom"',
    defaultValue: '"bottom"',
    description: "Where the caption renders; it names the table either way.",
  },
  {
    prop: "Anatomy",
    type: "Header | Body | Footer | Row | Head | Cell | Caption",
    defaultValue: "—",
    description:
      "Real table elements underneath — semantics, keyboard behavior, and screen-reader navigation are native.",
  },
];
