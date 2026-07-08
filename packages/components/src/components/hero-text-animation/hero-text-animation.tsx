import {
  createElement,
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
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
  useMotionValue,
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
  | "blur-focus"
  | "kinetic-emphasis-pop"
  | "svg-stroke-draw"
  | "scroll-responsive";
export type HeroTextAnimationElement = "h1" | "h2" | "p" | "span";
export type HeroTextAnimationSplitBy = "word" | "line";
export type HeroTextAnimationTrigger = "mount" | "in-view" | "manual";
export type HeroTextAnimationReducedMotionStrategy = "static" | "opacity-only";
export type HeroTextAnimationProviderReducedMotion =
  "user" | "always" | "never";

/**
 * @deprecated `svg-stroke-draw` now traces the heading's own letterforms
 * (outline → fill) instead of a decorative accent path, so `svgPathData` is no
 * longer used. The type is retained for backwards compatibility only.
 */
export interface HeroTextAnimationSvgPath {
  d: string;
  strokeWidth?: number;
}

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
  emphasisWordIndices?: readonly number[];
  emphasisWords?: readonly string[];
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
  svgAccessibleTitle?: string;
  /**
   * @deprecated `svg-stroke-draw` traces the heading's own letterforms now, so
   * this prop is ignored. It is kept only so existing callers keep type-checking.
   */
  svgPathData?:
    string | readonly string[] | readonly HeroTextAnimationSvgPath[];
  /**
   * Optional view box override for the `svg-stroke-draw` letter trace. When
   * omitted (recommended) the component frames the text automatically from its
   * measured glyph metrics.
   */
  svgViewBox?: string;
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
    maskedCurtain: 0.64,
    typewriter: 1.1,
    scramble: 1.2,
    rotatingKeyword: 0.34,
    gradientHighlight: 1.6,
    blurFocus: 0.9,
    kineticEmphasisPop: 0.5,
    svgStrokeDraw: 1.4,
    scrollResponsive: 0,
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
    blurFocusY: "0.2em",
    scrollY: -32,
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
  "ml-[0.08em] inline-block h-[0.9em] w-[0.08em] translate-y-[0.08em] bg-current align-baseline opacity-70 animate-pulse motion-reduce:animate-none";
// Every state of the scramble — jumbled, settling, fully resolved, and the SSR
// fallback — is rendered from the *same* per-character slots, so a character's
// box is byte-for-byte identical whether it is showing a cipher glyph or its
// final letter. Resolving a character only swaps the glyph inside its slot; the
// slot itself never changes size. That invariance is what removes every source
// of jitter and the settle-time shift, without depending on font kerning at all.
const heroTextAnimationScrambleMotionClasses =
  "inline min-w-0 max-w-full";
const heroTextAnimationScrambleTextClasses = "inline";
// Each word is an inline-block so a run of character slots never breaks mid-word
// — line breaks only happen at the real spaces between words.
const heroTextAnimationScrambleWordClasses =
  "inline-block whitespace-pre align-baseline";
// A resolved slot simply shows its final character (clean text, natural width).
const heroTextAnimationScrambleResolvedGlyphClasses =
  "inline-block whitespace-pre align-baseline";
// An unresolved slot reserves its final character's width with an invisible copy
// and floats the cycling cipher glyph, centered, on top — so glyph churn never
// moves anything. Because the reserved width equals the resolved width, the slot
// does not resize when it locks in.
const heroTextAnimationScrambleGlyphClasses =
  "relative inline-block whitespace-pre align-baseline";
const heroTextAnimationScrambleGlyphOverlayClasses =
  "absolute left-0 top-0 w-full text-center";
const heroTextAnimationRotatingMotionClasses =
  "inline-flex min-w-0 max-w-full flex-wrap items-baseline gap-x-[0.18em]";
const heroTextAnimationRotatingTextClasses = "whitespace-pre-wrap";
const heroTextAnimationRotatingSlotClasses =
  "relative inline-grid overflow-hidden align-baseline [line-height:inherit] [contain:layout]";
const heroTextAnimationRotatingSizerClasses =
  "invisible col-start-1 row-start-1 whitespace-pre";
const heroTextAnimationRotatingKeywordClasses =
  "col-start-1 row-start-1 whitespace-pre will-change-transform data-[reduced-motion=true]:will-change-auto";
// A light-sweep "paint-in" reveal. The heading is painted into the text via
// `background-clip: text`, and the gradient runs revealed → glint → hidden:
// `base` (foreground) on the left, a bright primary `sheen`/`accent` band at the
// boundary, then `transparent` on the right. Animating `background-position`
// slides that boundary across so each glyph flashes primary as it appears and
// settles to foreground — a directional reveal, not a sheen over visible text,
// so it reads clearly in light and dark themes. At the default position (0%) the
// window sits entirely in `base`, so the static/reduced fallback is solid text.
const heroTextAnimationGradientHighlightClasses =
  "inline whitespace-pre-wrap bg-[linear-gradient(100deg,var(--hero-text-animation-highlight-base)_0%,var(--hero-text-animation-highlight-base)_36%,var(--hero-text-animation-highlight-accent)_45%,var(--hero-text-animation-highlight-sheen)_50%,var(--hero-text-animation-highlight-accent)_55%,transparent_64%,transparent_100%)] bg-[length:300%_100%] bg-no-repeat bg-clip-text text-transparent will-change-[background-position] forced-colors:bg-none forced-colors:text-[CanvasText] data-[reduced-motion=true]:will-change-auto";
const heroTextAnimationBlurFocusClasses =
  "inline-block min-w-0 max-w-full whitespace-pre-wrap align-baseline will-change-[filter,opacity,transform] data-[reduced-motion=true]:will-change-auto";
const heroTextAnimationBlurFocusWordClasses =
  "inline-block whitespace-pre align-baseline will-change-[filter,opacity,transform] data-[reduced-motion=true]:will-change-auto";
const heroTextAnimationBlurFocusLineClasses =
  "block min-w-0 overflow-visible will-change-[filter,opacity,transform] data-[reduced-motion=true]:will-change-auto";
const heroTextAnimationKineticEmphasisMotionClasses =
  "inline min-w-0 max-w-full";
const heroTextAnimationKineticEmphasisWordClasses =
  "inline-block whitespace-pre align-baseline [transform-origin:center_70%] data-[emphasized=true]:text-primary data-[emphasized=true]:font-semibold data-[emphasized=true]:underline data-[emphasized=true]:decoration-current data-[emphasized=true]:decoration-[0.08em] data-[emphasized=true]:underline-offset-[0.14em] data-[emphasized=true]:[text-decoration-skip-ink:auto] data-[emphasized=true]:forced-colors:text-[CanvasText] data-[emphasized=true]:forced-colors:decoration-[CanvasText] data-[emphasized=true]:will-change-transform data-[reduced-motion=true]:will-change-auto";
const heroTextAnimationScrollResponsiveClasses =
  "inline-block min-w-0 max-w-full whitespace-pre-wrap align-baseline will-change-transform [transform-origin:center_top] data-[reduced-motion=true]:will-change-auto";
const heroTextAnimationSvgStrokeDrawClasses =
  "block w-full min-w-0 max-w-full text-foreground";
const heroTextAnimationSvgStrokeDrawSvgClasses =
  "block h-auto w-full overflow-visible";
const heroTextAnimationSvgStrokeDrawLineClasses = "[paint-order:stroke]";

const typewriterMinimumIntervalMs = 16;
// Upper bound on the per-character cadence so a long duration on a short string
// still reads as typing rather than stalling between glyphs.
const typewriterMaximumIntervalMs = 96;
const typewriterMinimumDurationMs = 300;
// Raised so a deliberately paced hero (a slower, more "typewriter" feel) is
// honored end to end instead of being clamped back to a rushed reveal.
const typewriterMaximumDurationMs = 2600;
// A fast cadence with many frames so the reveal reads as rapid cipher churn
// resolving left to right, rather than a handful of sluggish discrete steps.
const scrambleMinimumIntervalMs = 30;
const scrambleMinimumDurationMs = 500;
const scrambleMaximumDurationMs = 2400;
const scrambleMaximumUpdateCount = 56;
// Uppercase letters, digits, and a few code-flavored symbols so the pre-reveal
// text reads as encrypted copy decoding into the headline (not abstract noise).
const scrambleGlyphs = Array.from(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&/<>*",
) as readonly string[];
const rotatingKeywordDefaultIntervalMs = 2000;
const rotatingKeywordMinimumIntervalMs = 400;
const rotatingKeywordMaximumAutoRotateMs = 5000;
// Blur is expressed in `em` so the radius scales with the heading size — a
// stronger, more cinematic defocus on large hero text while staying readable on
// smaller headings. Initial and final must share a unit for Motion to
// interpolate the blur() filter smoothly.
const blurFocusInitialBlur = "0.2em";
const blurFocusFinalBlur = "0em";
const blurFocusInitialScale = 1.06;
// A gently back-loaded ease so the defocus lingers and racks into sharp focus
// near the end, instead of the front-loaded soft ease that snapped crisp within
// the first fraction of the duration.
const blurFocusFocusEase = [0.42, 0, 0.2, 1] as [
  number,
  number,
  number,
  number,
];
// The gradient sheen must glide across at a near-even pace so the sweep reads as
// a deliberate glint. The front-loaded "soft" ease dumped most of the travel in
// the first fraction of the duration, so the highlight flashed past instantly;
// this gentle ease-in-out keeps it moving through the whole sweep.
const gradientHighlightSweepEase = [0.4, 0, 0.2, 1] as [
  number,
  number,
  number,
  number,
];
const kineticEmphasisMaximumWordCount = 2;
// Peak scale of the emphasis pop. The word starts small, overshoots this peak,
// then settles at rest — a deliberate punch rather than a symmetric zoom.
const kineticEmphasisScale = 1.08;
const kineticEmphasisHiddenScale = 0.84;
const kineticEmphasisRise = "0.6em";
// Scroll-responsive anchors to the hero's own position (offset "start start":
// progress begins when the hero's top reaches the viewport top) rather than to
// raw page scroll, so the effect is correct wherever the hero sits on the page
// (PRD 9.9). The subtle transform then completes over a fixed scroll window so
// the feel is independent of heading size.
const scrollResponsiveAnchor = "start start";
const scrollResponsiveRangePx = 220;
const scrollResponsiveMinimumOpacity = 0.92;
// The letter-trace renders the heading as an SVG `<text>` in a fixed user-unit
// coordinate space (font-size 100) so the geometry is independent of the
// responsive display size — the SVG then scales to fill its container width.
// Each line is revealed by a left-to-right clip wipe: the stroked outline is
// exposed first, then a fill wipe follows a beat behind, so the word reads as a
// pen drawing the outline and inking it in (PRD: outline → fill "wordmark that
// draws itself"). A clip wipe is used rather than stroke-dashoffset because
// `<text>` gives no reliable stroke length and browsers apply dashes per glyph
// inconsistently, which makes a true dash trace non-portable.
const svgStrokeDrawFontSize = 100;
const svgStrokeDrawAscent = 82;
const svgStrokeDrawDescent = 26;
const svgStrokeDrawLineGap = 122;
const svgStrokeDrawStrokeWidth = 2.4;
const svgStrokeDrawViewBoxPadding = 8;
// Fallback glyph advance (user units) used to frame the box before the text is
// measured, and on the server where no layout is available.
const svgStrokeDrawFallbackCharWidth = 60;
// Fraction of the per-line duration by which the fill wipe trails the outline
// wipe, so the fill inks in just behind the drawing edge.
const svgStrokeDrawFillLagRatio = 0.22;
const svgStrokeDrawLineStagger = 0.18;
const defaultRepeatDelay = 1.8;
const gradientHighlightStyle = {
  // Settled text color once revealed.
  "--hero-text-animation-highlight-base": "var(--dt-color-foreground)",
  // The glint edge — a vivid primary so each glyph flashes brand color as it is
  // painted in.
  "--hero-text-animation-highlight-accent":
    "color-mix(in oklab, var(--dt-color-primary) 80%, var(--dt-color-foreground) 20%)",
  // The luminous core of the sweep. Leaning primary toward background keeps it
  // reading as a bright light band that travels across the reveal boundary in
  // any theme.
  "--hero-text-animation-highlight-sheen":
    "color-mix(in oklab, var(--dt-color-primary) 55%, var(--dt-color-background) 45%)",
} as CSSProperties;
const svgStrokeDrawStyle = {
  "--hero-text-animation-svg-stroke":
    "color-mix(in oklab, var(--dt-color-foreground) 82%, var(--dt-color-primary) 18%)",
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

function normalizeEmphasisWord(word: string) {
  return word
    .trim()
    .replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "")
    .toLocaleLowerCase();
}

function resolveKineticEmphasisWordIndices({
  emphasisWordIndices,
  emphasisWords,
  segments,
}: {
  emphasisWordIndices?: readonly number[];
  emphasisWords?: readonly string[];
  segments: HeroTextAnimationSegment[];
}) {
  const wordSegments = segments.filter((segment) => segment.kind === "text");
  const resolvedIndices: number[] = [];

  for (const configuredIndex of emphasisWordIndices ?? []) {
    if (!Number.isFinite(configuredIndex)) {
      continue;
    }

    const normalizedIndex = Math.trunc(configuredIndex);

    if (
      normalizedIndex >= 0 &&
      normalizedIndex < wordSegments.length &&
      !resolvedIndices.includes(normalizedIndex)
    ) {
      resolvedIndices.push(normalizedIndex);
    }

    if (resolvedIndices.length >= kineticEmphasisMaximumWordCount) {
      return resolvedIndices;
    }
  }

  const normalizedWords = (emphasisWords ?? [])
    .map((word) => normalizeEmphasisWord(word))
    .filter((word) => word.length > 0);

  for (const configuredWord of normalizedWords) {
    const matchedIndex = wordSegments.findIndex(
      (segment, wordIndex) =>
        !resolvedIndices.includes(wordIndex) &&
        normalizeEmphasisWord(segment.text) === configuredWord,
    );

    if (matchedIndex >= 0) {
      resolvedIndices.push(matchedIndex);
    }

    if (resolvedIndices.length >= kineticEmphasisMaximumWordCount) {
      return resolvedIndices;
    }
  }

  return resolvedIndices;
}

function getSegmentWordIndices(segments: readonly HeroTextAnimationSegment[]) {
  let nextWordIndex = -1;

  return segments.map((segment) => {
    if (segment.kind === "space") {
      return -1;
    }

    nextWordIndex += 1;

    return nextWordIndex;
  });
}

interface SvgStrokeDrawGeometry {
  viewBox: string;
  centerX: number;
  baselines: number[];
  lineWidths: number[];
  measured: boolean;
}

function splitSvgStrokeDrawLines(text: string): string[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  return lines.length > 0 ? lines : [text.trim()];
}

// Deterministic geometry used for SSR, reduced motion, and as the pre-measure
// frame on the client. Because it depends only on the text (not on layout), the
// server and first client render agree, so hydration never mismatches; the
// animated variant then refines the view box and dash lengths from the real
// measured glyph metrics.
function estimateSvgStrokeDrawGeometry(
  lines: string[],
  viewBoxOverride?: string,
): SvgStrokeDrawGeometry {
  const lineCount = Math.max(1, lines.length);
  const baselines = Array.from(
    { length: lineCount },
    (_, index) => svgStrokeDrawAscent + index * svgStrokeDrawLineGap,
  );
  const contentWidth = Math.max(
    svgStrokeDrawFontSize * 2,
    ...lines.map(
      (line) => Array.from(line).length * svgStrokeDrawFallbackCharWidth,
    ),
  );
  const contentHeight =
    svgStrokeDrawAscent +
    svgStrokeDrawDescent +
    (lineCount - 1) * svgStrokeDrawLineGap;
  const pad = svgStrokeDrawViewBoxPadding;
  const viewBox =
    viewBoxOverride ??
    `${-pad} ${-pad} ${contentWidth + pad * 2} ${contentHeight + pad * 2}`;
  const lineWidths = lines.map((line) =>
    Math.max(1, Array.from(line).length * svgStrokeDrawFallbackCharWidth),
  );

  return {
    viewBox,
    centerX: contentWidth / 2,
    baselines,
    lineWidths,
    measured: false,
  };
}

function isValidSvgViewBox(viewBox: string) {
  const values = viewBox
    .trim()
    .split(/[\s,]+/)
    .map((value) => Number(value));

  return (
    values.length === 4 &&
    values.every((value) => Number.isFinite(value)) &&
    values[2] > 0 &&
    values[3] > 0
  );
}

function useHasHydrated() {
  const [hasHydrated, setHasHydrated] = useState(false);

  useIsomorphicLayoutEffect(() => {
    setHasHydrated(true);
  }, []);

  return hasHydrated;
}

/**
 * Tracks whether a one-shot animation is at rest so we can drop the
 * `will-change` hint once motion completes. Motion's own performance guidance
 * flags leaving `will-change` on every animated node as an anti-pattern because
 * each promoted layer holds GPU memory and can subtly change text rasterization
 * at rest. `willChangeClass` returns the resting override to merge in.
 */
function useMotionRest() {
  const [atRest, setAtRest] = useState(false);
  const markActive = useCallback(() => setAtRest(false), []);
  const markRest = useCallback(() => setAtRest(true), []);
  const willChangeClass = atRest ? "will-change-auto" : undefined;

  return { markActive, markRest, willChangeClass };
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
        className={cn(heroTextAnimationLineClasses, "will-change-auto")}
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
        className={cn(heroTextAnimationWordClasses, "will-change-auto")}
      >
        {segment.text}
      </span>
    );
  });
}

