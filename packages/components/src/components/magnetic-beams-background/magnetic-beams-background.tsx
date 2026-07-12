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
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import {
  MotionConfig,
  animate,
  motion as motionElement,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type AnimationPlaybackControls,
  type MotionValue,
  type Transition,
} from "motion/react";
import { cn } from "../../utils/cn";
import { mulberry32, seededRange } from "../../utils/seeded-random";

export type MagneticBeamsBackgroundDensity = "sparse" | "normal" | "dense";
export type MagneticBeamsBackgroundMode = "magnetic" | "follow";
export type MagneticBeamsBackgroundIntensity = "faint" | "subtle" | "bold";
export type MagneticBeamsBackgroundSpeed = "slow" | "normal" | "fast";
export type MagneticBeamsBackgroundTone = "foreground" | "muted" | "primary";
export type MagneticBeamsBackgroundBeamAxis = "x" | "y";

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

export interface MagneticBeamsBackgroundProps extends MotionSafeDivProps {
  animate?: boolean;
  children?: ReactNode;
  density?: MagneticBeamsBackgroundDensity;
  intensity?: MagneticBeamsBackgroundIntensity;
  interactive?: boolean;
  mode?: MagneticBeamsBackgroundMode;
  seed?: number;
  speed?: MagneticBeamsBackgroundSpeed;
  tone?: MagneticBeamsBackgroundTone;
}

export interface MagneticBeamsBackgroundMotionConfig {
  animateEnabled: boolean;
  attractTransition: Transition;
  beamDuration: number;
  reducedMotion: boolean;
  transition: Transition;
}

export interface MagneticBeamsBackgroundBeam {
  axis: MagneticBeamsBackgroundBeamAxis;
  delay: number;
  position: number;
  repeatDelay: number;
  staticOffset: number;
}

const magneticBeamsBackgroundSpeedDurations: Record<
  MagneticBeamsBackgroundSpeed,
  number
> = {
  slow: 9,
  normal: 6,
  fast: 3.5,
};

export function getMagneticBeamsBackgroundMotionConfig(
  speed: MagneticBeamsBackgroundSpeed,
  reducedMotion = false,
): MagneticBeamsBackgroundMotionConfig {
  if (reducedMotion) {
    return {
      animateEnabled: false,
      attractTransition: { duration: 0 },
      beamDuration: 0,
      reducedMotion: true,
      transition: { duration: 0 },
    };
  }

  const beamDuration = magneticBeamsBackgroundSpeedDurations[speed];

  return {
    animateEnabled: true,
    attractTransition: { type: "spring", stiffness: 120, damping: 24 },
    beamDuration,
    reducedMotion: false,
    transition: { duration: beamDuration, ease: "linear", repeat: Infinity },
  };
}

const magneticBeamsBackgroundBeamCounts: Record<
  MagneticBeamsBackgroundDensity,
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

export function getMagneticBeamsBackgroundGeometry(
  seed: number,
  density: MagneticBeamsBackgroundDensity,
): MagneticBeamsBackgroundBeam[] {
  const random = mulberry32(seed);

  return Array.from(
    { length: magneticBeamsBackgroundBeamCounts[density] },
    () => ({
      axis: (random() > 0.5 ? "x" : "y") as MagneticBeamsBackgroundBeamAxis,
      position: Math.round(seededRange(random, 8, 92)),
      delay: roundTo(seededRange(random, 0, 4), 2),
      repeatDelay: roundTo(seededRange(random, 1.5, 5), 2),
      staticOffset: Math.round(seededRange(random, 10, 60)),
    }),
  );
}

// A beam spans 30% of its rail and travels from -100% to 433% of its own
// length, so a full pass carries it fully offscreen on both ends. Progress is
// the normalized 0..1 position within that pass.
const magneticBeamsBackgroundBeamLengthFraction = 0.3;
const magneticBeamsBackgroundTravelStart = -100;
const magneticBeamsBackgroundTravelSpan = 533;

export function getMagneticBeamsBackgroundPointerProgress(
  pointerFraction: number,
): number {
  const fraction = Math.min(1, Math.max(0, pointerFraction));
  const translate =
    ((fraction - magneticBeamsBackgroundBeamLengthFraction / 2) * 100) /
    magneticBeamsBackgroundBeamLengthFraction;
  const progress =
    (translate - magneticBeamsBackgroundTravelStart) /
    magneticBeamsBackgroundTravelSpan;

  return Math.min(1, Math.max(0, progress));
}

// In "follow" mode a beam covers the distance to the pointer at its normal
// pass speed instead of a spring, so the chase reads as steady travel.
export function getMagneticBeamsBackgroundFollowDuration(
  currentProgress: number,
  targetProgress: number,
  beamDuration: number,
): number {
  return Math.abs(targetProgress - currentProgress) * beamDuration;
}

const magneticBeamsBackgroundRootClasses = "relative isolate overflow-hidden";

const magneticBeamsBackgroundLayerClasses =
  "pointer-events-none absolute inset-0 select-none";

const magneticBeamsBackgroundContentClasses = "relative z-10";

