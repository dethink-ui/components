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
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import {
  AnimatePresence,
  MotionConfig,
  motion as motionElement,
  useReducedMotion,
  type Transition,
  type Variants,
} from "motion/react";
import { cn } from "../../utils/cn";

export type HeroTextAnimationKind =
  | "stagger-words"
  | "masked-curtain"
  | "typewriter"
  | "scramble-decrypt"
  | "rotating-keyword"
  | "gradient-highlight"
  | "blur-focus";
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
  autoRotateKeywords?: boolean;
  defaultRotatingKeywordIndex?: number;
  rotatingKeywordIndex?: number;
  rotatingKeywordInterval?: number;
  rotatingKeywordOptions?: readonly string[];
  rotatingKeywordPrefix?: string;
  rotatingKeywordSuffix?: string;
  showCaret?: boolean;
  splitBy?: HeroTextAnimationSplitBy;
  stagger?: number;
  text: string;
  trigger?: HeroTextAnimationTrigger;
  "data-testid"?: string;
  onAnimationComplete?: () => void;
  onAnimationStart?: () => void;
  onRotatingKeywordIndexChange?: (index: number) => void;
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
    scramble: 1.2,
    rotatingKeyword: 0.34,
    gradientHighlight: 0.9,
    blurFocus: 0.42,
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
    blurFocusY: "0.16em",
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
const heroTextAnimationScrambleMotionClasses =
  "inline-grid min-w-0 max-w-full align-baseline";
const heroTextAnimationScrambleSizerClasses =
  "invisible col-start-1 row-start-1 whitespace-pre-wrap";
const heroTextAnimationScrambleTextClasses =
  "col-start-1 row-start-1 whitespace-pre-wrap";
const heroTextAnimationScrambleGlyphClasses =
  "inline-block whitespace-pre align-baseline";
const heroTextAnimationRotatingMotionClasses =
  "inline-flex min-w-0 max-w-full flex-wrap items-baseline gap-x-[0.18em]";
const heroTextAnimationRotatingTextClasses = "whitespace-pre-wrap";
const heroTextAnimationRotatingSlotClasses =
  "relative inline-grid overflow-hidden align-baseline [line-height:inherit] [contain:layout]";
const heroTextAnimationRotatingSizerClasses =
  "invisible col-start-1 row-start-1 whitespace-pre";
const heroTextAnimationRotatingKeywordClasses =
  "col-start-1 row-start-1 whitespace-pre will-change-transform data-[reduced-motion=true]:will-change-auto";
const heroTextAnimationGradientHighlightClasses =
  "inline whitespace-pre-wrap bg-[linear-gradient(105deg,var(--hero-text-animation-highlight-base)_0%,var(--hero-text-animation-highlight-base)_34%,var(--hero-text-animation-highlight-accent)_44%,var(--hero-text-animation-highlight-sheen)_50%,var(--hero-text-animation-highlight-accent)_56%,var(--hero-text-animation-highlight-base)_66%,var(--hero-text-animation-highlight-base)_100%)] bg-[length:220%_100%] bg-clip-text text-transparent underline decoration-(--hero-text-animation-highlight-underline) decoration-[0.08em] underline-offset-[0.14em] will-change-[background-position] [text-decoration-skip-ink:auto] forced-colors:bg-none forced-colors:text-[CanvasText] forced-colors:decoration-[CanvasText] data-[reduced-motion=true]:will-change-auto";
const heroTextAnimationBlurFocusClasses =
  "inline-block min-w-0 max-w-full whitespace-pre-wrap align-baseline will-change-[filter,opacity,transform] data-[reduced-motion=true]:will-change-auto";

