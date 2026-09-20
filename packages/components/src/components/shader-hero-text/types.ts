import type { HTMLAttributes } from "react";

export const shaderHeroTextAnimations = [
  "liquid-ripple",
  "chromatic-refraction",
  "noise-dissolve",
  "wave-distortion",
  "liquid-metal",
  "particle-follow",
] as const;

export type ShaderHeroTextAnimation = (typeof shaderHeroTextAnimations)[number];
export type ShaderHeroTextElement = "h1" | "h2" | "p" | "span";
export type ShaderHeroTextTrigger = "mount" | "in-view" | "manual";

export interface ShaderHeroTextProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "children" | "aria-label" | "onAnimationStart"
> {
  text: string;
  as?: ShaderHeroTextElement;
  ariaLabel?: string;
  animation?: ShaderHeroTextAnimation;
  trigger?: ShaderHeroTextTrigger;
  active?: boolean;
  delay?: number;
  /** Seconds. One-shot effects: 0–5; particle return: 0–2. */
  duration?: number;
  intensity?: number;
  seed?: number;
  replayKey?: string | number;
  reducedMotion?: "user" | "always";
  onAnimationStart?: () => void;
  onAnimationComplete?: () => void;
}

export function bounded(
  value: number | undefined,
  fallback: number,
  max: number,
) {
  return Number.isFinite(value) ? Math.min(max, Math.max(0, value!)) : fallback;
}
