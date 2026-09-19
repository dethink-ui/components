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

export type GridBeamsBackgroundDensity = "sparse" | "normal" | "dense";
export type GridBeamsBackgroundIntensity = "faint" | "subtle" | "bold";
export type GridBeamsBackgroundSpeed = "slow" | "normal" | "fast";
export type GridBeamsBackgroundTone = "foreground" | "muted" | "primary";
export type GridBeamsBackgroundBeamAxis = "x" | "y";

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

export interface GridBeamsBackgroundProps extends MotionSafeDivProps {
  animate?: boolean;
  children?: ReactNode;
  density?: GridBeamsBackgroundDensity;
  intensity?: GridBeamsBackgroundIntensity;
  seed?: number;
  speed?: GridBeamsBackgroundSpeed;
  tone?: GridBeamsBackgroundTone;
}

export interface GridBeamsBackgroundMotionConfig {
  animateEnabled: boolean;
  beamDuration: number;
  reducedMotion: boolean;
  transition: Transition;
}

export interface GridBeamsBackgroundBeam {
  axis: GridBeamsBackgroundBeamAxis;
  delay: number;
  position: number;
  repeatDelay: number;
  staticOffset: number;
}

const gridBeamsBackgroundSpeedDurations: Record<
  GridBeamsBackgroundSpeed,
  number
> = {
  slow: 9,
  normal: 6,
  fast: 3.5,
};

export function getGridBeamsBackgroundMotionConfig(
  speed: GridBeamsBackgroundSpeed,
  reducedMotion = false,
): GridBeamsBackgroundMotionConfig {
  if (reducedMotion) {
    return {
      animateEnabled: false,
      beamDuration: 0,
      reducedMotion: true,
      transition: { duration: 0 },
    };
  }

  const beamDuration = gridBeamsBackgroundSpeedDurations[speed];

  return {
    animateEnabled: true,
    beamDuration,
    reducedMotion: false,
    transition: { duration: beamDuration, ease: "linear", repeat: Infinity },
  };
}

const gridBeamsBackgroundBeamCounts: Record<
  GridBeamsBackgroundDensity,
  number
> = {
  sparse: 3,
  normal: 5,
  dense: 7,
};

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function getGridBeamsBackgroundGeometry(
  seed: number,
  density: GridBeamsBackgroundDensity,
): GridBeamsBackgroundBeam[] {
  const random = mulberry32(seed);

  return Array.from({ length: gridBeamsBackgroundBeamCounts[density] }, () => ({
    axis: (random() > 0.5 ? "x" : "y") as GridBeamsBackgroundBeamAxis,
    position: Math.round(seededRange(random, 8, 92)),
    delay: roundTo(seededRange(random, 0, 4), 2),
    repeatDelay: roundTo(seededRange(random, 1.5, 5), 2),
    staticOffset: Math.round(seededRange(random, 10, 60)),
  }));
}

const gridBeamsBackgroundRootClasses = "relative isolate overflow-hidden";

const gridBeamsBackgroundLayerClasses =
  "pointer-events-none absolute inset-0 select-none";

const gridBeamsBackgroundContentClasses = "relative z-10";

const gridBeamsBackgroundPatternClasses =
  "absolute inset-0 [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)]";

const gridBeamsBackgroundDensityClasses: Record<
  GridBeamsBackgroundDensity,
  string
> = {
  sparse: "[background-size:96px_96px]",
  normal: "[background-size:56px_56px]",
  dense: "[background-size:32px_32px]",
};

const gridBeamsBackgroundToneIntensityClasses: Record<
  GridBeamsBackgroundTone,
  Record<GridBeamsBackgroundIntensity, string>
> = {
  foreground: {
    faint: "text-foreground/5 dark:text-foreground/10",
    subtle: "text-foreground/10 dark:text-foreground/15",
    bold: "text-foreground/15 dark:text-foreground/25",
  },
  muted: {
    faint: "text-muted-foreground/10 dark:text-muted-foreground/15",
    subtle: "text-muted-foreground/15 dark:text-muted-foreground/25",
    bold: "text-muted-foreground/25 dark:text-muted-foreground/40",
  },
  primary: {
    faint: "text-primary/5 dark:text-primary/10",
    subtle: "text-primary/10 dark:text-primary/20",
    bold: "text-primary/20 dark:text-primary/30",
  },
};

const gridBeamsBackgroundBeamToneClasses: Record<
  GridBeamsBackgroundTone,
  string
> = {
  foreground: "text-foreground/40 dark:text-foreground/50",
  muted: "text-muted-foreground/40 dark:text-muted-foreground/50",
  primary: "text-primary/60 dark:text-primary/70",
};

const gridBeamsBackgroundRailClasses: Record<
  GridBeamsBackgroundBeamAxis,
  string