const magneticBeamsBackgroundPatternClasses =
  "absolute inset-0 [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)]";

const magneticBeamsBackgroundDensityClasses: Record<
  MagneticBeamsBackgroundDensity,
  string
> = {
  sparse: "[background-size:96px_96px]",
  normal: "[background-size:56px_56px]",
  dense: "[background-size:32px_32px]",
};

const magneticBeamsBackgroundToneIntensityClasses: Record<
  MagneticBeamsBackgroundTone,
  Record<MagneticBeamsBackgroundIntensity, string>
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

const magneticBeamsBackgroundBeamToneClasses: Record<
  MagneticBeamsBackgroundTone,
  string
> = {
  foreground: "text-foreground/40 dark:text-foreground/50",
  muted: "text-muted-foreground/40 dark:text-muted-foreground/50",
  primary: "text-primary/60 dark:text-primary/70",
};

const magneticBeamsBackgroundRailClasses: Record<
  MagneticBeamsBackgroundBeamAxis,
  string
> = {
  x: "absolute inset-x-0 h-px",
  y: "absolute inset-y-0 w-px",
};

const magneticBeamsBackgroundBeamClasses: Record<
  MagneticBeamsBackgroundBeamAxis,
  string
> = {
  x: "absolute inset-y-0 w-[30%] bg-gradient-to-r from-transparent via-current to-transparent",
  y: "absolute inset-x-0 h-[30%] bg-gradient-to-b from-transparent via-current to-transparent",
};

export interface MagneticBeamsBackgroundClassNamesOptions {
  className?: string;
}

export function magneticBeamsBackgroundClassNames({
  className,
}: MagneticBeamsBackgroundClassNamesOptions = {}) {
  return cn(magneticBeamsBackgroundRootClasses, className);
}

export interface MagneticBeamsBackgroundLayerClassNamesOptions {
  className?: string;
  intensity?: MagneticBeamsBackgroundIntensity;
  tone?: MagneticBeamsBackgroundTone;
}

export function magneticBeamsBackgroundLayerClassNames({
  className,
  intensity = "subtle",
  tone = "muted",
}: MagneticBeamsBackgroundLayerClassNamesOptions = {}) {
  return cn(
    magneticBeamsBackgroundLayerClasses,
    magneticBeamsBackgroundToneIntensityClasses[tone][intensity],
    className,
  );
}

export interface MagneticBeamsBackgroundContentClassNamesOptions {
  className?: string;
}

