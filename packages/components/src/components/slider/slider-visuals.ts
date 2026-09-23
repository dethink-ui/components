import { createContext, type ComponentType } from "react";

/** Internal decoration bridge: the base registry never imports Motion. */
export interface SliderDecorationProps {
  dragging: boolean;
  active: boolean;
  milestone?: number;
  className: string;
}
export const SliderDecorationContext =
  createContext<ComponentType<SliderDecorationProps> | null>(null);
