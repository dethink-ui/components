import type { PropRow } from "@/components/props-table";

export const drawerProps: PropRow[] = [
  {
    prop: "direction",
    type: '"top" | "bottom" | "left" | "right"',
    defaultValue: '"bottom"',
    description:
      "Anchor edge. A physical anchor — it never repositions under RTL, only internal spacing does.",
  },
  {
    prop: "modal",
    type: "boolean",
    defaultValue: "true",
    description:
      "false renders a non-modal inline push panel that shifts sibling layout instead of overlaying it.",
  },
  {
    prop: "size / fullSize / dimension",
    type: '"sm" | "md" | "lg" | "xl" | "full" / boolean / string | number',
    defaultValue: '"md" / false / —',
    description:
      "Direction-aware drawer sizing. For top/bottom drawers this controls height; for left/right drawers this controls width. dimension accepts custom CSS lengths, with numbers treated as px.",
  },
  {
    prop: "open / defaultOpen / onOpenChange",
    type: "boolean / boolean / (open) => void",
    defaultValue: "—",
    description:
      "Controlled or uncontrolled open state, identical to Dialog's contract.",
  },
  {
    prop: "DrawerContent — dismissible / keyboardDismissDisabled",
    type: "boolean / boolean",
    defaultValue: "false / false",
    description:
      "Outside-click dismissal when dismissible is true, plus Escape dismissal in modal mode. Requires a visible close affordance when keyboard dismiss is disabled.",
  },
  {
    prop: "snapPoints / activeSnapPoint / defaultSnapPoint / onActiveSnapPointChange",
    type: "number[] / number / number / (snapPoint) => void",
    defaultValue: "—",
    description:
      "Fractions in (0, 1] of the drawer's open size it can rest at. 0 (closed) is always implicit.",
  },
  {
    prop: "closeThreshold / velocityThreshold",
    type: "number / number",
    defaultValue: "0.25 / 500",
    description:
      "Distance fraction and px/s flick velocity that trigger a drag dismiss below the distance threshold.",
  },
  {
    prop: "dragHandleOnly",
    type: "boolean",
    defaultValue: "true",
    description: "Restricts drag initiation to DrawerHandle/header region.",
  },
  {
    prop: "backgroundScale",
    type: "boolean",
    defaultValue: "false",
    description:
      "iOS-style scale-down/dim on a data-drawer-background-wrapper element while a modal drawer is open.",
  },
  {
    prop: "edgeSwipeToOpen / edgeSwipeHitRegionSize",
    type: "boolean / number",
    defaultValue: "false / 24",
    description:
      "Opt-in edge-swipe gesture to open the drawer, and its hit-region size in px.",
  },
  {
    prop: "motionPreset",
    type: '"none" | "subtle" | "standard" | "expressive"',
    defaultValue: '"standard"',
    description:
      "Spring/duration tuning applied consistently to drag, snap, recede, and shared-element morph.",
  },
  {
    prop: "reducedMotion",
    type: "boolean",
    defaultValue: "—",
    description:
      "Explicit override that forces the CSS-only fallback regardless of prefers-reduced-motion.",
  },
  {
    prop: "DrawerContent — layoutId",
    type: "string",
    defaultValue: "—",
    description:
      "Passthrough to the underlying Motion element for an optional shared-element entrance from a matching motion.* trigger.",
  },
  {
    prop: "DrawerHandle",
    type: "draggable affordance",
    defaultValue: "—",
    description:
      "aria-hidden, additive pointer-drag handle. Trigger, close, dismissible outside click, and Escape work without it.",
  },
  {
    prop: "Nested drawers",
    type: "automatic",
    defaultValue: "—",
    description:
      "A drawer opened from inside another drawer automatically recedes its parent using the same spring primitives as drag. Recommended max stack depth: 2.",
  },
  {
    prop: "DrawerHeader / DrawerTitle / DrawerDescription / DrawerFooter / DrawerClose",
    type: "section components",
    defaultValue: "—",
    description:
      "Anatomy pieces; the title and description label the drawer for assistive tech.",
  },
];
