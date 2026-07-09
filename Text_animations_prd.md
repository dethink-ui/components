PRD: Production-Grade Hero Text Animation System

Product: Landing page hero text animation library
Framework: React + TypeScript + motion/react
Date: July 8, 2026
Status: Ready for implementation

1. Summary

Build a reusable hero text animation system for landing pages. It should support 10 production-grade animation styles, work with motion/react, be accessible by default, respect reduced-motion preferences, preserve SEO-readable text, and avoid distracting or unsafe motion.

Motion for React is the current Motion library for React, previously known as Framer Motion, and supports declarative React animation, variants, gestures, layout, scroll animation, and production-oriented animation primitives. Motion’s docs also provide MotionConfig, useReducedMotion, AnimatePresence, scroll hooks, and LazyMotion, which are directly relevant to this PRD.  

⸻

2. Goals

The animation system must:

1. Provide a polished, modern hero text experience without making the page feel gimmicky.
2. Support 10 curated animation styles that cover common production landing-page needs.
3. Use real semantic HTML text, not canvas-only or image-only text.
4. Respect prefers-reduced-motion and provide reduced-motion fallbacks.
5. Avoid infinite or distracting animations by default.
6. Maintain strong performance by preferring transform and opacity for most motion.
7. Support SSR/Next.js usage without harming SEO or no-JavaScript readability.
8. Be configurable enough for marketing, SaaS, AI, fintech, agency, and consumer landing pages.

Web performance guidance recommends using transform and opacity where possible and avoiding layout/paint-heavy properties unless necessary.  

⸻

3. Non-goals

This system will not:

1. Animate body copy, legal text, pricing tables, or long-form text.
2. Use animations that are essential to understanding the message.
3. Use endless blinking, flashing, or looping by default.
4. Replace accessible text with images, SVG-only text, canvas, or decorative DOM fragments.
5. Require Motion+ paid components; typewriter and scramble effects should be implemented internally.

⸻

4. Target users

Primary users: front-end engineers implementing landing pages.
Secondary users: designers choosing motion styles for brand expression.
End users: visitors viewing landing pages across desktop, mobile, keyboard navigation, screen readers, reduced-motion settings, and low-power devices.

⸻

5. Core accessibility principles

The hero text animation must be readable and understandable with or without animation.

The implementation must support prefers-reduced-motion. MDN defines prefers-reduced-motion as a media feature that detects whether a user has asked the device to minimize non-essential motion. Motion for React supports both MotionConfig reducedMotion="user" and useReducedMotion() for adapting animations.  

Animations that move, blink, scroll, or auto-update for more than five seconds need a mechanism to pause, stop, or hide them under WCAG 2.2.2.  

The system must avoid flashing more than three times in any one-second period, following WCAG 2.3.1.  

Text must maintain a minimum contrast ratio of 4.5:1 for normal text and 3:1 for large text, including during animated gradient, shimmer, or masked states.  

⸻

6. Recommended top 10 animation styles

Overview table

#	Animation style	Best for	Default behavior	Reduced-motion fallback
1	Staggered word / line reveal	Most SaaS and B2B landing pages	Words or lines fade and rise in sequence	Static text or opacity-only fade
2	Masked curtain reveal	Premium, editorial, agency, fintech	Lines slide up inside an overflow-hidden mask	Instant text or opacity-only fade
3	Typewriter reveal	Developer tools, AI, productivity	Text appears progressively once	Full static text from first render
4	Scramble / decrypt text	AI, cybersecurity, technical products	Characters resolve into final text	Static final text
5	Rotating keyword slot	Multi-segment positioning	One word swaps through 2–5 options	Static primary word or full phrase
6	Gradient highlight sweep	Brand-forward hero headlines	One subtle sweep across key phrase	Static gradient or solid accessible color
7	Blur-to-focus reveal	Premium, cinematic, product launches	Text fades from soft blur to sharp	Opacity-only fade or static
8	Kinetic emphasis pop	Highlighting one value prop	One key word gently scales/springs once	Static emphasis style
9	Scroll-responsive hero text	Long-form storytelling pages	Text subtly transforms with scroll	Disabled parallax; static text
10	SVG stroke draw / outline-to-fill	Logos, product names, hero keywords	Decorative outline draws then fills	Final filled state immediately

