import type { PropRow } from "@/components/props-table";

export const lightStreaksBackgroundProps: PropRow[] = [
  {
    prop: "animate",
    type: "boolean",
    defaultValue: "true",
    description:
      "Set to false to force the static composition regardless of OS motion preference: one faint streak at its seeded position with blur retained, and no animation loops mounted.",
  },
  {
    prop: "density",
    type: '"sparse" | "normal" | "dense"',
    defaultValue: '"normal"',
    description:
      "Streak count (3/4/5). Streaks never move in lockstep — each has a seeded delay and pause.",
  },
  {
    prop: "intensity",
    type: '"faint" | "subtle" | "bold"',
    defaultValue: '"subtle"',
    description:
      "Opacity tier for the streaks. Keep faint or subtle under body copy; bold is for short hero statements on dark canvases.",
  },
  {
    prop: "speed",
    type: '"slow" | "normal" | "fast"',
    defaultValue: '"normal"',
    description:
      "Sweep cycle duration (10/7/4.5s). Loops pause automatically while the background is offscreen.",
  },
  {
    prop: "tone",
    type: '"foreground" | "muted" | "primary"',
    defaultValue: '"muted"',
    description:
      "Semantic token driving the streak color via currentColor, so light and dark mode adapt automatically.",
  },
  {
    prop: "seed",
    type: "number",
    defaultValue: "1",
    description:
      "Drives streak positions and stagger deterministically, so markup is SSR-stable across server and client renders; change it to reshuffle the streaks.",
  },
  {
    prop: "children",
    type: "ReactNode",
    defaultValue: "—",
    description:
      "Hero content rendered in the content slot above the aria-hidden decorative layer. The layer is pointer-events-none, so children stay fully interactive.",
  },
  {
    prop: "getLightStreaksBackgroundMotionConfig / getLightStreaksBackgroundGeometry / *ClassNames helpers",
    type: "(speed, reducedMotion) => config, (seed, density) => streaks, ({ className }) => string",
    defaultValue: "—",
    description:
      "Open-code escape hatches: read the resolved sweep transition, reuse the seeded streak layout, or apply the root, layer, and content class recipes to custom elements.",
  },
];
