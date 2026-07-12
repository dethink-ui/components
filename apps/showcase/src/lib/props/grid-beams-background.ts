import type { PropRow } from "@/components/props-table";

export const gridBeamsBackgroundProps: PropRow[] = [
  {
    prop: "animate",
    type: "boolean",
    defaultValue: "true",
    description:
      "Set to false to force the static composition regardless of OS motion preference: the grid plus two frozen beam segments, with no animation loops mounted.",
  },
  {
    prop: "density",
    type: '"sparse" | "normal" | "dense"',
    defaultValue: '"normal"',
    description:
      "Grid cell size (96/56/32px) and beam count (3/5/7). Denser grids suit tighter, more technical compositions.",
  },
  {
    prop: "intensity",
    type: '"faint" | "subtle" | "bold"',
    defaultValue: '"subtle"',
    description:
      "Opacity tier for the grid pattern. Keep faint or subtle under body copy; bold is for short hero statements.",
  },
  {
    prop: "speed",
    type: '"slow" | "normal" | "fast"',
    defaultValue: '"normal"',
    description:
      "Beam traversal duration (9/6/3.5s per sweep). Loops pause automatically while the background is offscreen.",
  },
  {
    prop: "tone",
    type: '"foreground" | "muted" | "primary"',
    defaultValue: '"muted"',
    description:
      "Semantic token driving the grid and beam color via currentColor, so light and dark mode adapt automatically.",
  },
  {
    prop: "seed",
    type: "number",
    defaultValue: "1",
    description:
      "Drives all pseudo-random beam placement deterministically. The same seed renders the same layout on the server and every client, so markup is SSR-stable; change it to reshuffle the beams.",
  },
  {
    prop: "children",
    type: "ReactNode",
    defaultValue: "—",
    description:
      "Hero content rendered in the content slot above the aria-hidden decorative layer. The layer is pointer-events-none, so children stay fully interactive.",
  },
  {
    prop: "getGridBeamsBackgroundMotionConfig / getGridBeamsBackgroundGeometry / *ClassNames helpers",
    type: "(speed, reducedMotion) => config, (seed, density) => beams, ({ className }) => string",
    defaultValue: "—",
    description:
      "Open-code escape hatches: read the resolved loop transition, reuse the seeded beam geometry, or apply the root, layer, and content class recipes to custom elements.",
  },
];
