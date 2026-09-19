"use client";

import { forwardRef } from "react";
import { ShaderBackground } from "../shader-backgrounds/shader-background";
import type { ShaderBackgroundProps } from "../shader-backgrounds/types";

export type OrbitalGlowBackgroundProps = ShaderBackgroundProps;

/** Luminous elliptical rings surround a soft, slowly shifting core. */
export const OrbitalGlowBackground = forwardRef<
  HTMLDivElement,
  OrbitalGlowBackgroundProps
>(function OrbitalGlowBackground(props, ref) {
  return <ShaderBackground {...props} ref={ref} effect="orbital-glow" />;
});