function renderStaticKineticEmphasis({
  emphasisIndices,
  segments,
}: {
  emphasisIndices: readonly number[];
  segments: HeroTextAnimationSegment[];
}) {
  const segmentWordIndices = getSegmentWordIndices(segments);

  return (
    <span
      aria-hidden="true"
      data-emphasis-count={emphasisIndices.length}
      data-kinetic-emphasis="pop"
      data-reduced-motion="true"
      data-slot="hero-text-animation-motion"
      data-split-by="word"
      className={heroTextAnimationKineticEmphasisMotionClasses}
    >
      {segments.map((segment, index) => {
        if (segment.kind === "space") {
          return segment.text;
        }

        const wordIndex = segmentWordIndices[index] ?? -1;
        const emphasisOrder = emphasisIndices.indexOf(wordIndex);
        const emphasized = emphasisOrder >= 0;

        return (
          <span
            key={`${index}-${segment.text}`}
            data-emphasized={emphasized ? "true" : undefined}
            data-emphasis-order={emphasized ? emphasisOrder : undefined}
            data-emphasis-word-index={emphasized ? wordIndex : undefined}
            data-reduced-motion="true"
            data-slot="hero-text-animation-segment"
            data-segment="word"
            className={heroTextAnimationKineticEmphasisWordClasses}
          >
            {segment.text}
          </span>
        );
      })}
    </span>
  );
}

