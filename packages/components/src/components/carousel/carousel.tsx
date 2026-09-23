import {
  Children,
  createContext,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  version,
  type CSSProperties,
  type DragEvent,
  type ForwardedRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import {
  MotionConfig,
  animate,
  motion,
  useMotionValue,
  type AnimationPlaybackControls,
  type MotionValue,
} from "motion/react";
import { cn } from "../../utils/cn";
import { IconButton, type IconButtonProps } from "../icon-button";
import {
  clampIndex,
  clampWithRubberBand,
  getDragDirection,
  getSnapTarget,
  pxToIndexDelta,
} from "./carousel-utils";

// Bundlers replace this development flag; copied browser components do not
// otherwise need Node's ambient types.
declare const process: { env: { NODE_ENV?: string } };

export type CarouselStaging =
  "flat" | "tilt" | "floor" | "fan" | "arc" | "ribbon";
export type CarouselIntensity = "subtle" | "standard" | "dramatic";

// Motion owns the root element, so the same drag/animation handler names it
// binds must be omitted from the forwarded HTML props to avoid type clashes
// (mirrors the AuroraBackground convention).
type MotionBackedEventProps =
  | "onAnimationStart"
  | "onAnimationEnd"
  | "onAnimationIteration"
  | "onDrag"
  | "onDragStart"
  | "onDragEnd"
  | "onDragEnter"
  | "onDragLeave"
  | "onDragOver"
  | "onDragExit";

type MotionSafeDivProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  MotionBackedEventProps
>;

export interface CarouselProps extends MotionSafeDivProps {
  staging?: CarouselStaging;
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  drag?: boolean;
  intensity?: CarouselIntensity;
  /** Inactive-card blur in pixels (0–4). Does not affect the active card. */
  inactiveBlur?: number;
  children?: ReactNode;
}

export interface CarouselContextValue {
  offset: MotionValue<number>;
  count: number;
  index: number;
  staging: CarouselStaging;
  intensity: CarouselIntensity;
  reducedMotion: boolean;
  dragEnabled: boolean;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  scrollTo: (index: number) => void;
  scrollPrev: () => void;
  scrollNext: () => void;
  onDragStart: () => void;
  onDragSettle: (index: number) => void;
}

export interface UseCarouselReturn {
  index: number;
  count: number;
  staging: CarouselStaging;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  scrollPrev: () => void;
  scrollNext: () => void;
  scrollTo: (index: number) => void;
}

const CarouselContext = createContext<CarouselContextValue | null>(null);
const CarouselItemIndexContext = createContext<number>(0);

function subscribeToMotionPreference(callback: () => void) {
  const query = window.matchMedia?.("(prefers-reduced-motion: reduce)");
  query?.addEventListener("change", callback);
  return () => query?.removeEventListener("change", callback);
}
function getMotionPreference() {
  return (
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false
  );
}
function getServerMotionPreference() {
  return false;
}

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

// The OS reduced-motion preference is only trusted after hydration so the first
// client render matches the server exactly (mirrors AuroraBackground).
function useHasHydrated() {
  const [hasHydrated, setHasHydrated] = useState(false);
  useIsomorphicLayoutEffect(() => {
    setHasHydrated(true);
  }, []);
  return hasHydrated;
}

function useCarouselContext(component: string): CarouselContextValue {
  const context = useContext(CarouselContext);
  if (!context) {
    throw new Error(`${component} must be used within a <Carousel>.`);
  }
  return context;
}

export function useCarousel(): UseCarouselReturn {
  const {
    index,
    count,
    staging,
    canScrollPrev,
    canScrollNext,
    scrollPrev,
    scrollNext,
    scrollTo,
  } = useCarouselContext("useCarousel");
  return {
    index,
    count,
    staging,
    canScrollPrev,
    canScrollNext,
    scrollPrev,
    scrollNext,
    scrollTo,
  };
}

// The far plateau of the distance-driven transforms and the visible radius that
// governs inert-marking are both wider for the deeper stagings.
const stagingVisibleRadius: Record<CarouselStaging, number> = {
  flat: 0,
  tilt: 1,
  floor: 2,
  fan: 0,
  arc: 0,
  ribbon: 0,
};

// Rotate/depth multiplier written inline on the root; blur is switched off
// entirely at the calm end so the floor scene never blurs when subtle.
const intensityMultiplier: Record<CarouselIntensity, number> = {
  subtle: 0.6,
  standard: 1,
  dramatic: 1.4,
};

const carouselSpring = { type: "spring", stiffness: 90, damping: 18 } as const;
const dragThreshold = 10;
const clickSuppressionMs = 160;

const carouselRootClasses =
  "group/carousel relative isolate w-full text-foreground [container-type:inline-size] outline-none";

const carouselViewportClasses =
  "relative flex w-full justify-center rounded-[var(--dt-radius-lg)] py-[var(--carousel-viewport-pad-block)] [touch-action:pan-y] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background overflow-x-clip [overflow-y:visible] data-[drag=true]:cursor-grab data-[dragging=true]:cursor-grabbing data-[dragging=true]:select-none";

const carouselTrackClasses =
  "grid w-full items-end justify-items-center min-h-[var(--carousel-min-height)]";

// No permanent will-change: promoting every slide to a compositor layer for the
// carousel's lifetime is a standing GPU-memory cost. The tilt/floor staging
// rules already include an explicit translateZ() term in each item's transform
// (the Safari shimmer guard), which composites the 3D scenes when they need it;
// flat is purely 2D.
const carouselItemClasses =
  "relative [grid-area:1/1] w-[var(--carousel-card-size)] max-w-full [backface-visibility:hidden] motion-reduce:[transition:opacity_200ms_ease]";

const carouselShadowClasses =
  "pointer-events-none absolute bottom-0 left-1/2 -z-10 h-[var(--carousel-shadow-height)] w-[var(--carousel-shadow-width)] -translate-x-1/2 translate-y-[var(--carousel-shadow-offset)] rounded-[100%] bg-[var(--carousel-shadow-color)] blur-md";

const carouselDotsClasses = "flex items-center justify-center";

const carouselDotClasses =
  "group/dot flex size-11 shrink-0 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function carouselClassNames({
  className,
}: Pick<CarouselProps, "className"> = {}) {
  return cn(carouselRootClasses, className);
}

