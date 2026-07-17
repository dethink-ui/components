# Carousel design QA

Manual and automated QA notes for the Carousel (PRD [#439](https://github.com/parveshh/dethink-components/issues/439)). Storybook is the review surface; the stories referenced below carry `play` interaction tests and the a11y addon.

## Staging

- **Flat** (`Flat`, `GenericContent`, `Controlled`, `Density`): a centered slider, one card in view, neighbors fading out. No 3D nodes, no contact shadows.
- **Tilt** (`Tilt`, `IntensityComparison`, `MarketingCards`, `RTL`): a restrained perspective row — cards rotateY toward the center, recede, and scale down toward the edges; far cards plateau at the clamp. Contact shadows present.
- **Floor** (`FloorGallery`, `DarkMode`, `ReducedMotion`, `WithAuroraBackground`): the hero scene — one shared vanishing point (perspective on the viewport), a tilted ground plane (rotateX on the preserve-3d track), cards standing on their bottom edge, depth blur on far cards, and ground-plane contact shadows.

## Interaction checklist

- Pointer drag tracks the row 1:1, rubber-bands at the ends, and settles with momentum to the nearest slide (flick projects velocity).
- Previous/Next move one slide, disable at the bounds (no loop), and never steal focus.
- Dots reflect the active slide with `aria-current` and jump on click.
- ArrowLeft/ArrowRight browse from the viewport; Home/End jump to the ends; RTL reverses the arrow mapping and chevrons.
- Controlled usage does not move unless the consumer updates `index`; `onIndexChange` fires once per settle.

## Accessibility

- Region carries `aria-roledescription="carousel"` and the consumer's `aria-label`; slides are `role="group"` + `aria-roledescription="slide"` labeled "N of M".
- A polite live region announces control-driven changes; drag does not announce.
- Fully off-screen slides are `inert` (visible radius: flat 0, tilt 1, floor 2) so Tab never reaches a hidden slide's nested link/button (see `MarketingCards`).
- axe is clean for all three stagings (`carousel.a11y.test.tsx`).

## Theming, density, RTL

- Contact-shadow color has dedicated light/dark tokens (`DarkMode`).
- Gap follows `--dt-density-gap`; cards are sized in container-query units so the scene scales with width (`Density`).
- `--carousel-dir` flips the horizontal translate and rotateY under `:dir(rtl)`; depth (`translateZ`) is never mirrored (`RTL`).

## Reduced motion

- With the OS preference on, the 3D tokens and floor `rotateX` zero out, tilt/floor item transforms collapse to the flat translate, the spring becomes an instant jump, and the active-slide change reads as an opacity crossfade (`ReducedMotion` story; `carousel.motion.test.tsx`).

## 3D risk mitigations (verified in source)

- No `filter` or containment on the track (would flatten `preserve-3d`); depth blur lives on leaf cards only and is capped at `--carousel-max-blur` (≤3px), dropped to 0 at `intensity="subtle"`.
- Query containment lives on the root only, outside the perspective/preserve-3d chain.
- Viewport clips the inline axis only (`overflow-x: clip; overflow-y: visible`) with generous block padding, so cards pushed toward the camera are not sliced.
- `backface-visibility: hidden` (plus `-webkit-` prefix) guards Safari shimmer.

## Known gap: browser drag e2e

A dedicated Playwright drag test (including WebKit) is **deferred**. The existing e2e harness (`playwright.config.ts`) builds and serves only the Next.js showcase on chromium; the carousel has no showcase route, so a real-browser drag/WebKit test would require new infrastructure (a showcase carousel route or a Storybook `webServer` + a WebKit project). Drag momentum and the 3D scene are currently covered by:

- pure-math unit tests for snap projection, rubber-band, px→index, and RTL sign (`carousel-utils.test.ts`);
- Storybook `play` interaction tests for controls, dots, keyboard, staging, and inert (`Carousel.stories.tsx`);
- jsdom rendered/a11y/SSR/motion tests.

When a showcase route or Storybook e2e target is added, wire a WebKit + chromium drag spec that asserts the settle target after a flick and that `preserve-3d` is not flattened.
