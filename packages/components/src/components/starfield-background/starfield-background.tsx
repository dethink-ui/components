import {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ForwardedRef,
  type HTMLAttributes,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import {
  MotionConfig,
  motion as motionElement,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type Transition,
} from "motion/react";
import { cn } from "../../utils/cn";
import { usePageVisible } from "../../utils/use-page-visible";
import { mulberry32, seededRange } from "../../utils/seeded-random";

export type StarfieldBackgroundDensity = "sparse" | "normal" | "dense";
export type StarfieldBackgroundIntensity = "faint" | "subtle" | "bold";
export type StarfieldBackgroundSpeed = "slow" | "normal" | "fast";
export type StarfieldBackgroundTone = "foreground" | "muted" | "primary";

type MotionBackedEventProps =
  | "onAnimationEnd"
  | "onAnimationEndCapture"
  | "onAnimationIteration"
  | "onAnimationIterationCapture"
  | "onAnimationStart"
  | "onAnimationStartCapture"
  | "onDrag"
  | "onDragCapture"
  | "onDragEnd"
  | "onDragEndCapture"
  | "onDragEnter"
  | "onDragEnterCapture"
  | "onDragExit"
  | "onDragExitCapture"
  | "onDragLeave"
  | "onDragLeaveCapture"
  | "onDragOver"
  | "onDragOverCapture"
  | "onDragStart"
  | "onDragStartCapture";

type MotionSafeDivProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  MotionBackedEventProps
>;

export interface StarfieldBackgroundProps extends MotionSafeDivProps {
  animate?: boolean;
  children?: ReactNode;
  density?: StarfieldBackgroundDensity;
  intensity?: StarfieldBackgroundIntensity;
  interactive?: boolean;
  seed?: number;
  speed?: StarfieldBackgroundSpeed;
  tone?: StarfieldBackgroundTone;
}

export interface StarfieldBackgroundMotionConfig {
  animateEnabled: boolean;
  driftDurations: readonly [number, number, number];
  parallaxDepths: readonly [number, number, number];
  reducedMotion: boolean;
  twinkleTransition: Transition;
}

export interface StarfieldBackgroundStar {
  cx: number;
  cy: number;
}

export interface StarfieldBackgroundTwinkle {
  cx: number;
  cy: number;
  delay: number;
  duration: number;
}

export interface StarfieldBackgroundLayer {
  radius: number;
  stars: StarfieldBackgroundStar[];
  twinkles: StarfieldBackgroundTwinkle[];
}

const starfieldBackgroundBaseDriftDurations = [120, 90, 60] as const;

const starfieldBackgroundParallaxDepths = [3, 6, 10] as const;

const starfieldBackgroundSpeedMultipliers: Record<
  StarfieldBackgroundSpeed,
  number
> = {
  slow: 1.5,
  normal: 1,
  fast: 0.6,
};

export function getStarfieldBackgroundMotionConfig(
  speed: StarfieldBackgroundSpeed,
  reducedMotion = false,
): StarfieldBackgroundMotionConfig {
  if (reducedMotion) {
    return {
      animateEnabled: false,
      driftDurations: [0, 0, 0],
      parallaxDepths: [0, 0, 0],
      reducedMotion: true,
      twinkleTransition: { duration: 0 },
    };
  }

  const multiplier = starfieldBackgroundSpeedMultipliers[speed];

  return {
    animateEnabled: true,
    driftDurations: [
      starfieldBackgroundBaseDriftDurations[0] * multiplier,
      starfieldBackgroundBaseDriftDurations[1] * multiplier,
      starfieldBackgroundBaseDriftDurations[2] * multiplier,
    ],
    parallaxDepths: starfieldBackgroundParallaxDepths,
    reducedMotion: false,
    twinkleTransition: { ease: "easeInOut", repeat: Infinity },
  };
}

const starfieldBackgroundStarCounts: Record<
  StarfieldBackgroundDensity,
  readonly [number, number, number]
> = {
  sparse: [24, 16, 10],
  normal: [40, 26, 16],
  dense: [60, 40, 24],
};

const starfieldBackgroundTwinkleCounts: Record<
  StarfieldBackgroundDensity,
  number
> = {
  sparse: 4,
  normal: 6,
  dense: 8,
};

const starfieldBackgroundLayerRadii = [0.4, 0.6, 0.9] as const;

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function getStarfieldBackgroundGeometry(
  seed: number,
  density: StarfieldBackgroundDensity,
): StarfieldBackgroundLayer[] {
  const random = mulberry32(seed);
  const twinkleCount = starfieldBackgroundTwinkleCounts[density];

  return starfieldBackgroundStarCounts[density].map(
    (starCount, layerIndex) => ({
      radius: starfieldBackgroundLayerRadii[layerIndex],
      stars: Array.from({ length: starCount }, () => ({
        cx: roundTo(seededRange(random, 2, 98), 1),
        cy: roundTo(seededRange(random, 2, 98), 1),
      })),
      twinkles: Array.from({ length: twinkleCount }, () => ({
        cx: roundTo(seededRange(random, 2, 98), 1),
        cy: roundTo(seededRange(random, 2, 98), 1),
        delay: roundTo(seededRange(random, 0, 4), 2),
        duration: roundTo(seededRange(random, 2, 5), 2),
      })),
    }),
  );
}

const starfieldBackgroundRootClasses = "relative isolate overflow-hidden";

const starfieldBackgroundLayerClasses =
  "pointer-events-none absolute inset-0 select-none";

const starfieldBackgroundContentClasses = "relative z-10";

// Oversized so the slow drift loop never exposes an empty edge.
const starfieldBackgroundStarLayerClasses = "absolute -inset-[4%]";

const starfieldBackgroundSvgClasses = "absolute inset-0 h-full w-full";

const starfieldBackgroundLayerOpacityClasses = [
  "opacity-60",
  "opacity-75",
  "opacity-90",
] as const;

const starfieldBackgroundToneIntensityClasses: Record<
  StarfieldBackgroundTone,
  Record<StarfieldBackgroundIntensity, string>
> = {
  foreground: {
    faint: "text-foreground/30 dark:text-foreground/40",
    subtle: "text-foreground/50 dark:text-foreground/60",
    bold: "text-foreground/70 dark:text-foreground/80",
  },
  muted: {
    faint: "text-muted-foreground/30 dark:text-muted-foreground/40",
    subtle: "text-muted-foreground/50 dark:text-muted-foreground/60",
    bold: "text-muted-foreground/70 dark:text-muted-foreground/80",
  },
  primary: {
    faint: "text-primary/30 dark:text-primary/40",
    subtle: "text-primary/50 dark:text-primary/60",
    bold: "text-primary/70 dark:text-primary/80",
  },
};

// Literal per-layer drift keyframes so layers never move in lockstep.
const starfieldBackgroundDriftKeyframes = [
  { x: ["0%", "1.6%"], y: ["0%", "-1.2%"] },
  { x: ["0%", "-1.4%"], y: ["0%", "1%"] },
  { x: ["0%", "1.2%"], y: ["0%", "0.8%"] },
] as const;

export interface StarfieldBackgroundClassNamesOptions {
  className?: string;
}

export function starfieldBackgroundClassNames({
  className,
}: StarfieldBackgroundClassNamesOptions = {}) {
  return cn(starfieldBackgroundRootClasses, className);
}

export interface StarfieldBackgroundLayerClassNamesOptions {
  className?: string;
  intensity?: StarfieldBackgroundIntensity;
  tone?: StarfieldBackgroundTone;
}

export function starfieldBackgroundLayerClassNames({
  className,
  intensity = "subtle",
  tone = "muted",
}: StarfieldBackgroundLayerClassNamesOptions = {}) {
  return cn(
    starfieldBackgroundLayerClasses,
    starfieldBackgroundToneIntensityClasses[tone][intensity],
    className,
  );
}

export interface StarfieldBackgroundContentClassNamesOptions {
  className?: string;
}

export function starfieldBackgroundContentClassNames({
  className,
}: StarfieldBackgroundContentClassNamesOptions = {}) {
  return cn(starfieldBackgroundContentClasses, className);
}

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

function useHasHydrated() {
  const [hasHydrated, setHasHydrated] = useState(false);

  useIsomorphicLayoutEffect(() => {
    setHasHydrated(true);
  }, []);

  return hasHydrated;
}

// Pauses drift and twinkle loops while the background is scrolled offscreen.
// Fails open (stays true) where IntersectionObserver is unavailable so the
// background still animates in older browsers and jsdom.
function useDecorativeInView(ref: { current: HTMLElement | null }) {
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const element = ref.current;

    if (
      !element ||
      typeof window === "undefined" ||
      !("IntersectionObserver" in window)
    ) {
      return;
    }

    const observer = new window.IntersectionObserver(([entry]) => {
      if (entry) {
        setInView(entry.isIntersecting);
      }
    });

    observer.observe(element);

    return () => observer.disconnect();
  }, [ref]);

  return inView;
}