export function carouselViewportClassNames({
  className,
}: { className?: string } = {}) {
  return cn(carouselViewportClasses, className);
}

export function carouselTrackClassNames({
  className,
}: { className?: string } = {}) {
  return cn(carouselTrackClasses, className);
}

export function carouselItemClassNames({
  className,
}: { className?: string } = {}) {
  return cn(carouselItemClasses, className);
}

function ChevronLeftIcon() {
  return (
    <svg
      className="rtl:rotate-180"
      aria-hidden="true"
      fill="none"
      viewBox="0 0 16 16"
      stroke="currentColor"
    >
      <path
        d="M10 3.5 5.5 8l4.5 4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      className="rtl:rotate-180"
      aria-hidden="true"
      fill="none"
      viewBox="0 0 16 16"
      stroke="currentColor"
    >
      <path
        d="m6 3.5 4.5 4.5L6 12.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
    </svg>
  );
}

function findCarouselContent(children: ReactNode): ReactNode {
  let found: ReactNode = null;
  Children.forEach(children, (child) => {
    if (found) return;
    if (isValidElement(child) && child.type === CarouselContent) {
      found = child;
    }
  });
  return found;
}

function countSlides(children: ReactNode): number {
  const content = findCarouselContent(children);
  if (!isValidElement(content)) return 0;
  const contentChildren = (content.props as { children?: ReactNode }).children;
  return Children.toArray(contentChildren).filter(isValidElement).length;
}

