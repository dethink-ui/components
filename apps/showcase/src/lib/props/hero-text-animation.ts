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
    type: '"stagger-words" | "masked-curtain" | "typewriter" | "scramble-decrypt" | "rotating-keyword" | "gradient-highlight"',
    defaultValue: '"stagger-words"',
    description:
      "Animation style. Use staggered words for the safest default, masked curtain for line-by-line reveals, typewriter for short developer/product hero copy, scramble-decrypt for deterministic decorative glyph resolution, rotating-keyword for a stable sentence with a decorative swapping slot, or gradient-highlight for a one-shot tokenized highlight sweep over a complete phrase.",
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
    prop: "showCaret",
    type: "boolean",
    defaultValue: "true",
    description:
      "Shows a decorative typewriter caret while typing. The caret is removed after completion and never loops.",
  },
  {
    prop: "repeat",
    type: "boolean",
    defaultValue: "false",
    description:
      "Replays the decorative visual animation after it completes. Keep it off for static content and enable it for demos or controlled preview surfaces.",
  },
  {
    prop: "repeatDelay",
    type: "number",
    defaultValue: "1.8",
    description:
      "Delay in seconds before an enabled repeat starts the animation again. Reduced-motion rendering never schedules repeats.",
  },
  {
    prop: "rotatingKeywordOptions",
    type: "readonly string[]",
    defaultValue: "[text]",
    description:
      "Keyword or short phrase options for the rotating-keyword visual slot. The slot reserves the longest option so the headline layout stays stable.",
  },
  {
    prop: "rotatingKeywordPrefix / rotatingKeywordSuffix",
    type: "string",
    defaultValue: '"" / ""',
    description:
      "Visible decorative text rendered before and after the keyword slot. Keep text as the complete stable sentence for assistive technology.",
  },
  {
    prop: "rotatingKeywordIndex / defaultRotatingKeywordIndex",
    type: "number",
    defaultValue: "undefined / 0",
    description:
      "Controls or initializes the active keyword. Use rotatingKeywordIndex with onRotatingKeywordIndexChange for manual selectors.",
  },
  {
    prop: "autoRotateKeywords / rotatingKeywordInterval",
    type: "boolean / number",
    defaultValue: "false / 1.6",
    description:
      "Opt-in keyword auto rotation. Timers are bounded and stop within five seconds; reduced-motion rendering never schedules them.",
  },
  {
    prop: "delay / duration / stagger",
    type: "number",
    defaultValue:
      "0.05 / 0.48 / 0.045; typewriter duration 1.1; scramble duration 1.2; rotating keyword duration 0.34; gradient highlight duration 0.9",
    description:
      "Timing controls in seconds. Typewriter, scramble-decrypt, and gradient-highlight use duration as bounded total reveal time. Scramble-decrypt caps updates so it cannot run indefinitely or exceed three updates per second. Gradient-highlight runs once by default and uses the shared repeat mechanism only when repeat is enabled.",
  },
  {
    prop: "HeroTextAnimationProvider",
    type: 'reducedMotion?: "user" | "always" | "never"',
    defaultValue: '"user"',
    description:
      "Wraps examples or app surfaces with MotionConfig and a testable reduced-motion override.",
  },
];