export function magneticBeamsBackgroundContentClassNames({
  className,
}: MagneticBeamsBackgroundContentClassNamesOptions = {}) {
  return cn(magneticBeamsBackgroundContentClasses, className);
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

function railStyle(beam: MagneticBeamsBackgroundBeam): CSSProperties {
  return beam.axis === "x"
    ? { top: `${beam.position}%` }
    : { left: `${beam.position}%` };
}

interface MagneticBeamsBackgroundBeamElementProps {
  attracting: boolean;
  beam: MagneticBeamsBackgroundBeam;
  mode: MagneticBeamsBackgroundMode;
  motionConfig: MagneticBeamsBackgroundMotionConfig;
  pointerFraction: MotionValue<number>;
  tone: MagneticBeamsBackgroundTone;
}

// One beam, driven imperatively through a 0..1 pass-progress motion value so
// the traversal loop, the pointer attraction spring, and the resume pass all
// hand the same value to each other without visual jumps.
function MagneticBeamsBackgroundBeamElement({
  attracting,
  beam,
  mode,
  motionConfig,
  pointerFraction,
  tone,
}: MagneticBeamsBackgroundBeamElementProps) {
  const progress = useMotionValue(0);
  const translate = useTransform(
    progress,
    (value) =>
      `${magneticBeamsBackgroundTravelStart + value * magneticBeamsBackgroundTravelSpan}%`,
  );

  useEffect(() => {
    let controls: AnimationPlaybackControls | undefined;
    let disposed = false;

    const startLoop = (delay: number) => {
      controls = animate(progress, [0, 1], {
        ...motionConfig.transition,
        delay,
        repeatDelay: beam.repeatDelay,
      });
    };

    if (attracting) {
      // Magnetic mode re-targets a spring on every pointer move (velocity is
      // preserved, so the beam glides between targets). Follow mode travels
      // to each target linearly at the beam's normal pass speed.
      const attract = (fraction: number) => {
        const target = getMagneticBeamsBackgroundPointerProgress(fraction);

        controls =
          mode === "follow"
            ? animate(progress, target, {
                duration: getMagneticBeamsBackgroundFollowDuration(
                  progress.get(),
                  target,
                  motionConfig.beamDuration,
                ),
                ease: "linear",
              })
            : animate(progress, target, motionConfig.attractTransition);
      };

      attract(pointerFraction.get());
      const unsubscribe = pointerFraction.on("change", attract);

      return () => {
        disposed = true;
        unsubscribe();
        controls?.stop();
      };
    }

    const current = progress.get();

    if (current > 0) {
      // Resuming after attraction: finish the current pass at the normal
      // linear speed from wherever the beam sits, then re-enter the loop.
      controls = animate(progress, 1, {
        duration: motionConfig.beamDuration * (1 - current),
        ease: "linear",
      });
      void controls.finished.then(() => {
        if (!disposed) {
          startLoop(beam.repeatDelay);
        }
      });
    } else {
      startLoop(beam.delay);
    }

    return () => {
      disposed = true;
      controls?.stop();
    };
  }, [attracting, beam, mode, motionConfig, pointerFraction, progress]);

  return (
    <motionElement.div
      data-slot="magnetic-beams-background-beam"
      className={cn(
        magneticBeamsBackgroundBeamClasses[beam.axis],
        magneticBeamsBackgroundBeamToneClasses[tone],
        beam.axis === "x" ? "left-0" : "top-0",
      )}
      style={beam.axis === "x" ? { x: translate } : { y: translate }}
    />
  );
}

export const MagneticBeamsBackground = forwardRef(
  function MagneticBeamsBackground(
    {
      animate: animateProp = true,
      children,
      className,
      density = "normal",
      intensity = "subtle",
      interactive = true,
      mode = "magnetic",
      onPointerLeave: onPointerLeaveProp,
      onPointerMove: onPointerMoveProp,
      seed = 1,
      speed = "normal",
      tone = "muted",
      ...props
    }: MagneticBeamsBackgroundProps,
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
      !animateProp || (hasHydrated && prefersReducedMotion === true);
    const running = hasHydrated && !reducedMotion && inView;

    const motionConfig = useMemo(
      () => getMagneticBeamsBackgroundMotionConfig(speed, reducedMotion),
      [speed, reducedMotion],
    );
    const beams = useMemo(
      () => getMagneticBeamsBackgroundGeometry(seed, density),
      [seed, density],
    );

    // Pointer tracking runs through motion values — no React state per pointer
    // move. Only crossing the enter/leave boundary re-renders, which flips the
    // beams between their loop and attract modes.
    const pointerXFraction = useMotionValue(0.5);
    const pointerYFraction = useMotionValue(0.5);
    const [pointerActive, setPointerActive] = useState(false);

    const attractEnabled = running && interactive;
    const attracting = attractEnabled && pointerActive;

    const handlePointerMove = useCallback(
      (event: ReactPointerEvent<HTMLDivElement>) => {
        onPointerMoveProp?.(event);

        if (!attractEnabled) {
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

        pointerXFraction.set((event.clientX - rect.left) / rect.width);
        pointerYFraction.set((event.clientY - rect.top) / rect.height);
        setPointerActive(true);
      },
      [attractEnabled, onPointerMoveProp, pointerXFraction, pointerYFraction],
    );

    const handlePointerLeave = useCallback(
      (event: ReactPointerEvent<HTMLDivElement>) => {
        onPointerLeaveProp?.(event);
        setPointerActive(false);
      },
      [onPointerLeaveProp],
    );

    return (
      <MotionConfig reducedMotion={reducedMotion ? "always" : "user"}>
        <div
          {...props}
          ref={composedRef}
          data-slot="magnetic-beams-background"
          data-animate={animateProp ? "true" : "false"}
          data-density={density}
          data-intensity={intensity}
          data-interactive={interactive ? "true" : "false"}
          data-mode={mode}
          data-speed={speed}
          data-tone={tone}
          data-reduced-motion={reducedMotion ? "true" : undefined}
          className={magneticBeamsBackgroundClassNames({ className })}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
        >
          <div
            aria-hidden="true"
            data-slot="magnetic-beams-background-layer"
            className={magneticBeamsBackgroundLayerClassNames({
              intensity,
              tone,
            })}
          >
            <div
              className={cn(
                magneticBeamsBackgroundPatternClasses,
                magneticBeamsBackgroundDensityClasses[density],
              )}
            />
            {running
              ? beams.map((beam, index) => (
                  <div
                    key={index}
                    className={magneticBeamsBackgroundRailClasses[beam.axis]}
                    style={railStyle(beam)}
                  >
                    <MagneticBeamsBackgroundBeamElement
                      attracting={attracting}
                      beam={beam}
                      mode={mode}
                      motionConfig={motionConfig}
                      pointerFraction={
                        beam.axis === "x" ? pointerXFraction : pointerYFraction
                      }
                      tone={tone}
                    />
                  </div>
                ))
              : beams.slice(0, 2).map((beam, index) => (
                  <div
                    key={index}
                    className={magneticBeamsBackgroundRailClasses[beam.axis]}
                    style={railStyle(beam)}
                  >
                    <div
                      data-slot="magnetic-beams-background-beam"
                      className={cn(
                        magneticBeamsBackgroundBeamClasses[beam.axis],
                        magneticBeamsBackgroundBeamToneClasses[tone],
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
            data-slot="magnetic-beams-background-content"
            className={magneticBeamsBackgroundContentClassNames()}
          >
            {children}
          </div>
        </div>
      </MotionConfig>
    );
  },
);

MagneticBeamsBackground.displayName = "MagneticBeamsBackground";
