# PRD: Landing-Page Background Components (Technical/Geometric Set)

## Problem Statement

Teams building landing pages, hero sections, and marketing surfaces with Dethink Components have no decorative background primitives. Every product landing page needs an ambient, animated backdrop that signals polish without distracting from hero content, and today each consumer hand-rolls one-off CSS or copies unvetted snippets from effect galleries. Those ad hoc backgrounds routinely break dark mode, ignore reduced-motion preferences, hydrate nondeterministically under SSR, and animate expensive properties that tank scrolling performance. The library's closest component, HeroTextAnimation, animates copy but offers nothing for the canvas behind it, and the catalog has no home for decorative components at all.

## Solution

Ship five production-grade, independently installable animated background components with a technical/geometric aesthetic suited to SaaS dashboards, developer tools, B2B, and AI-native products:

1. **GridBeamsBackground** — a subtle line grid with seeded light beams tracing along grid lines.
2. **DotMatrixBackground** — a dot grid with soft brightness ripples rolling through the field.
3. **LightStreaksBackground** — blurred diagonal light streaks sweeping across periodically.
4. **StarfieldBackground** — a multi-layer parallax starfield with twinkle, slow drift, and optional pointer parallax.
5. **ScanGridBackground** — a line grid with a scanning highlight band sweeping vertically or horizontally.

Each component wraps hero content, fills its container with an aria-hidden decorative layer, animates with Motion, and shares one prop contract: `animate`, `density`, `intensity`, `speed`, `tone`, and `seed`. All render deterministic SSR markup, fall back to attractive static compositions under reduced motion or `animate={false}`, use only semantic design tokens (dark/light aware), and stay within a strict transform/opacity animation budget. A new "Effects" category houses them (and HeroTextAnimation) in the catalog.

## User Stories

1. As a landing-page developer, I want to wrap my hero section in an animated background component, so that the page feels polished without me building animation infrastructure.
2. As a landing-page developer, I want each background to be installable on its own from the registry, so that I only copy the code and dependencies I actually use.
3. As a landing-page developer, I want a shared prop contract across all five backgrounds, so that I can swap one background for another without rewriting my hero section.
4. As a developer on a dev-tool product, I want a grid with tracing light beams, so that my hero conveys a technical, engineered aesthetic.
5. As a developer on an AI product, I want a pulsing dot-matrix field, so that my hero suggests activity and computation without literal imagery.
6. As a marketing engineer, I want periodic diagonal light streaks, so that a dark hero has depth and motion without patterned geometry.
7. As a marketing engineer, I want a parallax starfield, so that a launch page feels expansive and alive.
8. As a developer on a security/observability product, I want a scanning highlight band over a grid, so that the hero suggests continuous monitoring.
9. As a designer, I want density, intensity, tone, and speed props, so that I can tune each background to my brand's restraint level without editing animation code.
10. As a designer, I want the backgrounds to use semantic color tokens only, so that they follow my theme in light and dark mode automatically.
11. As a designer, I want an intensity tier that stays faint, so that body copy and CTAs remain fully readable over the background.
12. As a motion-sensitive user, I want the backgrounds to respect my reduced-motion preference, so that pages remain comfortable to view.
13. As a motion-sensitive user, I want the reduced-motion fallback to still look designed, so that I get an equivalent visual experience rather than a blank canvas.
14. As a developer, I want an `animate` prop I can set to false, so that I can disable motion contextually (e.g., inside screenshots, print, or low-power mode) regardless of OS settings.
15. As a screen-reader user, I want decorative layers hidden from the accessibility tree, so that backgrounds add no noise to page navigation.
16. As a keyboard user, I want backgrounds to be non-interactive and non-focusable, so that tabbing through the hero only visits real controls.
17. As a Next.js developer, I want server-rendered background markup to match the client exactly, so that hydration produces no warnings or visual flicker.
18. As a developer, I want a `seed` prop controlling all pseudo-random placement, so that layouts are reproducible across renders, snapshots, and environments.
19. As a performance-conscious developer, I want animations limited to transform and opacity on a handful of nodes, so that the background never degrades scroll or interaction performance.
20. As a performance-conscious developer, I want animations to pause when the background is offscreen, so that hidden heroes don't burn CPU/GPU.
21. As a Starfield user, I want optional pointer parallax, so that the hero responds subtly to the cursor when I want interactivity — and stays still when I don't.
22. As a ScanGrid user, I want a direction prop, so that the scan band can sweep vertically or horizontally to fit my layout.
23. As a component consumer, I want exported classNames helpers, so that I can reuse the background's styling contract in custom compositions.
24. As a component consumer, I want data attributes reflecting every variant prop, so that I can target states from my own CSS.
25. As a registry user, I want accurate registry metadata, so that installing a background pulls Motion, the shared utilities, and nothing else.
26. As a documentation reader, I want showcase pages with live examples and props tables for each background, so that I can evaluate and configure them quickly.
27. As a catalog browser, I want an Effects category in the showcase, so that decorative components are discoverable in one place.
28. As a Storybook user, I want stories covering variants and reduced motion, so that I can review every state visually and via the a11y addon.
29. As a library maintainer, I want deterministic tests across behavior, a11y, SSR, and motion seams, so that the backgrounds stay reliable as the library evolves.
30. As a library maintainer, I want the seeded random utility shared and tested once, so that determinism bugs can't drift between the five components.

