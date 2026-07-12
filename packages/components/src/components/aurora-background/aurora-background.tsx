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
import { mulberry32, seededPick, seededRange } from "../../utils/seeded-random";

export type AuroraBackgroundDensity = "sparse" | "normal" | "dense";
export type AuroraBackgroundIntensity = "faint" | "subtle" | "bold";
export type AuroraBackgroundSpeed = "slow" | "normal" | "fast";
export type AuroraBackgroundTone = "foreground" | "muted" | "primary";

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

export interface AuroraBackgroundProps extends MotionSafeDivProps {
  animate?: boolean;
  children?: ReactNode;
  density?: AuroraBackgroundDensity;
  intensity?: AuroraBackgroundIntensity;
  seed?: number;
  speed?: AuroraBackgroundSpeed;
  tone?: AuroraBackgroundTone;
}

export interface AuroraBackgroundMotionConfig {
  animateEnabled: boolean;
  driftDuration: number;
  reducedMotion: boolean;
  transition: Transition;
}

export interface AuroraBackgroundRibbon {
  delay: number;
  driftX: number;
  driftY: number;
  durationScale: number;
  rotationClassName: string;
  swayDegrees: number;
  top: number;
}

const auroraBackgroundSpeedDurations: Record<AuroraBackgroundSpeed, number> = {
  slow: 32,
  normal: 22,
  fast: 14,
};

export function getAuroraBackgroundMotionConfig(
  speed: AuroraBackgroundSpeed,
  reducedMotion = false,
): AuroraBackgroundMotionConfig {
  if (reducedMotion) {
    return {
      animateEnabled: false,
      driftDuration: 0,
      reducedMotion: true,
      transition: { duration: 0 },
    };
  }

  const driftDuration = auroraBackgroundSpeedDurations[speed];

  return {
    animateEnabled: true,
    driftDuration,
    reducedMotion: false,
    transition: {
      duration: driftDuration,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "mirror",
    },
  };
}

const auroraBackgroundRibbonCounts: Record<AuroraBackgroundDensity, number> = {
  sparse: 3,
  normal: 4,
  dense: 5,
};

// Base rotations come from a literal class set (never inline transform styles)
// so the server markup stays free of transforms and Tailwind can see every
// class statically.
const auroraBackgroundRotationClasses = [
  "-rotate-12",
  "-rotate-6",
  "-rotate-3",
  "rotate-3",
  "rotate-6",
  "rotate-12",
] as const;

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function getAuroraBackgroundGeometry(
  seed: number,
  density: AuroraBackgroundDensity,
): AuroraBackgroundRibbon[] {
  const random = mulberry32(seed);

  return Array.from({ length: auroraBackgroundRibbonCounts[density] }, () => ({
    top: Math.round(seededRange(random, -15, 65)),
    rotationClassName: seededPick(random, auroraBackgroundRotationClasses),
    driftX: Math.round(seededRange(random, 8, 18)),
    driftY: Math.round(seededRange(random, 4, 10)),
    swayDegrees: roundTo(seededRange(random, 2, 6), 2),
    delay: roundTo(seededRange(random, 0, 6), 2),
    durationScale: roundTo(seededRange(random, 0.85, 1.25), 2),
  }));
}

// Each ribbon slot shifts the hue of the active tone color by a fixed number
// of OKLCH degrees, so one semantic token yields a designed multi-hue aurora.
// The spread is wide enough that neighboring slots land on clearly distinct
// color families rather than tints of the same hue.
export const auroraBackgroundHueShifts = [0, 75, -60, 145, -115] as const;

const auroraBackgroundRootClasses = "relative isolate overflow-hidden";

const auroraBackgroundLayerClasses =
  "pointer-events-none absolute inset-0 select-none";

const auroraBackgroundContentClasses = "relative z-10";

const auroraBackgroundRailClasses = "absolute -inset-x-1/3 h-64";

// The hue rotation is a progressive enhancement: browsers without relative
// color syntax keep plain currentColor, which reads as a designed mono-hue
// aurora. The chroma floor and lightness clamp keep the rotation visible and
// vibrant when the tone token is a near-neutral (the default theme's
// primary/foreground tokens have zero chroma, where a bare hue rotation is a
// no-op); tokens that already carry chroma and mid lightness pass through
// unchanged. The alpha multiplier compensates for blur spreading the color
// thin while preserving the tone/intensity alpha ladder proportionally. Blur
// is a static style and must never be animated.
const auroraBackgroundRibbonClasses =
  "h-full w-full rounded-[100%] bg-gradient-to-r from-transparent via-current to-transparent blur-2xl supports-[color:oklch(from_red_l_c_h)]:[color:oklch(from_currentcolor_clamp(0.65,l,0.75)_max(c,0.19)_calc(h_+_var(--aurora-hue-shift,0))/calc(alpha*1.35))]";

const auroraBackgroundStaticRibbonOpacityClasses = [
  "opacity-70",
  "opacity-50",
  "opacity-60",
  "opacity-40",
  "opacity-55",
] as const;

// Ribbons cover far more surface than the family's thin geometry, so each
// tier sits one step below the geometric backgrounds' alpha values to keep
// hero copy readable, especially in dark mode.
const auroraBackgroundToneIntensityClasses: Record<
  AuroraBackgroundTone,
  Record<AuroraBackgroundIntensity, string>
