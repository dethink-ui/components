import type { PropRow } from "@/components/props-table";

export const auroraBackgroundProps: PropRow[] = [
  {
    prop: "animate",
    type: "boolean",
    defaultValue: "true",
    description:
      "Set to false to force the static composition regardless of OS motion preference: every ribbon frozen at its seeded offset with layered opacities, no animation loops mounted.",
  },
  {
    prop: "density",
    type: '"sparse" | "normal" | "dense"',
    defaultValue: '"normal"',
    description:
      "Ribbon count (3/4/5). Sparser skies read calmer; denser ones fill tall heroes with more overlapping light.",
  },
  {
    prop: "intensity",
    type: '"faint" | "subtle" | "bold"',
    defaultValue: '"subtle"',
    description:
      "Opacity tier for the ribbon layer. Keep faint or subtle under body copy; bold is for short hero statements.",
  },
  {
    prop: "speed",
    type: '"slow" | "normal" | "fast"',
    defaultValue: '"normal"',
    description:
      "Drift cycle duration (32/22/14s per mirrored pass), jittered per ribbon by the seed. Loops pause automatically while the background is offscreen.",
  },
  {
    prop: "tone",
    type: '"foreground" | "muted" | "primary"',
    defaultValue: '"primary"',
    description:
      "Semantic token driving the ribbon colors via currentColor. Each ribbon slot hue-rotates that color in OKLCH through CSS relative color syntax, so one token yields a multi-hue aurora that adapts to light and dark mode; browsers without relative color syntax fall back to a designed mono-hue composition.",
  },
  {
    prop: "seed",
    type: "number",
    defaultValue: "1",
    description:
      "Drives all pseudo-random ribbon placement and timing jitter deterministically. The same seed renders the same layout on the server and every client, so markup is SSR-stable; change it to reshuffle the sky.",
  },
  {
    prop: "children",
    type: "ReactNode",
    defaultValue: "—",
    description:
      "Hero content rendered in the content slot above the aria-hidden decorative layer. The layer is pointer-events-none, so children stay fully interactive.",
  },
  {
    prop: "getAuroraBackgroundMotionConfig / getAuroraBackgroundGeometry / auroraBackgroundHueShifts / *ClassNames helpers",
    type: "(speed, reducedMotion) => config, (seed, density) => ribbons, readonly number[], ({ className }) => string",
    defaultValue: "—",
    description:
      "Open-code escape hatches: read the resolved drift transitions, reuse the seeded ribbon geometry, inspect the literal per-slot hue-shift map, or apply the root, layer, and content class recipes to custom elements.",
  },
];
