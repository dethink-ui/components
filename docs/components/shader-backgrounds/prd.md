# PRD: Five WebGL shader backgrounds

Published: [PRD #469](https://github.com/parveshh/dethink-components/issues/469).
Implementation issues: #470–#474. All five components and their showcase pages are implemented.

## Problem Statement

The library has geometric DOM/SVG backgrounds and shader headline effects, but lacks
continuous GPU-rendered background materials. Product heroes need expressive motion
behind real, accessible content, with predictable performance and static fallbacks.

## Solution

Add LiquidMeshBackground, SilkFlowBackground, CausticLightBackground,
ContourFieldBackground and OrbitalGlowBackground. Each is independently installable
and documented, with a shared lightweight renderer, its own showcase page, and a
collection overview. The user requested researching and adding five backgrounds;
the selection and implementation are within that authorized scope.

## User Stories

1. As a designer, I want blended liquid colors behind a hero so it feels atmospheric.
2. As a designer, I want satin-like flowing folds so a launch feels tactile.
3. As a designer, I want watery caustic light so a section feels luminous.
4. As a designer, I want evolving contour lines so a product feels technical.
5. As a designer, I want glowing orbital rings so a hero has depth and focus.
6. As a developer, I want normal children and a forwarded div ref so content composes naturally.
7. As a keyboard user, I want foreground controls to work without canvas focus stops.
8. As a reader, I want the decoration hidden from assistive technology.
9. As a motion-sensitive user, I want static compositions under reduced motion.
10. As a reader, I want an explicit pause control in continuous-motion examples.
11. As a developer, I want animate=false to stop GPU work and retain a designed fallback.
12. As a mobile user, I want responsive backgrounds that do not block scrolling.
13. As a theme author, I want semantic CSS variables for background and accent colors.
14. As a developer, I want stable seeded composition and bounded speed/intensity tiers.
15. As a site owner, I want no rendering work while hidden or offscreen.
16. As a user with unavailable WebGL, I want content and a static background immediately.
17. As a developer, I want context recovery and complete cleanup on unmount.
18. As a consumer, I want SSR and hydration without layout shifts or mismatches.
19. As a consumer, I want each registry item to install without hidden files or graphics runtimes.
20. As a developer, I want isolated GPU pixel tests and meaningful component tests.
21. As a reviewer, I want individual showcase pages, live controls, installation and API docs.
22. As a user, I want optional subtle mouse interaction to respect motion preferences and touch input.

## Implementation Decisions

- Five named React client components wrap a private shared renderer. Preserve existing background and hero APIs.
- Common props: native div attributes/ref/children, animate (true), speed (slow/normal/fast), intensity (faint/subtle/bold), seed (1), interactive (false).
- Colors use --shader-background-base/accent/secondary, defaulting to Dethink background, primary and info tokens. No fixed brand palette in library code.
- Use original GLSL in WebGL1 with precision fallback, one fullscreen triangle, no textures and no new runtime dependency. Compile the chosen effect only.
- Limit DPR to 1.5, drawing buffers to one million pixels, and rendering to 30 fps. Suspend and release offscreen/hidden contexts; resume with preserved elapsed phase.
- Respect reduced motion, forced colors and print with static CSS. Explicit pause via animate=false produces static CSS without allocating WebGL. Fail closed to CSS on shader/context errors.
- Optional mouse parallax changes shader coordinates, never captures pointers or blocks scrolling. Disable it on coarse input and static modes.
- Existing DOM remains above decoration with stable layout. Showcase examples demonstrate contrast-safe foreground surfaces and a pause control.
- Independently installable registry items include shared files and base tokens. Package exports, Storybook, playground and a minor Changeset accompany the components.

## Testing Decisions

- Extend established hero shader browser seams: actual pixel variation, canvas lifecycle, disabled WebGL, context restoration and bounded drawing buffers.
- Use unit/component tests for deterministic SSR/hydration, refs, native events, children, axe and stopped behavior. Prefer public behavior over shader implementation snapshots.
- Verify all five showcase pages in Chromium, Firefox and WebKit, dark/light modes, mobile, keyboard foreground actions, pause/resume, pointer input and reduced motion.
- Validate registry closure in a clean Vite consumer, TypeScript, package/Storybook/showcase builds and Button-only tree shaking.

## Out of Scope

Fluid simulation, 3D models, WebGPU, postprocessing bloom, video textures, text rasterization,
scroll hijacking, replacement of existing backgrounds, and guaranteed physical-device frame rates.

## Further Notes

The research notes record sources and tradeoffs. Five AFK vertical slices each ship
a complete component plus docs/showcase/registry/tests; slices 2–5 depend only on
the first slice's shared lifecycle.
