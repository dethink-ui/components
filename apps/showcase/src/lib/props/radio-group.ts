import type { PropRow } from "@/components/props-table";

export const radioGroupProps: PropRow[] = [
  {
    prop: "value / defaultValue",
    type: "string",
    defaultValue: "—",
    description: "Controlled or uncontrolled selected item value.",
  },
  {
    prop: "onValueChange",
    type: "(value: string) => void",
    defaultValue: "—",
    description: "Fires with the newly selected item's value.",
  },
  {
    prop: "name",
    type: "string",
    defaultValue: "—",
    description: "Shared input name applied to every item in the group.",
  },
  {
    prop: "orientation",
    type: '"vertical" | "horizontal"',
    defaultValue: '"vertical"',
    description: "Layout direction and arrow-key axis.",
  },
  {
    prop: "controlSize",
    type: '"sm" | "md" | "lg"',
    defaultValue: '"md"',
    description: "Control size inherited by every item.",
  },
  {
    prop: "required / disabled / readOnly / invalid",
    type: "boolean",
    defaultValue: "false",
    description: "Group-level states inherited by every item.",
  },
];

export const radioGroupItemProps: PropRow[] = [
  {
    prop: "value",
    type: "string",
    defaultValue: "—",
    description: "Value this radio contributes when selected.",
  },
  {
    prop: "controlSize / invalid / disabled",
    type: "per-item overrides",
    defaultValue: "inherited",
    description: "Item-level overrides of the group settings.",
  },
  {
    prop: "…native input props",
    type: "InputHTMLAttributes",
    defaultValue: "—",
    description: "Renders a real <input type=\"radio\">.",
  },
];