const typewriterDefaultIntervalMs = 28;
const typewriterMinimumIntervalMs = 16;
const typewriterMinimumDurationMs = 300;
const typewriterMaximumDurationMs = 1400;
const scrambleMinimumIntervalMs = 334;
const scrambleMinimumDurationMs = 700;
const scrambleMaximumDurationMs = 1800;
const scrambleMaximumUpdateCount = 5;
const scrambleGlyphs = ["-", "+", "=", "~", "*", ":", ".", "_"] as const;
const rotatingKeywordDefaultIntervalMs = 1600;
const rotatingKeywordMinimumIntervalMs = 400;
const rotatingKeywordMaximumAutoRotateMs = 5000;
const blurFocusInitialBlur = "6px";
const blurFocusFinalBlur = "0px";
const defaultRepeatDelay = 1.8;
const gradientHighlightStyle = {
  "--hero-text-animation-highlight-base": "var(--dt-color-foreground)",
  "--hero-text-animation-highlight-accent":
    "color-mix(in oklab, var(--dt-color-foreground) 78%, var(--dt-color-primary) 22%)",
  "--hero-text-animation-highlight-sheen":
    "color-mix(in oklab, var(--dt-color-foreground) 58%, var(--dt-color-background) 42%)",
  "--hero-text-animation-highlight-underline":
    "color-mix(in oklab, var(--dt-color-primary) 72%, var(--dt-color-foreground) 28%)",
} as CSSProperties;

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

function getScrambleTiming({ duration }: { duration: number }) {
  const boundedDurationMs = Math.min(
    scrambleMaximumDurationMs,
    Math.max(scrambleMinimumDurationMs, Math.round(duration * 1000)),
  );
  const updateCount = Math.max(
    1,
    Math.min(
      scrambleMaximumUpdateCount,
      Math.floor(boundedDurationMs / scrambleMinimumIntervalMs),
    ),
  );

  return {
    intervalMs: Math.max(
      scrambleMinimumIntervalMs,
      Math.floor(boundedDurationMs / updateCount),
    ),
    updateCount,
  };
}

function getScrambleGlyph({
  character,
  characterIndex,
  frame,
}: {
  character: string;
  characterIndex: number;
  frame: number;
}) {
  const codePoint = character.codePointAt(0) ?? 0;
  const glyphIndex =
    (codePoint + characterIndex * 7 + frame * 3) % scrambleGlyphs.length;

  return scrambleGlyphs[glyphIndex];
}

function getScrambleFrameText({
  frame,
  text,
  updateCount,
}: {
  frame: number;
  text: string;
  updateCount: number;
}) {
  if (frame >= updateCount) {
    return text;
  }

  const characters = Array.from(text);
  const revealableCount = characters.filter(
    (character) => !/\s/.test(character),
  ).length;
  let revealableIndex = 0;

  return characters
    .map((character, characterIndex) => {
      if (/\s/.test(character)) {
        return character;
      }

      revealableIndex += 1;

      const resolveFrame = Math.max(
        1,
        Math.ceil(
          (revealableIndex / Math.max(1, revealableCount)) * updateCount,
        ),
      );

      if (frame >= resolveFrame) {
        return character;
      }

      return getScrambleGlyph({ character, characterIndex, frame });
    })
    .join("");
}

function resolveRotatingKeywordOptions({
  rotatingKeywordOptions,
  text,
}: {
  rotatingKeywordOptions?: readonly string[];
  text: string;
}) {
  const options =
    rotatingKeywordOptions?.filter((keyword) => keyword.length > 0) ?? [];

  return options.length > 0 ? options : [text];
}

function normalizeRotatingKeywordIndex(index: number, keywordCount: number) {
  if (keywordCount <= 0) {
    return 0;
  }

  const integerIndex = Number.isFinite(index) ? Math.trunc(index) : 0;

  return ((integerIndex % keywordCount) + keywordCount) % keywordCount;
}

function getLongestRotatingKeyword(keywords: readonly string[]) {
  return keywords.reduce((longestKeyword, keyword) =>
    Array.from(keyword).length > Array.from(longestKeyword).length
      ? keyword
      : longestKeyword,
  );
}

function getRotatingKeywordIntervalMs(intervalSeconds: number | undefined) {
  return Math.max(
    rotatingKeywordMinimumIntervalMs,
    Math.round(
      (intervalSeconds ?? rotatingKeywordDefaultIntervalMs / 1000) * 1000,
    ),
  );
}