function StarfieldStars({
  layer,
  layerIndex,
  running,
  twinkleTransition,
}: {
  layer: StarfieldBackgroundLayer;
  layerIndex: number;
  running: boolean;
  twinkleTransition: Transition;
}) {
  return (
    <svg
      className={cn(
        starfieldBackgroundSvgClasses,
        starfieldBackgroundLayerOpacityClasses[layerIndex],
      )}
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      focusable="false"
    >
      {layer.stars.map((star, starIndex) => (
        <circle
          key={`star-${starIndex}`}
          cx={star.cx}
          cy={star.cy}
          r={layer.radius}
          fill="currentColor"
        />
      ))}
      {layer.twinkles.map((twinkle, twinkleIndex) =>
        running ? (
          <motionElement.circle
            key={`twinkle-${twinkleIndex}`}
            data-slot="starfield-background-twinkle"
            cx={twinkle.cx}
            cy={twinkle.cy}
            r={layer.radius * 1.4}
            fill="currentColor"
            initial={{ opacity: 0.2 }}
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{
              ...twinkleTransition,
              delay: twinkle.delay,
              duration: twinkle.duration,
            }}
          />
        ) : (
          <circle
            key={`twinkle-${twinkleIndex}`}
            data-slot="starfield-background-twinkle"
            cx={twinkle.cx}
            cy={twinkle.cy}
            r={layer.radius * 1.4}
            fill="currentColor"
            opacity={0.6}
          />
        ),
      )}
    </svg>
  );
}

