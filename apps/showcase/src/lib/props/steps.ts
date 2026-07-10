import type { PropRow } from "@/components/props-table";

export const stepsProps: PropRow[] = [
  {
    prop: "items",
    type: "StepItemData<TData>[]",
    defaultValue: "—",
    description:
      "The visible workflow branch. Every item requires a stable, unique id and readable label.",
  },
  {
    prop: "value / defaultValue / onValueChange",
    type: "string / string / (value: string) => void",
    defaultValue: "first item",
    description:
      "Controlled or uncontrolled current-step identity. Keep the current id present when the branch changes.",
  },
  {
    prop: "interactive",
    type: "boolean",
    defaultValue: "false",
    description:
      "Renders each step surface as a native button and requests navigation to any enabled item.",
  },
  {
    prop: "orientation",
    type: '"horizontal" | "vertical"',
    defaultValue: '"horizontal"',
    description:
      "Uses a horizontal process track with safe inline overflow or an explicit vertical rail.",
  },
  {
    prop: "size",
    type: '"sm" | "md" | "lg"',
    defaultValue: '"md"',
    description: "Controls indicator and type scale.",
  },
  {
    prop: "motionPreset",
    type: '"none" | "subtle" | "standard" | "expressive"',
    defaultValue: '"standard"',
    description:
      "Controls branch presence, surviving-item layout, current-marker, and progress choreography.",
  },
  {
    prop: "showProgress",
    type: "boolean",
    defaultValue: "false",
    description:
      "Shows a named progressbar derived from the current ordinal and visible branch length.",
  },
  {
    prop: "progressValue",
    type: "number",
    defaultValue: "derived",
    description:
      "Overrides ordinal progress with a product-specific percentage, clamped to 0–100.",
  },
  {
    prop: "formatProgress",
    type: "(percentage, context) => ReactNode",
    defaultValue: "rounded percent",
    description:
      "Formats visible progress and aria-valuetext when the result is a string or number.",
  },
  {
    prop: "renderItem",
    type: "(item, state) => ReactNode",
    defaultValue: "built-in body",
    description:
      "Replaces visible item content while Steps retains list, activation, current, status, and progress semantics.",
  },
  {
    prop: "aria-label / aria-labelledby",
    type: "string",
    defaultValue: '"Progress steps"',
    description: "Provides an accessible name for the ordered process list.",
  },
];

export const stepItemProps: PropRow[] = [
  {
    prop: "id",
    type: "string",
    defaultValue: "—",
    description:
      "Stable, unique state and animation identity. Required for every item.",
  },
  {
    prop: "label / description",
    type: "ReactNode / ReactNode",
    defaultValue: "—",
    description:
      "Required visible label and optional supporting description used by the default renderer.",
  },
  {
    prop: "icon",
    type: "ReactNode",
    defaultValue: "ordinal/status icon",
    description: "Optional decorative indicator content.",
  },
  {
    prop: "disabled / optional",
    type: "boolean / boolean",
    defaultValue: "false / false",
    description:
      "Blocks interactive activation or marks a step as optional without removing it from the branch.",
  },
  {
    prop: "status",
    type: '"complete" | "upcoming" | "error" | "skipped"',
    defaultValue: "derived",
    description:
      "Overrides visual/domain status. aria-current remains independently tied to the root value.",
  },
  {
    prop: "data",
    type: "TData",
    defaultValue: "—",
    description: "Consumer-owned typed payload passed unchanged to renderItem.",
  },
];

export const stepsStateProps: PropRow[] = [
  {
    prop: "items / defaultItems",
    type: "StepItemData<TData>[]",
    defaultValue: "[]",
    description:
      "Controlled or uncontrolled visible collection shared by the provider hooks.",
  },
  {
    prop: "value / defaultValue",
    type: "string / string",
    defaultValue: "first item",
    description:
      "Controlled or uncontrolled current-step identity used by indicators, panels, and controls.",
  },
  {
    prop: "onItemsChange",
    type: "(items) => void",
    defaultValue: "—",
    description:
      "Receives the complete proposed collection after a guarded future-step mutation.",
  },
  {
    prop: "onValueChange",
    type: "(value) => void",
    defaultValue: "—",
    description: "Receives an enabled visible destination.",
  },
  {
    prop: "progressValue",
    type: "number",
    defaultValue: "derived",
    description:
      "Overrides the current ordinal divided by the visible collection length.",
  },
];

export const stepsPanelProps: PropRow[] = [
  {
    prop: "render",
    type: "(context) => ReactNode",
    defaultValue: "—",
    description:
      "Renders consumer-owned content for the provider's current step with step, index, count, and value.",
  },
  {
    prop: "fallback",
    type: "ReactNode",
    defaultValue: "null",
    description: "Shown when the provider cannot resolve a current step.",
  },
];
