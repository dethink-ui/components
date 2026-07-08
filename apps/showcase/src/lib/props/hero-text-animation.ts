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
    type: '"stagger-words" | "masked-curtain" | "typewriter" | "scramble-decrypt" | "rotating-keyword" | "gradient-highlight" | "blur-focus" | "kinetic-emphasis-pop"',
    defaultValue: '"stagger-words"',
    description:
      "Animation style. Use staggered words for the safest default, masked curtain for line-by-line reveals, typewriter for short developer/product hero copy, scramble-decrypt for deterministic decorative glyph resolution, rotating-keyword for a stable sentence with a decorative swapping slot, gradient-highlight for a one-shot tokenized highlight sweep over a complete phrase, blur-focus for short cinematic hero headings that resolve quickly into crisp readable text, or kinetic-emphasis-pop for one or two statically emphasized words with a subtle one-shot scale accent.",
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
    prop: "emphasisWords",
    type: "readonly string[]",
    defaultValue: "[]",
    description:
      "Word terms to emphasize for kinetic-emphasis-pop. Matching is case-insensitive and ignores surrounding punctuation. The component uses the first two resolved words.",
  },
  {
    prop: "emphasisWordIndices",
    type: "readonly number[]",
    defaultValue: "[]",
    description:
      "Zero-based word indices to emphasize for kinetic-emphasis-pop. Indices resolve before emphasisWords so precise targeting can override repeated terms.",
  },
  {
    prop: "delay / duration / stagger",
    type: "number",
    defaultValue:
      "0.05 / 0.48 / 0.045; typewriter duration 1.1; scramble duration 1.2; rotating keyword duration 0.34; gradient highlight duration 0.9; blur focus duration 0.42; kinetic emphasis duration 0.42",
    description:
      "Timing controls in seconds. Typewriter, scramble-decrypt, gradient-highlight, blur-focus, and kinetic-emphasis-pop use duration as bounded total reveal time. Scramble-decrypt caps updates so it cannot run indefinitely or exceed three updates per second. Gradient-highlight, blur-focus, and kinetic-emphasis-pop run once by default and use the shared repeat mechanism only when repeat is enabled.",
  },
  {
    prop: "blur-focus content guidance",
    type: "short hero heading",
    defaultValue: "—",
    description:
      "Limit blur-focus to short cinematic headings, ideally one line or under eight words. Do not combine the same heading with scale, parallax, or rotation; the component uses only small blur, opacity, and vertical translation, then finishes at blur(0px).",
  },
  {
    prop: "kinetic-emphasis-pop content guidance",
    type: "one or two important words",
    defaultValue: "—",
    description:
      "Use kinetic emphasis for one or two words whose importance is also clear from static styling. Reduced motion removes scale animation and keeps the color, weight, and underline emphasis.",
  },
  {
    prop: "HeroTextAnimationProvider",
    type: 'reducedMotion?: "user" | "always" | "never"',
    defaultValue: '"user"',
    description:
      "Wraps examples or app surfaces with MotionConfig and a testable reduced-motion override.",
  },
];
