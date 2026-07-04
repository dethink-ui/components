import type { PropRow } from "@/components/props-table";

export const popoverProps: PropRow[] = [
  {
    prop: "open / defaultOpen / onOpenChange",
    type: "boolean / boolean / (open) => void",
    defaultValue: "—",
    description: "Controlled or uncontrolled visibility.",
  },
  {
    prop: "PopoverTrigger / PopoverClose",
    type: "variant + size (Button API)",
    defaultValue: "—",
    description:
      "Anchor button and close buttons; PopoverClose also accepts onPress for save-on-close patterns.",
  },
  {
    prop: "PopoverContent — placement",
    type: '"top" | "bottom" | "left" | "right" (+ " start"/" end")',
    defaultValue: '"bottom"',
    description: "Preferred side and alignment relative to the trigger.",
  },
  {
    prop: "PopoverContent — showArrow",
    type: "boolean",
    defaultValue: "false",
    description: "Renders a pointing arrow tied to the trigger.",
  },
  {
    prop: "PopoverContent — offset",
    type: "number",
    defaultValue: "8",
    description: "Distance in pixels between trigger and panel.",
  },
  {
    prop: "PopoverHeader / PopoverTitle / PopoverDescription / PopoverFooter",
    type: "section components",
    defaultValue: "—",
    description:
      "Anatomy pieces; title and description label the popover dialog.",
  },
];
