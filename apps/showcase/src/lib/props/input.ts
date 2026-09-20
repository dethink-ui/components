import type { PropRow } from "@/components/props-table";

export const inputProps: PropRow[] = [
  {
    prop: "controlSize",
    type: '"sm" | "md" | "lg"',
    defaultValue: '"md"',
    description:
      'Sets the field height and padding. The "md" size follows the app density setting.',
  },
  {
    prop: "invalid",
    type: "boolean",
    defaultValue: "false",
    description:
      "Shows an error border and marks the field as invalid for screen readers.",
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
    description: "Lets users read and select the text, but prevents editing.",
  },
  {
    prop: "required",
    type: "boolean",
    defaultValue: "false",
    description: "Requires a value before the browser submits the form.",
  },
  {
    prop: "…InputHTMLAttributes",
    type: "InputHTMLAttributes<HTMLInputElement>",
    description:
      "All native input props pass through: type, placeholder, value, onChange, autoComplete, and so on.",
  },
];
