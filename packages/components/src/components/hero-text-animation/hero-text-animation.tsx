import {
  createElement,
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
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

export type HeroTextAnimationKind =
  "stagger-words" | "masked-curtain" | "typewriter";
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
  repeat?: boolean;
  repeatDelay?: number;
  showCaret?: boolean;
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
    typewriter: 1.1,
  },
  stagger: {
    word: 0.045,
    line: 0.11,
    character: 0.018,
  },
  distance: {
    wordY: "0.6em",
    lineY: "0.6em",
    curtainY: "0.85em",
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
const heroTextAnimationCurtainMaskClasses =
  "block min-w-0 overflow-hidden [line-height:inherit]";
const heroTextAnimationCurtainLineClasses =
  "block min-w-0 will-change-transform data-[reduced-motion=true]:will-change-auto";
const heroTextAnimationTypewriterMotionClasses =
  "inline-grid min-w-0 max-w-full align-baseline";
const heroTextAnimationTypewriterSizerClasses =
  "invisible col-start-1 row-start-1 whitespace-pre-wrap";
const heroTextAnimationTypewriterTextClasses =
  "col-start-1 row-start-1 whitespace-pre-wrap";
const heroTextAnimationTypewriterCaretClasses =
  "ml-[0.08em] inline-block h-[0.9em] w-[0.08em] translate-y-[0.08em] bg-current align-baseline opacity-70";

const typewriterDefaultIntervalMs = 28;
const typewriterMinimumIntervalMs = 16;
const typewriterMinimumDurationMs = 300;
const typewriterMaximumDurationMs = 1400;
const defaultRepeatDelay = 1.8;

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

function getStaggeredSegmentVariants({
  duration,
  reducedMotion,
  splitBy,
}: {
  duration: number;
  reducedMotion: boolean;
  splitBy: HeroTextAnimationSplitBy;
}): Variants {
  const distance =
    splitBy === "line"
      ? heroTextAnimationMotionTokens.distance.lineY
      : heroTextAnimationMotionTokens.distance.wordY;
  const hidden = reducedMotion
    ? { opacity: 0 }
    : {
        opacity: 0,
        y: distance,
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

function getMaskedCurtainSegmentVariants({
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
        y: heroTextAnimationMotionTokens.distance.curtainY,
      };

  return {
    hidden,
    visible: {
      opacity: 1,
      transition: {
        duration,
        ease: heroTextAnimationMotionTokens.easing.soft,
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
  const segmentVariants = getStaggeredSegmentVariants({
    duration,
    reducedMotion,
    splitBy,
  });
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

function MaskedCurtainSegments({
  active,
  delay,
  duration,
  once,
  reducedMotion,
  segments,
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
  stagger: number;
  trigger: HeroTextAnimationTrigger;
  onAnimationComplete?: () => void;
  onAnimationStart?: () => void;
}) {
  const containerVariants = getContainerVariants({ delay, stagger });
  const segmentVariants = getMaskedCurtainSegmentVariants({
    duration,
    reducedMotion,
  });
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
      data-split-by="line"
      className={heroTextAnimationMotionClasses}
      variants={containerVariants}
      initial="hidden"
      onAnimationComplete={onAnimationComplete}
      onAnimationStart={onAnimationStart}
      {...triggerProps}
    >
      {segments.map((segment, index) => (
        <span
          key={`${index}-${segment.text}`}
          data-slot="hero-text-animation-mask"
          className={heroTextAnimationCurtainMaskClasses}
        >
          <motionElement.span
            data-slot="hero-text-animation-segment"
            data-reduced-motion={reducedMotion ? "true" : undefined}
            data-segment="line"
            className={heroTextAnimationCurtainLineClasses}
            variants={segmentVariants}
            transition={getSegmentTransition(duration)}
          >
            {segment.text}
          </motionElement.span>
        </span>
      ))}
    </motionElement.span>
  );
}

function splitTypewriterCharacters(text: string) {
  return Array.from(text);
}

function getTypewriterTiming({
  characterCount,
  duration,
}: {
  characterCount: number;
  duration: number;
}) {
  const boundedDurationMs = Math.min(
    typewriterMaximumDurationMs,
    Math.max(typewriterMinimumDurationMs, Math.round(duration * 1000)),
  );
  const maxFrames = Math.max(
    1,
    Math.floor(boundedDurationMs / typewriterMinimumIntervalMs),
  );
  const charactersPerTick = Math.max(
    1,
    Math.ceil(Math.max(characterCount, 1) / maxFrames),
  );
  const tickCount = Math.max(
    1,
    Math.ceil(Math.max(characterCount, 1) / charactersPerTick),
  );
  const intervalMs = Math.min(
    typewriterDefaultIntervalMs,
    Math.max(
      typewriterMinimumIntervalMs,
      Math.floor(boundedDurationMs / tickCount),
    ),
  );

  return {
    charactersPerTick,
    intervalMs,
  };
}

function useTypewriterInView({
  once,
  trigger,
}: {
  once: boolean;
  trigger: HeroTextAnimationTrigger;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [isInView, setIsInView] = useState(trigger !== "in-view");

  useEffect(() => {
    if (trigger !== "in-view") {
      setIsInView(true);
      return;
    }

    const element = ref.current;

    if (
      !element ||
      typeof window === "undefined" ||
      !("IntersectionObserver" in window)
    ) {
      setIsInView(true);
      return;
    }

    setIsInView(false);

    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (!entry) {
          return;
        }

        if (entry.isIntersecting) {
          setIsInView(true);

          if (once) {
            observer.disconnect();
          }

          return;
        }

        if (!once) {
          setIsInView(false);
        }
      },
      { threshold: 0.6 },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [once, trigger]);

  return [ref, isInView] as const;
}

function TypewriterSegments({
  active,
  delay,
  duration,
  once,
  reducedMotion,
  showCaret,
  text,
  trigger,
  onAnimationComplete,
  onAnimationStart,
}: {
  active: boolean;
  delay: number;
  duration: number;
  once: boolean;
  reducedMotion: boolean;
  showCaret: boolean;
  text: string;
  trigger: HeroTextAnimationTrigger;
  onAnimationComplete?: () => void;
  onAnimationStart?: () => void;
}) {
  const [inViewRef, isInView] = useTypewriterInView({ once, trigger });
  const characters = useMemo(() => splitTypewriterCharacters(text), [text]);
  const characterCount = characters.length;
  const shouldStart =
    trigger === "in-view" ? isInView : trigger === "manual" ? active : true;
  const [visibleLength, setVisibleLength] = useState(() =>
    reducedMotion ? characterCount : 0,
  );

  useEffect(() => {
    if (reducedMotion) {
      setVisibleLength(characterCount);
      return;
    }

    if (!shouldStart || characterCount === 0) {
      setVisibleLength(0);
      return;
    }

    const { charactersPerTick, intervalMs } = getTypewriterTiming({
      characterCount,
      duration,
    });
    let cancelled = false;
    let nextVisibleLength = 0;
    let intervalId: number | undefined;

    setVisibleLength(0);

    const delayId = window.setTimeout(
      () => {
        if (cancelled) {
          return;
        }

        onAnimationStart?.();

        intervalId = window.setInterval(() => {
          if (cancelled) {
            return;
          }

          nextVisibleLength = Math.min(
            characterCount,
            nextVisibleLength + charactersPerTick,
          );
          setVisibleLength(nextVisibleLength);

          if (nextVisibleLength >= characterCount) {
            if (intervalId !== undefined) {
              window.clearInterval(intervalId);
            }
            onAnimationComplete?.();
          }
        }, intervalMs);
      },
      Math.max(0, Math.round(delay * 1000)),
    );

    return () => {
      cancelled = true;
      window.clearTimeout(delayId);

      if (intervalId !== undefined) {
        window.clearInterval(intervalId);
      }
    };
  }, [
    characterCount,
    delay,
    duration,
    onAnimationComplete,
    onAnimationStart,
    reducedMotion,
    shouldStart,
    text,
  ]);

  const normalizedVisibleLength = reducedMotion
    ? characterCount
    : Math.min(visibleLength, characterCount);
  const visibleText = characters.slice(0, normalizedVisibleLength).join("");
  const isComplete = normalizedVisibleLength >= characterCount;
  const shouldShowCaret =
    showCaret &&
    shouldStart &&
    !reducedMotion &&
    !isComplete &&
    characterCount > 0;

  return (
    <span
      ref={inViewRef}
      aria-hidden="true"
      data-slot="hero-text-animation-motion"
      data-split-by="character"
      data-typewriter-complete={isComplete ? "true" : "false"}
      className={heroTextAnimationTypewriterMotionClasses}
    >
      <span
        data-slot="hero-text-animation-typewriter-sizer"
        className={heroTextAnimationTypewriterSizerClasses}
      >
        {text}
      </span>
      <span
        data-slot="hero-text-animation-typewriter-text"
        data-reduced-motion={reducedMotion ? "true" : undefined}
        className={heroTextAnimationTypewriterTextClasses}
      >
        {visibleText}
        {shouldShowCaret ? (
          <span
            aria-hidden="true"
            data-slot="hero-text-animation-typewriter-caret"
            className={heroTextAnimationTypewriterCaretClasses}
          />
        ) : null}
      </span>
    </span>
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
      duration,
      once = true,
      reducedMotionStrategy = "opacity-only",
      repeat = false,
      repeatDelay = defaultRepeatDelay,
      showCaret = true,
      splitBy = "word",
      stagger,
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
    const resolvedDuration =
      duration ??
      (animation === "typewriter"
        ? heroTextAnimationMotionTokens.duration.typewriter
        : heroTextAnimationMotionTokens.duration.base);
    const renderStatic =
      !hasHydrated || (reducedMotion && reducedMotionStrategy === "static");
    const canRepeat =
      hasHydrated &&
      repeat &&
      !reducedMotion &&
      (trigger !== "manual" || active) &&
      !renderStatic;
    const repeatDelayMs = Math.max(0, Math.round(repeatDelay * 1000));
    const repeatTimeoutRef = useRef<number | undefined>(undefined);
    const [repeatIteration, setRepeatIteration] = useState(0);
    const resolvedSplitBy = animation === "masked-curtain" ? "line" : splitBy;
    const resolvedStagger =
      stagger ??
      (resolvedSplitBy === "line"
        ? heroTextAnimationMotionTokens.stagger.line
        : heroTextAnimationMotionTokens.stagger.word);
    const segments = useMemo(
      () => splitHeroText(text, resolvedSplitBy),
      [resolvedSplitBy, text],
    );
    const accessibleLabel = ariaLabel ?? text;
    const animatedSegmentCount =
      animation === "typewriter"
        ? splitTypewriterCharacters(text).length
        : segments.filter((segment) => segment.kind === "text").length;
    const visualKey = [
      animation,
      repeatIteration,
      text,
      resolvedSplitBy,
      resolvedStagger,
      resolvedDuration,
    ].join(":");

    useEffect(() => {
      window.clearTimeout(repeatTimeoutRef.current);
      repeatTimeoutRef.current = undefined;

      return () => {
        window.clearTimeout(repeatTimeoutRef.current);
        repeatTimeoutRef.current = undefined;
      };
    }, [
      active,
      animation,
      delay,
      once,
      repeat,
      repeatDelayMs,
      reducedMotion,
      reducedMotionStrategy,
      resolvedDuration,
      resolvedSplitBy,
      resolvedStagger,
      showCaret,
      text,
      trigger,
    ]);

    const handleAnimationComplete = useCallback(() => {
      onAnimationComplete?.();

      if (!canRepeat) {
        return;
      }

      window.clearTimeout(repeatTimeoutRef.current);
      repeatTimeoutRef.current = window.setTimeout(() => {
        setRepeatIteration((iteration) => iteration + 1);
      }, repeatDelayMs);
    }, [canRepeat, onAnimationComplete, repeatDelayMs]);

    return createElement(
      as,
      {
        ...props,
        ref,
        className: heroTextAnimationClassNames({ className }),
        "data-animation": animation,
        "data-active": active ? "true" : "false",
        "data-once": once ? "true" : "false",
        "data-repeat": repeat ? "true" : "false",
        "data-repeat-delay": repeatDelay,
        "data-reduced-motion": reducedMotion ? "true" : "false",
        "data-reduced-motion-strategy": reducedMotionStrategy,
        "data-segment-count": animatedSegmentCount,
        "data-slot": "hero-text-animation",
        "data-split-by": resolvedSplitBy,
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
          renderStaticSegments({ segments, splitBy: resolvedSplitBy })
        ) : animation === "masked-curtain" ? (
          <MaskedCurtainSegments
            key={visualKey}
            active={active}
            delay={delay}
            duration={resolvedDuration}
            once={once}
            reducedMotion={reducedMotion}
            segments={segments}
            stagger={resolvedStagger}
            trigger={trigger}
            onAnimationComplete={handleAnimationComplete}
            onAnimationStart={onAnimationStart}
          />
        ) : animation === "typewriter" ? (
          <TypewriterSegments
            key={visualKey}
            active={active}
            delay={delay}
            duration={resolvedDuration}
            once={once}
            reducedMotion={reducedMotion}
            showCaret={showCaret}
            text={text}
            trigger={trigger}
            onAnimationComplete={handleAnimationComplete}
            onAnimationStart={onAnimationStart}
          />
        ) : (
          <StaggeredSegments
            key={visualKey}
            active={active}
            delay={delay}
            duration={resolvedDuration}
            once={once}
            reducedMotion={reducedMotion}
            segments={segments}
            splitBy={resolvedSplitBy}
            stagger={resolvedStagger}
            trigger={trigger}
            onAnimationComplete={handleAnimationComplete}
            onAnimationStart={onAnimationStart}
          />
        )}
      </span>,
    );
  },
);

HeroTextAnimation.displayName = "HeroTextAnimation";
