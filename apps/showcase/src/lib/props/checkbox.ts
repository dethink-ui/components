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
    description: "Initial state for uncontrolled usage.",
  },
  {
    prop: "onCheckedChange",
    type: '(checked: boolean | "indeterminate") => void',
    defaultValue: "—",
    description: "Fires with the next state on user toggle.",
  },
  {
    prop: "controlSize",
    type: '"sm" | "md" | "lg"',
    defaultValue: '"md"',
    description: "Control dimensions aligned with the other form controls.",
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
      'Renders a real <input type="checkbox">: name, value, disabled, required, readOnly, and form behavior are native.',
  },
];
