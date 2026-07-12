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
  motion as motionElement,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  type Transition,
} from "motion/react";
import { cn } from "../../utils/cn";
import { mulberry32, seededRange } from "../../utils/seeded-random";

export type DotMatrixBackgroundDensity = "sparse" | "normal" | "dense";
export type DotMatrixBackgroundIntensity = "faint" | "subtle" | "bold";
export type DotMatrixBackgroundMode = "pulse" | "follow";
export type DotMatrixBackgroundSpeed = "slow" | "normal" | "fast";
export type DotMatrixBackgroundTone = "foreground" | "muted" | "primary";

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

export interface DotMatrixBackgroundProps extends MotionSafeDivProps {
  animate?: boolean;
  children?: ReactNode;
  density?: DotMatrixBackgroundDensity;
  intensity?: DotMatrixBackgroundIntensity;
  interactive?: boolean;
  mode?: DotMatrixBackgroundMode;
  seed?: number;
  speed?: DotMatrixBackgroundSpeed;
  tone?: DotMatrixBackgroundTone;
}

export interface DotMatrixBackgroundMotionConfig {
  animateEnabled: boolean;
  pulseDuration: number;
  reducedMotion: boolean;
  transition: Transition;
}

export interface DotMatrixBackgroundPulse {
  delay: number;
  originX: number;
  originY: number;
  repeatDelay: number;
}

const dotMatrixBackgroundSpeedDurations: Record<
  DotMatrixBackgroundSpeed,
  number
> = {
  slow: 7,
  normal: 5,
  fast: 3,
};

export function getDotMatrixBackgroundMotionConfig(
  speed: DotMatrixBackgroundSpeed,
  reducedMotion = false,
): DotMatrixBackgroundMotionConfig {
  if (reducedMotion) {
    return {
      animateEnabled: false,
      pulseDuration: 0,
      reducedMotion: true,
      transition: { duration: 0 },
    };
  }

  const pulseDuration = dotMatrixBackgroundSpeedDurations[speed];

  return {
    animateEnabled: true,
    pulseDuration,
    reducedMotion: false,
    transition: {
      duration: pulseDuration,
      ease: "easeInOut",
      repeat: Infinity,
    },
  };
}

const dotMatrixBackgroundPulseCount = 3;

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function getDotMatrixBackgroundGeometry(
  seed: number,
): DotMatrixBackgroundPulse[] {
  const random = mulberry32(seed);

  return Array.from({ length: dotMatrixBackgroundPulseCount }, () => ({
    originX: Math.round(seededRange(random, 15, 85)),
    originY: Math.round(seededRange(random, 15, 85)),
    delay: roundTo(seededRange(random, 0, 3), 2),
    repeatDelay: roundTo(seededRange(random, 0.5, 2.5), 2),
  }));
}

const dotMatrixBackgroundRootClasses = "relative isolate overflow-hidden";

const dotMatrixBackgroundLayerClasses =
  "pointer-events-none absolute inset-0 select-none";

const dotMatrixBackgroundContentClasses = "relative z-10";

const dotMatrixBackgroundPatternClasses =
  "absolute inset-0 [background-image:radial-gradient(circle,currentColor_1.5px,transparent_1.5px)]";

const dotMatrixBackgroundDensityClasses: Record<
  DotMatrixBackgroundDensity,
  string
> = {
  sparse: "[background-size:48px_48px]",
  normal: "[background-size:32px_32px]",
  dense: "[background-size:20px_20px]",
};

const dotMatrixBackgroundToneIntensityClasses: Record<
  DotMatrixBackgroundTone,
  Record<DotMatrixBackgroundIntensity, string>
> = {
  foreground: {
    faint: "text-foreground/10 dark:text-foreground/15",
    subtle: "text-foreground/15 dark:text-foreground/20",
    bold: "text-foreground/20 dark:text-foreground/30",
  },
  muted: {
    faint: "text-muted-foreground/15 dark:text-muted-foreground/20",
    subtle: "text-muted-foreground/20 dark:text-muted-foreground/30",
    bold: "text-muted-foreground/30 dark:text-muted-foreground/45",
  },
  primary: {
    faint: "text-primary/10 dark:text-primary/15",
    subtle: "text-primary/15 dark:text-primary/25",
    bold: "text-primary/25 dark:text-primary/35",
  },
};

const dotMatrixBackgroundPulseToneClasses: Record<
  DotMatrixBackgroundTone,
  string
> = {
  foreground: "text-foreground/50 dark:text-foreground/60",
  muted: "text-muted-foreground/50 dark:text-muted-foreground/60",
  primary: "text-primary/70 dark:text-primary/80",
};

export interface DotMatrixBackgroundClassNamesOptions {
  className?: string;
}

export function dotMatrixBackgroundClassNames({
  className,
}: DotMatrixBackgroundClassNamesOptions = {}) {
  return cn(dotMatrixBackgroundRootClasses, className);
}

export interface DotMatrixBackgroundLayerClassNamesOptions {
  className?: string;
  intensity?: DotMatrixBackgroundIntensity;
  tone?: DotMatrixBackgroundTone;
}

export function dotMatrixBackgroundLayerClassNames({
  className,
  intensity = "subtle",
  tone = "muted",
}: DotMatrixBackgroundLayerClassNamesOptions = {}) {
  return cn(
    dotMatrixBackgroundLayerClasses,
    dotMatrixBackgroundToneIntensityClasses[tone][intensity],
    className,
  );
}

