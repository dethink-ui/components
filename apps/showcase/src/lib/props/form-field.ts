import type { PropRow } from "@/components/props-table";

export const fieldProps: PropRow[] = [
  {
    prop: "id",
    type: "string",
    defaultValue: "generated",
    description:
      "Base id that wires the control, label, description, and error together.",
  },
  {
    prop: "orientation",
    type: '"vertical" | "horizontal"',
    defaultValue: '"vertical"',
    description:
      "Vertical stacks label over control; horizontal puts the control first — the checkbox/switch layout.",
  },
  {
    prop: "required / disabled / readOnly / invalid",
    type: "boolean",
    defaultValue: "false",
    description:
      "Field-level states forwarded to the control and reflected in labels and messages.",
  },
  {
    prop: "as",
    type: "element",
    defaultValue: '"div"',
    description: "Semantic element the field renders as.",
  },
];

export const fieldPartsProps: PropRow[] = [
  {
    prop: "FieldControl",
    type: "asChild + slot props",
    defaultValue: "—",
    description:
      "Wraps the actual control and injects id, aria-describedby, aria-errormessage, and state attributes.",
  },
  {
    prop: "FieldLabel",
    type: "label props",
    defaultValue: "—",
    description: "Label associated with the control; click focuses/toggles it.",
  },
  {
    prop: "FieldDescription",
    type: "text props",
    defaultValue: "—",
    description: "Muted helper text announced via aria-describedby.",
  },
  {
    prop: "FieldError",
    type: "children | errors: FieldErrorItem[]",
    defaultValue: "—",
    description:
      "Validation message announced via aria-errormessage; accepts a list of error items.",
  },
  {
    prop: "FieldContent",
    type: "container props",
    defaultValue: "—",
    description:
      "Groups label and description beside a horizontal control (checkbox, switch).",
  },
  {
    prop: "FieldSet / FieldLegend / FieldGroup",
    type: "fieldset anatomy",
    defaultValue: "—",
    description:
      "Native fieldset semantics for related fields — the wrapper for radio groups and checkbox sets.",
  },
  {
    prop: "Form",
    type: "form props",
    defaultValue: "—",
    description: "Styled form wrapper with consistent vertical rhythm.",
  },
];
