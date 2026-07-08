import type { PropRow } from "@/components/props-table";

export const buttonProps: PropRow[] = [
  {
    prop: "variant",
    type: '"solid" | "soft" | "outline" | "ghost" | "link" | "destructive"',
    defaultValue: '"solid"',
    description:
      "Visual emphasis of the button, from primary action to inline link.",
  },
  {
    prop: "size",
    type: '"xs" | "sm" | "md" | "lg" | "xl" | "icon"',
    defaultValue: '"md"',
    description:
      'Control height and padding. "icon" renders a square button sized by the density token; provide an aria-label.',
  },
  {
    prop: "loading",
    type: "boolean",
    defaultValue: "false",
    description:
      "Shows a spinner in place of the left icon, sets aria-busy, and blocks clicks while pending.",
  },
  {
    prop: "leftIcon",
    type: "ReactNode",
    description:
      "Decorative icon rendered before the label. Hidden from assistive technology.",
  },
  {
    prop: "rightIcon",
    type: "ReactNode",
    description:
      "Decorative icon rendered after the label. Hidden from assistive technology.",
  },
  {
    prop: "asChild",
    type: "boolean",
    defaultValue: "false",
    description:
      "Merge button styling and behavior onto the single child element (for example a link) instead of rendering a <button>.",
  },
  {
    prop: "disabled",
    type: "boolean",
    defaultValue: "false",
    description:
      "Disables interaction. Also applied automatically while loading is true.",
  },
];
