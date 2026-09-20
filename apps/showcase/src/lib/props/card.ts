import type { PropRow } from "@/components/props-table";

export const cardProps: PropRow[] = [
  {
    prop: "surface",
    type: '"default" | "muted" | "transparent"',
    defaultValue: '"default"',
    description: "Sets the card background.",
  },
  {
    prop: "border",
    type: '"default" | "muted" | "none"',
    defaultValue: '"default"',
    description: "Sets the card border style.",
  },
  {
    prop: "radius",
    type: '"md" | "lg"',
    defaultValue: '"lg"',
    description: "Sets how rounded the corners are.",
  },
  {
    prop: "shadow",
    type: '"none" | "sm" | "md"',
    defaultValue: '"sm"',
    description: "Sets the shadow below the card.",
  },
  {
    prop: "spacing",
    type: '"sm" | "md" | "lg"',
    defaultValue: '"md"',
    description:
      "Sets the padding and gaps inside each card section. Follows the app density setting.",
  },
  {
    prop: "as",
    type: '"div" | "article" | "section" | "aside" | "li"',
    defaultValue: '"div"',
    description: "The HTML element to render.",
  },
  {
    prop: "asChild",
    type: "boolean",
    defaultValue: "false",
    description:
      "Applies the card styles to its single child instead of adding a wrapper.",
  },
];

export const cardSubcomponentProps: PropRow[] = [
  {
    prop: "CardHeader",
    type: 'as: "div" | "header" | "section"',
    defaultValue: '"div"',
    description: "Groups the title, description, and optional action.",
  },
  {
    prop: "CardTitle",
    type: 'as: "div" | "h2"–"h6"',
    defaultValue: '"h3"',
    description:
      "Heading of the card. Pick the level that fits the page outline.",
  },
  {
    prop: "CardDescription",
    type: 'as: "p" | "div" | "span"',
    defaultValue: '"p"',
    description: "Adds supporting text below the title.",
  },
  {
    prop: "CardAction",
    type: 'as: "div" | "span"',
    defaultValue: '"div"',
    description: "Places a button, menu, or badge beside the title.",
  },
  {
    prop: "CardContent",
    type: 'as: "div" | "section"',
    defaultValue: '"div"',
    description: "Main body of the card.",
  },
  {
    prop: "CardFooter",
    type: 'as + justify: "start" | "between" | "end"',
    defaultValue: '"div", "start"',
    description: "Places actions at the bottom. Use justify to align them.",
  },
];
