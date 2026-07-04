import type { PropRow } from "@/components/props-table";

export const iconButtonProps: PropRow[] = [
  {
    prop: "aria-label / aria-labelledby",
    type: "string (one required)",
    defaultValue: "—",
    description:
      "The accessible name is required by the type system — an icon-only button without one will not compile.",
  },
  {
    prop: "variant",
    type: '"solid" | "soft" | "outline" | "ghost" | "destructive"',
    defaultValue: '"solid"',
    description: "Visual treatment matching the Button variants.",
  },
  {
    prop: "size",
    type: '"xs" | "sm" | "md" | "lg" | "xl"',
    defaultValue: '"md"',
    description: "Square control size; the icon scales with it.",
  },
  {
    prop: "shape",
    type: '"square" | "circle"',
    defaultValue: '"square"',
    description: "Corner treatment.",
  },
  {
    prop: "loading",
    type: "boolean",
    defaultValue: "false",
    description: "Spinner replaces the icon; the button becomes inert.",
  },
  {
    prop: "…native button props",
    type: "ButtonHTMLAttributes",
    defaultValue: "—",
    description: "Renders a real button: onClick, disabled, aria-pressed, type.",
  },
];
