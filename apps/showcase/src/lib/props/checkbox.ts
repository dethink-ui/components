import type { PropRow } from "@/components/props-table";

export const checkboxProps: PropRow[] = [
  {
    prop: "checked",
    type: 'boolean | "indeterminate"',
    defaultValue: "—",
    description:
      'Controlled state. "indeterminate" renders the mixed state and announces as such.',
  },
  {
    prop: "defaultChecked",
    type: 'boolean | "indeterminate"',
    defaultValue: "false",
    description: "The starting state when the component manages its own state.",
  },
  {
    prop: "onCheckedChange",
    type: '(checked: boolean | "indeterminate") => void',
    defaultValue: "—",
    description: "Called with the new state when the user toggles the control.",
  },
  {
    prop: "controlSize",
    type: '"sm" | "md" | "lg"',
    defaultValue: '"md"',
    description: "Sets the control size to match other form fields.",
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
      'Renders a real <input type="checkbox">: name, value, disabled, required, readOnly, and form behavior are native.',
  },
];
