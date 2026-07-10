import type { PropRow } from "@/components/props-table";

export const dropdownButtonProps: PropRow[] = [
  {
    prop: "mode",
    type: '"menu" | "split" | "selectable"',
    defaultValue: '"menu"',
    description:
      "Menu mode renders one trigger. Split mode fixes a primary action. Selectable mode derives the later primary action from one chosen action descriptor.",
  },
  {
    prop: "actions",
    type: "readonly DropdownButtonSelectableAction[]",
    description:
      "Selectable-mode action ownership: stable ID, label, optional description/icon, disabled/destructive state, and execution handler.",
  },
  {
    prop: "selectedActionId / defaultSelectedActionId / onSelectedActionChange",
    type: "string / string / (actionId) => void",
    description:
      "Controlled or uncontrolled selectable state. Choosing updates the primary action but never invokes its handler.",
  },
  {
    prop: "menuLabel / onPrimaryAction / primaryIcon",
    type: "string / Button onClick / ReactNode",
    description:
      "Required split semantics: the icon-only menu half is separately named, while the native primary side owns only the direct action and optional icon.",
  },
  {
    prop: "loading / loadingBehavior",
    type: 'boolean / "all" | "primary"',
    defaultValue: 'false / "all"',
    description:
      "Marks the readable primary action busy and prevents duplicate activation. The safe default disables both halves; primary keeps declared-safe menu alternatives available.",
  },
  {
    prop: "disabled / primaryDisabled / menuDisabled",
    type: "boolean",
    defaultValue: "false",
    description:
      "Disable the complete composite or either native half independently without changing the other control's semantics.",
  },
  {
    prop: "label",
    type: "ReactNode",
    description:
      "Visible trigger content and, when textual, the menu button's accessible name. Supply aria-label for non-text content.",
  },
  {
    prop: "variant / size",
    type: "ButtonVariant / ButtonSize",
    defaultValue: '"outline" / "md"',
    description:
      "Uses the existing Button visual recipes without introducing a second variant system.",
  },
  {
    prop: "open / defaultOpen / onOpenChange",
    type: "boolean / boolean / (open) => void",
    description: "Controlled or uncontrolled menu visibility.",
  },
  {
    prop: "placement / offset / crossOffset / containerPadding / shouldFlip",
    type: "DropdownMenu positioning props",
    defaultValue: '"bottom start" / 8 / 0 / 12 / true',
    description:
      "Delegates logical placement and collision handling to DropdownMenu. Split mode anchors and sizes from the complete composite.",
  },
  {
    prop: "motionPreset",
    type: '"none" | "subtle" | "standard"',
    defaultValue: '"standard"',
    description:
      "Selects Motion-based menu presence and item feedback. The user preference or reducedMotion removes transform choreography.",
  },
  {
    prop: "children",
    type: "ReactNode",
    description:
      "Existing DropdownMenuItem, Section, Label, Separator, Shortcut, and Submenu components; no parallel item schema is introduced.",
  },
  {
    prop: "className / groupClassName / triggerClassName / contentClassName / menuClassName",
    type: "string",
    description:
      "Compose classes at stable root, composite, trigger, surface, and menu slots.",
  },
];
