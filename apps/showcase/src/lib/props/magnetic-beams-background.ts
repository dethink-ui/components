import type { PropRow } from "@/components/props-table";

export const magneticBeamsBackgroundProps: PropRow[] = [
  {
    prop: "animate",
    type: "boolean",
    defaultValue: "true",
    description:
      "Set to false to force the static composition regardless of OS motion preference: the grid plus two frozen beam segments, with no animation loops or pointer attraction mounted.",
  },
  {
    prop: "interactive",
    type: "boolean",
    defaultValue: "true",
    description:
      "Enables pointer attraction: while the pointer hovers the component, each beam springs along its rail toward the pointer (horizontal beams track x, vertical beams track y); on leave, each beam resumes its traversal from its current position. Set to false to keep the plain traversal loop.",
  },
  {
    prop: "mode",
    type: '"magnetic" | "follow"',
    defaultValue: '"magnetic"',
    description:
      "How beams approach the pointer. magnetic springs each beam onto the pointer's projection with velocity-preserving physics; follow travels there linearly at the beam's normal traversal speed, so the chase reads as steady motion instead of a snap.",
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
      "Beam traversal duration (9/6/3.5s per sweep), also used when a beam finishes its pass after the pointer leaves. Loops pause automatically while the background is offscreen.",
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
      "Hero content rendered in the content slot above the aria-hidden decorative layer. The layer is pointer-events-none, so children stay fully interactive while pointer moves are tracked on the root.",
  },
  {
    prop: "getMagneticBeamsBackgroundMotionConfig / getMagneticBeamsBackgroundGeometry / getMagneticBeamsBackgroundPointerProgress / getMagneticBeamsBackgroundFollowDuration / *ClassNames helpers",
    type: "(speed, reducedMotion) => config, (seed, density) => beams, (pointerFraction) => progress, (current, target, beamDuration) => seconds, ({ className }) => string",
    defaultValue: "—",
    description:
      "Open-code escape hatches: read the resolved loop and attraction transitions, reuse the seeded beam geometry, map a pointer position to a beam's pass progress, or apply the root, layer, and content class recipes to custom elements.",
  },
];