function getKineticEmphasisWordVariants({
  duration,
  emphasized,
}: {
  duration: number;
  emphasized: boolean;
}): Variants {
  // Every word rises and fades in on a stagger so the line assembles as a
  // kinetic sweep instead of the whole block blinking on. Emphasized words pop
  // in from small, overshoot the peak scale, then settle — a one-shot punch that
  // draws the eye, with the lasting emphasis still carried by the static weight,
  // color, and underline (PRD 9.8).
  if (!emphasized) {
    return {
      hidden: { opacity: 0, y: kineticEmphasisRise },
      visible: {
        opacity: 1,
        transition: {
          duration,
          ease: heroTextAnimationMotionTokens.easing.standard,
        },
        y: "0em",
      },
    };
  }

  return {
    hidden: { opacity: 0, scale: kineticEmphasisHiddenScale, y: kineticEmphasisRise },
    visible: {
      opacity: 1,
      scale: [kineticEmphasisHiddenScale, kineticEmphasisScale, 1],
      transition: {
        duration,
        ease: heroTextAnimationMotionTokens.easing.standard,
        scale: {
          duration,
          ease: heroTextAnimationMotionTokens.easing.standard,
          times: [0, 0.62, 1],
        },
      },
      y: "0em",
    },
  };
}

function KineticEmphasisSegments({
  active,
  delay,
  duration,
  emphasisIndices,
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
  emphasisIndices: readonly number[];
  once: boolean;
  reducedMotion: boolean;
  segments: HeroTextAnimationSegment[];
  stagger: number;
  trigger: HeroTextAnimationTrigger;
  onAnimationComplete?: () => void;
  onAnimationStart?: () => void;
}) {
  const { markActive, markRest, willChangeClass } = useMotionRest();
  // Non-reduced: the container only orchestrates the per-word stagger so the
  // line assembles as a sweep. Reduced motion falls back to a single opacity
  // fade of the whole phrase with no transforms.
  const containerVariants: Variants = reducedMotion
    ? {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { delay, duration: 0.2, ease: "linear" },
        },
      }
    : getContainerVariants({ delay, stagger });
  const triggerProps =
    trigger === "in-view"
      ? {
          whileInView: "visible",
          viewport: { amount: 0.6, once },
        }
      : {
          animate: trigger === "manual" && !active ? "hidden" : "visible",
        };
  const segmentWordIndices = getSegmentWordIndices(segments);

  return (
    <motionElement.span
      aria-hidden="true"
      data-emphasis-count={emphasisIndices.length}
      data-kinetic-emphasis="pop"
      data-reduced-motion={reducedMotion ? "true" : undefined}
      data-slot="hero-text-animation-motion"
      data-split-by="word"
      className={heroTextAnimationKineticEmphasisMotionClasses}
      variants={containerVariants}
      initial="hidden"
      onAnimationComplete={() => {
        markRest();
        onAnimationComplete?.();
      }}
      onAnimationStart={() => {
        markActive();
        onAnimationStart?.();
      }}
      {...triggerProps}
    >
      {segments.map((segment, index) => {
        if (segment.kind === "space") {
          return segment.text;
        }

        const wordIndex = segmentWordIndices[index] ?? -1;
        const emphasisOrder = emphasisIndices.indexOf(wordIndex);
        const emphasized = emphasisOrder >= 0;
        const sharedProps = {
          "data-emphasized": emphasized ? "true" : undefined,
          "data-emphasis-order": emphasized ? emphasisOrder : undefined,
          "data-emphasis-scale":
            emphasized && !reducedMotion ? kineticEmphasisScale : undefined,
          "data-emphasis-word-index": emphasized ? wordIndex : undefined,
          "data-reduced-motion": reducedMotion ? "true" : undefined,
          "data-segment": "word",
          "data-slot": "hero-text-animation-segment",
          className: cn(
            heroTextAnimationKineticEmphasisWordClasses,
            willChangeClass,
          ),
        };

        if (reducedMotion) {
          return (
            <span key={`${index}-${segment.text}`} {...sharedProps}>
              {segment.text}
            </span>
          );
        }

        return (
          <motionElement.span
            key={`${index}-${segment.text}`}
            {...sharedProps}
            variants={getKineticEmphasisWordVariants({ duration, emphasized })}
          >
            {segment.text}
          </motionElement.span>
        );
      })}
    </motionElement.span>
  );
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
  const { markActive, markRest, willChangeClass } = useMotionRest();
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
      onAnimationComplete={() => {
        markRest();
        onAnimationComplete?.();
      }}
      onAnimationStart={() => {
        markActive();
        onAnimationStart?.();
      }}
      {...triggerProps}
    >
      {splitBy === "line"
        ? segments.map((segment, index) => (
            <motionElement.span
              key={`${index}-${segment.text}`}
              data-slot="hero-text-animation-segment"
              data-reduced-motion={reducedMotion ? "true" : undefined}
              data-segment="line"
              className={cn(heroTextAnimationLineClasses, willChangeClass)}
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
                className={cn(heroTextAnimationWordClasses, willChangeClass)}
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
  const { markActive, markRest, willChangeClass } = useMotionRest();
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
      onAnimationComplete={() => {
        markRest();
        onAnimationComplete?.();
      }}
      onAnimationStart={() => {
        markActive();
        onAnimationStart?.();
      }}
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
            className={cn(heroTextAnimationCurtainLineClasses, willChangeClass)}
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
  const count = Math.max(characterCount, 1);
  // Cap how many ticks we schedule so very long copy still reveals in a few
  // characters per frame rather than thousands of timers.
  const maxFrames = Math.max(
    1,
    Math.floor(boundedDurationMs / typewriterMinimumIntervalMs),
  );
  const charactersPerTick = Math.max(1, Math.ceil(count / maxFrames));
  const tickCount = Math.max(1, Math.ceil(count / charactersPerTick));
  // Derive the cadence from the duration so the reveal actually fills the time
  // asked for (bounded by a min/max so it never feels janky or stalled),
  // instead of snapping back to a fixed fast interval.
  const intervalMs = Math.min(
    typewriterMaximumIntervalMs,
    Math.max(
      typewriterMinimumIntervalMs,
      Math.round(boundedDurationMs / tickCount),
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

// Static (pre-hydration / reduced-motion-static) render for the typewriter.
// It reuses the exact grid + invisible sizer box that `TypewriterSegments`
// renders so the reserved space is pixel-identical before and after hydration.
// Falling back to plain word spans here (a different inline layout) is what made
// the heading shift the moment typing began.
function renderStaticTypewriter(text: string) {
  return (
    <span
      aria-hidden="true"
      data-slot="hero-text-animation-motion"
      data-split-by="character"
      data-typewriter-complete="true"
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
        data-reduced-motion="true"
        className={heroTextAnimationTypewriterTextClasses}
      >
        {text}
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

// Deterministic (no Math.random, so SSR and every mount agree) but chaotic
// enough that consecutive frames don't march predictably through the alphabet.
function getScrambleGlyph({
  characterIndex,
  frame,
}: {
  characterIndex: number;
  frame: number;
}) {
  const hash = ((characterIndex + 1) * 2654435761 + (frame + 1) * 40503) >>> 0;

  return scrambleGlyphs[hash % scrambleGlyphs.length];
}

interface ScrambleSlot {
  finalCharacter: string;
  glyph: string;
  isSpace: boolean;
  resolved: boolean;
}

// Resolves the whole string left to right: character i locks to its final glyph
// once the frame passes its share of the timeline, while everything after it
// keeps cycling. Spaces pass through untouched so word breaks stay put.
function getScrambleFrameSlots({
  frame,
  text,
  updateCount,
}: {
  frame: number;
  text: string;
  updateCount: number;
}): ScrambleSlot[] {
  const characters = Array.from(text);
  const revealableCount = characters.filter(
    (character) => !/\s/.test(character),
  ).length;
  let revealableIndex = 0;

  return characters.map((finalCharacter, characterIndex) => {
    if (/\s/.test(finalCharacter)) {
      return {
        finalCharacter,
        glyph: finalCharacter,
        isSpace: true,
        resolved: true,
      };
    }

    revealableIndex += 1;

    const resolveFrame = Math.max(
      1,
      Math.ceil((revealableIndex / Math.max(1, revealableCount)) * updateCount),
    );
    const resolved = frame >= resolveFrame;

    return {
      finalCharacter,
      glyph: resolved
        ? finalCharacter
        : getScrambleGlyph({ characterIndex, frame }),
      isSpace: false,
      resolved,
    };
  });
}

type ScrambleGroup =
  | { kind: "space"; text: string }
  | { kind: "word"; slots: { slot: ScrambleSlot; index: number }[] };

// Groups the flat slot list into words (kept whole via an inline-block wrapper)
// and the spaces between them (real break opportunities), so the overlay wraps
// exactly like the plain sizer text underneath it.
function groupScrambleSlots(slots: ScrambleSlot[]): ScrambleGroup[] {
  const groups: ScrambleGroup[] = [];

  slots.forEach((slot, index) => {
    if (slot.isSpace) {
      const previous = groups[groups.length - 1];

      if (previous && previous.kind === "space") {
        previous.text += slot.finalCharacter;
      } else {
        groups.push({ kind: "space", text: slot.finalCharacter });
      }

      return;
    }

    const previous = groups[groups.length - 1];

    if (previous && previous.kind === "word") {
      previous.slots.push({ slot, index });
    } else {
      groups.push({ kind: "word", slots: [{ slot, index }] });
    }
  });

  return groups;
}

// All-resolved slots, used for the SSR / reduced-motion / pre-hydration render
// so it shares the exact per-character slot layout the animation settles into —
// no plain-text run anywhere, so the client takeover never shifts the text.
function getResolvedScrambleGroups(text: string): ScrambleGroup[] {
  return groupScrambleSlots(
    Array.from(text).map((finalCharacter) => ({
      finalCharacter,
      glyph: finalCharacter,
      isSpace: /\s/.test(finalCharacter),
      resolved: true,
    })),
  );
}

// Shared renderer for both the live animation and the static fallback. A
// resolved slot is just its final character (clean text); an unresolved slot
// reserves that same width with an invisible copy and floats the cipher glyph on
// top. Only unresolved slots carry the fragment marker, so the static render is
// free of scramble internals.
function renderScrambleGroups(groups: ScrambleGroup[]) {
  return groups.map((group, groupIndex) =>
    group.kind === "space" ? (
      <span key={`space-${groupIndex}`}>{group.text}</span>
    ) : (
      <span
        key={`word-${groupIndex}`}
        data-slot="hero-text-animation-scramble-word"
        className={heroTextAnimationScrambleWordClasses}
      >
        {group.slots.map(({ slot, index }) =>
          slot.resolved ? (
            <span
              key={`${index}-${slot.finalCharacter}`}
              data-scramble-resolved="true"
              className={heroTextAnimationScrambleResolvedGlyphClasses}
            >
              {slot.finalCharacter}
            </span>
          ) : (
            <span
              key={`${index}-${slot.finalCharacter}`}
              data-slot="hero-text-animation-scramble-fragment"
              data-scramble-resolved="false"
              className={heroTextAnimationScrambleGlyphClasses}
            >
              <span aria-hidden="true" className="invisible">
                {slot.finalCharacter}
              </span>
              <span
                aria-hidden="true"
                className={heroTextAnimationScrambleGlyphOverlayClasses}
              >
                {slot.glyph}
              </span>
            </span>
          ),
        )}
      </span>
    ),
  );
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

// Static (SSR / pre-hydration / reduced-motion-static) render. It reuses the
// exact sizer + overlay box the animated component settles into, so the plain
// final text is shown with no glyph fragments and the layout never shifts when
// the client takes over.
function renderStaticScramble(text: string) {
  return (
    <span
      aria-hidden="true"
      data-slot="hero-text-animation-motion"
      data-scramble-complete="true"
      data-split-by="character"
      className={heroTextAnimationScrambleMotionClasses}
    >
      <span
        data-slot="hero-text-animation-scramble-text"
        data-reduced-motion="true"
        className={heroTextAnimationScrambleTextClasses}
      >
        {renderScrambleGroups(getResolvedScrambleGroups(text))}
      </span>
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
  const isComplete = normalizedFrame >= updateCount;
  const slots = getScrambleFrameSlots({
    frame: normalizedFrame,
    text,
    updateCount,
  });
  const groups = groupScrambleSlots(slots);

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
        data-slot="hero-text-animation-scramble-text"
        data-reduced-motion={reducedMotion ? "true" : undefined}
        className={heroTextAnimationScrambleTextClasses}
      >
        {renderScrambleGroups(groups)}
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
  const { markActive, markRest, willChangeClass } = useMotionRest();
  const shouldStart =
    trigger === "in-view" ? isInView : trigger === "manual" ? active : true;
  // Position 0% shows the fully revealed (base) text; 100% parks the window in
  // the transparent zone so the heading starts invisible and paints in as the
  // sweep drives the position back to 0%. Reduced motion rests revealed; an
  // in-view trigger waits hidden until it scrolls into view.
  const initialBackgroundPositionX = reducedMotion ? "0%" : "100%";
  const targetBackgroundPositionX = reducedMotion
    ? "0%"
    : !shouldStart
      ? "100%"
      : "0%";
  const transition = reducedMotion
    ? { duration: 0 }
    : {
        delay,
        duration,
        ease: gradientHighlightSweepEase,
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
        willChangeClass,
      )}
      style={gradientHighlightStyle}
      initial={{ backgroundPositionX: initialBackgroundPositionX }}
      animate={{ backgroundPositionX: targetBackgroundPositionX }}
      transition={transition}
      onAnimationComplete={
        reducedMotion || !shouldStart
          ? undefined
          : () => {
              markRest();
              onAnimationComplete?.();
            }
      }
      onAnimationStart={
        reducedMotion || !shouldStart
          ? undefined
          : () => {
              markActive();
              onAnimationStart?.();
            }
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

function renderStaticSvgStrokeDraw({
  accessibleTitle,
  lines,
  viewBox,
  viewBoxValid,
}: {
  accessibleTitle?: string;
  lines: string[];
  viewBox: string;
  viewBoxValid: boolean;
}) {
  const geometry = estimateSvgStrokeDrawGeometry(
    lines,
    viewBoxValid ? viewBox : undefined,
  );
  const shouldExposeSvg =
    accessibleTitle !== undefined && accessibleTitle.length > 0;

  return (
    <span
      aria-hidden={shouldExposeSvg ? undefined : "true"}
      data-reduced-motion="true"
      data-slot="hero-text-animation-motion"
      data-split-by="line"
      data-svg-line-count={lines.length}
      data-svg-stroke-draw="true"
      data-svg-stroke-draw-mode="letter-trace"
      data-svg-view-box-valid={viewBoxValid ? "true" : "false"}
      className={cn(
        heroTextAnimationMotionClasses,
        heroTextAnimationSvgStrokeDrawClasses,
      )}
      style={svgStrokeDrawStyle}
    >
      <svg
        aria-hidden={shouldExposeSvg ? undefined : "true"}
        aria-label={shouldExposeSvg ? accessibleTitle : undefined}
        data-slot="hero-text-animation-svg"
        fill="none"
        focusable="false"
        preserveAspectRatio="xMidYMid meet"
        role={shouldExposeSvg ? "img" : undefined}
        viewBox={geometry.viewBox}
        className={heroTextAnimationSvgStrokeDrawSvgClasses}
      >
        {shouldExposeSvg && accessibleTitle ? (
          <title>{accessibleTitle}</title>
        ) : null}
        {lines.map((line, index) => (
          <text
            key={`${index}-${line}`}
            aria-hidden="true"
            data-reduced-motion="true"
            data-slot="hero-text-animation-svg-line"
            x={geometry.centerX}
            y={geometry.baselines[index]}
            textAnchor="middle"
            fontSize={svgStrokeDrawFontSize}
            fill="currentColor"
            fillOpacity={1}
            stroke="var(--hero-text-animation-svg-stroke)"
            strokeWidth={svgStrokeDrawStrokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={heroTextAnimationSvgStrokeDrawLineClasses}
          >
            {line}
          </text>
        ))}
      </svg>
    </span>
  );
}

function SvgStrokeDrawSegments({
  accessibleTitle,
  active,
  delay,
  duration,
  lines,
  once,
  trigger,
  viewBox,
  viewBoxValid,
  onAnimationComplete,
  onAnimationStart,
}: {
  accessibleTitle?: string;
  active: boolean;
  delay: number;
  duration: number;
  lines: string[];
  once: boolean;
  trigger: HeroTextAnimationTrigger;
  viewBox: string;
  viewBoxValid: boolean;
  onAnimationComplete?: () => void;
  onAnimationStart?: () => void;
}) {
  const [inViewRef, isInView] = useTypewriterInView({ once, trigger });
  const { markActive, markRest } = useMotionRest();
  const clipId = useId().replace(/:/g, "");
  const shouldStart =
    trigger === "in-view" ? isInView : trigger === "manual" ? active : true;
  const shouldExposeSvg =
    accessibleTitle !== undefined && accessibleTitle.length > 0;
  const viewBoxOverride = viewBoxValid ? viewBox : undefined;
  const [geometry, setGeometry] = useState(() =>
    estimateSvgStrokeDrawGeometry(lines, viewBoxOverride),
  );
  const groupRef = useRef<SVGGElement>(null);
  const lineRefs = useRef<Array<SVGTextElement | null>>([]);
  const linesKey = lines.join("\n");

  // Measure the real glyph metrics after layout so each line's wipe spans its
  // exact width and the view box frames the text tightly. Re-measures once web
  // fonts settle, since the glyph advances change when the real face swaps in.
  useIsomorphicLayoutEffect(() => {
    const measure = () => {
      const group = groupRef.current;

      if (!group || typeof group.getBBox !== "function") {
        return;
      }

      let box: DOMRect;

      try {
        box = group.getBBox();
      } catch {
        return;
      }

      if (!box || box.width === 0 || box.height === 0) {
        return;
      }

      const lineWidths = lines.map((_, index) => {
        const element = lineRefs.current[index];
        const length =
          element && typeof element.getComputedTextLength === "function"
            ? element.getComputedTextLength()
            : 0;

        return Math.max(1, length);
      });
      const pad = svgStrokeDrawViewBoxPadding;

      setGeometry((previous) => ({
        ...previous,
        viewBox:
          viewBoxOverride ??
          `${box.x - pad} ${box.y - pad} ${box.width + pad * 2} ${
            box.height + pad * 2
          }`,
        lineWidths,
        measured: true,
      }));
    };

    measure();

    if (
      typeof document !== "undefined" &&
      document.fonts &&
      "ready" in document.fonts
    ) {
      let cancelled = false;

      document.fonts.ready
        .then(() => {
          if (!cancelled) {
            measure();
          }
        })
        .catch(() => {});

      return () => {
        cancelled = true;
      };
    }

    return undefined;
  }, [linesKey, viewBoxOverride]);

  const lastLineIndex = lines.length - 1;
  const wipePad = svgStrokeDrawStrokeWidth * 2;
  const fillLag = duration * svgStrokeDrawFillLagRatio;
  const wipeTransition = (wipeDelay: number) => ({
    delay: wipeDelay,
    duration,
    ease: "linear" as const,
  });

  return (
    <span
      ref={inViewRef}
      aria-hidden={shouldExposeSvg ? undefined : "true"}
      data-slot="hero-text-animation-motion"
      data-split-by="line"
      data-svg-line-count={lines.length}
      data-svg-measured={geometry.measured ? "true" : "false"}
      data-svg-stroke-draw="true"
      data-svg-stroke-draw-mode="letter-trace"
      data-svg-view-box-valid={viewBoxValid ? "true" : "false"}
      className={cn(
        heroTextAnimationMotionClasses,
        heroTextAnimationSvgStrokeDrawClasses,
      )}
      style={svgStrokeDrawStyle}
    >
      <svg
        aria-hidden={shouldExposeSvg ? undefined : "true"}
        aria-label={shouldExposeSvg ? accessibleTitle : undefined}
        data-slot="hero-text-animation-svg"
        fill="none"
        focusable="false"
        preserveAspectRatio="xMidYMid meet"
        role={shouldExposeSvg ? "img" : undefined}
        viewBox={geometry.viewBox}
        className={heroTextAnimationSvgStrokeDrawSvgClasses}
      >
        {shouldExposeSvg && accessibleTitle ? (
          <title>{accessibleTitle}</title>
        ) : null}
        <defs>
          {lines.map((line, index) => {
            const width = geometry.lineWidths[index] ?? 1;
            const left = geometry.centerX - width / 2 - wipePad;
            const fullWidth = width + wipePad * 2;
            const top =
              geometry.baselines[index] - svgStrokeDrawAscent - wipePad;
            const height =
              svgStrokeDrawAscent + svgStrokeDrawDescent + wipePad * 2;
            const lineDelay = delay + index * svgStrokeDrawLineStagger;
            // The wipe only runs once the text has been measured, so the reveal
            // always spans the real line width rather than the placeholder.
            const isDrawing = shouldStart && geometry.measured;

            return [
              <clipPath key={`o-${index}`} id={`${clipId}-o-${index}`}>
                <motionElement.rect
                  x={left}
                  y={top}
                  height={height}
                  initial={{ width: 0 }}
                  animate={{ width: isDrawing ? fullWidth : 0 }}
                  transition={wipeTransition(lineDelay)}
                  onAnimationStart={
                    isDrawing && index === 0
                      ? () => {
                          markActive();
                          onAnimationStart?.();
                        }
                      : undefined
                  }
                />
              </clipPath>,
              <clipPath key={`f-${index}`} id={`${clipId}-f-${index}`}>
                <motionElement.rect
                  x={left}
                  y={top}
                  height={height}
                  initial={{ width: 0 }}
                  animate={{ width: isDrawing ? fullWidth : 0 }}
                  transition={wipeTransition(lineDelay + fillLag)}
                  onAnimationComplete={
                    isDrawing && index === lastLineIndex
                      ? () => {
                          markRest();
                          onAnimationComplete?.();
                        }
                      : undefined
                  }
                />
              </clipPath>,
            ];
          })}
        </defs>
        <g ref={groupRef} data-slot="hero-text-animation-svg-group">
          {lines.map((line, index) => {
            const baseTextProps = {
              x: geometry.centerX,
              y: geometry.baselines[index],
              textAnchor: "middle" as const,
              fontSize: svgStrokeDrawFontSize,
            };

            return (
              <g key={`${index}-${line}`} data-svg-line-index={index}>
                <text
                  {...baseTextProps}
                  ref={(element) => {
                    lineRefs.current[index] = element;
                  }}
                  aria-hidden="true"
                  data-slot="hero-text-animation-svg-line"
                  clipPath={`url(#${clipId}-o-${index})`}
                  fill="none"
                  stroke="var(--hero-text-animation-svg-stroke)"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={svgStrokeDrawStrokeWidth}
                >
                  {line}
                </text>
                <text
                  {...baseTextProps}
                  aria-hidden="true"
                  data-slot="hero-text-animation-svg-fill"
                  clipPath={`url(#${clipId}-f-${index})`}
                  fill="currentColor"
                  stroke="none"
                  className={heroTextAnimationSvgStrokeDrawLineClasses}
                >
                  {line}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
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
  const { markActive, markRest, willChangeClass } = useMotionRest();
  const shouldStart =
    trigger === "in-view" ? isInView : trigger === "manual" ? active : true;
  const hiddenState = reducedMotion
    ? { opacity: 0 }
    : {
        filter: `blur(${blurFocusInitialBlur})`,
        opacity: 0,
        scale: blurFocusInitialScale,
        y: heroTextAnimationMotionTokens.distance.blurFocusY,
      };
  const visibleState = reducedMotion
    ? { opacity: 1 }
    : {
        filter: `blur(${blurFocusFinalBlur})`,
        opacity: 1,
        scale: 1,
        y: "0em",
      };
  const transition: Transition = reducedMotion
    ? { delay, duration: 0.18, ease: "linear" }
    : {
        delay,
        duration,
        ease: blurFocusFocusEase,
        // The defocus (blur/scale/y) racks in with the back-loaded ease so it
        // stays perceptible through the reveal; opacity resolves sooner so the
        // heading reads as a soft-focus word settling into clarity rather than
        // fading in from nothing.
        filter: { delay, duration, ease: blurFocusFocusEase },
        scale: { delay, duration, ease: blurFocusFocusEase },
        y: { delay, duration, ease: blurFocusFocusEase },
        opacity: {
          delay,
          duration: duration * 0.6,
          ease: heroTextAnimationMotionTokens.easing.soft,
        },
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
        willChangeClass,
      )}
      initial={shouldStart ? hiddenState : { opacity: 0 }}
      animate={shouldStart ? visibleState : { opacity: 0 }}
      transition={transition}
      onAnimationComplete={
        shouldStart && !reducedMotion
          ? () => {
              markRest();
              onAnimationComplete?.();
            }
          : undefined
      }
      onAnimationStart={
        shouldStart && !reducedMotion
          ? () => {
              markActive();
              onAnimationStart?.();
            }
          : undefined
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

function getBlurFocusSegmentVariants({
  duration,
  reducedMotion,
  splitBy,
}: {
  duration: number;
  reducedMotion: boolean;
  splitBy: HeroTextAnimationSplitBy;
}): Variants {
  if (reducedMotion) {
    return {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { duration: 0.18, ease: "linear" },
      },
    };
  }

  const distance =
    splitBy === "line"
      ? heroTextAnimationMotionTokens.distance.lineY
      : heroTextAnimationMotionTokens.distance.blurFocusY;

  return {
    hidden: {
      filter: `blur(${blurFocusInitialBlur})`,
      opacity: 0,
      scale: blurFocusInitialScale,
      y: distance,
    },
    visible: {
      filter: `blur(${blurFocusFinalBlur})`,
      opacity: 1,
      scale: 1,
      // Mirror the single-phrase reveal per segment: the defocus racks in with
      // the back-loaded ease while opacity resolves sooner, so each word settles
      // from soft focus into clarity as the stagger sweeps across the line.
      transition: {
        duration,
        ease: blurFocusFocusEase,
        opacity: {
          duration: duration * 0.6,
          ease: heroTextAnimationMotionTokens.easing.soft,
        },
      },
      y: "0em",
    },
  };
}

function renderStaticBlurFocusSegments({
  segments,
  splitBy,
}: {
  segments: HeroTextAnimationSegment[];
  splitBy: HeroTextAnimationSplitBy;
}) {
  return (
    <span
      aria-hidden="true"
      data-blur-final={blurFocusFinalBlur}
      data-blur-initial={blurFocusFinalBlur}
      data-focus-reveal="blur-focus"
      data-reduced-motion="true"
      data-slot="hero-text-animation-motion"
      data-split-by={splitBy}
      className={heroTextAnimationMotionClasses}
    >
      {renderStaticSegments({ segments, splitBy })}
    </span>
  );
}

function BlurFocusStaggeredSegments({
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
  const segmentVariants = getBlurFocusSegmentVariants({
    duration,
    reducedMotion,
    splitBy,
  });
  const { markActive, markRest, willChangeClass } = useMotionRest();
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
      data-blur-final={blurFocusFinalBlur}
      data-blur-initial={
        reducedMotion ? blurFocusFinalBlur : blurFocusInitialBlur
      }
      data-focus-reveal="blur-focus"
      data-reduced-motion={reducedMotion ? "true" : undefined}
      data-slot="hero-text-animation-motion"
      data-split-by={splitBy}
      className={heroTextAnimationMotionClasses}
      variants={containerVariants}
      initial="hidden"
      onAnimationComplete={() => {
        markRest();
        onAnimationComplete?.();
      }}
      onAnimationStart={() => {
        markActive();
        onAnimationStart?.();
      }}
      {...triggerProps}
    >
      {splitBy === "line"
        ? segments.map((segment, index) => (
            <motionElement.span
              key={`${index}-${segment.text}`}
              data-slot="hero-text-animation-segment"
              data-reduced-motion={reducedMotion ? "true" : undefined}
              data-segment="line"
              className={cn(
                heroTextAnimationBlurFocusLineClasses,
                willChangeClass,
              )}
              variants={segmentVariants}
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
                className={cn(
                  heroTextAnimationBlurFocusWordClasses,
                  willChangeClass,
                )}
                variants={segmentVariants}
              >
                {segment.text}
              </motionElement.span>
            );
          })}
    </motionElement.span>
  );
}

function renderStaticScrollResponsive(text: string) {
  return (
    <span
      aria-hidden="true"
      data-reduced-motion="true"
      data-scroll-anchor={scrollResponsiveAnchor}
      data-scroll-opacity-min={scrollResponsiveMinimumOpacity}
      data-scroll-progress="0.000"
      data-scroll-range-px={scrollResponsiveRangePx}
      data-scroll-responsive="subtle"
      data-scroll-y-max="0"
      data-scroll-y-min={heroTextAnimationMotionTokens.distance.scrollY}
      data-slot="hero-text-animation-motion"
      data-split-by="phrase"
      className={cn(
        heroTextAnimationMotionClasses,
        heroTextAnimationScrollResponsiveClasses,
      )}
    >
      {text}
    </span>
  );
}

function ScrollResponsiveSegments({
  reducedMotion,
  text,
}: {
  reducedMotion: boolean;
  text: string;
}) {
  const motionRef = useRef<HTMLSpanElement>(null);
  const y = useMotionValue(0);
  const opacity = useMotionValue(1);

  useEffect(() => {
    const element = motionRef.current;

    y.set(0);
    opacity.set(1);
    element?.setAttribute("data-scroll-progress", "0.000");
    element?.setAttribute("data-scroll-y", "0.000");
    element?.setAttribute("data-scroll-opacity", "1.000");

    if (reducedMotion || typeof window === "undefined") {
      return;
    }

    let frameId: number | undefined;

    const update = () => {
      frameId = undefined;

      if (!element) {
        return;
      }

      // Progress is anchored to the hero's own top: 0 while the hero top is at
      // or below the viewport top, rising to 1 over the next `range` px of
      // scroll. Uses the live element position, so it is correct wherever the
      // hero is placed on the page.
      const rect = element.getBoundingClientRect();
      const progress = Math.min(
        1,
        Math.max(0, -rect.top / scrollResponsiveRangePx),
      );
      const nextY = heroTextAnimationMotionTokens.distance.scrollY * progress;
      const nextOpacity = 1 - (1 - scrollResponsiveMinimumOpacity) * progress;

      y.set(nextY);
      opacity.set(nextOpacity);
      element.setAttribute("data-scroll-progress", progress.toFixed(3));
      element.setAttribute("data-scroll-y", nextY.toFixed(3));
      element.setAttribute("data-scroll-opacity", nextOpacity.toFixed(3));
    };

    const scheduleUpdate = () => {
      if (frameId !== undefined) {
        return;
      }

      frameId =
        window.requestAnimationFrame?.(update) ?? window.setTimeout(update, 16);
    };

    update();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate, { passive: true });

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);

      if (frameId !== undefined) {
        if (window.cancelAnimationFrame) {
          window.cancelAnimationFrame(frameId);
        } else {
          window.clearTimeout(frameId);
        }
      }
    };
  }, [opacity, reducedMotion, y]);

  return (
    <motionElement.span
      ref={motionRef}
      aria-hidden="true"
      data-reduced-motion={reducedMotion ? "true" : undefined}
      data-scroll-anchor={scrollResponsiveAnchor}
      data-scroll-opacity-min={scrollResponsiveMinimumOpacity}
      data-scroll-progress="0.000"
      data-scroll-range-px={scrollResponsiveRangePx}
      data-scroll-responsive="subtle"
      data-scroll-y-max="0"
      data-scroll-y-min={heroTextAnimationMotionTokens.distance.scrollY}
      data-slot="hero-text-animation-motion"
      data-split-by="phrase"
      className={cn(
        heroTextAnimationMotionClasses,
        heroTextAnimationScrollResponsiveClasses,
      )}
      style={reducedMotion ? undefined : { opacity, y }}
    >
      {text}
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
      duration,
      emphasisWordIndices,
      emphasisWords,
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
      splitBy,
      stagger,
      svgAccessibleTitle,
      // Deprecated and ignored; destructured only to keep it out of `...props`
      // so it never lands on the DOM node.
      svgPathData: _svgPathData,
      svgViewBox,
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
      (animation === "masked-curtain"
        ? heroTextAnimationMotionTokens.duration.maskedCurtain
        : animation === "rotating-keyword"
        ? heroTextAnimationMotionTokens.duration.rotatingKeyword
        : animation === "scramble-decrypt"
          ? heroTextAnimationMotionTokens.duration.scramble
          : animation === "gradient-highlight"
            ? heroTextAnimationMotionTokens.duration.gradientHighlight
            : animation === "blur-focus"
              ? heroTextAnimationMotionTokens.duration.blurFocus
              : animation === "kinetic-emphasis-pop"
                ? heroTextAnimationMotionTokens.duration.kineticEmphasisPop
                : animation === "svg-stroke-draw"
                  ? heroTextAnimationMotionTokens.duration.svgStrokeDraw
                  : animation === "scroll-responsive"
                    ? heroTextAnimationMotionTokens.duration.scrollResponsive
                    : animation === "typewriter"
                      ? heroTextAnimationMotionTokens.duration.typewriter
                      : heroTextAnimationMotionTokens.duration.base);
    const renderStatic =
      !hasHydrated ||
      (reducedMotion &&
        (reducedMotionStrategy === "static" ||
          animation === "svg-stroke-draw"));
    const canRepeat =
      hasHydrated &&
      repeat &&
      !reducedMotion &&
      animation !== "rotating-keyword" &&
      animation !== "scroll-responsive" &&
      (trigger !== "manual" || active) &&
      !renderStatic;
    const repeatDelayMs = Math.max(0, Math.round(repeatDelay * 1000));
    const repeatTimeoutRef = useRef<number | undefined>(undefined);
    const [repeatIteration, setRepeatIteration] = useState(0);
    const resolvedSplitBy =
      animation === "masked-curtain"
        ? "line"
        : animation === "kinetic-emphasis-pop"
          ? "word"
          : (splitBy ?? "word");
    // Blur-focus reveals the whole phrase at once by default. Passing an
    // explicit splitBy opts into a staggered word-by-word (or line-by-line)
    // focus-in; leaving it undefined keeps the original single-phrase behavior.
    const blurFocusSegmented =
      animation === "blur-focus" &&
      (splitBy === "word" || splitBy === "line");
    const resolvedStagger =
      stagger ??
      (resolvedSplitBy === "line"
        ? heroTextAnimationMotionTokens.stagger.line
        : heroTextAnimationMotionTokens.stagger.word);
    const segments = useMemo(
      () => splitHeroText(text, resolvedSplitBy),
      [resolvedSplitBy, text],
    );
    const kineticEmphasisIndices = useMemo(
      () =>
        resolveKineticEmphasisWordIndices({
          emphasisWordIndices,
          emphasisWords,
          segments,
        }),
      [emphasisWordIndices, emphasisWords, segments],
    );
    const rotatingKeywords = useMemo(
      () =>
        resolveRotatingKeywordOptions({
          rotatingKeywordOptions,
          text,
        }),
      [rotatingKeywordOptions, text],
    );
    const svgStrokeDrawLines = useMemo(
      () => splitSvgStrokeDrawLines(text),
      [text],
    );
    const svgViewBoxValid =
      svgViewBox !== undefined && isValidSvgViewBox(svgViewBox);
    const resolvedSvgViewBox = svgViewBoxValid ? svgViewBox.trim() : "";
    const exposesSvgAlternative =
      animation === "svg-stroke-draw" &&
      svgAccessibleTitle !== undefined &&
      svgAccessibleTitle.length > 0;
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
        : animation === "blur-focus"
          ? blurFocusSegmented
            ? segments.filter((segment) => segment.kind === "text").length
            : 1
          : animation === "gradient-highlight" ||
              animation === "scroll-responsive"
            ? 1
            : animation === "svg-stroke-draw"
              ? svgStrokeDrawLines.length
              : animation === "typewriter" || animation === "scramble-decrypt"
                ? splitTypewriterCharacters(text).length
                : segments.filter((segment) => segment.kind === "text").length;
    const visualSplitBy =
      animation === "rotating-keyword"
        ? "keyword"
        : animation === "blur-focus"
          ? blurFocusSegmented
            ? resolvedSplitBy
            : "phrase"
          : animation === "gradient-highlight" ||
              animation === "scroll-responsive"
            ? "phrase"
            : animation === "svg-stroke-draw"
              ? "line"
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
      kineticEmphasisIndices.join(","),
      svgStrokeDrawLines.join("|"),
      resolvedSvgViewBox,
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
      svgViewBox,
      text,
      trigger,
      kineticEmphasisIndices,
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
        "data-emphasis-count":
          animation === "kinetic-emphasis-pop"
            ? kineticEmphasisIndices.length
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
        aria-hidden={exposesSvgAlternative ? undefined : "true"}
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
        ) : renderStatic && animation === "typewriter" ? (
          renderStaticTypewriter(text)
        ) : renderStatic && animation === "scramble-decrypt" ? (
          renderStaticScramble(text)
        ) : renderStatic && animation === "gradient-highlight" ? (
          renderStaticGradientHighlight(text)
        ) : renderStatic && animation === "blur-focus" ? (
          blurFocusSegmented ? (
            renderStaticBlurFocusSegments({
              segments,
              splitBy: resolvedSplitBy,
            })
          ) : (
            renderStaticBlurFocus(text)
          )
        ) : renderStatic && animation === "scroll-responsive" ? (
          renderStaticScrollResponsive(text)
        ) : renderStatic && animation === "kinetic-emphasis-pop" ? (
          renderStaticKineticEmphasis({
            emphasisIndices: kineticEmphasisIndices,
            segments,
          })
        ) : renderStatic && animation === "svg-stroke-draw" ? (
          renderStaticSvgStrokeDraw({
            accessibleTitle: svgAccessibleTitle,
            lines: svgStrokeDrawLines,
            viewBox: resolvedSvgViewBox,
            viewBoxValid: svgViewBoxValid,
          })
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
          blurFocusSegmented ? (
            <BlurFocusStaggeredSegments
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
          ) : (
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
          )
        ) : animation === "svg-stroke-draw" ? (
          <SvgStrokeDrawSegments
            key={visualKey}
            accessibleTitle={svgAccessibleTitle}
            active={active}
            delay={delay}
            duration={resolvedDuration}
            lines={svgStrokeDrawLines}
            once={once}
            trigger={trigger}
            viewBox={resolvedSvgViewBox}
            viewBoxValid={svgViewBoxValid}
            onAnimationComplete={handleAnimationComplete}
            onAnimationStart={onAnimationStart}
          />
        ) : animation === "scroll-responsive" ? (
          <ScrollResponsiveSegments
            key={visualKey}
            reducedMotion={reducedMotion}
            text={text}
          />
        ) : animation === "kinetic-emphasis-pop" ? (
          <KineticEmphasisSegments
            key={visualKey}
            active={active}
            delay={delay}
            duration={resolvedDuration}
            emphasisIndices={kineticEmphasisIndices}
            once={once}
            reducedMotion={reducedMotion}
            segments={segments}
            stagger={resolvedStagger}
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
