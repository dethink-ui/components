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
import { mulberry32, seededRange } from "../../utils/seeded-random";

export type ScanGridBackgroundDensity = "sparse" | "normal" | "dense";
export type ScanGridBackgroundDirection = "vertical" | "horizontal";
export type ScanGridBackgroundIntensity = "faint" | "subtle" | "bold";
export type ScanGridBackgroundSpeed = "slow" | "normal" | "fast";
export type ScanGridBackgroundTone = "foreground" | "muted" | "primary";

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

export interface ScanGridBackgroundProps extends MotionSafeDivProps {
  animate?: boolean;
  children?: ReactNode;
  density?: ScanGridBackgroundDensity;
  direction?: ScanGridBackgroundDirection;
  intensity?: ScanGridBackgroundIntensity;
  seed?: number;
  speed?: ScanGridBackgroundSpeed;
  tone?: ScanGridBackgroundTone;
}

export interface ScanGridBackgroundMotionConfig {
  animateEnabled: boolean;
  reducedMotion: boolean;
  repeatDelay: number;
  scanDuration: number;
  transition: Transition;
}

export interface ScanGridBackgroundGeometry {
  delay: number;
  staticOffset: number;
}

const scanGridBackgroundSpeedSettings: Record<
  ScanGridBackgroundSpeed,
  { duration: number; repeatDelay: number }
> = {
  slow: { duration: 12, repeatDelay: 2.5 },
  normal: { duration: 8, repeatDelay: 1.5 },
  fast: { duration: 5, repeatDelay: 0.75 },
};

export function getScanGridBackgroundMotionConfig(
  speed: ScanGridBackgroundSpeed,
  reducedMotion = false,
): ScanGridBackgroundMotionConfig {
  if (reducedMotion) {
    return {
      animateEnabled: false,
      reducedMotion: true,
      repeatDelay: 0,
      scanDuration: 0,
      transition: { duration: 0 },
    };
  }

  const { duration, repeatDelay } = scanGridBackgroundSpeedSettings[speed];

  return {
    animateEnabled: true,
    reducedMotion: false,
    repeatDelay,
    scanDuration: duration,
    transition: {
      duration,
      ease: "linear",
      repeat: Infinity,
      repeatDelay,
    },
  };
}

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function getScanGridBackgroundGeometry(
  seed: number,
): ScanGridBackgroundGeometry {
  const random = mulberry32(seed);

  return {
    delay: roundTo(seededRange(random, 0, 2), 2),
    staticOffset: Math.round(seededRange(random, 20, 45)),
  };
}

const scanGridBackgroundRootClasses = "relative isolate overflow-hidden";

const scanGridBackgroundLayerClasses =
  "pointer-events-none absolute inset-0 select-none";

const scanGridBackgroundContentClasses = "relative z-10";

const scanGridBackgroundPatternClasses =
  "absolute inset-0 [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)]";

const scanGridBackgroundDensityClasses: Record<
  ScanGridBackgroundDensity,
  string
> = {
  sparse: "[background-size:96px_96px]",
  normal: "[background-size:56px_56px]",
  dense: "[background-size:32px_32px]",
};

const scanGridBackgroundToneIntensityClasses: Record<
  ScanGridBackgroundTone,
  Record<ScanGridBackgroundIntensity, string>
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

const scanGridBackgroundBandToneClasses: Record<
  ScanGridBackgroundTone,
  string
> = {
  foreground: "text-foreground/20 dark:text-foreground/25",
  muted: "text-muted-foreground/20 dark:text-muted-foreground/30",
  primary: "text-primary/30 dark:text-primary/40",
};

const scanGridBackgroundBandClasses: Record<
  ScanGridBackgroundDirection,
  string
> = {
  vertical:
    "absolute inset-x-0 h-[20%] bg-gradient-to-b from-transparent via-current to-transparent",
  horizontal:
    "absolute inset-y-0 w-[20%] bg-gradient-to-r from-transparent via-current to-transparent",
};

const scanGridBackgroundEdgeClasses: Record<
  ScanGridBackgroundDirection,
  string
