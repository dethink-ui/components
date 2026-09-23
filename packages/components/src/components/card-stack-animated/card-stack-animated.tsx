import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useRef,
} from "react";
import { useReducedMotion } from "motion/react";
import { animate } from "motion/mini";
import { CardStack, type CardStackProps } from "../card-stack";
import {
  CardStackRendererContext,
  type CardStackDeckProps,
  type CardStackFrameProps,
} from "../card-stack/card-stack-renderer";

export interface CardStackAnimatedProps extends CardStackProps {
  /** Opt in to horizontal touch/pen navigation. Buttons remain available. */
  swipe?: boolean;
}

const SwipeContext = createContext(false);

function AnimatedDeck({ navigation, style, ...props }: CardStackDeckProps) {
  const swipe = useContext(SwipeContext);
  const gesture = useRef<{
    id: number;
    x: number;
    y: number;
    horizontal: boolean;
  } | null>(null);
  const suppressClick = useRef(false);
  useEffect(() => {
    gesture.current = null;
  }, [navigation.activeIndex, swipe]);
  return (
    <div
      {...props}
      style={{
        ...style,
        ...(swipe ? { touchAction: "pan-y pinch-zoom" } : {}),
      }}
      onPointerDown={(event) => {
        suppressClick.current = false;
        gesture.current = null;
        if (
          !swipe ||
          !event.isPrimary ||
          event.pointerType === "mouse" ||
          event.button !== 0
        )
          return;
        if (
          (event.target as Element).closest(
            "a,button,input,textarea,select,[contenteditable],[role='button'],[data-card-stack-no-swipe]",
          )
        )
          return;
        if (window.getSelection()?.isCollapsed === false) return;
        gesture.current = {
          id: event.pointerId,
          x: event.clientX,
          y: event.clientY,
          horizontal: false,
        };
      }}
      onPointerMove={(event) => {
        const start = gesture.current;
        if (!start || start.id !== event.pointerId) return;
        const dx = event.clientX - start.x;
        const dy = event.clientY - start.y;
        if (
          window.getSelection()?.isCollapsed === false ||
          Math.abs(dy) > Math.max(12, Math.abs(dx))
        ) {
          gesture.current = null;
          return;
        }
        if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 1.5)
          start.horizontal = true;
      }}
      onPointerUp={(event) => {
        const start = gesture.current;
        gesture.current = null;
        if (
          !start ||
          start.id !== event.pointerId ||
          !start.horizontal ||
          window.getSelection()?.isCollapsed === false
        )
          return;
        const dx = event.clientX - start.x;
        const dy = event.clientY - start.y;
        const threshold = Math.max(40, event.currentTarget.clientWidth * 0.16);
        if (Math.abs(dx) < threshold || Math.abs(dx) < Math.abs(dy) * 1.5)
          return;
        suppressClick.current = true;
        const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
        if (dx < 0 !== rtl) navigation.next();
        else navigation.previous();
      }}
      onPointerCancel={() => {
        gesture.current = null;
      }}
      onLostPointerCapture={() => {
        gesture.current = null;
      }}
      onClickCapture={(event) => {
        if (suppressClick.current) {
          event.preventDefault();
          event.stopPropagation();
          suppressClick.current = false;
        }
      }}
    />
  );
}

function AnimatedFrame({ frame, style, ...props }: CardStackFrameProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const wasActive = useRef(frame.active);

  useEffect(() => {
    const element = elementRef.current;
    const changed = wasActive.current !== frame.active;
    const leaving = wasActive.current && !frame.active;
    wasActive.current = frame.active;
    if (
      !element ||
      !element.animate ||
      !changed ||
      reducedMotion ||
      !frame.visible
    )
      return;
    const direction =
      frame.direction *
      (getComputedStyle(element).direction === "rtl" ? -1 : 1);
    let cancelled = false;
    const resting = "translateX(0px) rotate(0deg) scale(1)";
    const controls = animate(
      element,
      {
        transform: leaving
          ? [
              resting,
              `translateX(${-direction * 42}px) rotate(${-direction * 4}deg) scale(0.97)`,
              resting,
            ]
          : [
              `translateX(${direction * 24}px) rotate(${direction * 2}deg) scale(0.98)`,
              resting,
            ],
        opacity: leaving ? [1, 0.65, 1] : [0.8, 1],
      },
      {
        duration: 0.28,
        ease: [0.22, 1, 0.36, 1],
        ...(leaving ? { times: [0, 0.45, 1] } : {}),
      },
    );
    void controls.then(() => {
      if (cancelled) return;
      element.style.transform = "";
      element.style.opacity = "";
    });
    return () => {
      cancelled = true;
      controls.stop();
      element.style.transform = "";
      element.style.opacity = "";
    };
  }, [
    frame.active,
    frame.visible,
    frame.direction,
    frame.count,
    reducedMotion,
  ]);

  return <div {...props} ref={elementRef} style={style} />;
}

const renderer = { Frame: AnimatedFrame, Deck: AnimatedDeck };

/** Optional Motion-backed presentation; base CardStack retains CSS-only rendering. */
export const CardStackAnimated = forwardRef<
  HTMLDivElement,
  CardStackAnimatedProps
>(({ swipe = false, ...props }, ref) => (
  <SwipeContext.Provider value={swipe}>
    <CardStackRendererContext.Provider value={renderer}>
      <CardStack {...props} ref={ref} />
    </CardStackRendererContext.Provider>
  </SwipeContext.Provider>
));
CardStackAnimated.displayName = "CardStackAnimated";
