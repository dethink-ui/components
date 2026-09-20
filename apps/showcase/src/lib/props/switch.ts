import type { PropRow } from "@/components/props-table";

export const switchProps: PropRow[] = [
  {
    prop: "checked / defaultChecked",
    type: "boolean",
    defaultValue: "false",
    description: "Controlled or uncontrolled on/off state.",
  },
  {
    prop: "onCheckedChange",
    type: "(checked: boolean) => void",
    defaultValue: "—",
    description: "Called with the new state when the user toggles the control.",
  },
  {
    prop: "controlSize",
    type: '"sm" | "md" | "lg"',
    defaultValue: '"md"',
    description: "Track and thumb dimensions.",
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
      "Renders a real checkbox input with a switch role: name, value, disabled, and form behavior are native.",
  },
];
