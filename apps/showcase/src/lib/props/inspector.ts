import type { PropRow } from "@/components/props-table";

export const inspectorProps: PropRow[] = [
  {
    prop: "value",
    type: "Record<string, unknown> | null",
    defaultValue: "—",
    description:
      "The selection's properties. null or undefined shows the empty state.",
  },
  {
    prop: "onValueChange",
    type: "(next, { path, value }) => void",
    defaultValue: "—",
    description:
      "Receives an immutable copy with the committed change and the dot path that changed.",
  },
  {
    prop: "selectionKey",
    type: "string | number",
    defaultValue: "value identity",
    description:
      "Identifies the selected object. Unfinished drafts are discarded when it changes. Pass a stable id when value is rebuilt without changing the selection.",
  },
  {
    prop: "disabled / readOnly",
    type: "boolean",
    defaultValue: "false",
    description: "Applies to every property in the panel.",
  },
  {
    prop: "emptyState",
    type: "ReactNode",
    defaultValue: '"Nothing selected"',
    description: "Replaces the default compact EmptyState.",
  },
];

export const inspectorSectionProps: PropRow[] = [
  {
    prop: "title / description",
    type: "ReactNode",
    defaultValue: "—",
    description:
      "Section heading and optional hint. The heading names the section's group.",
  },
  {
    prop: "collapsible",
    type: "boolean",
    defaultValue: "true",
    description: "false renders a plain heading and keeps content visible.",
  },
  {
    prop: "defaultOpen / open / onOpenChange",
    type: "boolean / (open) => void",
    defaultValue: "true",
    description: "Uncontrolled or controlled disclosure state.",
  },
  {
    prop: "headingLevel",
    type: "2 | 3 | 4 | 5 | 6",
    defaultValue: "3",
    description: "Match the heading outline of the host page.",
  },
  {
    prop: "actions",
    type: "ReactNode",
    defaultValue: "—",
    description: "Controls beside the heading, outside the toggle button.",
  },
];

export const inspectorPropertyProps: PropRow[] = [
  {
    prop: "path",
    type: "string",
    defaultValue: "—",
    description: "Dot path into value, such as layout.width or points.0.x.",
  },
  {
    prop: "label / description",
    type: "ReactNode",
    defaultValue: "—",
    description:
      "Visible label (truncated when narrow) and optional hint wired to the control.",
  },
  {
    prop: "disabled / readOnly / disabledReason",
    type: "boolean / ReactNode",
    defaultValue: "false",
    description: "Locks the property and explains why.",
  },
  {
    prop: "error",
    type: "ReactNode",
    defaultValue: "—",
    description:
      "Consumer error. Takes precedence over messages a control reports for invalid drafts.",
  },
];

export const inspectorControlProps: PropRow[] = [
  {
    prop: "InspectorNumber",
    type: "min, max, step, precision, unit",
    defaultValue: "step 1",
    description:
      "Spinbutton. Commits on Enter/blur, reverts on Escape, clamps, and steps with arrows; Home/End jump to bounds.",
  },
  {
    prop: "InspectorText",
    type: "validate?: (text) => string | null",
    defaultValue: "—",
    description:
      "Commits on Enter/blur. A returned message rejects the draft and keeps the previous value.",
  },
  {
    prop: "InspectorSwitch",
    type: "SwitchProps",
    defaultValue: "—",
    description: "Writes true or false.",
  },
  {
    prop: "InspectorSelect",
    type: "options, placeholder",
    defaultValue: '"Select…"',
    description: "Writes the chosen option's string value.",
  },
  {
    prop: "useInspectorProperty",
    type: "() => { value, setValue, ids, … }",
    defaultValue: "—",
    description: "Wire a custom control to the surrounding property.",
  },
];
