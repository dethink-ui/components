import type { PropRow } from "@/components/props-table";

export const numberInputProps: PropRow[] = [
  {
    prop: "numberMode",
    type: '"decimal" | "numeric"',
    defaultValue: '"decimal"',
    description:
      "Sets inputMode so mobile keyboards show the right keypad — decimals or digits only.",
  },
  {
    prop: "type",
    type: '"text" | "number"',
    defaultValue: '"text"',
    description:
      'Use "number" for native min/max/step semantics and arrow-key stepping; "text" keeps free-form entry with a numeric keypad.',
  },
  {
    prop: "controlSize",
    type: '"sm" | "md" | "lg"',
    defaultValue: '"md"',
    description: "Height and typography scale aligned with Input.",
  },
  {
    prop: "invalid",
    type: "boolean",
    defaultValue: "false",
    description:
      "Shows an error style and marks the field as invalid for screen readers.",
  },
  {
    prop: "…native input props",
    type: "InputHTMLAttributes",
    defaultValue: "—",
    description:
      "Renders a real input: min, max, step, name, disabled, and form behavior are native.",
  },
];
