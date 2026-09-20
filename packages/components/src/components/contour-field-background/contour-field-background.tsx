"use client";

import { forwardRef } from "react";
import { ShaderBackground } from "../shader-backgrounds/shader-background";
import type { ShaderBackgroundProps } from "../shader-backgrounds/types";

export type ContourFieldBackgroundProps = ShaderBackgroundProps;

/** Topographic contours evolve through a warped noise field. */
export const ContourFieldBackground = forwardRef<
  HTMLDivElement,
  ContourFieldBackgroundProps
>(function ContourFieldBackground(props, ref) {
  return <ShaderBackground {...props} ref={ref} effect="contour-field" />;
});
