import type { PropRow } from "@/components/props-table";

export const scanGridBackgroundProps: PropRow[] = [
  {
    prop: "animate",
    type: "boolean",
    defaultValue: "true",
    description:
      "Set to false to force the static composition regardless of OS motion preference: the band frozen at its seeded position at reduced opacity, with no animation loops mounted.",
  },
  {
    prop: "direction",
    type: '"vertical" | "horizontal"',
    defaultValue: '"vertical"',
    description:
      "Sweep axis for the scan band. Vertical sweeps top to bottom; horizontal sweeps left to right. Reflected as data-direction for CSS targeting.",
  },
  {
    prop: "density",
    type: '"sparse" | "normal" | "dense"',
    defaultValue: '"normal"',
    description:
      "Grid cell size (96/56/32px). Denser grids read as more technical; the band lights more lines per sweep.",
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
      "Sweep duration and pause between sweeps (12s/2.5s, 8s/1.5s, 5s/0.75s). Loops pause automatically while the background is offscreen.",
  },
  {
    prop: "tone",
    type: '"foreground" | "muted" | "primary"',
    defaultValue: '"muted"',
    description:
      "Semantic token driving the grid and band color via currentColor, so light and dark mode adapt automatically.",
  },
  {
    prop: "seed",
    type: "number",
    defaultValue: "1",
    description:
      "Drives the sweep's start delay and the frozen band position deterministically, so markup is SSR-stable across server and client renders.",
  },
  {
    prop: "children",
    type: "ReactNode",
    defaultValue: "—",
    description:
      "Hero content rendered in the content slot above the aria-hidden decorative layer. The layer is pointer-events-none, so children stay fully interactive.",
  },
  {
    prop: "getScanGridBackgroundMotionConfig / getScanGridBackgroundGeometry / *ClassNames helpers",
    type: "(speed, reducedMotion) => config, (seed) => geometry, ({ className }) => string",
    defaultValue: "—",
    description:
      "Open-code escape hatches: read the resolved sweep transition, reuse the seeded delay and frozen offset, or apply the root, layer, and content class recipes to custom elements.",
  },
];
