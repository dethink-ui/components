import type { PropRow } from "@/components/props-table";

export const horizontalAccordionProps: PropRow[] = [
  {
    prop: "value",
    type: "string | undefined",
    defaultValue: "—",
    description:
      "Controlled active item value. undefined means no active item. Pair with onValueChange.",
  },
  {
    prop: "defaultValue",
    type: "string",
    defaultValue: "—",
    description:
      "Initial active item for uncontrolled usage. Omit to start fully collapsed.",
  },
  {
    prop: "onValueChange",
    type: "(value: string | undefined) => void",
    defaultValue: "—",
    description:
      "Fires with the next value on activation, or undefined when the active item collapses.",
  },
  {
    prop: "collapsible",
    type: "boolean",
    defaultValue: "true",
    description:
      "Whether activating the active blade collapses it. With false the accordion keeps one section open once activated.",
  },
  {
    prop: "activationMode",
    type: '"manual" | "automatic"',
    defaultValue: '"manual"',
    description:
      "Manual activates blades with click, Enter, or Space. Automatic also activates on keyboard focus.",
  },
  {
    prop: "bladeWidth",
    type: "number",
    defaultValue: "72",
    description:
      "Collapsed blade width in pixels, exposed as --horizontal-accordion-blade-width.",
  },
  {
    prop: "height",
    type: "number",
    defaultValue: "420",
    description:
      "Band height in pixels, exposed as --horizontal-accordion-height. Compact layout treats it as a minimum.",
  },
  {
    prop: "compactBreakpoint",
    type: "number",
    defaultValue: "640",
    description:
      "Container width in pixels at or below which the compact layout activates. Measured with a ResizeObserver, not the viewport.",
  },
  {
    prop: "animation",
    type: "{ duration?: number; easing?: string; content?: boolean }",
    defaultValue: '{ duration: 260, easing: "cubic-bezier(0.2, 0, 0, 1)", content: true }',
    description:
      "Tunes the expansion and Motion choreography globally. content false disables panel content animation.",
  },
  {
    prop: "unmountInactivePanels",
    type: "boolean",
    defaultValue: "false",
    description:
      "Unmounts inactive panel children after their exit animation instead of keeping them mounted and hidden.",
  },
];

export const horizontalAccordionPartProps: PropRow[] = [
  {
    prop: "Item value",
    type: "string",
    defaultValue: "—",
    description:
      "Required stable identity for each item. Duplicate values throw in development.",
  },
  {
    prop: "Blade iconPosition",
    type: '"start" | "end" | "top" | "bottom"',
    defaultValue: '"start"',
    description:
      "Position of BladeIcon along the blade axis. top and bottom are aliases for start and end.",
  },
  {
    prop: "BladeLabel orientation",
    type: '"rotated" | "vertical"',
    defaultValue: '"rotated"',
    description:
      "Rotated turns horizontal text; vertical uses a true vertical writing mode.",
  },
  {
    prop: "BladeLabel direction",
    type: '"bottom-to-top" | "top-to-bottom"',
    defaultValue: '"bottom-to-top"',
    description: "Reading direction of the blade label text.",
  },
];
