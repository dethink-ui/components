import {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ForwardedRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import {
  MotionConfig,
  motion as motionElement,
  useReducedMotion,
  type Transition,
} from "motion/react";
import { cn } from "../../utils/cn";
import { usePageVisible } from "../../utils/use-page-visible";
import { mulberry32, seededRange } from "../../utils/seeded-random";

export type LightStreaksBackgroundDensity = "sparse" | "normal" | "dense";
export type LightStreaksBackgroundIntensity = "faint" | "subtle" | "bold";
export type LightStreaksBackgroundSpeed = "slow" | "normal" | "fast";
export type LightStreaksBackgroundTone = "foreground" | "muted" | "primary";

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

export interface LightStreaksBackgroundProps extends MotionSafeDivProps {
  animate?: boolean;
  children?: ReactNode;
  density?: LightStreaksBackgroundDensity;
  intensity?: LightStreaksBackgroundIntensity;
  seed?: number;
  speed?: LightStreaksBackgroundSpeed;
  tone?: LightStreaksBackgroundTone;
}

export interface LightStreaksBackgroundMotionConfig {
  animateEnabled: boolean;
  reducedMotion: boolean;
  sweepDuration: number;
  transition: Transition;
}

export interface LightStreaksBackgroundStreak {
  delay: number;
  left: number;
  repeatDelay: number;
}

const lightStreaksBackgroundSpeedDurations: Record<
  LightStreaksBackgroundSpeed,
  number
> = {
  slow: 10,
  normal: 7,
  fast: 4.5,
};

export function getLightStreaksBackgroundMotionConfig(
  speed: LightStreaksBackgroundSpeed,
  reducedMotion = false,
): LightStreaksBackgroundMotionConfig {
  if (reducedMotion) {
    return {
      animateEnabled: false,
      reducedMotion: true,
      sweepDuration: 0,
      transition: { duration: 0 },
    };
  }

  const sweepDuration = lightStreaksBackgroundSpeedDurations[speed];

  return {
    animateEnabled: true,
    reducedMotion: false,
    sweepDuration,
    transition: {
      duration: sweepDuration,
      ease: "easeInOut",
      repeat: Infinity,
    },
  };
}

const lightStreaksBackgroundStreakCounts: Record<
  LightStreaksBackgroundDensity,
  number
> = {
  sparse: 3,
  normal: 4,
  dense: 5,
};

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function getLightStreaksBackgroundGeometry(
  seed: number,
  density: LightStreaksBackgroundDensity,
): LightStreaksBackgroundStreak[] {
  const random = mulberry32(seed);

  return Array.from(
    { length: lightStreaksBackgroundStreakCounts[density] },
    () => ({
      left: Math.round(seededRange(random, 5, 80)),
      delay: roundTo(seededRange(random, 0, 5), 2),
      repeatDelay: roundTo(seededRange(random, 1, 4), 2),
    }),
  );
}

const lightStreaksBackgroundRootClasses = "relative isolate overflow-hidden";

const lightStreaksBackgroundLayerClasses =
  "pointer-events-none absolute inset-0 select-none";

const lightStreaksBackgroundContentClasses = "relative z-10";

// Each streak rail is oversized vertically and statically rotated so the
// blurred bar reads as a diagonal glare; the bar itself only ever animates
// transform and opacity.
const lightStreaksBackgroundRailClasses =
  "absolute -inset-y-1/4 w-24 -rotate-[20deg]";

const lightStreaksBackgroundStreakClasses =
  "h-full w-full bg-gradient-to-r from-transparent via-current to-transparent blur-2xl";

const lightStreaksBackgroundToneIntensityClasses: Record<
  LightStreaksBackgroundTone,
  Record<LightStreaksBackgroundIntensity, string>
> = {
  foreground: {
    faint: "text-foreground/20 dark:text-foreground/25",
    subtle: "text-foreground/30 dark:text-foreground/40",
    bold: "text-foreground/40 dark:text-foreground/55",
  },
  muted: {
    faint: "text-muted-foreground/25 dark:text-muted-foreground/30",
    subtle: "text-muted-foreground/35 dark:text-muted-foreground/45",
    bold: "text-muted-foreground/50 dark:text-muted-foreground/60",
  },
  primary: {
    faint: "text-primary/25 dark:text-primary/30",
    subtle: "text-primary/40 dark:text-primary/50",
    bold: "text-primary/55 dark:text-primary/65",
  },
};

export interface LightStreaksBackgroundClassNamesOptions {
  className?: string;
}

export function lightStreaksBackgroundClassNames({
  className,
}: LightStreaksBackgroundClassNamesOptions = {}) {
  return cn(lightStreaksBackgroundRootClasses, className);
}

export interface LightStreaksBackgroundLayerClassNamesOptions {
  className?: string;
  intensity?: LightStreaksBackgroundIntensity;
  tone?: LightStreaksBackgroundTone;
}

export function lightStreaksBackgroundLayerClassNames({
  className,
  intensity = "subtle",
  tone = "muted",
}: LightStreaksBackgroundLayerClassNamesOptions = {}) {
  return cn(
    lightStreaksBackgroundLayerClasses,
    lightStreaksBackgroundToneIntensityClasses[tone][intensity],
    className,
  );
}

export interface LightStreaksBackgroundContentClassNamesOptions {
  className?: string;
}

export function lightStreaksBackgroundContentClassNames({
  className,
}: LightStreaksBackgroundContentClassNamesOptions = {}) {
  return cn(lightStreaksBackgroundContentClasses, className);
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

// Pauses looping sweeps while the background is scrolled offscreen. Fails open
// (stays true) where IntersectionObserver is unavailable so the background
// still animates in older browsers and jsdom.
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

function railStyle(streak: LightStreaksBackgroundStreak): CSSProperties {
  return { left: `${streak.left}%` };
}

export const LightStreaksBackground = forwardRef(
  function LightStreaksBackground(
    {
      animate = true,
      children,
      className,
      density = "normal",
      intensity = "subtle",
      seed = 1,
      speed = "normal",
      tone = "muted",
      ...props
    }: LightStreaksBackgroundProps,
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

    const motionConfig = getLightStreaksBackgroundMotionConfig(
      speed,
      reducedMotion,
    );
    const streaks = useMemo(
      () => getLightStreaksBackgroundGeometry(seed, density),
      [seed, density],
    );

    return (
      <MotionConfig reducedMotion={reducedMotion ? "always" : "user"}>
        <div
          {...props}
          ref={composedRef}
          data-slot="light-streaks-background"
          data-animate={animate ? "true" : "false"}
          data-density={density}
          data-intensity={intensity}
          data-speed={speed}
          data-tone={tone}
          data-reduced-motion={reducedMotion ? "true" : undefined}
          className={lightStreaksBackgroundClassNames({ className })}
        >
          <div
            aria-hidden="true"
            data-slot="light-streaks-background-layer"
            className={lightStreaksBackgroundLayerClassNames({
              intensity,
              tone,
            })}
          >
            {running
              ? streaks.map((streak, index) => (
                  <div
                    key={index}
                    className={lightStreaksBackgroundRailClasses}
                    style={railStyle(streak)}
                  >
                    <motionElement.div
                      data-slot="light-streaks-background-streak"
                      className={lightStreaksBackgroundStreakClasses}
                      initial={{ opacity: 0, x: "-250%" }}
                      animate={{ opacity: [0, 1, 0], x: ["-250%", "250%"] }}
                      transition={{
                        ...motionConfig.transition,
                        delay: streak.delay,
                        repeatDelay: streak.repeatDelay,
                      }}
                    />
                  </div>
                ))
              : streaks.slice(0, 1).map((streak, index) => (
                  <div
                    key={index}
                    className={lightStreaksBackgroundRailClasses}
                    style={railStyle(streak)}
                  >
                    <div
                      data-slot="light-streaks-background-streak"
                      className={cn(
                        lightStreaksBackgroundStreakClasses,
                        "opacity-40",
                      )}
                    />
                  </div>
                ))}
          </div>
          <div
            data-slot="light-streaks-background-content"
            className={lightStreaksBackgroundContentClassNames()}
          >
            {children}
          </div>
        </div>
      </MotionConfig>
    );
  },
);

LightStreaksBackground.displayName = "LightStreaksBackground";