export const Carousel = forwardRef(function Carousel(
  {
    children,
    className,
    staging = "flat",
    index,
    defaultIndex = 0,
    onIndexChange,
    drag = true,
    intensity = "standard",
    inactiveBlur,
    style,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
    ...props
  }: CarouselProps,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  const count = useMemo(() => countSlides(children), [children]);
  const isControlled = index !== undefined;
  const initialIndex = clampIndex(isControlled ? index : defaultIndex, count);

  const offset = useMotionValue(initialIndex);
  const [uncontrolledIndex, setUncontrolledIndex] = useState(initialIndex);
  const activeIndex = clampIndex(
    isControlled ? index : uncontrolledIndex,
    count,
  );

  const prefersReducedMotion = useSyncExternalStore(
    subscribeToMotionPreference,
    getMotionPreference,
    getServerMotionPreference,
  );
  const hasHydrated = useHasHydrated();
  const reducedMotion = hasHydrated && prefersReducedMotion === true;

  const [liveMessage, setLiveMessage] = useState("");
  const animationRef = useRef<AnimationPlaybackControls | null>(null);
  const dragEnabled = drag && count > 1;

  // Latest committed index, updated synchronously at commit so a microtask
  // scheduled from an event handler (which runs after React's sync flush but
  // before passive effects) can read the post-flush value.
  const committedIndexRef = useRef(activeIndex);
  useIsomorphicLayoutEffect(() => {
    committedIndexRef.current = activeIndex;
  });

  const animateOffsetTo = useCallback(
    (target: number) => {
      const clamped = clampIndex(target, count);
      animationRef.current?.stop();
      if (reducedMotion) {
        offset.jump(clamped);
        animationRef.current = null;
        return;
      }
      animationRef.current = animate(offset, clamped, carouselSpring);
    },
    [count, offset, reducedMotion],
  );

  // A single effect keeps the resting offset synced to the settled index for
  // control-driven changes and reduced-motion flips. User gestures update the
  // index below; this effect performs the actual spring/jump.
  useEffect(() => {
    animateOffsetTo(activeIndex);
    return () => animationRef.current?.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, reducedMotion]);

  const settle = useCallback(
    (target: number, announce: boolean) => {
      const clamped = clampIndex(target, count);
      const changed = clamped !== activeIndex;
      if (isControlled) {
        // Controlled: the consumer owns the index. After this event flushes,
        // spring the offset to whatever index is actually committed — if the
        // consumer accepted the change this targets the new index (the sync
        // effect does the same), and if it ignored or clamped the callback the
        // track still settles back onto the held integer instead of resting at
        // a fractional drag offset forever.
        queueMicrotask(() => animateOffsetTo(committedIndexRef.current));
      } else if (changed) {
        setUncontrolledIndex(clamped);
      } else {
        // Snapped back to the same slide: the effect will not re-run, so pull
        // the dragged offset back to the integer here.
        animateOffsetTo(clamped);
      }
      if (changed) onIndexChange?.(clamped);
      if (changed && announce) {
        setLiveMessage(`Slide ${clamped + 1} of ${count}`);
      }
    },
    [activeIndex, animateOffsetTo, count, isControlled, onIndexChange],
  );

  const scrollTo = useCallback(
    (target: number) => settle(target, true),
    [settle],
  );
  const scrollPrev = useCallback(
    () => scrollTo(activeIndex - 1),
    [activeIndex, scrollTo],
  );
  const scrollNext = useCallback(
    () => scrollTo(activeIndex + 1),
    [activeIndex, scrollTo],
  );

  const onDragStart = useCallback(() => {
    animationRef.current?.stop();
  }, []);
  const onDragSettle = useCallback(
    (target: number) => settle(target, false),
    [settle],
  );

  // Development-only nudge: a carousel without an accessible name is an
  // unlabeled region. Warn once after mount so SSR output stays clean.
  const warnedRef = useRef(false);
  useEffect(() => {
    if (
      process.env.NODE_ENV !== "production" &&
      !warnedRef.current &&
      !ariaLabel &&
      !ariaLabelledby
    ) {
      warnedRef.current = true;
      console.warn(
        "Carousel: provide an accessible name via `aria-label` or `aria-labelledby`.",
      );
    }
  }, [ariaLabel, ariaLabelledby]);

  const contextValue = useMemo<CarouselContextValue>(
    () => ({
      offset,
      count,
      index: activeIndex,
      staging,
      intensity,
      reducedMotion,
      dragEnabled,
      canScrollPrev: activeIndex > 0,
      canScrollNext: activeIndex < count - 1,
      scrollTo,
      scrollPrev,
      scrollNext,
      onDragStart,
      onDragSettle,
    }),
    [
      offset,
      count,
      activeIndex,
      staging,
      intensity,
      reducedMotion,
      dragEnabled,
      scrollTo,
      scrollPrev,
      scrollNext,
      onDragStart,
      onDragSettle,
    ],
  );

  const rootStyle = {
    ...style,
    "--carousel-offset": offset,
    "--carousel-intensity": intensityMultiplier[intensity],
    "--carousel-blur-enabled": intensity === "subtle" ? 0 : 1,
    ...(inactiveBlur !== undefined && Number.isFinite(inactiveBlur)
      ? {
          "--carousel-focus-blur": `${Math.min(4, Math.max(0, inactiveBlur))}px`,
        }
      : {}),
  } as CSSProperties;

  return (
    <MotionConfig reducedMotion={reducedMotion ? "always" : "user"}>
      <CarouselContext.Provider value={contextValue}>
        <motion.div
          {...props}
          ref={forwardedRef}
          role="region"
          aria-roledescription="carousel"
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledby}
          data-slot="carousel"
          data-staging={staging}
          data-intensity={intensity}
          data-reduced-motion={reducedMotion ? "true" : undefined}
          className={carouselClassNames({ className })}
          style={rootStyle}
        >
          {children}
          <div className="sr-only" aria-live="polite" aria-atomic="true">
            {liveMessage}
          </div>
        </motion.div>
      </CarouselContext.Provider>
    </MotionConfig>
  );
});

