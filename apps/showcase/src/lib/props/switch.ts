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
    description: "Fires with the next state on user toggle.",
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
    description: "Invalid styling plus aria-invalid.",
  },
  {
    prop: "…native input props",
    type: "InputHTMLAttributes",
    defaultValue: "—",
    description:
      "Renders a real checkbox input with a switch role: name, value, disabled, and form behavior are native.",
  },
];
