import type { PropRow } from "@/components/props-table";

export const buttonProps: PropRow[] = [
  {
    prop: "variant",
    type: '"solid" | "soft" | "outline" | "ghost" | "link" | "destructive"',
    defaultValue: '"solid"',
    description:
      "Sets the button style. Use solid for the main action or outline for a secondary action.",
  },
  {
    prop: "size",
    type: '"xs" | "sm" | "md" | "lg" | "xl" | "icon"',
    defaultValue: '"md"',
    description:
      'Sets the button size. The "icon" size is square and needs an aria-label.',
  },
  {
    prop: "loading",
    type: "boolean",
    defaultValue: "false",
    description:
      "Shows a spinner and blocks clicks while an action is running. Sets aria-busy for screen readers.",
  },
  {
    prop: "leftIcon",
    type: "ReactNode",
    description:
      "An icon before the label. Screen readers read the label and ignore the icon.",
  },
  {
    prop: "rightIcon",
    type: "ReactNode",
    description:
      "An icon after the label. Screen readers read the label and ignore the icon.",
  },
  {
    prop: "asChild",
    type: "boolean",
    defaultValue: "false",
    description:
      "Applies button styles and behavior to its single child, such as a link.",
  },
  {
    prop: "disabled",
    type: "boolean",
    defaultValue: "false",
    description:
      "Blocks interaction. Also enabled automatically while loading.",
  },
];