Carousel.displayName = "Carousel";

interface DragSession {
  didDrag: boolean;
  pointerId: number;
  direction: 1 | -1;
  startClientX: number;
  startOffset: number;
  step: number;
}

export interface CarouselContentProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export const CarouselContent = forwardRef<HTMLDivElement, CarouselContentProps>(
  function CarouselContent(
    {
      children,
      className,
      // Consumer handlers are chained ahead of the internal drag/keyboard
      // logic (consumer first; preventDefault opts out), matching onKeyDown.
      onClickCapture: onClickCaptureProp,
      onDragStart: onDragStartProp,
      onKeyDown: onKeyDownProp,
      onPointerCancel: onPointerCancelProp,
      onPointerDown: onPointerDownProp,
      onPointerMove: onPointerMoveProp,
      onPointerUp: onPointerUpProp,
      ...props
    },
    forwardedRef,
  ) {
    const {
      offset,
      count,
      dragEnabled,
      onDragStart,
      onDragSettle,
      scrollPrev,
      scrollNext,
      scrollTo,
    } = useCarouselContext("CarouselContent");
    const viewportRef = useRef<HTMLDivElement | null>(null);
    const probeRef = useRef<HTMLSpanElement>(null);
    const sessionRef = useRef<DragSession | null>(null);
    const suppressClickUntilRef = useRef(0);
    const [isDragging, setIsDragging] = useState(false);

    const measureStep = useCallback((viewport: HTMLElement) => {
      // A zero-height probe sized to `--carousel-step` resolves the CSS length
      // (including container-query units) to pixels for the drag math, without
      // measuring the overlapping stacked cards.
      const probe = probeRef.current;
      const probeWidth = probe?.getBoundingClientRect().width ?? 0;
      if (probeWidth > 0) return probeWidth;
      const item = viewport.querySelector<HTMLElement>(
        '[data-slot="carousel-item"]',
      );
      return item?.getBoundingClientRect().width || viewport.clientWidth || 1;
    }, []);

    const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
      onPointerDownProp?.(event);
      if (event.defaultPrevented) return;
      if (!dragEnabled || event.button !== 0) return;
      onDragStart();
      sessionRef.current = {
        didDrag: false,
        pointerId: event.pointerId,
        direction: getDragDirection(
          getComputedStyle(event.currentTarget).direction === "rtl",
        ),
        startClientX: event.clientX,
        startOffset: offset.get(),
        step: measureStep(event.currentTarget),
      };
    };

    const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
      onPointerMoveProp?.(event);
      if (event.defaultPrevented) return;
      const session = sessionRef.current;
      if (!session || session.pointerId !== event.pointerId) return;
      const delta = event.clientX - session.startClientX;
      if (!session.didDrag && Math.abs(delta) < dragThreshold) return;
      if (!session.didDrag) {
        session.didDrag = true;
        event.currentTarget.setPointerCapture?.(event.pointerId);
        setIsDragging(true);
      }
      event.preventDefault();
      const raw =
        session.startOffset -
        pxToIndexDelta(delta, session.step, session.direction);
      offset.set(clampWithRubberBand(raw, 0, Math.max(0, count - 1)));
    };

    const endDrag = (event: PointerEvent<HTMLDivElement>) => {
      if (event.defaultPrevented) return;
      const session = sessionRef.current;
      if (!session || session.pointerId !== event.pointerId) return;
      if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
        event.currentTarget.releasePointerCapture?.(event.pointerId);
      }
      sessionRef.current = null;
      if (!session.didDrag) return;
      suppressClickUntilRef.current = Date.now() + clickSuppressionMs;
      setIsDragging(false);
      const target = getSnapTarget({
        offset: offset.get(),
        velocity: offset.getVelocity(),
        min: 0,
        max: Math.max(0, count - 1),
      });
      onDragSettle(target);
    };

    const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
      onPointerUpProp?.(event);
      endDrag(event);
    };

    const handlePointerCancel = (event: PointerEvent<HTMLDivElement>) => {
      onPointerCancelProp?.(event);
      endDrag(event);
    };

    const handleClickCapture = (event: MouseEvent<HTMLDivElement>) => {
      onClickCaptureProp?.(event);
      if (Date.now() > suppressClickUntilRef.current) return;
      suppressClickUntilRef.current = 0;
      event.preventDefault();
      event.stopPropagation();
    };

    const handleDragStart = (event: DragEvent<HTMLDivElement>) => {
      onDragStartProp?.(event);
      event.preventDefault();
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      onKeyDownProp?.(event);
      if (event.defaultPrevented) return;
      // Nested controls own their arrow/Home/End keys (text selection, sliders,
      // menus). Carousel navigation belongs to the viewport itself.
      if (event.target !== event.currentTarget) return;
      const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
      switch (event.key) {
        case "ArrowRight":
          event.preventDefault();
          if (rtl) scrollPrev();
          else scrollNext();
          break;
        case "ArrowLeft":
          event.preventDefault();
          if (rtl) scrollNext();
          else scrollPrev();
          break;
        case "Home":
          event.preventDefault();
          scrollTo(0);
          break;
        case "End":
          event.preventDefault();
          scrollTo(count - 1);
          break;
        default:
          break;
      }
    };

    return (
      /* eslint-disable jsx-a11y/no-static-element-interactions, jsx-a11y/no-noninteractive-tabindex -- This focusable viewport supports keyboard navigation and pointer gestures. */
      <div
        {...props}
        ref={(node) => {
          viewportRef.current = node;
          if (typeof forwardedRef === "function") forwardedRef(node);
          else if (forwardedRef) forwardedRef.current = node;
        }}
        tabIndex={0}
        data-slot="carousel-viewport"
        data-drag={dragEnabled ? "true" : undefined}
        data-dragging={isDragging ? "true" : undefined}
        className={carouselViewportClassNames({ className })}
        onKeyDown={handleKeyDown}
        onClickCapture={handleClickCapture}
        onDragStart={handleDragStart}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        {/* eslint-enable jsx-a11y/no-static-element-interactions, jsx-a11y/no-noninteractive-tabindex */}
        <span
          ref={probeRef}
          aria-hidden="true"
          data-slot="carousel-step-probe"
          className="pointer-events-none absolute h-0 w-[var(--carousel-step)]"
        />
        <div data-slot="carousel-track" className={carouselTrackClasses}>
          {Children.map(children, (child, itemIndex) =>
            isValidElement(child) ? (
              <CarouselItemIndexContext.Provider value={itemIndex}>
                {child}
              </CarouselItemIndexContext.Provider>
            ) : (
              child
            ),
          )}
        </div>
      </div>
    );
  },
);