function getRotatingKeywordVariants({
  duration,
  reducedMotion,
}: {
  duration: number;
  reducedMotion: boolean;
}): Variants {
  if (reducedMotion) {
    return {
      enter: { opacity: 1 },
      center: { opacity: 1 },
      exit: { opacity: 1 },
    };
  }

  return {
    enter: {
      opacity: 0,
      y: "0.4em",
    },
    center: {
      opacity: 1,
      transition: {
        duration,
        ease: heroTextAnimationMotionTokens.easing.soft,
      },
      y: "0em",
    },
    exit: {
      opacity: 0,
      transition: {
        duration: Math.min(
          duration,
          heroTextAnimationMotionTokens.duration.fast,
        ),
        ease: heroTextAnimationMotionTokens.easing.standard,
      },
      y: "-0.35em",
    },
  };
}

function renderStaticRotatingKeyword({
  keyword,
  keywordIndex,
  longestKeyword,
  prefix,
  suffix,
}: {
  keyword: string;
  keywordIndex: number;
  longestKeyword: string;
  prefix: string;
  suffix: string;
}) {
  return (
    <span
      aria-hidden="true"
      data-auto-rotate-keywords="false"
      data-rotating-keyword-index={keywordIndex}
      data-rotating-keyword-max-duration-ms={rotatingKeywordMaximumAutoRotateMs}
      data-slot="hero-text-animation-motion"
      data-split-by="keyword"
      className={heroTextAnimationRotatingMotionClasses}
    >
      {prefix.length > 0 ? (
        <span
          data-slot="hero-text-animation-rotating-prefix"
          className={heroTextAnimationRotatingTextClasses}
        >
          {prefix}
        </span>
      ) : null}
      <span
        data-slot="hero-text-animation-rotating-slot"
        className={heroTextAnimationRotatingSlotClasses}
      >
        <span
          data-slot="hero-text-animation-rotating-sizer"
          className={heroTextAnimationRotatingSizerClasses}
        >
          {longestKeyword}
        </span>
        <span
          data-reduced-motion="true"
          data-slot="hero-text-animation-rotating-keyword"
          className={heroTextAnimationRotatingKeywordClasses}
        >
          {keyword}
        </span>
      </span>
      {suffix.length > 0 ? (
        <span
          data-slot="hero-text-animation-rotating-suffix"
          className={heroTextAnimationRotatingTextClasses}
        >
          {suffix}
        </span>
      ) : null}
    </span>
  );
}