export const StarfieldBackground = forwardRef(function StarfieldBackground(
  {
    animate = true,
    children,
    className,
    density = "normal",
    intensity = "subtle",
    interactive = true,
    onPointerLeave: onPointerLeaveProp,
    onPointerMove: onPointerMoveProp,
    seed = 1,
    speed = "normal",
    tone = "muted",
    ...props
  }: StarfieldBackgroundProps,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  const localRef = useRef<HTMLDivElement | null>(null);
  const composedRef = useCallback(
    (node: HTMLDivElement | null) => {
      localRef.current = node;

      if (typeof forwardedRef === "function") {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    },
    [forwardedRef],
  );

  const hasHydrated = useHasHydrated();
  const prefersReducedMotion = useReducedMotion();
  const inView = useDecorativeInView(localRef);
  // OS preference is only trusted after hydration so the first client render
  // matches the server render exactly; animate={false} is deterministic on
  // both sides and applies immediately.
  const reducedMotion =
    !animate || (hasHydrated && prefersReducedMotion === true);
  const pageVisible = usePageVisible();
  const running = hasHydrated && !reducedMotion && inView && pageVisible;

  const motionConfig = getStarfieldBackgroundMotionConfig(speed, reducedMotion);
  const layers = useMemo(
    () => getStarfieldBackgroundGeometry(seed, density),
    [seed, density],
  );

  // Pointer parallax runs entirely through motion values — no React state per
  // pointer event. Springs ease each layer toward the cursor with depth
  // increasing from the far to the near layer.
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springX = useSpring(pointerX, { stiffness: 60, damping: 20 });
  const springY = useSpring(pointerY, { stiffness: 60, damping: 20 });
  const farParallaxX = useTransform(springX, [-0.5, 0.5], [-3, 3]);
  const farParallaxY = useTransform(springY, [-0.5, 0.5], [-3, 3]);
  const midParallaxX = useTransform(springX, [-0.5, 0.5], [-6, 6]);
  const midParallaxY = useTransform(springY, [-0.5, 0.5], [-6, 6]);
  const nearParallaxX = useTransform(springX, [-0.5, 0.5], [-10, 10]);
  const nearParallaxY = useTransform(springY, [-0.5, 0.5], [-10, 10]);
  const parallax = [
    { x: farParallaxX, y: farParallaxY },
    { x: midParallaxX, y: midParallaxY },
    { x: nearParallaxX, y: nearParallaxY },
  ];

  const parallaxEnabled = running && interactive;

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      onPointerMoveProp?.(event);

      if (!parallaxEnabled) {
        return;
      }

      const node = localRef.current;

      if (!node) {
        return;
      }

      const rect = node.getBoundingClientRect();

      if (rect.width === 0 || rect.height === 0) {
        return;
      }

      pointerX.set((event.clientX - rect.left) / rect.width - 0.5);
      pointerY.set((event.clientY - rect.top) / rect.height - 0.5);
    },
    [onPointerMoveProp, parallaxEnabled, pointerX, pointerY],
  );

  const handlePointerLeave = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      onPointerLeaveProp?.(event);
      pointerX.set(0);
      pointerY.set(0);
    },
    [onPointerLeaveProp, pointerX, pointerY],
  );

  return (
    <MotionConfig reducedMotion={reducedMotion ? "always" : "user"}>
      <div
        {...props}
        ref={composedRef}
        data-slot="starfield-background"
        data-animate={animate ? "true" : "false"}
        data-density={density}
        data-intensity={intensity}
        data-interactive={interactive ? "true" : "false"}
        data-speed={speed}
        data-tone={tone}
        data-reduced-motion={reducedMotion ? "true" : undefined}
        className={starfieldBackgroundClassNames({ className })}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        <div
          aria-hidden="true"
          data-slot="starfield-background-layer"
          className={starfieldBackgroundLayerClassNames({ intensity, tone })}
        >
          {layers.map((layer, layerIndex) =>
            running ? (
              <motionElement.div
                key={layerIndex}
                data-slot="starfield-background-star-layer"
                className={starfieldBackgroundStarLayerClasses}
                style={{
                  x: parallax[layerIndex].x,
                  y: parallax[layerIndex].y,
                }}
              >
                <motionElement.div
                  className="absolute inset-0"
                  animate={{
                    x: [...starfieldBackgroundDriftKeyframes[layerIndex].x],
                    y: [...starfieldBackgroundDriftKeyframes[layerIndex].y],
                  }}
                  transition={{
                    duration: motionConfig.driftDurations[layerIndex],
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatType: "mirror",
                  }}
                >
                  <StarfieldStars
                    layer={layer}
                    layerIndex={layerIndex}
                    running
                    twinkleTransition={motionConfig.twinkleTransition}
                  />
                </motionElement.div>
              </motionElement.div>
            ) : (
              <div
                key={layerIndex}
                data-slot="starfield-background-star-layer"
                className={starfieldBackgroundStarLayerClasses}
              >
                <StarfieldStars
                  layer={layer}
                  layerIndex={layerIndex}
                  running={false}
                  twinkleTransition={motionConfig.twinkleTransition}
                />
              </div>
            ),
          )}
        </div>
        <div
          data-slot="starfield-background-content"
          className={starfieldBackgroundContentClassNames()}
        >
          {children}
        </div>
      </div>
    </MotionConfig>
  );
});

StarfieldBackground.displayName = "StarfieldBackground";