⸻

7. Component architecture

7.1 Package structure

/components/hero-text-animation/
  HeroTextAnimation.tsx
  HeroTextAnimation.types.ts
  animations/
    staggerWords.ts
    maskedLines.ts
    typewriter.ts
    scramble.ts
    rotatingKeyword.ts
    gradientSweep.ts
    blurFocus.ts
    kineticEmphasis.ts
    scrollResponsive.ts
    svgStrokeDraw.ts
  utils/
    splitText.ts
    reducedMotion.ts
    timing.ts
    accessibility.ts
  styles/
    heroTextAnimation.css

7.2 Public component API

export type HeroTextAnimationKind =
  | "stagger-words"
  | "masked-lines"
  | "typewriter"
  | "scramble"
  | "rotating-keyword"
  | "gradient-sweep"
  | "blur-focus"
  | "kinetic-emphasis"
  | "scroll-responsive"
  | "svg-stroke-draw";
export interface HeroTextAnimationProps {
  as?: "h1" | "h2" | "p" | "span";
  text: string;
  animation: HeroTextAnimationKind;
  /**
   * Accessible label. Defaults to `text`.
   * Required when visual text is split, scrambled, rotated, or SVG-rendered.
   */
  ariaLabel?: string;
  className?: string;
  /**
   * Trigger behavior.
   * mount: runs once on load.
   * in-view: runs when hero enters viewport.
   * manual: controlled externally.
   */
  trigger?: "mount" | "in-view" | "manual";
  /**
   * Animation should run only once by default.
   */
  once?: boolean;
  delay?: number;
  duration?: number;
  stagger?: number;
  /**
   * Used by rotating keyword animation.
   */
  rotatingWords?: string[];
  rotatingWordIndex?: number;
  autoRotate?: boolean;
  autoRotateIntervalMs?: number;
  maxAutoRotations?: number;
  /**
   * Used by kinetic emphasis.
   */
  emphasisWords?: string[];
  /**
   * Used by SVG stroke draw.
   */
  svgPathData?: string;
  /**
   * Reduced motion strategy.
   */
  reducedMotionStrategy?: "static" | "opacity-only";
  /**
   * Optional event hooks.
   */
  onAnimationStart?: () => void;
  onAnimationComplete?: () => void;
}

7.3 Required wrapper

import { MotionConfig, LazyMotion, domAnimation } from "motion/react";
import * as m from "motion/react-m";
export function AppMotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation}>{children}</LazyMotion>
    </MotionConfig>
  );
}

MotionConfig reducedMotion="user" should be the default because Motion can automatically respect the user’s reduced-motion setting; when reduced motion is active, Motion disables transform and layout animations while preserving non-transform animations such as opacity or background color.  

LazyMotion should be used for landing pages where bundle size matters. Motion’s docs state that the standard motion component comes with a larger pre-bundled feature set, while LazyMotion with m can reduce the initial animation feature payload.  

⸻

8. Accessibility implementation model

8.1 Semantic text rule

For split, scramble, rotating, SVG, or character-based animations, the visible animated fragments should be aria-hidden="true" and a single accessible text string should be available to assistive technology.

Recommended structure:

<h1 className="hero-heading">
  <span className="sr-only">
    Build faster landing pages with production-ready motion.
  </span>
  <span aria-hidden="true">
    {/* animated visual fragments */}
  </span>
</h1>

Required .sr-only utility:

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

8.2 Reduced-motion behavior

Every animation must support:

import { useReducedMotion } from "motion/react";
const shouldReduceMotion = useReducedMotion();

Use this to disable custom state-based animations, timers, typewriter effects, scramble effects, scroll parallax, loops, and keyframe sequences that MotionConfig cannot fully control by itself. Motion’s useReducedMotion returns whether the current device has reduced motion enabled and is intended for replacing transform-heavy motion with gentler alternatives such as opacity or static rendering.  

