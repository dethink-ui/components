import type { PropRow } from "@/components/props-table";

export const dropdownButtonProps: PropRow[] = [
  {
    prop: "mode",
    type: '"menu"',
    defaultValue: '"menu"',
    description:
      "This slice exposes one menu button and rejects split-only primary action props. Split mode arrives in its own implementation slice.",
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
      "Delegates logical placement and collision handling to the existing positioned DropdownMenu path.",
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
