import type { PropRow } from "@/components/props-table";

export const inputProps: PropRow[] = [
  {
    prop: "controlSize",
    type: '"sm" | "md" | "lg"',
    defaultValue: '"md"',
    description:
      'Control height and horizontal padding. "md" follows the active density token.',
  },
  {
    prop: "invalid",
    type: "boolean",
    defaultValue: "false",
    description:
      "Marks the field invalid: destructive border and ring, plus aria-invalid for assistive technology.",
  },
  {
    prop: "disabled",
    type: "boolean",
    defaultValue: "false",
    description: "Disables the field and lowers its opacity.",
  },
  {
    prop: "readOnly",
    type: "boolean",
    defaultValue: "false",
    description:
      "Keeps the value selectable but not editable, on a muted surface.",
  },
  {
    prop: "required",
    type: "boolean",
    defaultValue: "false",
    description: "Marks the field required for constraint validation.",
  },
  {
    prop: "…InputHTMLAttributes",
    type: "InputHTMLAttributes<HTMLInputElement>",
    description:
      "All native input props pass through: type, placeholder, value, onChange, autoComplete, and so on.",
  },
];
