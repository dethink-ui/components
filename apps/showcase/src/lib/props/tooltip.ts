import type { PropRow } from "@/components/props-table";

export const tooltipProps: PropRow[] = [
  {
    prop: "delay / closeDelay",
    type: "number (ms)",
    defaultValue: "library defaults",
    description: "Hover intent timing before showing and hiding.",
  },
  {
    prop: "open / onOpenChange",
    type: "boolean / (open) => void",
    defaultValue: "—",
    description: "Controlled visibility for programmatic tooltips.",
  },
  {
    prop: "disabled",
    type: "boolean",
    defaultValue: "false",
    description: "Suppresses the tooltip without disabling the trigger.",
  },
  {
    prop: "TooltipTrigger",
    type: "variant + size (Button API)",
    defaultValue: "—",
    description:
      "A real button trigger — keep the accessible name on the trigger (aria-label); the tooltip is a hint, not the name.",
  },
  {
    prop: "TooltipContent — placement",
    type: '"top" | "bottom" | "left" | "right" (+ alignment)',
    defaultValue: '"top"',
    description: "Preferred side relative to the trigger.",
  },
  {
    prop: "TooltipContent — showArrow",
    type: "boolean",
    defaultValue: "false",
    description: "Renders a pointing arrow.",
  },
];
