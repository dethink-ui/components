import type { PropRow } from "@/components/props-table";

export const textareaProps: PropRow[] = [
  {
    prop: "controlSize",
    type: '"sm" | "md" | "lg"',
    defaultValue: '"md"',
    description: "Sets the padding and text size to match Input.",
  },
  {
    prop: "invalid",
    type: "boolean",
    defaultValue: "false",
    description:
      "Shows an error style and marks the field as invalid for screen readers.",
  },
  {
    prop: "resize",
    type: '"none" | "vertical" | "horizontal" | "both"',
    defaultValue: '"vertical"',
    description:
      "Sets whether users can resize the field vertically, horizontally, both, or neither.",
  },
  {
    prop: "…native textarea props",
    type: "TextareaHTMLAttributes",
    defaultValue: "—",
    description:
      "Renders a real <textarea>: rows, name, disabled, readOnly, required, maxLength, and form behavior are native.",
  },
];
