import type { PropRow } from "@/components/props-table";

export const dotMatrixBackgroundProps: PropRow[] = [
  {
    prop: "animate",
    type: "boolean",
    defaultValue: "true",
    description:
      "Set to false to force the static composition regardless of OS motion preference: the dot field with one soft highlight at the first seeded origin, with no animation loops mounted.",
  },
  {
    prop: "interactive",
    type: "boolean",
    defaultValue: "true",
    description:
      "Enables the pointer-following glow when mode is follow. The enhancement only responds to a mouse pointer and is disabled for touch, reduced motion, and offscreen content. Set to false to keep the selected non-interactive composition.",
  },
  {
    prop: "mode",
    type: '"pulse" | "follow"',
    defaultValue: '"pulse"',
    description:
      "pulse loops three seeded brightness ripples through the dot field. follow replaces the loop with one brighter, aligned patch that trails the mouse while it is over the background.",
  },
  {
    prop: "density",
    type: '"sparse" | "normal" | "dense"',
    defaultValue: '"normal"',
    description:
      "Dot spacing (48/32/20px). The pulse overlays reuse the same pattern, so alignment holds at every density.",
  },
  {
    prop: "intensity",
    type: '"faint" | "subtle" | "bold"',
    defaultValue: '"subtle"',
    description:
      "Opacity tier for the base dot field. Keep faint or subtle under body copy; bold is for short hero statements.",
  },
  {
    prop: "speed",
    type: '"slow" | "normal" | "fast"',
    defaultValue: '"normal"',
    description:
      "Pulse cycle duration (7/5/3s). Pulses stagger from seeded delays and pause automatically while the background is offscreen.",
  },
  {
    prop: "tone",
    type: '"foreground" | "muted" | "primary"',
    defaultValue: '"muted"',
    description:
      "Semantic token driving the dot and pulse color via currentColor, so light and dark mode adapt automatically.",
  },
  {
    prop: "seed",
    type: "number",
    defaultValue: "1",
    description:
      "Drives the three pulse origins and their stagger deterministically, so markup is SSR-stable across server and client renders.",
  },
  {
    prop: "children",
    type: "ReactNode",
    defaultValue: "—",
    description:
      "Hero content rendered in the content slot above the aria-hidden decorative layer. The layer is pointer-events-none, so children stay fully interactive.",
  },
  {
    prop: "getDotMatrixBackgroundMotionConfig / getDotMatrixBackgroundGeometry / *ClassNames helpers",
    type: "(speed, reducedMotion) => config, (seed) => pulses, ({ className }) => string",
    defaultValue: "—",
    description:
      "Open-code escape hatches: read the resolved pulse transition, reuse the seeded pulse origins, or apply the root, layer, and content class recipes to custom elements.",
  },
];
