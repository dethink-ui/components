import type { PropRow } from "@/components/props-table";

export const tagInputProps: PropRow[] = [
  {
    prop: "value / defaultValue / onValueChange",
    type: "string[] / string[] / (value) => void",
    defaultValue: "[]",
    description: "Controlled or uncontrolled tags.",
  },
  {
    prop: "inputValue / defaultInputValue / onInputValueChange",
    type: "string / string / (text) => void",
    defaultValue: '""',
    description: "Controlled or uncontrolled text for the entry field.",
  },
  {
    prop: "delimiters",
    type: "string[]",
    defaultValue: "[,]",
    description: "Characters that commit the current text as a tag.",
  },
  {
    prop: "normalizeTag",
    type: "(value) => string",
    defaultValue: "trim + collapse spaces",
    description: "Normalizes typed and initial tag values before validation.",
  },
  {
    prop: "validateTag",
    type: "(value, existing) => ReactNode | null",
    defaultValue: "—",
    description: "Returns a message to block a tag, or null to accept it.",
  },
  {
    prop: "maxTags / maxTagLength",
    type: "number",
    defaultValue: "—",
    description: "Limits total tag count and individual tag length.",
  },
  {
    prop: "label / description / errorMessage",
    type: "ReactNode",
    defaultValue: "—",
    description: "The field label, help text, and error message.",
  },
  {
    prop: "placeholder / removeLabel",
    type: "string",
    defaultValue: '"Add tag" / "Remove"',
    description:
      "Entry placeholder and remove-button action text. React Aria appends the tag label.",
  },
  {
    prop: "controlSize",
    type: '"sm" | "md" | "lg"',
    defaultValue: '"md"',
    description: "Control height and typography scale.",
  },
  {
    prop: "required / disabled / readOnly / invalid",
    type: "boolean",
    defaultValue: "false",
    description: "Makes the field required, disabled, read-only, or invalid.",
  },
  {
    prop: "name",
    type: "string",
    defaultValue: "—",
    description: "Repeated hidden input name for native form submission.",
  },
];
