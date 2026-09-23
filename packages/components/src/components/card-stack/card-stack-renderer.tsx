import { createContext, type ComponentType, type HTMLAttributes } from "react";

/** Internal rendering seam shared by the CSS and optional animated variants. */
export interface CardStackFrameProps extends HTMLAttributes<HTMLDivElement> {
  inert?: boolean;
  frame: {
    active: boolean;
    visible: boolean;
    direction: number;
    count: number;
  };
}

export interface CardStackDeckProps extends HTMLAttributes<HTMLDivElement> {
  navigation: { previous: () => void; next: () => void; activeIndex: number };
}

export const CardStackRendererContext = createContext<{
  Frame: ComponentType<CardStackFrameProps>;
  Deck: ComponentType<CardStackDeckProps>;
} | null>(null);

export function StaticCardStackFrame({
  frame: _frame,
  ...props
}: CardStackFrameProps) {
  void _frame;
  return <div {...props} />;
}

export function StaticCardStackDeck({
  navigation: _navigation,
  ...props
}: CardStackDeckProps) {
  void _navigation;
  return <div {...props} />;
}