> = {
  x: "absolute inset-x-0 h-px",
  y: "absolute inset-y-0 w-px",
};

const gridBeamsBackgroundBeamClasses: Record<
  GridBeamsBackgroundBeamAxis,
  string
> = {
  x: "absolute inset-y-0 w-[30%] bg-gradient-to-r from-transparent via-current to-transparent",
  y: "absolute inset-x-0 h-[30%] bg-gradient-to-b from-transparent via-current to-transparent",
};

export interface GridBeamsBackgroundClassNamesOptions {
  className?: string;
}

export function gridBeamsBackgroundClassNames({
  className,
}: GridBeamsBackgroundClassNamesOptions = {}) {
  return cn(gridBeamsBackgroundRootClasses, className);
}

export interface GridBeamsBackgroundLayerClassNamesOptions {
  className?: string;
  intensity?: GridBeamsBackgroundIntensity;
  tone?: GridBeamsBackgroundTone;
}

export function gridBeamsBackgroundLayerClassNames({
  className,
  intensity = "subtle",
  tone = "muted",
}: GridBeamsBackgroundLayerClassNamesOptions = {}) {
  return cn(
    gridBeamsBackgroundLayerClasses,
    gridBeamsBackgroundToneIntensityClasses[tone][intensity],
    className,
  );
}

export interface GridBeamsBackgroundContentClassNamesOptions {
  className?: string;
}

export function gridBeamsBackgroundContentClassNames({
  className,
}: GridBeamsBackgroundContentClassNamesOptions = {}) {
  return cn(gridBeamsBackgroundContentClasses, className);
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

// Pauses looping animations while the background is scrolled offscreen.
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

function railStyle(beam: GridBeamsBackgroundBeam): CSSProperties {
  return beam.axis === "x"
    ? { top: `${beam.position}%` }
    : { left: `${beam.position}%` };
}

export const GridBeamsBackground = forwardRef(function GridBeamsBackground(
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
  }: GridBeamsBackgroundProps,
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

  const motionConfig = getGridBeamsBackgroundMotionConfig(speed, reducedMotion);
  const beams = useMemo(
    () => getGridBeamsBackgroundGeometry(seed, density),
    [seed, density],
  );

  return (
    <MotionConfig reducedMotion={reducedMotion ? "always" : "user"}>
      <div
        {...props}
        ref={composedRef}
        data-slot="grid-beams-background"
        data-animate={animate ? "true" : "false"}
        data-density={density}
        data-intensity={intensity}
        data-speed={speed}
        data-tone={tone}
        data-reduced-motion={reducedMotion ? "true" : undefined}
        className={gridBeamsBackgroundClassNames({ className })}
      >
        <div
          aria-hidden="true"
          data-slot="grid-beams-background-layer"
          className={gridBeamsBackgroundLayerClassNames({ intensity, tone })}
        >
          <div
            className={cn(
              gridBeamsBackgroundPatternClasses,
              gridBeamsBackgroundDensityClasses[density],
            )}
          />
          {running
            ? beams.map((beam, index) => (
                <div
                  key={index}
                  className={gridBeamsBackgroundRailClasses[beam.axis]}
                  style={railStyle(beam)}
                >
                  <motionElement.div
                    data-slot="grid-beams-background-beam"
                    className={cn(
                      gridBeamsBackgroundBeamClasses[beam.axis],
                      gridBeamsBackgroundBeamToneClasses[tone],
                      beam.axis === "x" ? "left-0" : "top-0",
                    )}
                    initial={
                      beam.axis === "x" ? { x: "-100%" } : { y: "-100%" }
                    }
                    animate={beam.axis === "x" ? { x: "433%" } : { y: "433%" }}
                    transition={{
                      ...motionConfig.transition,
                      delay: beam.delay,
                      repeatDelay: beam.repeatDelay,
                    }}
                  />
                </div>
              ))
            : beams.slice(0, 2).map((beam, index) => (
                <div
                  key={index}
                  className={gridBeamsBackgroundRailClasses[beam.axis]}
                  style={railStyle(beam)}
                >
                  <div
                    data-slot="grid-beams-background-beam"
                    className={cn(
                      gridBeamsBackgroundBeamClasses[beam.axis],
                      gridBeamsBackgroundBeamToneClasses[tone],
                      "opacity-40",
                    )}
                    style={
                      beam.axis === "x"
                        ? { left: `${beam.staticOffset}%` }
                        : { top: `${beam.staticOffset}%` }
                    }
                  />
                </div>
              ))}
        </div>
        <div
          data-slot="grid-beams-background-content"
          className={gridBeamsBackgroundContentClassNames()}
        >
          {children}
        </div>
      </div>
    </MotionConfig>
  );
});

GridBeamsBackground.displayName = "GridBeamsBackground";