## Implementation Decisions

- Five separate components, five registry items, each independently installable; no umbrella component or variant switch.
- A shared pure seeded-PRNG utility (mulberry32 with range/pick helpers) ships as a shared lib file in each registry item, mirroring how the class-merge helper is distributed. `Math.random` and `Date.now` are banned from these components.
- Common prop contract on every background: `animate?: boolean` (default true), `density?: "sparse" | "normal" | "dense"`, `intensity?: "faint" | "subtle" | "bold"`, `speed?: "slow" | "normal" | "fast"`, `tone?: "foreground" | "muted" | "primary"`, `seed?: number` (default 1), plus `children`. Starfield adds `interactive?: boolean` (default true); ScanGrid adds `direction?: "vertical" | "horizontal"` (default vertical).
- Shared anatomy: a relative, isolated, overflow-hidden root that forwards its ref; an absolutely positioned aria-hidden pointer-events-none decorative layer; a relatively positioned content slot above it. Anatomy is duplicated per component (no shared JSX shell) to preserve registry portability and per-component variance.
- Each component exports three pure seams: a classNames recipe helper, a motion-config factory keyed on speed and reduced motion, and a geometry factory keyed on seed and density.
- Motion (the `motion/react` package) drives all animation: looping transform/opacity keyframes for beams, ripples, streaks, drift, twinkle, and the scan band; motion values with springs for Starfield pointer parallax; MotionConfig propagates reduced-motion state.
- Reduced-motion resolution: `animate={false}` or the user's OS preference produces a static composition — looping animations are not mounted at all, and each background renders a designed static frame (frozen beams, a static highlight, a static streak, still stars, a frozen band).
- Rendering technique favors minimal DOM: pattern layers are single divs with token-colored CSS gradients referencing `currentColor`; Starfield uses three SVG layers of seeded circles rather than per-star elements; animated nodes are capped at roughly eight per background (plus a bounded set of twinkling circles).
- Color comes exclusively from existing semantic tokens via literal tone-and-intensity class maps; gradients reference `currentColor` so dark/light adaptation is free. No new tokens, no hard-coded colors, no runtime-composed class names.
- Animations pause offscreen via an in-view check that fails open where IntersectionObserver is unavailable.
- Server markup equals the static resting frame: initial keyframe values match the resting state and nothing visible at rest renders at zero opacity.
- A new "effects" category is added to the showcase catalog taxonomy and the component inventory; HeroTextAnimation moves from "general" into it.
- Each component ships with registry metadata (Motion as the only npm dependency, base registry item as the only registry dependency), showcase page with live examples and props table, a Storybook story set, playground smoke imports, package exports, and a minor changeset.

## Testing Decisions

- Tests target public behavior at the highest existing seams: rendered markup and data attributes, jsdom rendering, string-level SSR output, and the exported pure factories — never Motion internals or animation timing.
- Behavior tests assert children render in the content slot, className merges last, every variant prop reflects into data attributes, disabling animation sets the reduced-motion attribute, ref forwarding works, and identical seeds produce identical markup while different seeds differ.
- Accessibility tests run axe on a realistic hero composition and assert the decorative layer is aria-hidden and free of focusable elements while children stay reachable by role.
- SSR tests assert deterministic double-render string equality, the presence of the anatomy slots and aria-hidden marker, no zero-opacity styles on rest-visible elements, and warning-free hydration — following the established SSR test contract used by HeroTextAnimation.
- Motion tests exercise the pure factories: speed tiers order durations correctly with infinite repeat, reduced motion yields disabled configs, and geometry output is deterministic, in bounds, and density-correct; Starfield additionally asserts per-layer parallax depths.
- The seeded-random utility gets its own unit tests for sequence stability and range bounds.
- Storybook stories cover the hero composition, each variant axis, and a reduced-motion story, with interaction tests asserting the aria-hidden layer and reachable children; the a11y addon must be clean.
- Prior art: the drawer and slot-planner motion test files, the HeroTextAnimation SSR test, and the existing per-component behavior/a11y test flavors.

## Out of Scope

- Ambient/organic backgrounds (aurora, gradient mesh, waves, noise) — a possible future set under the same contract.
- Canvas- or WebGL-based rendering; all five ship as DOM/SVG + Motion.
- Cursor-following spotlight effects beyond Starfield's subtle pointer parallax.
- New design tokens or theme changes; the set uses existing semantic tokens only.
- A shared background-shell React component in the registry.
- npm package distribution changes beyond the standard export additions.
- Marketing recipe pages composing the backgrounds (can follow as a separate recipes task).

## Further Notes

- The showcase catalog e2e assertions include a hard-coded component count that must be bumped as catalog entries are added.
- The registry validator rejects component-level cssVars; these items inherit all tokens from the base registry item.
- Element budgets and the transform/opacity-only rule are acceptance criteria, not aspirations: reviewers should reject additions that animate filters, background-position, or box-shadow, or that mount unbounded per-element animations.
