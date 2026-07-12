# Spec: Landing-Page Background Components (Technical/Geometric Set)

Five independently installable, Motion-animated background components:

| Component | Slug | Signature effect |
|---|---|---|
| GridBeamsBackground | `grid-beams-background` | Line grid + seeded light beams tracing grid lines |
| MagneticBeamsBackground | `magnetic-beams-background` | GridBeams variant: beams approach the hovering pointer (spring `magnetic` or loop-speed `follow` mode), then resume traversal from that point (PRD #428) |
| DotMatrixBackground | `dot-matrix-background` | Dot grid + brightness ripples rolling through the field |
| LightStreaksBackground | `light-streaks-background` | Blurred diagonal streaks sweeping periodically |
| StarfieldBackground | `starfield-background` | 3-layer parallax starfield, twinkle, optional pointer parallax |
| ScanGridBackground | `scan-grid-background` | Line grid + scanning highlight band (vertical/horizontal) |

## Shared prop contract

```ts
animate?: boolean;                        // default true; false forces the static composition
density?: "sparse" | "normal" | "dense";  // default "normal" — pattern cell size / element count
intensity?: "faint" | "subtle" | "bold";  // default "subtle" — opacity tier for pattern + accents
speed?: "slow" | "normal" | "fast";       // default "normal" — loop durations
tone?: "foreground" | "muted" | "primary";// default "muted" — semantic token driving currentColor
seed?: number;                            // default 1 — drives ALL pseudo-random placement
children?: ReactNode;                     // hero content rendered above the decorative layer
// StarfieldBackground only:
interactive?: boolean;                    // default true — pointer parallax (disabled under reduced motion)
// ScanGridBackground only:
direction?: "vertical" | "horizontal";    // default "vertical"
```

Root also accepts div props minus Motion-conflicting event handlers (the sidebar-shell `MotionSafeDivProps` pattern).

## Anatomy (identical across all five, duplicated per component)

```html
<div data-slot="<slug>" class="relative isolate overflow-hidden">       <!-- forwardRef root -->
  <div data-slot="<slug>-layer" aria-hidden="true"
       class="pointer-events-none absolute inset-0 -z-10">…</div>       <!-- decorative layer -->
  <div data-slot="<slug>-content" class="relative z-10">{children}</div>
</div>
```

Data attributes on root: `data-animate`, `data-density`, `data-intensity`, `data-speed`, `data-tone`, `data-reduced-motion` (present only when true), plus `data-direction` (ScanGrid) and `data-interactive` (Starfield).

## Pure exported seams (per component)

- `<name>ClassNames({ className })`, `<name>LayerClassNames(...)`, `<name>ContentClassNames(...)`
- `get<Name>MotionConfig(speed, reducedMotion)` → durations/transitions; reduced → disabled config
- `get<Name>Geometry(seed, density)` → seeded positions/delays/counts

## Shared utility

`seeded-random` (`mulberry32(seed)`, `seededRange`, `seededPick`) — pure, ~25 lines, unit-tested once, listed as a `registry:lib` file in all five registry items (like the class-merge helper). `Math.random`/`Date.now` are banned.

## Rendering techniques & budgets

Animate only transform/opacity. ≤8 animated DOM nodes per background (Starfield: +≤24 twinkling SVG circles). Static blur/masks via classes. No `will-change` classes (Motion manages it). No background-position/filter/box-shadow animation. Offscreen pause via `useInView`, failing open when IntersectionObserver is undefined.

- **GridBeams** — one static div with dual `linear-gradient(...currentColor 1px...)` grid (density = background-size 96/56/32px). 3/5/7 seeded rails (`h-px`/`w-px` at seeded % offsets), each holding one `motion.div` gradient beam animating `x`/`y` from `-100%` to `433%`, linear, infinite, seeded delay + repeatDelay.
- **DotMatrix** — one static `radial-gradient` dot-pattern div. Three overlay divs at seeded origins carrying a brighter dot pattern, radial-masked, each wrapped in `motion.div` animating `scale: [0.4, 1.6]`, `opacity: [0, 0.9, 0]`, staggered seeded delays.
- **LightStreaks** — 3/4/5 oversized wrappers with static rotation and seeded left offsets; inner `motion.div` gradient bar with static `blur-2xl`, animating an `x` sweep plus `opacity: [0, 1, 0]`, seeded delays/repeatDelays.
- **Starfield** — three SVG layers (far/mid/near) of 30–70 seeded `<circle fill="currentColor">`; each layer in one `motion.div` running a tiny mirrored x/y drift loop (120/90/60s → parallax); ≤8 `motion.circle` twinkles per layer; optional pointer parallax via `useMotionValue` + `useSpring(useTransform(...))` with 3/6/10px depth per layer.
- **ScanGrid** — same static grid div as GridBeams; ONE `motion.div` band (20% extent gradient + 1px leading edge) animating `y: ["-100%", "500%"]` (or `x` when horizontal), linear, infinite, speed-tiered repeatDelay.

## Color / tokens

All pattern and accent color flows through `currentColor`; tone×intensity map to literal Tailwind classes over semantic tokens only (`foreground`, `muted-foreground`, `primary`) with `dark:` opacity adjustments. All variant classes are complete literal strings — no interpolation.

## Reduced motion / `animate={false}`

`reduced = !animate || useReducedMotion() === true` → `get<Name>MotionConfig(speed, true)`, `<MotionConfig reducedMotion="always">`, `data-reduced-motion="true"`, and looping `animate` props are **not mounted**. Static compositions:

| Component | Static fallback |
|---|---|
| GridBeams | Grid + 2 frozen faint beam segments at seeded positions |
| DotMatrix | Dots + one static soft highlight at the first seeded origin |
| LightStreaks | One static faint streak at the mid position (blur retained) |
| Starfield | All stars static, twinkle subset at mid opacity, no drift/parallax |
| ScanGrid | Band frozen at ~30% position at reduced opacity |

## SSR contract

Server HTML equals the static resting frame: two `renderToString` calls are string-equal; no `opacity:0` on anything visible at rest; hydration is warning-free. Geometry memoized on `(seed, density)`.

## Surfaces per component

Component folder (6 files: impl, index, behavior/a11y/ssr/motion tests) · registry item (`dependencies: ["motion"]`, `registryDependencies: ["dethink-base"]`, files incl. `cn.ts` + `seeded-random.ts`, **no cssVars**) · showcase page + examples + props table · Storybook stories (fullscreen hero, variants, ReducedMotion, interaction test) · playground barrel import · package index exports · minor changeset.

Once, in the first slice: `seeded-random.ts` + tests; the `effects` showcase category (union + `componentTypes` entry + move `hero-text-animation`); Effects section in `docs/component-inventory.md`; e2e catalog-count bump.

## Verification per slice

`pnpm check` · `pnpm registry:validate` · `pnpm build` · visual pass in showcase (dark/light, variants, reduced motion) · Storybook a11y addon clean.
