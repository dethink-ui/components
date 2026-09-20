"use client";

import { forwardRef } from "react";
import { ShaderBackground } from "../shader-backgrounds/shader-background";
import type { ShaderBackgroundProps } from "../shader-backgrounds/types";

export type LiquidMeshBackgroundProps = ShaderBackgroundProps;

/** Soft pools of color drift and blend behind your content. */
export const LiquidMeshBackground = forwardRef<
  HTMLDivElement,
  LiquidMeshBackgroundProps
>(function LiquidMeshBackground(props, ref) {
  return <ShaderBackground {...props} ref={ref} effect="liquid-mesh" />;
});
