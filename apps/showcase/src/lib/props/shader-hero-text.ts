import type { PropRow } from "@/components/props-table";

export const shaderHeroTextProps: PropRow[] = [
  {
    prop: "text",
    type: "string",
    defaultValue: "—",
    description:
      "Complete semantic heading. Supports explicit newlines and measured browser wrapping.",
  },
  {
    prop: "animation",
    type: '"liquid-ripple" | "chromatic-refraction" | "noise-dissolve" | "wave-distortion" | "liquid-metal" | "particle-follow"',
    defaultValue: '"liquid-ripple"',
    description: "Five one-shot shaders and one interactive particle effect.",
  },
  {
    prop: "as / ariaLabel",
    type: '"h1" | "h2" | "p" | "span" / string',
    defaultValue: '"h1" / undefined',
    description: "Semantic root and optional accessible label override.",
  },
  {
    prop: "trigger / active",
    type: '"mount" | "in-view" | "manual" / boolean',
    defaultValue: '"in-view" / true',
    description:
      "Activation strategy. All effects suspend offscreen; active=false disables rendering. Toggle active for manual activation.",
  },
  {
    prop: "duration",
    type: "number",
    defaultValue: "1.2–1.8",
    description:
      "Seconds, bounded to 0–5 for one-shots. Particle return defaults to 1.2 seconds and is bounded to 0–2; zero returns immediately.",
  },
  {
    prop: "delay",
    type: "number",
    defaultValue: "0",
    description:
      "One-shot delay in seconds, bounded to 0–5. Particle following responds directly to input.",
  },
  {
    prop: "intensity / seed",
    type: "number / number",
    defaultValue: "0.5 / 0",
    description:
      "Intensity is bounded to 0–1. Seed makes noise and particle offsets repeatable.",
  },
  {
    prop: "replayKey",
    type: "string | number",
    defaultValue: "undefined",
    description:
      "Change to replay a one-shot effect or reset particles to their formed letters.",
  },
  {
    prop: "reducedMotion",
    type: '"user" | "always"',
    defaultValue: '"user"',
    description:
      "Always respects the OS preference. Use always to request static HTML explicitly.",
  },
  {
    prop: "onAnimationStart / onAnimationComplete",
    type: "() => void",
    defaultValue: "undefined",
    description:
      "One-shot start/completion, or particle following-start/return-completion. Cancellation, reset and fallback never emit completion.",
  },
];