> = {
  vertical: "absolute inset-x-0 bottom-0 h-px bg-current opacity-60",
  horizontal: "absolute inset-y-0 right-0 w-px bg-current opacity-60",
};

export interface ScanGridBackgroundClassNamesOptions {
  className?: string;
}

export function scanGridBackgroundClassNames({
  className,
}: ScanGridBackgroundClassNamesOptions = {}) {
  return cn(scanGridBackgroundRootClasses, className);
}

export interface ScanGridBackgroundLayerClassNamesOptions {
  className?: string;
  intensity?: ScanGridBackgroundIntensity;
  tone?: ScanGridBackgroundTone;
}

export function scanGridBackgroundLayerClassNames({
  className,
  intensity = "subtle",
  tone = "muted",
}: ScanGridBackgroundLayerClassNamesOptions = {}) {
  return cn(
    scanGridBackgroundLayerClasses,
    scanGridBackgroundToneIntensityClasses[tone][intensity],
    className,
  );
}

export interface ScanGridBackgroundContentClassNamesOptions {
  className?: string;
}

export function scanGridBackgroundContentClassNames({
  className,
}: ScanGridBackgroundContentClassNamesOptions = {}) {
  return cn(scanGridBackgroundContentClasses, className);
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

// Pauses the scan loop while the background is scrolled offscreen. Fails open
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

export const ScanGridBackground = forwardRef(function ScanGridBackground(
  {
    animate = true,
    children,
    className,
    density = "normal",
    direction = "vertical",
    intensity = "subtle",
    seed = 1,
    speed = "normal",
    tone = "muted",
    ...props
  }: ScanGridBackgroundProps,
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

  const motionConfig = getScanGridBackgroundMotionConfig(speed, reducedMotion);
  const geometry = useMemo(() => getScanGridBackgroundGeometry(seed), [seed]);

  const bandClassName = cn(
    scanGridBackgroundBandClasses[direction],
    scanGridBackgroundBandToneClasses[tone],
  );
  const staticBandStyle: CSSProperties =
    direction === "vertical"
      ? { top: `${geometry.staticOffset}%` }
      : { left: `${geometry.staticOffset}%` };

  return (
    <MotionConfig reducedMotion={reducedMotion ? "always" : "user"}>
      <div
        {...props}
        ref={composedRef}
        data-slot="scan-grid-background"
        data-animate={animate ? "true" : "false"}
        data-density={density}
        data-direction={direction}
        data-intensity={intensity}
        data-speed={speed}
        data-tone={tone}
        data-reduced-motion={reducedMotion ? "true" : undefined}
        className={scanGridBackgroundClassNames({ className })}
      >
        <div
          aria-hidden="true"
          data-slot="scan-grid-background-layer"
          className={scanGridBackgroundLayerClassNames({ intensity, tone })}
        >
          <div
            className={cn(
              scanGridBackgroundPatternClasses,
              scanGridBackgroundDensityClasses[density],
            )}
          />
          {running ? (
            <motionElement.div
              data-slot="scan-grid-background-band"
              className={cn(
                bandClassName,
                direction === "vertical" ? "top-0" : "left-0",
              )}
              initial={
                direction === "vertical" ? { y: "-100%" } : { x: "-100%" }
              }
              animate={direction === "vertical" ? { y: "500%" } : { x: "500%" }}
              transition={{
                ...motionConfig.transition,
                delay: geometry.delay,
              }}
            >
              <div className={scanGridBackgroundEdgeClasses[direction]} />
            </motionElement.div>
          ) : (
            <div
              data-slot="scan-grid-background-band"
              className={cn(bandClassName, "opacity-50")}
              style={staticBandStyle}
            >
              <div className={scanGridBackgroundEdgeClasses[direction]} />
            </div>
          )}
        </div>
        <div
          data-slot="scan-grid-background-content"
          className={scanGridBackgroundContentClassNames()}
        >
          {children}
        </div>
      </div>
    </MotionConfig>
  );
});

ScanGridBackground.displayName = "ScanGridBackground";
