import type { PropRow } from "@/components/props-table";

export const cardStackProps: PropRow[] = [
  {
    prop: "children",
    type: "Card element | Card element[]",
    defaultValue: "—",
    description:
      "Direct Card children only. Anything else throws, so wrappers must merge onto a Card via asChild.",
  },
  {
    prop: "mode",
    type: '"stack" | "open"',
    defaultValue: '"stack"',
    description:
      "Layered deck with the active card on top, or a fanned arc that spreads the cards apart.",
  },
  {
    prop: "activeIndex",
    type: "number",
    defaultValue: "—",
    description:
      "Controlled index of the active card. Pair with onActiveIndexChange.",
  },
  {
    prop: "defaultActiveIndex",
    type: "number",
    defaultValue: "0",
    description: "Initial active card for uncontrolled usage.",
  },
  {
    prop: "onActiveIndexChange",
    type: "(index: number) => void",
    defaultValue: "—",
    description:
      "Fires with the normalized index whenever navigation changes the active card.",
  },
  {
    prop: "loop",
    type: "boolean",
    defaultValue: "true",
    description:
      "Wrap from the last card back to the first. When false, controls disable at the ends.",
  },
  {
    prop: "showControls",
    type: "boolean",
    defaultValue: "stack mode with 2+ cards",
    description:
      "Force the built-in previous/next icon buttons on or off in either mode.",
  },
  {
    prop: "previousLabel",
    type: "string",
    defaultValue: '"Show previous card"',
    description: "Accessible label for the built-in previous control.",
  },
  {
    prop: "nextLabel",
    type: "string",
    defaultValue: '"Show next card"',
    description: "Accessible label for the built-in next control.",
  },
  {
    prop: "angle",
    type: "number",
    defaultValue: "15",
    description:
      "Per-card rotation in open mode, clamped between 0 and 30 degrees.",
  },
  {
    prop: "stackOffset",
    type: "number",
    defaultValue: "8",
    description:
      "Pixel offset applied per depth level in stack mode, clamped between 0 and 32.",
  },
  {
    prop: "aria-label / aria-labelledby",
    type: "string",
    defaultValue: '"Card stack"',
    description:
      "Accessible name of the focusable group. Always pass one that describes the content.",
  },
];