> = {
  foreground: {
    faint: "text-foreground/15 dark:text-foreground/15",
    subtle: "text-foreground/25 dark:text-foreground/25",
    bold: "text-foreground/35 dark:text-foreground/40",
  },
  muted: {
    faint: "text-muted-foreground/20 dark:text-muted-foreground/20",
    subtle: "text-muted-foreground/30 dark:text-muted-foreground/30",
    bold: "text-muted-foreground/45 dark:text-muted-foreground/45",
  },
  primary: {
    faint: "text-primary/20 dark:text-primary/20",
    subtle: "text-primary/35 dark:text-primary/35",
    bold: "text-primary/50 dark:text-primary/50",
  },
};

export interface AuroraBackgroundClassNamesOptions {
  className?: string;
}

export function auroraBackgroundClassNames({
  className,
}: AuroraBackgroundClassNamesOptions = {}) {
  return cn(auroraBackgroundRootClasses, className);
}

export interface AuroraBackgroundLayerClassNamesOptions {
  className?: string;
  intensity?: AuroraBackgroundIntensity;
  tone?: AuroraBackgroundTone;
}

export function auroraBackgroundLayerClassNames({
  className,
  intensity = "subtle",
  tone = "primary",
}: AuroraBackgroundLayerClassNamesOptions = {}) {
  return cn(
    auroraBackgroundLayerClasses,
    auroraBackgroundToneIntensityClasses[tone][intensity],
    className,
  );
}

export interface AuroraBackgroundContentClassNamesOptions {
  className?: string;
}

export function auroraBackgroundContentClassNames({
  className,
}: AuroraBackgroundContentClassNamesOptions = {}) {
  return cn(auroraBackgroundContentClasses, className);
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

// Pauses looping drifts while the background is scrolled offscreen. Fails open
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

function railStyle(ribbon: AuroraBackgroundRibbon): CSSProperties {
  return { top: `${ribbon.top}%` };
}

function ribbonStyle(slot: number): CSSProperties {
  return {
    "--aurora-hue-shift": `${auroraBackgroundHueShifts[slot % auroraBackgroundHueShifts.length]}`,
  } as CSSProperties;
}

export const AuroraBackground = forwardRef(function AuroraBackground(
  {
    animate = true,
    children,
    className,
    density = "normal",
    intensity = "subtle",
    seed = 1,
    speed = "normal",
    tone = "primary",
    ...props
  }: AuroraBackgroundProps,
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
  const running = hasHydrated && !reducedMotion && inView;

  const motionConfig = getAuroraBackgroundMotionConfig(speed, reducedMotion);
  const ribbons = useMemo(
    () => getAuroraBackgroundGeometry(seed, density),
    [seed, density],
  );

  return (
    <MotionConfig reducedMotion={reducedMotion ? "always" : "user"}>
      <div
        {...props}
        ref={composedRef}
        data-slot="aurora-background"
        data-animate={animate ? "true" : "false"}
        data-density={density}
        data-intensity={intensity}
        data-speed={speed}
        data-tone={tone}
        data-reduced-motion={reducedMotion ? "true" : undefined}
        className={auroraBackgroundClassNames({ className })}
      >
        <div
          aria-hidden="true"
          data-slot="aurora-background-layer"
          className={auroraBackgroundLayerClassNames({ intensity, tone })}
        >
          {ribbons.map((ribbon, slot) => (
            <div
              key={slot}
              className={cn(
                auroraBackgroundRailClasses,
                ribbon.rotationClassName,
              )}
              style={railStyle(ribbon)}
            >
              {running ? (
                <motionElement.div
                  data-slot="aurora-background-ribbon"
                  className={auroraBackgroundRibbonClasses}
                  style={ribbonStyle(slot)}
                  initial={{
                    opacity: 1,
                    rotate: -ribbon.swayDegrees,
                    scaleY: 1,
                    x: `${-ribbon.driftX}%`,
                    y: `${-ribbon.driftY}%`,
                  }}
                  animate={{
                    opacity: [1, 0.65],
                    rotate: [-ribbon.swayDegrees, ribbon.swayDegrees],
                    scaleY: [1, 1.15],
                    x: [`${-ribbon.driftX}%`, `${ribbon.driftX}%`],
                    y: [`${-ribbon.driftY}%`, `${ribbon.driftY}%`],
                  }}
                  transition={{
                    ...motionConfig.transition,
                    delay: ribbon.delay,
                    duration: motionConfig.driftDuration * ribbon.durationScale,
                  }}
                />
              ) : (
                <div
                  data-slot="aurora-background-ribbon"
                  className={cn(
                    auroraBackgroundRibbonClasses,
                    auroraBackgroundStaticRibbonOpacityClasses[
                      slot % auroraBackgroundStaticRibbonOpacityClasses.length
                    ],
                  )}
                  style={ribbonStyle(slot)}
                />
              )}
            </div>
          ))}
        </div>
        <div
          data-slot="aurora-background-content"
          className={auroraBackgroundContentClassNames()}
        >
          {children}
        </div>
      </div>
    </MotionConfig>
  );
});

AuroraBackground.displayName = "AuroraBackground";
