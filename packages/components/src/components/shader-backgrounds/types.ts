import type { HTMLAttributes } from "react";

export type ShaderBackgroundEffect =
  | "liquid-mesh"
  | "silk-flow"
  | "caustic-light"
  | "contour-field"
  | "orbital-glow";

export interface ShaderBackgroundProps extends HTMLAttributes<HTMLDivElement> {
  /** False uses the static CSS composition and allocates no WebGL context. */
  animate?: boolean;
  speed?: "slow" | "normal" | "fast";
  intensity?: "faint" | "subtle" | "bold";
  /** Finite seeds choose a repeatable initial composition. */
  seed?: number;
  /** Gentle mouse parallax. Off by default; never captures touch input. */
  interactive?: boolean;
}

export function bufferSize(
  width: number,
  height: number,
  dpr: number,
  limit = 4096,
) {
  if (
    ![width, height, dpr, limit].every(Number.isFinite) ||
    width <= 0 ||
    height <= 0 ||
    limit < 1
  )
    return null;
  const scale = Math.min(
    Math.max(dpr, 0.5),
    1.5,
    Math.sqrt(1_000_000 / (width * height)),
    limit / width,
    limit / height,
  );
  return [
    Math.max(1, Math.floor(width * scale)),
    Math.max(1, Math.floor(height * scale)),
  ] as const;
}

export const backgroundSpeeds = { slow: 0.35, normal: 0.65, fast: 1 };
export const backgroundIntensities = { faint: 0.3, subtle: 0.6, bold: 0.9 };