function RotatingKeywordSegments({
  active,
  autoRotateKeywords,
  duration,
  keyword,
  keywordCount,
  keywordIndex,
  keywords,
  longestKeyword,
  once,
  prefix,
  reducedMotion,
  rotatingKeywordInterval,
  suffix,
  trigger,
  onAnimationComplete,
  onAnimationStart,
  onKeywordIndexChange,
}: {
  active: boolean;
  autoRotateKeywords: boolean;
  duration: number;
  keyword: string;
  keywordCount: number;
  keywordIndex: number;
  keywords: readonly string[];
  longestKeyword: string;
  once: boolean;
  prefix: string;
  reducedMotion: boolean;
  rotatingKeywordInterval?: number;
  suffix: string;
  trigger: HeroTextAnimationTrigger;
  onAnimationComplete?: () => void;
  onAnimationStart?: () => void;
  onKeywordIndexChange: (index: number) => void;
}) {
  const [inViewRef, isInView] = useTypewriterInView({ once, trigger });
  const keywordIndexRef = useRef(keywordIndex);
  const intervalMs = getRotatingKeywordIntervalMs(rotatingKeywordInterval);
  const variants = getRotatingKeywordVariants({ duration, reducedMotion });
  const shouldStart =
    trigger === "in-view" ? isInView : trigger === "manual" ? active : true;

  useEffect(() => {
    keywordIndexRef.current = keywordIndex;
  }, [keywordIndex]);

  useEffect(() => {
    if (
      reducedMotion ||
      !autoRotateKeywords ||
      !shouldStart ||
      keywordCount <= 1
    ) {
      return;
    }

    onAnimationStart?.();

    const intervalId = window.setInterval(() => {
      onKeywordIndexChange(keywordIndexRef.current + 1);
    }, intervalMs);
    const stopTimeoutId = window.setTimeout(() => {
      window.clearInterval(intervalId);
      onAnimationComplete?.();
    }, rotatingKeywordMaximumAutoRotateMs - 1);

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(stopTimeoutId);
    };
  }, [
    autoRotateKeywords,
    intervalMs,
    keywordCount,
    onAnimationComplete,
    onAnimationStart,
    onKeywordIndexChange,
    reducedMotion,
    shouldStart,
  ]);

  return (
    <span
      ref={inViewRef}
      aria-hidden="true"
      data-auto-rotate-keywords={autoRotateKeywords ? "true" : "false"}
      data-rotating-keyword-count={keywordCount}
      data-rotating-keyword-index={keywordIndex}
      data-rotating-keyword-interval-ms={intervalMs}
      data-rotating-keyword-max-duration-ms={rotatingKeywordMaximumAutoRotateMs}
      data-slot="hero-text-animation-motion"
      data-split-by="keyword"
      className={heroTextAnimationRotatingMotionClasses}
    >
      {prefix.length > 0 ? (
        <span
          data-slot="hero-text-animation-rotating-prefix"
          className={heroTextAnimationRotatingTextClasses}
        >
          {prefix}
        </span>
      ) : null}
      <span
        data-slot="hero-text-animation-rotating-slot"
        data-rotating-keyword-longest={longestKeyword}
        className={heroTextAnimationRotatingSlotClasses}
      >
        <span
          data-slot="hero-text-animation-rotating-sizer"
          className={heroTextAnimationRotatingSizerClasses}
        >
          {longestKeyword}
        </span>
        {reducedMotion ? (
          <span
            data-reduced-motion="true"
            data-slot="hero-text-animation-rotating-keyword"
            className={heroTextAnimationRotatingKeywordClasses}
          >
            {keyword}
          </span>
        ) : (
          <AnimatePresence initial={false}>
            <motionElement.span
              key={`${keywordIndex}-${keywords[keywordIndex] ?? keyword}`}
              data-slot="hero-text-animation-rotating-keyword"
              className={heroTextAnimationRotatingKeywordClasses}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              {keyword}
            </motionElement.span>
          </AnimatePresence>
        )}
      </span>
      {suffix.length > 0 ? (
        <span
          data-slot="hero-text-animation-rotating-suffix"
          className={heroTextAnimationRotatingTextClasses}
        >
          {suffix}
        </span>
      ) : null}
    </span>
  );
}

