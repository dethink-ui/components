"use client";

import { forwardRef } from "react";
import { ShaderBackground } from "../shader-backgrounds/shader-background";
import type { ShaderBackgroundProps } from "../shader-backgrounds/types";

export type CausticLightBackgroundProps = ShaderBackgroundProps;

/** Moving water-like ridges cast a field of caustic light. */
export const CausticLightBackground = forwardRef<
  HTMLDivElement,
  CausticLightBackgroundProps
>(function CausticLightBackground(props, ref) {
  return <ShaderBackground {...props} ref={ref} effect="caustic-light" />;
});
