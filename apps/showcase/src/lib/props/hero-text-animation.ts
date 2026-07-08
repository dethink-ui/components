import type { PropRow } from "@/components/props-table";

export const heroTextAnimationProps: PropRow[] = [
  {
    prop: "text",
    type: "string",
    defaultValue: "—",
    description:
      "Final hero copy. It is rendered as stable accessible text and split only for the visual animation layer.",
  },
  {
    prop: "animation",
    type: '"stagger-words"',
    defaultValue: '"stagger-words"',
    description:
      "Animation style. This first slice ships the production default staggered word and line reveal.",
  },
  {
    prop: "as",
    type: '"h1" | "h2" | "p" | "span"',
    defaultValue: '"h1"',
    description:
      "Semantic element for the root. Use h1 or h2 for actual hero headings.",
  },
  {
    prop: "ariaLabel",
    type: "string",
    defaultValue: "text",
    description:
      "Stable label announced by assistive technology when the visual fragments need different copy.",
  },
  {
    prop: "splitBy",
    type: '"word" | "line"',
    defaultValue: '"word"',
    description:
      "Controls whether the visual layer staggers each word or explicit newline-delimited lines.",
  },
  {
    prop: "trigger",
    type: '"mount" | "in-view" | "manual"',
    defaultValue: '"mount"',
    description:
      "Runs on mount, when the hero enters the viewport, or from the controlled active state.",
  },
  {
    prop: "reducedMotionStrategy",
    type: '"static" | "opacity-only"',
    defaultValue: '"opacity-only"',
    description:
      "Controls the fallback when reduced motion is active. Transform motion is removed either way.",
  },
  {
    prop: "delay / duration / stagger",
    type: "number",
    defaultValue: "0.05 / 0.48 / 0.045",
    description:
      "Timing controls in seconds. Defaults keep normal hero copy readable in under one second.",
  },
  {
    prop: "HeroTextAnimationProvider",
    type: 'reducedMotion?: "user" | "always" | "never"',
    defaultValue: '"user"',
    description:
      "Wraps examples or app surfaces with MotionConfig and a testable reduced-motion override.",
  },
];
