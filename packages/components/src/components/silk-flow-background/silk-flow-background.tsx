"use client";

import { forwardRef } from "react";
import { ShaderBackground } from "../shader-backgrounds/shader-background";
import type { ShaderBackgroundProps } from "../shader-backgrounds/types";

export type SilkFlowBackgroundProps = ShaderBackgroundProps;

/** Satin folds flow across the surface with gentle directional lighting. */
export const SilkFlowBackground = forwardRef<
  HTMLDivElement,
  SilkFlowBackgroundProps
>(function SilkFlowBackground(props, ref) {
  return <ShaderBackground {...props} ref={ref} effect="silk-flow" />;
});