export interface DotMatrixBackgroundContentClassNamesOptions {
  className?: string;
}

export function dotMatrixBackgroundContentClassNames({
  className,
}: DotMatrixBackgroundContentClassNamesOptions = {}) {
  return cn(dotMatrixBackgroundContentClasses, className);
}

// The pulse is a full-bleed copy of the dot pattern so its dots align exactly
// with the base grid; a fixed radial mask at the seeded origin limits it to a
// local glow. Brightness animates via opacity only — scaling would misalign
// the pattern. Browsers without mask support degrade to a whole-field pulse.
function pulseMaskStyle(pulse: DotMatrixBackgroundPulse): CSSProperties {
  const mask = `radial-gradient(circle at ${pulse.originX}% ${pulse.originY}%, black 0%, black 12%, transparent 32%)`;

  return {
    maskImage: mask,
    WebkitMaskImage: mask,
  };
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

// Pauses looping pulses while the background is scrolled offscreen. Fails open
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

export const DotMatrixBackground = forwardRef(function DotMatrixBackground(
  {
    animate = true,
    children,
    className,
    density = "normal",
    intensity = "subtle",
    interactive = true,
    mode = "pulse",
    onPointerLeave: onPointerLeaveProp,
    onPointerMove: onPointerMoveProp,
    seed = 1,
    speed = "normal",
    tone = "muted",
    ...props
  }: DotMatrixBackgroundProps,
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

  const motionConfig = getDotMatrixBackgroundMotionConfig(speed, reducedMotion);
  const pulses = useMemo(() => getDotMatrixBackgroundGeometry(seed), [seed]);

  // The follow highlight is driven by Motion values rather than React state,
  // keeping pointer movement off the render path. A spring makes the local
  // dot glow trail the mouse without changing the underlying grid alignment.
  const pointerX = useMotionValue(50);
  const pointerY = useMotionValue(50);
  const followX = useSpring(pointerX, { stiffness: 180, damping: 26 });
  const followY = useSpring(pointerY, { stiffness: 180, damping: 26 });
  const followMask = useMotionTemplate`radial-gradient(circle at ${followX}% ${followY}%, black 0%, black 12%, transparent 32%)`;
  const [pointerActive, setPointerActive] = useState(false);
  const followEnabled = running && interactive && mode === "follow";

  useEffect(() => {
    if (!followEnabled) {
      setPointerActive(false);
    }
  }, [followEnabled]);

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      onPointerMoveProp?.(event);

      // This is a non-essential mouse enhancement. Touch remains free to
      // scroll and operate the content without producing decorative motion.
      if (!followEnabled || event.pointerType === "touch") {
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

      pointerX.set(
        Math.min(
          100,
          Math.max(0, ((event.clientX - rect.left) / rect.width) * 100),
        ),
      );
      pointerY.set(
        Math.min(
          100,
          Math.max(0, ((event.clientY - rect.top) / rect.height) * 100),
        ),
      );
      setPointerActive(true);
    },
    [followEnabled, onPointerMoveProp, pointerX, pointerY],
  );

  const handlePointerLeave = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      onPointerLeaveProp?.(event);
      setPointerActive(false);
    },
    [onPointerLeaveProp],
  );

  const patternClassName = cn(
    dotMatrixBackgroundPatternClasses,
    dotMatrixBackgroundDensityClasses[density],
  );
  const pulseClassName = cn(
    patternClassName,
    dotMatrixBackgroundPulseToneClasses[tone],
  );

  return (
    <MotionConfig reducedMotion={reducedMotion ? "always" : "user"}>
      <div
        {...props}
        ref={composedRef}
        data-slot="dot-matrix-background"
        data-animate={animate ? "true" : "false"}
        data-density={density}
        data-intensity={intensity}
        data-interactive={interactive ? "true" : "false"}
        data-mode={mode}
        data-speed={speed}
        data-tone={tone}
        data-reduced-motion={reducedMotion ? "true" : undefined}
        className={dotMatrixBackgroundClassNames({ className })}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        <div
          aria-hidden="true"
          data-slot="dot-matrix-background-layer"
          className={dotMatrixBackgroundLayerClassNames({ intensity, tone })}
        >
          <div className={patternClassName} />
          {followEnabled ? (
            <motionElement.div
              data-slot="dot-matrix-background-follow"
              className={pulseClassName}
              style={{ maskImage: followMask, WebkitMaskImage: followMask }}
              initial={false}
              animate={{ opacity: pointerActive ? 1 : 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            />
          ) : running ? (
            pulses.map((pulse, index) => (
              <motionElement.div
                key={index}
                data-slot="dot-matrix-background-pulse"
                className={pulseClassName}
                style={pulseMaskStyle(pulse)}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{
                  ...motionConfig.transition,
                  delay: pulse.delay,
                  repeatDelay: pulse.repeatDelay,
                }}
              />
            ))
          ) : (
            pulses
              .slice(0, 1)
              .map((pulse, index) => (
                <div
                  key={index}
                  data-slot="dot-matrix-background-pulse"
                  className={cn(pulseClassName, "opacity-50")}
                  style={pulseMaskStyle(pulse)}
                />
              ))
          )}
        </div>
        <div
          data-slot="dot-matrix-background-content"
          className={dotMatrixBackgroundContentClassNames()}
        >
          {children}
        </div>
      </div>
    </MotionConfig>
  );
});

DotMatrixBackground.displayName = "DotMatrixBackground";
