import type { PropRow } from "@/components/props-table";

export const accordionProps: PropRow[] = [
  {
    prop: "type",
    type: '"single" | "multiple"',
    defaultValue: '"single"',
    description:
      "Controls whether one blade or several blades can be open at the same time.",
  },
  {
    prop: "value",
    type: "string | undefined | string[]",
    defaultValue: "—",
    description:
      "Controlled open value. Use a string for single mode and string[] for multiple mode.",
  },
  {
    prop: "defaultValue",
    type: "string | string[]",
    defaultValue: "—",
    description:
      "Initial open value for uncontrolled usage. Omit to start fully closed.",
  },
  {
    prop: "onValueChange",
    type: "(value: string | undefined | string[]) => void",
    defaultValue: "—",
    description: "Fires with the next open value when a blade toggles.",
  },
  {
    prop: "collapsible",
    type: "boolean",
    defaultValue: "true",
    description:
      "In single mode, allows clicking the open blade to close it. Multiple mode always toggles each blade independently.",
  },
  {
    prop: "disabled",
    type: "boolean",
    defaultValue: "false",
    description: "Disables every blade in the accordion.",
  },
  {
    prop: "motionPreset",
    type: '"none" | "subtle" | "standard" | "expressive"',
    defaultValue: '"standard"',
    description:
      "Controls Motion layout, content presence, icon rotation, and press feedback.",
  },
];

export const accordionPartProps: PropRow[] = [
  {
    prop: "Item value",
    type: "string",
    defaultValue: "—",
    description:
      "Required stable identity for the blade/content pair. Duplicate values throw in development.",
  },
  {
    prop: "Item disabled",
    type: "boolean",
    defaultValue: "false",
    description: "Disables one blade and removes it from arrow-key navigation.",
  },
  {
    prop: "Blade iconPosition",
    type: '"start" | "end"',
    defaultValue: '"start"',
    description:
      "Sets icon placement inside the blade trigger. Icon-only blades need an accessible name.",
  },
  {
    prop: "Content forceMount",
    type: "boolean",
    defaultValue: "false",
    description:
      "Keeps closed content mounted while hidden, useful for preserving form or widget state.",
  },
];