CarouselContent.displayName = "CarouselContent";

export interface CarouselItemProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export const CarouselItem = forwardRef<HTMLDivElement, CarouselItemProps>(
  function CarouselItem(
    { children, className, style, ...props },
    forwardedRef,
  ) {
    const { count, index, staging, scrollTo } =
      useCarouselContext("CarouselItem");
    const itemIndex = useContext(CarouselItemIndexContext);
    const isInert = Math.abs(itemIndex - index) > stagingVisibleRadius[staging];
    const showShadow = staging !== "flat";
    const itemRef = useRef<HTMLDivElement | null>(null);

    // Two-phase inert: the render that moves a slide out of view keeps the old
    // inert state, then a pre-paint layout effect rescues focus (the inert
    // attribute would silently blur a focused descendant to document.body) and
    // commits the new state. The initializer keeps SSR/first paint correct.
    const [appliedInert, setAppliedInert] = useState(isInert);
    useIsomorphicLayoutEffect(() => {
      if (isInert === appliedInert) return;
      const node = itemRef.current;
      if (
        isInert &&
        node &&
        typeof document !== "undefined" &&
        node.contains(document.activeElement)
      ) {
        const viewport = node.closest<HTMLElement>(
          '[data-slot="carousel-viewport"]',
        );
        viewport?.focus();
      }
      setAppliedInert(isInert);
    }, [isInert, appliedInert]);

    return (
      <div
        {...props}
        ref={(node) => {
          itemRef.current = node;
          if (typeof forwardedRef === "function") forwardedRef(node);
          else if (forwardedRef) forwardedRef.current = node;
        }}
        role="group"
        aria-roledescription="slide"
        aria-label={`${itemIndex + 1} of ${count}`}
        data-slot="carousel-item"
        data-active={itemIndex === index ? "true" : undefined}
        className={carouselItemClassNames({ className })}
        style={
          {
            ...style,
            "--carousel-item-index": itemIndex,
            "--carousel-item-polarity": itemIndex % 2 === 0 ? 1 : -1,
          } as CSSProperties
        }
      >
        {showShadow ? (
          <span
            aria-hidden="true"
            data-slot="carousel-item-shadow"
            className={carouselShadowClasses}
          />
        ) : null}
        <div
          data-slot="carousel-item-content"
          className="contents"
          // Keep the preview selector outside inert content. React 18 needs
          // the string form of this native attribute; React 19 uses a boolean.
          {...({
            inert: appliedInert
              ? version.startsWith("18.")
                ? ""
                : true
              : undefined,
          } as unknown as HTMLAttributes<HTMLDivElement>)}
        >
          {children}
        </div>
        {itemIndex !== index ? (
          <button
            type="button"
            data-slot="carousel-preview"
            aria-label={`Show slide ${itemIndex + 1}`}
            tabIndex={-1}
            className="absolute inset-0 z-10 cursor-pointer rounded-[inherit]"
            onClick={(event) => {
              if (event.defaultPrevented) return;
              event.stopPropagation();
              if (document.activeElement === event.currentTarget) {
                itemRef.current
                  ?.closest<HTMLElement>('[data-slot="carousel-viewport"]')
                  ?.focus();
              }
              scrollTo(itemIndex);
            }}
          />
        ) : null}
      </div>
    );
  },
);

