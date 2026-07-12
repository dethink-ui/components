import type { PropRow } from "@/components/props-table";

export const starfieldBackgroundProps: PropRow[] = [
  {
    prop: "animate",
    type: "boolean",
    defaultValue: "true",
    description:
      "Set to false to force the static composition regardless of OS motion preference: every star still, twinkles at mid brightness, and no drift or pointer parallax mounted.",
  },
  {
    prop: "interactive",
    type: "boolean",
    defaultValue: "true",
    description:
      "Enables pointer parallax: layers ease toward the cursor via spring-smoothed motion values with depth increasing from the far to the near layer (3/6/10px). Automatically disabled under reduced motion. Reflected as data-interactive.",
  },
  {
    prop: "density",
    type: '"sparse" | "normal" | "dense"',
    defaultValue: '"normal"',
    description:
      "Star count per layer (50/82/124 total stars plus twinkles). The far layer always carries the most, smallest stars.",
  },
  {
    prop: "intensity",
    type: '"faint" | "subtle" | "bold"',
    defaultValue: '"subtle"',
    description:
      "Opacity tier for the stars. Keep faint or subtle under body copy; bold suits dark, short hero statements.",
  },
  {
    prop: "speed",
    type: '"slow" | "normal" | "fast"',
    defaultValue: '"normal"',
    description:
      "Scales the per-layer drift loop durations (base 120/90/60s, mirrored). The far layer always drifts slowest, which creates the parallax. Loops pause automatically while the background is offscreen.",
  },
  {
    prop: "tone",
    type: '"foreground" | "muted" | "primary"',
    defaultValue: '"muted"',
    description:
      "Semantic token driving the star color via currentColor, so light and dark mode adapt automatically.",
  },
  {
    prop: "seed",
    type: "number",
    defaultValue: "1",
    description:
      "Drives every star and twinkle position deterministically, so markup is SSR-stable across server and client renders; change it for a different sky.",
  },
  {
    prop: "children",
    type: "ReactNode",
    defaultValue: "—",
    description:
      "Hero content rendered in the content slot above the aria-hidden decorative layer. The layer is pointer-events-none, so children stay fully interactive.",
  },
  {
    prop: "getStarfieldBackgroundMotionConfig / getStarfieldBackgroundGeometry / *ClassNames helpers",
    type: "(speed, reducedMotion) => config, (seed, density) => layers, ({ className }) => string",
    defaultValue: "—",
    description:
      "Open-code escape hatches: read the drift durations and parallax depths, reuse the seeded star geometry, or apply the root, layer, and content class recipes to custom elements.",
  },
];