8.3 Animation duration limits

Default hero text animations should complete within 300–1200ms.

Auto-rotating or looping animations must follow one of these rules:

1. Do not auto-loop by default.
2. Stop automatically within five seconds.
3. Provide a visible pause/stop control if continuing beyond five seconds.

This is required because WCAG 2.2.2 addresses moving, blinking, scrolling, or auto-updating content that starts automatically and persists long enough to distract or interfere with reading.  

8.4 Flashing and shimmer safety

The system must not include rapid flicker, hard black-white flashing, high-contrast strobing, or red flashing. No animation may flash more than three times in a one-second period.  

8.5 Contrast

All headline text states must pass contrast checks:

Normal text: 4.5:1 minimum
Large text: 3:1 minimum

This includes gradient text, shimmer overlays, dimmed initial states, outline text, and final filled states.  

⸻

9. Detailed animation requirements

9.1 Staggered word / line reveal

Description:
Words or lines enter sequentially using opacity and vertical translation. This is the safest default animation for production hero sections.

Use cases:

* SaaS homepage
* B2B landing page
* Product launch page
* Conversion-focused hero section

Motion behavior:

const container = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.045,
      delayChildren: 0.05,
    },
  },
};
const word = {
  hidden: {
    opacity: 0,
    y: "0.6em",
  },
  visible: {
    opacity: 1,
    y: "0em",
    transition: {
      duration: 0.48,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

Timing:

Duration per word: 420–520ms
Stagger: 35–60ms
Total animation target: under 1000ms

Accessibility:

* Visual word spans must be aria-hidden.
* Full heading must exist once as readable text.
* Reduced motion: no y transform; use static text or opacity-only fade.
* Do not delay critical heading readability by more than one second.

Acceptance criteria:

* Text is readable without waiting for the animation.
* No layout shift occurs while words animate.
* Animation runs once by default.

⸻

9.2 Masked curtain reveal

Description:
Each line is clipped by an overflow-hidden wrapper. The line moves from below the mask into its final position.

Use cases:

* Premium SaaS
* Fintech
* Design agency
* Editorial landing pages

Motion behavior:

<span className="line-mask" aria-hidden="true">
  <m.span
    initial={shouldReduceMotion ? false : { y: "100%", opacity: 0 }}
    animate={{ y: "0%", opacity: 1 }}
    transition={{
      duration: 0.64,
      ease: [0.22, 1, 0.36, 1],
    }}
  >
    {line}
  </m.span>
</span>
.line-mask {
  display: block;
  overflow: hidden;
}

Timing:

Line duration: 560–720ms
Line stagger: 80–140ms

Accessibility:

* Avoid clipping actual accessible text. Use an sr-only heading plus visual duplicate.
* Reduced motion: render final text immediately or fade in opacity only.
* Make sure line height does not crop descenders such as g, j, p, q, y.

Acceptance criteria:

* No text is visually cut off in final state.
* Works across responsive line breaks.
* Reduced-motion mode has no vertical slide.

⸻

9.3 Typewriter reveal

Description:
Characters appear progressively, creating a writing effect. This should be used sparingly because slow typewriter effects can delay comprehension.

Use cases:

* Developer tools
* AI assistants
* Productivity apps
* Command-line-inspired brands

Default behavior:

* Run once.
* Reveal final text within 900–1400ms.
* Caret stops blinking after completion.
* No deleting/retyping loop by default.

Implementation logic:

const TYPE_INTERVAL_MS = 28;
const MAX_TYPE_DURATION_MS = 1400;
function TypewriterText({ text }: { text: string }) {
  const shouldReduceMotion = useReducedMotion();
  const [visibleLength, setVisibleLength] = React.useState(
    shouldReduceMotion ? text.length : 0
  );
  React.useEffect(() => {
    if (shouldReduceMotion) {
      setVisibleLength(text.length);
      return;
    }
    const totalChars = text.length;
    const interval = Math.min(
      TYPE_INTERVAL_MS,
      Math.floor(MAX_TYPE_DURATION_MS / Math.max(totalChars, 1))
    );
    let index = 0;
    const id = window.setInterval(() => {
      index += 1;
      setVisibleLength(index);
      if (index >= totalChars) {
        window.clearInterval(id);
      }
    }, interval);
    return () => window.clearInterval(id);
  }, [text, shouldReduceMotion]);
  return (
    <span>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {text.slice(0, visibleLength)}
        <span className="caret" />
      </span>
    </span>
  );
}

Accessibility:

* Screen readers must receive the full final text immediately.
* Animated text must be aria-hidden.
* Do not use aria-live for the character-by-character reveal.
* Caret blink must stop after completion.
* Reduced motion: show full text immediately.
* If the caret blinks, it must not blink indefinitely.

Acceptance criteria:

* Full text is available to assistive technology from initial render.
* Visual typing completes quickly.
* No infinite typing/deleting loop.

⸻

9.4 Scramble / decrypt text

Description:
Characters briefly cycle through placeholder glyphs before resolving to the final text.

Use cases:

* AI products
* Security products
* Data tools
* Developer infrastructure

Default behavior:

Total duration: 500–900ms
Scramble character set: A–Z, 0–9, neutral symbols
Max random updates: 12–20 frames
Looping: disabled

Implementation detail:

const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

Each character should resolve progressively from left to right or by weighted random order.

Accessibility:

* Animated scramble layer must be aria-hidden.
* Full final headline must be exposed as static text.
* Reduced motion: skip scramble.
* Do not use rapidly flashing color changes.
* Do not scramble words that are essential for legal, medical, pricing, or compliance meaning.

Acceptance criteria:

* The final text is always deterministic.
* Animation cannot run indefinitely.
* Reduced-motion mode renders final text.

⸻

9.5 Rotating keyword slot

Description:
A single word or phrase in the hero headline changes to show multiple audiences, outcomes, or product use cases.

Example:

Launch pages for startups.
Launch pages for agencies.
Launch pages for product teams.

Use cases:

* Multi-audience SaaS
* Agency service pages
* AI tools with multiple use cases
* Product-led growth landing pages

Motion behavior:

Use AnimatePresence for enter/exit transitions when the keyword changes. Motion’s AnimatePresence supports exit animations when keyed children are removed from the React tree.  

<AnimatePresence mode="wait">
  <m.span
    key={activeWord}
    initial={shouldReduceMotion ? false : { y: "0.5em", opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    exit={shouldReduceMotion ? undefined : { y: "-0.5em", opacity: 0 }}
    transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    aria-hidden="true"
  >
    {activeWord}
  </m.span>
</AnimatePresence>

Default behavior:

Auto-rotate: false by default
If enabled:
  interval: 1800–2400ms
  max rotations: 2 cycles
  must stop within 5 seconds unless pause control exists

Accessibility:

* Do not announce every word change to screen readers.
* Provide a static accessible label, for example: “Launch pages for startups, agencies, and product teams.”
* Reserve width for the longest word to prevent layout shift.
* Reduced motion: show the primary word or full static phrase.
* If auto-rotation lasts longer than five seconds, include pause/stop control.

Acceptance criteria:

* No layout shift when words change.
* Screen reader reads a stable sentence.
* Auto-loop is disabled unless explicitly configured.

⸻

9.6 Gradient highlight sweep

Description:
A subtle light sweep or gradient movement passes over a highlighted phrase.

Use cases:

* AI landing pages
* Premium product launches
* Consumer apps
* Brand-heavy hero sections

Recommended CSS/Motion approach:

<m.span
  className="gradient-text"
  initial={shouldReduceMotion ? false : { backgroundPositionX: "100%" }}
  animate={{ backgroundPositionX: "0%" }}
  transition={{ duration: 1.1, ease: "easeOut" }}
>
  {text}
</m.span>
.gradient-text {
  background-image: linear-gradient(
    90deg,
    var(--hero-text),
    var(--hero-highlight),
    var(--hero-text)
  );
  background-size: 200% 100%;
  background-clip: text;
  color: transparent;
}

Accessibility:

* Final and animated gradient states must pass contrast requirements.
* The gradient must not be the only indicator of meaning.
* Avoid high-speed shimmer.
* Avoid infinite shimmer by default.
* Reduced motion: static gradient or solid text color.

Acceptance criteria:

* No shimmer loops by default.
* Text contrast passes in all visible states.
* Animation completes once within 1200ms.

⸻

9.7 Blur-to-focus reveal

Description:
Text appears from soft blur into crisp focus. This creates a cinematic reveal but should be used conservatively because filter: blur() can be more expensive than transform/opacity.

Use cases:

* Product launches
* Luxury/premium landing pages
* Visual storytelling pages
* Brand campaigns

Motion behavior:

const blurFocus = {
  hidden: {
    opacity: 0,
    filter: "blur(10px)",
    y: "0.25em",
  },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    y: "0em",
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

Accessibility:

* Use only for short headings.
* Keep total blur duration under 800ms.
* Do not leave text blurred while users need to read it.
* Reduced motion: no blur, no y transform; static or opacity-only fade.
* Avoid combining blur with scale, parallax, and rotation in the same heading.

Acceptance criteria:

* Text reaches crisp final state quickly.
* No blur animation in reduced-motion mode.
* Performance is tested on low-end mobile.

⸻

9.8 Kinetic emphasis pop

Description:
One or two important words receive a small scale, opacity, or spring emphasis after the main headline appears.

Example:

Ship beautiful pages faster.

The word “faster” gets a subtle pop.

Use cases:

* Conversion-focused hero copy
* Feature/value emphasis
* SaaS positioning
* Product marketing pages

Motion behavior:

<m.span
  initial={shouldReduceMotion ? false : { scale: 0.96, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{
    type: "spring",
    stiffness: 420,
    damping: 28,
    delay: 0.35,
  }}
>
  faster
</m.span>

Accessibility:

* Do not rely on animation alone to communicate emphasis.
* Also use font weight, color, underline, or semantic copy.
* Reduced motion: no scale; static emphasized style.
* No pulsing loop by default.

Acceptance criteria:

* Scale delta stays subtle: 0.96–1.04.
* No repeated pulsing.
* Does not move surrounding layout.

⸻

9.9 Scroll-responsive hero text

Description:
Hero text subtly responds to the first scroll interaction, such as fading out, moving slightly upward, or separating layers.

Use cases:

* Storytelling landing pages
* Interactive product narratives
* Launch pages with strong visual direction
* Long-scroll marketing pages

Motion behavior:

Use Motion’s scroll hooks. useScroll creates scroll-linked values such as scrollYProgress, which can be transformed into opacity, y, scale, or other motion values.  

const { scrollYProgress } = useScroll({
  target: heroRef,
  offset: ["start start", "end start"],
});
const opacity = useTransform(scrollYProgress, [0, 0.45], [1, 0]);
const y = useTransform(scrollYProgress, [0, 0.45], [0, -32]);
<m.h1 style={shouldReduceMotion ? undefined : { opacity, y }}>
  {text}
</m.h1>;

Accessibility:

* Disable parallax and scroll-linked transforms in reduced-motion mode.
* Do not make the heading unreadable before users can perceive it.
* Do not trap keyboard users in scroll-driven sequences.
* Avoid large-scale zoom, horizontal panning, or depth movement.
* Keep the final heading available in the DOM.

Acceptance criteria:

* Reduced motion disables scroll transform.
* Keyboard-only users can continue past hero normally.
* No required information appears only during a scroll animation.

⸻

9.10 SVG stroke draw / outline-to-fill

Description:
A decorative wordmark or key product name appears as an outline stroke, then fills.

Use cases:

* Brand wordmark
* Product name reveal
* Campaign tagline
* Design-forward hero sections

Motion behavior:

<m.path
  d={svgPathData}
  initial={shouldReduceMotion ? false : { pathLength: 0, opacity: 0 }}
  animate={{ pathLength: 1, opacity: 1 }}
  transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
/>

Accessibility:

* SVG text/path must be decorative unless it has a complete accessible alternative.
* Provide real HTML text elsewhere in the heading.
* Do not use SVG-only text for the main message.
* Reduced motion: show final filled state.
* Ensure stroke and fill contrast passes.

Acceptance criteria:

* Real text exists in HTML.
* SVG is aria-hidden="true" unless explicitly labeled.
* Final state renders immediately in reduced-motion mode.

⸻

10. Global animation tokens

export const heroMotionTokens = {
  easing: {
    standard: [0.22, 1, 0.36, 1],
    soft: [0.16, 1, 0.3, 1],
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
    lineY: "100%",
    scrollY: -32,
  },
  spring: {
    emphasis: {
      type: "spring",
      stiffness: 420,
      damping: 28,
    },
  },
} as const;

⸻

11. Functional requirements

FR-1: Animation selection

The component must accept an animation prop and render the chosen animation.

<HeroTextAnimation
  as="h1"
  text="Build production-ready landing pages faster."
  animation="stagger-words"
/>

FR-2: Semantic heading

The component must support rendering as h1, h2, p, or span.

Default:

as="h1"

FR-3: Reduced motion

The component must respect both:

<MotionConfig reducedMotion="user" />

and:

const shouldReduceMotion = useReducedMotion();

This is necessary because MotionConfig can handle many Motion transform/layout animations, but custom timers such as typewriter, scramble, and rotating keyword logic also need explicit reduced-motion handling.

FR-4: SSR and no-JS safety

The final text must exist in server-rendered HTML.

Implementation must avoid relying on client-only animation to make the text readable. Do not render the only visible text permanently at opacity: 0 before hydration.

FR-5: Layout stability

The component must reserve enough width/height before animation starts.

Examples:

* For rotating keywords, reserve the width of the longest word.
* For masked lines, preserve final line height.
* For split words, avoid changing font weight, letter spacing, or line height during motion.

FR-6: One-shot default

All animations must run once by default.

Looping requires explicit configuration:

autoRotate
maxAutoRotations={2}

FR-7: Pause control for long-running animation

If an animation auto-runs for more than five seconds, expose a pause/stop control.

<button type="button" aria-pressed={isPaused} onClick={togglePaused}>
  {isPaused ? "Resume animation" : "Pause animation"}
</button>

FR-8: Testing hooks

The component should expose stable test IDs.

data-testid="hero-text-animation"
data-animation="stagger-words"
data-reduced-motion={shouldReduceMotion}

⸻

12. Non-functional requirements

Performance

1. Prefer opacity and transform.
2. Avoid animating top, left, width, height, margin, or letter-spacing.
3. Use filter, clip-path, background-position, and SVG path animation sparingly.
4. Cap split fragments:
    * Words: max 24 recommended.
    * Characters: max 80 recommended.
    * Lines: max 4 recommended.
5. Use LazyMotion for landing pages.
6. Do not trigger React state updates every frame except in controlled text effects.
7. Use requestAnimationFrame or Motion values for frame-based visual updates.

Performance guidance from web.dev recommends restricting high-performance animations to transform and opacity where possible and avoiding properties that trigger layout or paint.  

Responsiveness

The system must support:

Mobile: 320px+
Tablet: 768px+
Desktop: 1024px+
Large desktop: 1440px+

Browser support

Support modern evergreen browsers that support React and Motion. prefers-reduced-motion is widely available across modern browsers according to MDN.  

⸻

13. Recommended implementation blueprint

import * as React from "react";
import { useReducedMotion } from "motion/react";
import * as m from "motion/react-m";
type HeroTextAnimationKind =
  | "stagger-words"
  | "masked-lines"
  | "typewriter"
  | "scramble"
  | "rotating-keyword"
  | "gradient-sweep"
  | "blur-focus"
  | "kinetic-emphasis"
  | "scroll-responsive"
  | "svg-stroke-draw";
interface HeroTextAnimationProps {
  as?: "h1" | "h2" | "p" | "span";
  text: string;
  animation: HeroTextAnimationKind;
  ariaLabel?: string;
  className?: string;
  delay?: number;
  duration?: number;
  stagger?: number;
}
export function HeroTextAnimation({
  as = "h1",
  text,
  animation,
  ariaLabel = text,
  className,
  delay = 0,
  duration = 0.48,
  stagger = 0.045,
}: HeroTextAnimationProps) {
  const shouldReduceMotion = useReducedMotion();
  const Tag = as;
  return (
    <Tag className={className} data-animation={animation}>
      <span className="sr-only">{ariaLabel}</span>
      <span aria-hidden="true">
        {animation === "stagger-words" && (
          <StaggerWords
            text={text}
            shouldReduceMotion={shouldReduceMotion}
            delay={delay}
            duration={duration}
            stagger={stagger}
          />
        )}
        {/* Other animation renderers go here */}
      </span>
    </Tag>
  );
}

Example stagger renderer:

function StaggerWords({
  text,
  shouldReduceMotion,
  delay,
  duration,
  stagger,
}: {
  text: string;
  shouldReduceMotion: boolean | null;
  delay: number;
  duration: number;
  stagger: number;
}) {
  const words = text.split(" ");
  if (shouldReduceMotion) {
    return <>{text}</>;
  }
  return (
    <m.span
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            delayChildren: delay,
            staggerChildren: stagger,
          },
        },
      }}
    >
      {words.map((word, index) => (
        <m.span
          key={`${word}-${index}`}
          className="hero-word"
          variants={{
            hidden: {
              opacity: 0,
              y: "0.6em",
            },
            visible: {
              opacity: 1,
              y: "0em",
              transition: {
                duration,
                ease: [0.22, 1, 0.36, 1],
              },
            },
          }}
        >
          {word}
          {index < words.length - 1 ? "\u00A0" : null}
        </m.span>
      ))}
    </m.span>
  );
}

⸻

14. QA checklist

Accessibility QA

Test	Requirement
Screen reader heading test	Heading is announced once, in the correct order
Reduced motion test	All transform/parallax/typewriter/scramble effects are disabled or simplified
Keyboard test	No animation blocks tab navigation
Pause/stop test	Any animation lasting more than five seconds can be paused/stopped
Contrast test	Text passes contrast in initial, animated, and final states
Flash test	No flashing more than three times per second
Zoom test	Text works at 200% browser zoom
No-JS / SSR test	Final text exists in server-rendered HTML

Performance QA

Test	Requirement
Lighthouse	No major performance regression from animation bundle
Mobile throttling	Animations remain smooth on mid/low-end mobile
Layout shift	CLS is not introduced by text animation
DevTools rendering	Avoid layout-triggering properties
Bundle analysis	Use LazyMotion where possible

Visual QA

Test	Requirement
Mobile line breaks	Masked/staggered lines do not crop text
Long words	Rotating keyword slot reserves enough width
Font loading	No jarring animation restart after webfont loads
Dark/light themes	Contrast passes in both
RTL/localized text	Text splitting does not break localization

⸻

15. Acceptance criteria

The feature is complete when:

1. All 10 animation styles are implemented as selectable variants.
2. Each style has a reduced-motion fallback.
3. Screen readers read the hero heading once and correctly.
4. No animation loops indefinitely by default.
5. Any animation longer than five seconds has pause/stop support.
6. Text contrast passes WCAG AA.
7. No flashing animation exceeds three flashes per second.
8. The component supports SSR and does not hide the only readable text before hydration.
9. The default animation uses performant transform and opacity.
10. The package includes documentation and examples for each animation style.

⸻

16. Recommended default style

Use Staggered word / line reveal as the default production animation.

It is the best default because it is readable, elegant, brand-neutral, easy to implement with Motion variants, and easy to reduce to opacity-only or static text. Use more expressive styles like scramble, typewriter, gradient sweep, and SVG stroke draw only when they match the brand and do not slow comprehension.

Final default:

<HeroTextAnimation
  as="h1"
  text="Build production-ready landing pages faster."
  animation="stagger-words"
  reducedMotionStrategy="opacity-only"
/>