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
    type: '"flat" | "tilt" | "floor" | "fan" | "arc" | "ribbon"',
    defaultValue: '"flat"',
    description:
      "Flat slides, legacy tilt/floor staging, a fanned deck, a curved image gallery, or an alternating tilted ribbon. New modes make inactive slides inert.",
  },
  {
    prop: "intensity",
    type: '"subtle" | "standard" | "dramatic"',
    defaultValue: '"standard"',
    description:
      "Scales rotation in angled modes without changing the control model. Narrow containers reduce angles automatically.",
  },
  {
    prop: "inactiveBlur",
    type: "number (0–4 pixels)",
    defaultValue: "fan/ribbon: 1.5; arc: 0.5",
    description:
      "Controls blur of inactive cards in fan, arc and ribbon independently of intensity. Set 0 for crisp previews. Active cards are always sharp; legacy modes retain their existing treatment.",
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