CarouselItem.displayName = "CarouselItem";

export interface CarouselControlProps extends Omit<
  IconButtonProps,
  "aria-label" | "aria-labelledby" | "children"
> {
  label?: string;
}

export const CarouselPrevious = forwardRef<
  HTMLButtonElement,
  CarouselControlProps
>(function CarouselPrevious(
  {
    label = "Previous slide",
    onClick,
    disabled,
    size = "sm",
    variant = "outline",
    ...props
  },
  forwardedRef,
) {
  const { canScrollPrev, scrollPrev } = useCarouselContext("CarouselPrevious");
  return (
    <IconButton
      {...props}
      ref={forwardedRef}
      aria-label={label}
      data-slot="carousel-previous"
      size={size}
      variant={variant}
      disabled={disabled ?? !canScrollPrev}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) scrollPrev();
      }}
    >
      <ChevronLeftIcon />
    </IconButton>
  );
});

CarouselPrevious.displayName = "CarouselPrevious";

export const CarouselNext = forwardRef<HTMLButtonElement, CarouselControlProps>(
  function CarouselNext(
    {
      label = "Next slide",
      onClick,
      disabled,
      size = "sm",
      variant = "outline",
      ...props
    },
    forwardedRef,
  ) {
    const { canScrollNext, scrollNext } = useCarouselContext("CarouselNext");
    return (
      <IconButton
        {...props}
        ref={forwardedRef}
        aria-label={label}
        data-slot="carousel-next"
        size={size}
        variant={variant}
        disabled={disabled ?? !canScrollNext}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) scrollNext();
        }}
      >
        <ChevronRightIcon />
      </IconButton>
    );
  },
);

CarouselNext.displayName = "CarouselNext";

export interface CarouselDotsProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "children"
> {
  label?: (index: number) => string;
}

export const CarouselDots = forwardRef<HTMLDivElement, CarouselDotsProps>(
  function CarouselDots(
    { className, label = (i) => `Go to slide ${i + 1}`, ...props },
    forwardedRef,
  ) {
    const { count, index, scrollTo } = useCarouselContext("CarouselDots");
    return (
      <div
        {...props}
        ref={forwardedRef}
        data-slot="carousel-dots"
        className={cn(carouselDotsClasses, className)}
      >
        {Array.from({ length: count }, (_, i) => (
          <button
            key={i}
            type="button"
            data-slot="carousel-dot"
            aria-label={label(i)}
            aria-current={i === index ? "true" : undefined}
            className={carouselDotClasses}
            onClick={() => scrollTo(i)}
          >
            <span
              aria-hidden="true"
              className="bg-muted-foreground/30 group-hover/dot:bg-muted-foreground/60 group-aria-[current=true]/dot:bg-primary size-2 rounded-full transition-[background-color,transform] group-aria-[current=true]/dot:scale-125 motion-reduce:transition-none forced-colors:border forced-colors:border-[ButtonText] forced-colors:group-aria-[current=true]/dot:bg-[Highlight]"
            />
          </button>
        ))}
      </div>
    );
  },
);

CarouselDots.displayName = "CarouselDots";
