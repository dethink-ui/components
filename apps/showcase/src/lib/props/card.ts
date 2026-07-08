import type { PropRow } from "@/components/props-table";

export const cardProps: PropRow[] = [
  {
    prop: "surface",
    type: '"default" | "muted" | "transparent"',
    defaultValue: '"default"',
    description: "Background treatment of the card surface.",
  },
  {
    prop: "border",
    type: '"default" | "muted" | "none"',
    defaultValue: '"default"',
    description: "Border strength around the card.",
  },
  {
    prop: "radius",
    type: '"md" | "lg"',
    defaultValue: '"lg"',
    description: "Corner radius, resolved from the shared radius tokens.",
  },
  {
    prop: "shadow",
    type: '"none" | "sm" | "md"',
    defaultValue: '"sm"',
    description: "Elevation shadow of the card.",
  },
  {
    prop: "spacing",
    type: '"sm" | "md" | "lg"',
    defaultValue: '"md"',
    description:
      "Density-aware padding and gap scale applied to every card section.",
  },
  {
    prop: "as",
    type: '"div" | "article" | "section" | "aside" | "li"',
    defaultValue: '"div"',
    description: "Semantic element the card renders as.",
  },
  {
    prop: "asChild",
    type: "boolean",
    defaultValue: "false",
    description: "Merge card styling onto the single child element instead.",
  },
];

export const cardSubcomponentProps: PropRow[] = [
  {
    prop: "CardHeader",
    type: 'as: "div" | "header" | "section"',
    defaultValue: '"div"',
    description:
      "Grid region that lays out title and description beside an optional action.",
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
    description: "Muted supporting copy under the title.",
  },
  {
    prop: "CardAction",
    type: 'as: "div" | "span"',
    defaultValue: '"div"',
    description:
      "Slot pinned to the header's end column for buttons, menus, or badges.",
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
    description: "Action row at the bottom of the card with justify control.",
  },
];
