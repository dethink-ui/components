import type { PropRow } from "@/components/props-table";

export const textareaProps: PropRow[] = [
  {
    prop: "controlSize",
    type: '"sm" | "md" | "lg"',
    defaultValue: '"md"',
    description: "Padding and typography scale aligned with Input.",
  },
  {
    prop: "invalid",
    type: "boolean",
    defaultValue: "false",
    description: "Invalid styling plus aria-invalid.",
  },
  {
    prop: "resize",
    type: '"none" | "vertical" | "horizontal" | "both"',
    defaultValue: '"vertical"',
    description: "Which axes the user can drag-resize.",
  },
  {
    prop: "…native textarea props",
    type: "TextareaHTMLAttributes",
    defaultValue: "—",
    description:
      "Renders a real <textarea>: rows, name, disabled, readOnly, required, maxLength, and form behavior are native.",
  },
];