function ScrambleDecryptSegments({
  active,
  delay,
  duration,
  once,
  reducedMotion,
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
  text: string;
  trigger: HeroTextAnimationTrigger;
  onAnimationComplete?: () => void;
  onAnimationStart?: () => void;
}) {
  const [inViewRef, isInView] = useTypewriterInView({ once, trigger });
  const { intervalMs, updateCount } = useMemo(
    () => getScrambleTiming({ duration }),
    [duration],
  );
  const shouldStart =
    trigger === "in-view" ? isInView : trigger === "manual" ? active : true;
  const [frame, setFrame] = useState(() => (reducedMotion ? updateCount : 0));

  useEffect(() => {
    if (reducedMotion) {
      return;
    }

    if (!shouldStart || text.length === 0) {
      return;
    }

    let cancelled = false;
    let nextFrame = 0;
    let intervalId: number | undefined;

    const delayId = window.setTimeout(
      () => {
        if (cancelled) {
          return;
        }

        setFrame(0);
        onAnimationStart?.();

        intervalId = window.setInterval(() => {
          if (cancelled) {
            return;
          }

          nextFrame = Math.min(updateCount, nextFrame + 1);
          setFrame(nextFrame);

          if (nextFrame >= updateCount) {
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
    delay,
    intervalMs,
    onAnimationComplete,
    onAnimationStart,
    reducedMotion,
    shouldStart,
    text,
    updateCount,
  ]);

  const normalizedFrame = reducedMotion
    ? updateCount
    : !shouldStart
      ? 0
      : Math.min(frame, updateCount);
  const visualText = getScrambleFrameText({
    frame: normalizedFrame,
    text,
    updateCount,
  });
  const finalCharacters = useMemo(() => Array.from(text), [text]);
  const isComplete = normalizedFrame >= updateCount;

  return (
    <span
      ref={inViewRef}
      aria-hidden="true"
      data-slot="hero-text-animation-motion"
      data-scramble-complete={isComplete ? "true" : "false"}
      data-scramble-interval-ms={intervalMs}
      data-scramble-max-updates={updateCount}
      data-split-by="character"
      className={heroTextAnimationScrambleMotionClasses}
    >
      <span
        data-slot="hero-text-animation-scramble-sizer"
        className={heroTextAnimationScrambleSizerClasses}
      >
        {text}
      </span>
      <span
        data-slot="hero-text-animation-scramble-text"
        data-reduced-motion={reducedMotion ? "true" : undefined}
        className={heroTextAnimationScrambleTextClasses}
      >
        {Array.from(visualText).map((character, index) => (
          <span
            key={`${index}-${character}`}
            data-slot="hero-text-animation-scramble-fragment"
            data-scramble-resolved={
              character === finalCharacters[index] ? "true" : "false"
            }
            className={heroTextAnimationScrambleGlyphClasses}
          >
            {character}
          </span>
        ))}
      </span>
    </span>
  );
}

function GradientHighlightSegments({
  active,
  delay,
  duration,
  once,
  reducedMotion,
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
  text: string;
  trigger: HeroTextAnimationTrigger;
  onAnimationComplete?: () => void;
  onAnimationStart?: () => void;
}) {
  const [inViewRef, isInView] = useTypewriterInView({ once, trigger });
  const shouldStart =
    trigger === "in-view" ? isInView : trigger === "manual" ? active : true;
  const initialBackgroundPositionX =
    reducedMotion || !shouldStart ? "0%" : "120%";
  const targetBackgroundPositionX =
    reducedMotion || !shouldStart ? "0%" : "-20%";
  const transition = reducedMotion
    ? { duration: 0 }
    : {
        delay,
        duration,
        ease: heroTextAnimationMotionTokens.easing.soft,
      };

  return (
    <motionElement.span
      ref={inViewRef}
      aria-hidden="true"
      data-highlight="gradient-highlight"
      data-reduced-motion={reducedMotion ? "true" : undefined}
      data-slot="hero-text-animation-motion"
      data-split-by="phrase"
      className={cn(
        heroTextAnimationMotionClasses,
        heroTextAnimationGradientHighlightClasses,
      )}
      style={gradientHighlightStyle}
      initial={{ backgroundPositionX: initialBackgroundPositionX }}
      animate={{ backgroundPositionX: targetBackgroundPositionX }}
      transition={transition}
      onAnimationComplete={
        reducedMotion || !shouldStart ? undefined : onAnimationComplete
      }
      onAnimationStart={
        reducedMotion || !shouldStart ? undefined : onAnimationStart
      }
    >
      {text}
    </motionElement.span>
  );
}

function renderStaticGradientHighlight(text: string) {
  return (
    <span
      aria-hidden="true"
      data-highlight="gradient-highlight"
      data-reduced-motion="true"
      data-slot="hero-text-animation-motion"
      data-split-by="phrase"
      className={cn(
        heroTextAnimationMotionClasses,
        heroTextAnimationGradientHighlightClasses,
      )}
      style={gradientHighlightStyle}
    >
      {text}
    </span>
  );
}

function BlurFocusSegments({
  active,
  delay,
  duration,
  once,
  reducedMotion,
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
  text: string;
  trigger: HeroTextAnimationTrigger;
  onAnimationComplete?: () => void;
  onAnimationStart?: () => void;
}) {
  const [inViewRef, isInView] = useTypewriterInView({ once, trigger });
  const shouldStart =
    trigger === "in-view" ? isInView : trigger === "manual" ? active : true;
  const hiddenState = reducedMotion
    ? { opacity: 0 }
    : {
        filter: `blur(${blurFocusInitialBlur})`,
        opacity: 0,
        y: heroTextAnimationMotionTokens.distance.blurFocusY,
      };
  const visibleState = reducedMotion
    ? { opacity: 1 }
    : {
        filter: `blur(${blurFocusFinalBlur})`,
        opacity: 1,
        y: "0em",
      };

  return (
    <motionElement.span
      ref={inViewRef}
      aria-hidden="true"
      data-blur-final={blurFocusFinalBlur}
      data-blur-initial={
        reducedMotion ? blurFocusFinalBlur : blurFocusInitialBlur
      }
      data-focus-reveal="blur-focus"
      data-reduced-motion={reducedMotion ? "true" : undefined}
      data-slot="hero-text-animation-motion"
      data-split-by="phrase"
      className={cn(
        heroTextAnimationMotionClasses,
        heroTextAnimationBlurFocusClasses,
      )}
      initial={shouldStart ? hiddenState : { opacity: 0 }}
      animate={shouldStart ? visibleState : { opacity: 0 }}
      transition={
        reducedMotion
          ? { delay, duration: 0.18, ease: "linear" }
          : {
              delay,
              duration,
              ease: heroTextAnimationMotionTokens.easing.soft,
            }
      }
      onAnimationComplete={
        shouldStart && !reducedMotion ? onAnimationComplete : undefined
      }
      onAnimationStart={
        shouldStart && !reducedMotion ? onAnimationStart : undefined
      }
    >
      {text}
    </motionElement.span>
  );
}

function renderStaticBlurFocus(text: string) {
  return (
    <span
      aria-hidden="true"
      data-blur-final={blurFocusFinalBlur}
      data-blur-initial={blurFocusFinalBlur}
      data-focus-reveal="blur-focus"
      data-reduced-motion="true"
      data-slot="hero-text-animation-motion"
      data-split-by="phrase"
      className={cn(
        heroTextAnimationMotionClasses,
        heroTextAnimationBlurFocusClasses,
      )}
    >
      {text}
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
      autoRotateKeywords = false,
      defaultRotatingKeywordIndex = 0,
      rotatingKeywordIndex,
      rotatingKeywordInterval,
      rotatingKeywordOptions,
      rotatingKeywordPrefix = "",
      rotatingKeywordSuffix = "",
      showCaret = true,
      splitBy = "word",
      stagger,
      text,
      trigger = "mount",
      "data-testid": dataTestId = "hero-text-animation",
      onAnimationComplete,
      onAnimationStart,
      onRotatingKeywordIndexChange,
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
      (animation === "rotating-keyword"
        ? heroTextAnimationMotionTokens.duration.rotatingKeyword
        : animation === "scramble-decrypt"
          ? heroTextAnimationMotionTokens.duration.scramble
          : animation === "gradient-highlight"
            ? heroTextAnimationMotionTokens.duration.gradientHighlight
            : animation === "blur-focus"
              ? heroTextAnimationMotionTokens.duration.blurFocus
              : animation === "typewriter"
                ? heroTextAnimationMotionTokens.duration.typewriter
                : heroTextAnimationMotionTokens.duration.base);
    const renderStatic =
      !hasHydrated || (reducedMotion && reducedMotionStrategy === "static");
    const canRepeat =
      hasHydrated &&
      repeat &&
      !reducedMotion &&
      animation !== "rotating-keyword" &&
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
    const rotatingKeywords = useMemo(
      () =>
        resolveRotatingKeywordOptions({
          rotatingKeywordOptions,
          text,
        }),
      [rotatingKeywordOptions, text],
    );
    const keywordCount = rotatingKeywords.length;
    const isRotatingKeywordControlled = rotatingKeywordIndex !== undefined;
    const [
      uncontrolledRotatingKeywordIndex,
      setUncontrolledRotatingKeywordIndex,
    ] = useState(() =>
      normalizeRotatingKeywordIndex(defaultRotatingKeywordIndex, keywordCount),
    );
    const selectedRotatingKeywordIndex = normalizeRotatingKeywordIndex(
      isRotatingKeywordControlled
        ? rotatingKeywordIndex
        : uncontrolledRotatingKeywordIndex,
      keywordCount,
    );
    const selectedRotatingKeyword =
      rotatingKeywords[selectedRotatingKeywordIndex] ?? text;
    const longestRotatingKeyword = getLongestRotatingKeyword(rotatingKeywords);
    const accessibleLabel = ariaLabel ?? text;
    const animatedSegmentCount =
      animation === "rotating-keyword"
        ? keywordCount
        : animation === "gradient-highlight" || animation === "blur-focus"
          ? 1
          : animation === "typewriter" || animation === "scramble-decrypt"
            ? splitTypewriterCharacters(text).length
            : segments.filter((segment) => segment.kind === "text").length;
    const visualSplitBy =
      animation === "rotating-keyword"
        ? "keyword"
        : animation === "gradient-highlight" || animation === "blur-focus"
          ? "phrase"
          : animation === "typewriter" || animation === "scramble-decrypt"
            ? "character"
            : resolvedSplitBy;
    const visualKey = [
      animation,
      repeatIteration,
      text,
      selectedRotatingKeywordIndex,
      resolvedSplitBy,
      resolvedStagger,
      resolvedDuration,
    ].join(":");

    const handleRotatingKeywordIndexChange = useCallback(
      (nextIndex: number) => {
        const normalizedIndex = normalizeRotatingKeywordIndex(
          nextIndex,
          keywordCount,
        );

        if (!isRotatingKeywordControlled) {
          setUncontrolledRotatingKeywordIndex(normalizedIndex);
        }

        onRotatingKeywordIndexChange?.(normalizedIndex);
      },
      [isRotatingKeywordControlled, keywordCount, onRotatingKeywordIndexChange],
    );

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
        "data-rotating-keyword-count":
          animation === "rotating-keyword" ? keywordCount : undefined,
        "data-rotating-keyword-index":
          animation === "rotating-keyword"
            ? selectedRotatingKeywordIndex
            : undefined,
        "data-segment-count": animatedSegmentCount,
        "data-slot": "hero-text-animation",
        "data-split-by": visualSplitBy,
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
        {renderStatic && animation === "rotating-keyword" ? (
          renderStaticRotatingKeyword({
            keyword: selectedRotatingKeyword,
            keywordIndex: selectedRotatingKeywordIndex,
            longestKeyword: longestRotatingKeyword,
            prefix: rotatingKeywordPrefix,
            suffix: rotatingKeywordSuffix,
          })
        ) : renderStatic && animation === "gradient-highlight" ? (
          renderStaticGradientHighlight(text)
        ) : renderStatic && animation === "blur-focus" ? (
          renderStaticBlurFocus(text)
        ) : renderStatic ? (
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
        ) : animation === "scramble-decrypt" ? (
          <ScrambleDecryptSegments
            key={visualKey}
            active={active}
            delay={delay}
            duration={resolvedDuration}
            once={once}
            reducedMotion={reducedMotion}
            text={text}
            trigger={trigger}
            onAnimationComplete={handleAnimationComplete}
            onAnimationStart={onAnimationStart}
          />
        ) : animation === "gradient-highlight" ? (
          <GradientHighlightSegments
            key={visualKey}
            active={active}
            delay={delay}
            duration={resolvedDuration}
            once={once}
            reducedMotion={reducedMotion}
            text={text}
            trigger={trigger}
            onAnimationComplete={handleAnimationComplete}
            onAnimationStart={onAnimationStart}
          />
        ) : animation === "blur-focus" ? (
          <BlurFocusSegments
            key={visualKey}
            active={active}
            delay={delay}
            duration={resolvedDuration}
            once={once}
            reducedMotion={reducedMotion}
            text={text}
            trigger={trigger}
            onAnimationComplete={handleAnimationComplete}
            onAnimationStart={onAnimationStart}
          />
        ) : animation === "rotating-keyword" ? (
          <RotatingKeywordSegments
            active={active}
            autoRotateKeywords={autoRotateKeywords}
            duration={resolvedDuration}
            keyword={selectedRotatingKeyword}
            keywordCount={keywordCount}
            keywordIndex={selectedRotatingKeywordIndex}
            keywords={rotatingKeywords}
            longestKeyword={longestRotatingKeyword}
            once={once}
            prefix={rotatingKeywordPrefix}
            reducedMotion={reducedMotion}
            rotatingKeywordInterval={rotatingKeywordInterval}
            suffix={rotatingKeywordSuffix}
            trigger={trigger}
            onAnimationComplete={onAnimationComplete}
            onAnimationStart={onAnimationStart}
            onKeywordIndexChange={handleRotatingKeywordIndexChange}
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
