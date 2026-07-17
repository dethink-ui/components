import type { PropRow } from "@/components/props-table";

export const carouselProps: PropRow[] = [
  {
    prop: "children",
    type: "CarouselContent + optional controls",
    defaultValue: "—",
    description:
      "Place one CarouselContent directly inside the root. Navigation controls and dots can sit alongside it.",
  },
  {
    prop: "staging",
    type: '"flat" | "tilt" | "floor"',
    defaultValue: '"flat"',
    description:
      "Conventional centered slides, a perspective row, or a receding floor stage.",
  },
  {
    prop: "intensity",
    type: '"subtle" | "standard" | "dramatic"',
    defaultValue: '"standard"',
    description:
      "Scales the depth and rotation in tilt and floor staging without changing the control model.",
  },
  {
    prop: "index",
    type: "number",
    defaultValue: "—",
    description:
      "Controlled active slide index. Pair with onIndexChange to synchronize application state.",
  },
  {
    prop: "defaultIndex",
    type: "number",
    defaultValue: "0",
    description: "Initial active index for uncontrolled use.",
  },
  {
    prop: "onIndexChange",
    type: "(index: number) => void",
    defaultValue: "—",
    description:
      "Fires after controls, dots, keyboard navigation, or a settled drag choose a different slide.",
  },
  {
    prop: "drag",
    type: "boolean",
    defaultValue: "true",
    description:
      "Enables mouse and touch drag when more than one slide is present.",
  },
  {
    prop: "aria-label / aria-labelledby",
    type: "string",
    defaultValue: "—",
    description:
      "Required accessible name for the carousel region. Name the content, not the visual effect.",
  },
];

export const carouselContentProps: PropRow[] = [
  {
    prop: "children",
    type: "CarouselItem | CarouselItem[]",
    defaultValue: "—",
    description:
      "Direct slide children. Each item gains slide semantics, an ordinal label, and inert behavior when it leaves the visible stage.",
  },
  {
    prop: "className / style",
    type: "string / CSSProperties",
    defaultValue: "—",
    description:
      "Use the viewport to adjust layout. The carousel exposes CSS variables for its card size and spacing tokens.",
  },
];

export const carouselDotsProps: PropRow[] = [
  {
    prop: "label",
    type: "(index: number) => string",
    defaultValue: '"Go to slide {n}"',
    description:
      "Returns an accessible destination label for each pagination button.",
  },
];
