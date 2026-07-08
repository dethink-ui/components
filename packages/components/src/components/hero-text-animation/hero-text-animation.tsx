import {
  createElement,
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import {
  MotionConfig,
  motion as motionElement,
  useReducedMotion,
  type Transition,
  type Variants,
} from "motion/react";
import { cn } from "../../utils/cn";

export type HeroTextAnimationKind = "stagger-words";
export type HeroTextAnimationElement = "h1" | "h2" | "p" | "span";
export type HeroTextAnimationSplitBy = "word" | "line";
export type HeroTextAnimationTrigger = "mount" | "in-view" | "manual";
export type HeroTextAnimationReducedMotionStrategy = "static" | "opacity-only";
export type HeroTextAnimationProviderReducedMotion =
  "user" | "always" | "never";

export interface HeroTextAnimationProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "aria-label" | "children" | "onAnimationStart"
> {
  active?: boolean;
  animation?: HeroTextAnimationKind;
  ariaLabel?: string;
  as?: HeroTextAnimationElement;
  delay?: number;
  duration?: number;
  once?: boolean;
  reducedMotionStrategy?: HeroTextAnimationReducedMotionStrategy;
  splitBy?: HeroTextAnimationSplitBy;
  stagger?: number;
  text: string;
  trigger?: HeroTextAnimationTrigger;
  "data-testid"?: string;
  onAnimationComplete?: () => void;
  onAnimationStart?: () => void;
}

export interface HeroTextAnimationProviderProps {
  children?: ReactNode;
  reducedMotion?: HeroTextAnimationProviderReducedMotion;
}

export type HeroTextAnimationSegment =
  | {
      kind: "text";
      text: string;
    }
  | {
      kind: "space";
      text: string;
    };

const standardEase = [0.22, 1, 0.36, 1] as [number, number, number, number];
const softEase = [0.16, 1, 0.3, 1] as [number, number, number, number];

export const heroTextAnimationMotionTokens = {
  easing: {
    standard: standardEase,
    soft: softEase,
  },
  duration: {
    fast: 0.28,
    base: 0.48,
    slow: 0.72,
    cinematic: 1.1,
  },
  stagger: {
    word: 0.045,
    line: 0.11,
    character: 0.018,
  },
  distance: {
    wordY: "0.6em",
    lineY: "0.6em",
    scrollY: -32,
  },
  spring: {
    emphasis: {
      damping: 28,
      stiffness: 420,
      type: "spring",
    },
  },
} as const;

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

const heroTextAnimationRootClasses =
  "min-w-0 max-w-full [text-wrap:balance] text-foreground";
const heroTextAnimationAccessibleTextClasses = "sr-only";
const heroTextAnimationVisualClasses = "inline min-w-0 max-w-full";
const heroTextAnimationMotionClasses = "inline min-w-0 max-w-full";
const heroTextAnimationWordClasses =
  "inline-block whitespace-pre align-baseline will-change-transform data-[reduced-motion=true]:will-change-auto";
const heroTextAnimationLineClasses =
  "block min-w-0 overflow-visible will-change-transform data-[reduced-motion=true]:will-change-auto";

const HeroTextAnimationReducedMotionContext =
  createContext<HeroTextAnimationProviderReducedMotion>("user");

export function HeroTextAnimationProvider({
  children,
  reducedMotion = "user",
}: HeroTextAnimationProviderProps) {
  return (
    <HeroTextAnimationReducedMotionContext.Provider value={reducedMotion}>
      <MotionConfig reducedMotion={reducedMotion}>{children}</MotionConfig>
    </HeroTextAnimationReducedMotionContext.Provider>
  );
}

export function splitHeroText(
  text: string,
  splitBy: HeroTextAnimationSplitBy = "word",
): HeroTextAnimationSegment[] {
  if (splitBy === "line") {
    return text.split(/\r?\n/).map((line) => ({ kind: "text", text: line }));
  }

  return (text.match(/\S+|\s+/g) ?? []).map((part) => ({
    kind: /^\s+$/.test(part) ? "space" : "text",
    text: part,
  }));
}

export function heroTextAnimationClassNames({
  className,
}: Pick<HeroTextAnimationProps, "className"> = {}) {
  return cn(heroTextAnimationRootClasses, className);
}

function useHasHydrated() {
  const [hasHydrated, setHasHydrated] = useState(false);

  useIsomorphicLayoutEffect(() => {
    setHasHydrated(true);
  }, []);

  return hasHydrated;
}

function getContainerVariants({
  delay,
  stagger,
}: {
  delay: number;
  stagger: number;
}): Variants {
  return {
    hidden: {},
    visible: {
      transition: {
        delayChildren: delay,
        staggerChildren: stagger,
      },
    },
  };
}

function getSegmentVariants({
  duration,
  reducedMotion,
}: {
  duration: number;
  reducedMotion: boolean;
}): Variants {
  const hidden = reducedMotion
    ? { opacity: 0 }
    : {
        opacity: 0,
        y: heroTextAnimationMotionTokens.distance.wordY,
      };

  return {
    hidden,
    visible: {
      opacity: 1,
      transition: {
        duration,
        ease: heroTextAnimationMotionTokens.easing.standard,
      },
      y: reducedMotion ? undefined : "0em",
    },
  };
}

function renderStaticSegments({
  segments,
  splitBy,
}: {
  segments: HeroTextAnimationSegment[];
  splitBy: HeroTextAnimationSplitBy;
}) {
  if (splitBy === "line") {
    return segments.map((segment, index) => (
      <span
        key={`${index}-${segment.text}`}
        data-slot="hero-text-animation-segment"
        data-segment="line"
        className={heroTextAnimationLineClasses}
      >
        {segment.text}
      </span>
    ));
  }

  return segments.map((segment, index) => {
    if (segment.kind === "space") {
      return segment.text;
    }

    return (
      <span
        key={`${index}-${segment.text}`}
        data-slot="hero-text-animation-segment"
        data-segment="word"
        className={heroTextAnimationWordClasses}
      >
        {segment.text}
      </span>
    );
  });
}

function StaggeredSegments({
  active,
  delay,
  duration,
  once,
  reducedMotion,
  segments,
  splitBy,
  stagger,
  trigger,
  onAnimationComplete,
  onAnimationStart,
}: {
  active: boolean;
  delay: number;
  duration: number;
  once: boolean;
  reducedMotion: boolean;
  segments: HeroTextAnimationSegment[];
  splitBy: HeroTextAnimationSplitBy;
  stagger: number;
  trigger: HeroTextAnimationTrigger;
  onAnimationComplete?: () => void;
  onAnimationStart?: () => void;
}) {
  const containerVariants = getContainerVariants({ delay, stagger });
  const segmentVariants = getSegmentVariants({ duration, reducedMotion });
  const triggerProps =
    trigger === "in-view"
      ? {
          whileInView: "visible",
          viewport: { amount: 0.6, once },
        }
      : {
          animate: trigger === "manual" && !active ? "hidden" : "visible",
        };

  return (
    <motionElement.span
      aria-hidden="true"
      data-slot="hero-text-animation-motion"
      data-split-by={splitBy}
      className={heroTextAnimationMotionClasses}
      variants={containerVariants}
      initial="hidden"
      onAnimationComplete={onAnimationComplete}
      onAnimationStart={onAnimationStart}
      {...triggerProps}
    >
      {splitBy === "line"
        ? segments.map((segment, index) => (
            <motionElement.span
              key={`${index}-${segment.text}`}
              data-slot="hero-text-animation-segment"
              data-reduced-motion={reducedMotion ? "true" : undefined}
              data-segment="line"
              className={heroTextAnimationLineClasses}
              variants={segmentVariants}
              transition={getSegmentTransition(duration)}
            >
              {segment.text}
            </motionElement.span>
          ))
        : segments.map((segment, index) => {
            if (segment.kind === "space") {
              return segment.text;
            }

            return (
              <motionElement.span
                key={`${index}-${segment.text}`}
                data-slot="hero-text-animation-segment"
                data-reduced-motion={reducedMotion ? "true" : undefined}
                data-segment="word"
                className={heroTextAnimationWordClasses}
                variants={segmentVariants}
                transition={getSegmentTransition(duration)}
              >
                {segment.text}
              </motionElement.span>
            );
          })}
    </motionElement.span>
  );
}

function getSegmentTransition(duration: number): Transition {
  return {
    duration,
    ease: heroTextAnimationMotionTokens.easing.standard,
  };
}

export const HeroTextAnimation = forwardRef<
  HTMLElement,
  HeroTextAnimationProps
>(
  (
    {
      active = true,
      animation = "stagger-words",
      ariaLabel,
      as = "h1",
      className,
      delay = 0.05,
      duration = heroTextAnimationMotionTokens.duration.base,
      once = true,
      reducedMotionStrategy = "opacity-only",
      splitBy = "word",
      stagger = heroTextAnimationMotionTokens.stagger.word,
      text,
      trigger = "mount",
      "data-testid": dataTestId = "hero-text-animation",
      onAnimationComplete,
      onAnimationStart,
      ...props
    },
    ref,
  ) => {
    const hasHydrated = useHasHydrated();
    const reducedMotionOverride = useContext(
      HeroTextAnimationReducedMotionContext,
    );
    const prefersReducedMotion = useReducedMotion();
    const reducedMotion =
      reducedMotionOverride === "always"
        ? true
        : reducedMotionOverride === "never"
          ? false
          : prefersReducedMotion === true;
    const renderStatic =
      !hasHydrated || (reducedMotion && reducedMotionStrategy === "static");
    const segments = useMemo(
      () => splitHeroText(text, splitBy),
      [splitBy, text],
    );
    const accessibleLabel = ariaLabel ?? text;
    const animatedSegmentCount = segments.filter(
      (segment) => segment.kind === "text",
    ).length;

    return createElement(
      as,
      {
        ...props,
        ref,
        className: heroTextAnimationClassNames({ className }),
        "data-animation": animation,
        "data-active": active ? "true" : "false",
        "data-once": once ? "true" : "false",
        "data-reduced-motion": reducedMotion ? "true" : "false",
        "data-reduced-motion-strategy": reducedMotionStrategy,
        "data-segment-count": animatedSegmentCount,
        "data-slot": "hero-text-animation",
        "data-split-by": splitBy,
        "data-testid": dataTestId,
        "data-trigger": trigger,
      },
      <span
        data-slot="hero-text-animation-accessible-text"
        className={heroTextAnimationAccessibleTextClasses}
      >
        {accessibleLabel}
      </span>,
      <span
        aria-hidden="true"
        data-slot="hero-text-animation-visual"
        className={heroTextAnimationVisualClasses}
      >
        {renderStatic ? (
          renderStaticSegments({ segments, splitBy })
        ) : (
          <StaggeredSegments
            active={active}
            delay={delay}
            duration={duration}
            once={once}
            reducedMotion={reducedMotion}
            segments={segments}
            splitBy={splitBy}
            stagger={stagger}
            trigger={trigger}
            onAnimationComplete={onAnimationComplete}
            onAnimationStart={onAnimationStart}
          />
        )}
      </span>,
    );
  },
);

HeroTextAnimation.displayName = "HeroTextAnimation";
