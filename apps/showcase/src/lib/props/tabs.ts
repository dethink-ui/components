import type { PropRow } from "@/components/props-table";

export const tabsProps: PropRow[] = [
  {
    prop: "value",
    type: "string",
    defaultValue: "—",
    description: "Controlled selected tab value.",
  },
  {
    prop: "defaultValue",
    type: "string",
    defaultValue: "first enabled trigger",
    description: "Initial selected value for uncontrolled usage.",
  },
  {
    prop: "onValueChange",
    type: "(value: string) => void",
    defaultValue: "—",
    description: "Fires when a different enabled tab becomes selected.",
  },
  {
    prop: "orientation",
    type: '"horizontal" | "vertical"',
    defaultValue: '"horizontal"',
    description: "Sets tablist orientation and arrow-key behavior.",
  },
  {
    prop: "activationMode",
    type: '"automatic" | "manual"',
    defaultValue: '"automatic"',
    description:
      "Automatic selects on focus. Manual requires Enter, Space, or click.",
  },
  {
    prop: "variant",
    type: '"pill" | "line"',
    defaultValue: '"pill"',
    description: "Visual style for the active layer and tab list.",
  },
  {
    prop: "size",
    type: '"sm" | "md" | "lg"',
    defaultValue: '"md"',
    description: "Adjusts trigger height, padding, and text size.",
  },
  {
    prop: "motionPreset",
    type: '"none" | "subtle" | "standard" | "expressive"',
    defaultValue: '"standard"',
    description:
      "Controls the shared-layout active layer; reduced motion forces a static layer.",
  },
  {
    prop: "collapsible",
    type: "boolean",
    defaultValue: "false",
    description:
      "Collapses horizontal triggers to their icons, revealing labels on selection, hover, or focus. Requires an icon per trigger. Vertical tabs always show their labels.",
  },
  {
    prop: "loop",
    type: "boolean",
    defaultValue: "true",
    description: "Allows arrow navigation to wrap from the last tab to first.",
  },
  {
    prop: "disabled",
    type: "boolean",
    defaultValue: "false",
    description: "Disables all triggers in the tab set.",
  },
];

export const tabsPartProps: PropRow[] = [
  {
    prop: "Trigger value",
    type: "string",
    defaultValue: "—",
    description: "Stable identity shared by one trigger and one panel.",
  },
  {
    prop: "Trigger icon",
    type: "ReactNode",
    defaultValue: "—",
    description:
      "Leading icon rendered beside the label; stays visible when the label collapses.",
  },
  {
    prop: "Trigger disabled",
    type: "boolean",
    defaultValue: "false",
    description:
      "Disables one trigger and removes it from roving keyboard navigation.",
  },
  {
    prop: "Panel value",
    type: "string",
    defaultValue: "—",
    description: "Matches the trigger value that controls this panel.",
  },
  {
    prop: "Panel forceMount",
    type: "boolean",
    defaultValue: "false",
    description: "Keeps inactive panel DOM mounted while hidden.",
  },
];
