import type { PropRow } from "@/components/props-table";

export const navDockProps: PropRow[] = [
  {
    prop: "placement / position",
    type: '"bottom" | "top" | "left" | "right" / "static" | "absolute" | "fixed"',
    defaultValue: '"bottom" / "static"',
    description:
      "Physical edge and positioning mode. Static preserves layout; absolute and fixed opt into overlay-style placement with edge offsets.",
  },
  {
    prop: "variant / size",
    type: '"default" | "glass" | "solid" / "sm" | "md" | "lg"',
    defaultValue: '"default" / "md"',
    description:
      "Token-backed dock surface and item scale. Provider density still controls the surrounding spacing rhythm.",
  },
  {
    prop: "showTitle",
    type: '"never" | "hover" | "always"',
    defaultValue: '"hover"',
    description:
      "Visual title behavior. Hidden titles remain accessible names for icon-only docks and collapsed rails.",
  },
  {
    prop: "motion",
    type: '"none" | "subtle" | "standard" | "expressive"',
    defaultValue: '"standard"',
    description:
      "Motion/react preset for magnification, title reveal, submenu presence, and collapsed rail open/close.",
  },
  {
    prop: "items",
    type: "NavDockItemData[]",
    defaultValue: "—",
    description:
      "Recommended data API. Root items are role-exclusive links, in-page actions, or submenu disclosures.",
  },
  {
    prop: "value / defaultValue / onValueChange",
    type: "string | null / string | null / (value) => void",
    defaultValue: "—",
    description:
      "Controlled or uncontrolled active interaction value used for hover/focus magnification and title reveal.",
  },
  {
    prop: "openValue / defaultOpenValue / onOpenValueChange",
    type: "string | null / string | null / (value) => void",
    defaultValue: "—",
    description:
      "Controlled or uncontrolled submenu disclosure state, separate from active hover/focus state.",
  },
  {
    prop: "currentValue / isItemCurrent",
    type: "string / (item, context) => boolean | 'page' | 'location' | undefined",
    defaultValue: "—",
    description:
      "Route-derived current matching that maps to aria-current without replacing interaction or submenu state.",
  },
  {
    prop: "CollapseDock",
    type: "compound child",
    defaultValue: "—",
    description:
      "Explicit collapsed-mode slot. It renders icon-only content, opens as a vertical rail, and keeps the trigger blended into the dock.",
  },
  {
    prop: "NavDockSeparator",
    type: "compound child",
    defaultValue: "—",
    description:
      "Decorative dock-axis divider for grouping compound NavDock items. NavDockDivider is kept as an alias.",
  },
];
