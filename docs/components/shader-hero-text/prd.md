# PRD: Six shader hero text animations

Status: draft for scope and test-seam review. Not yet published to GitHub.
Implementation is gated on the approved GitHub PRD and implementation issues.

## Problem Statement

Dethink Components has ten DOM/SVG hero text animations, but does not offer the
fluid distortion, prismatic edges, organic reveal, traveling waves, or reflective
materials or mouse-following particle lettering for expressive product-launch headlines. Teams need
these effects without sacrificing readable headings, predictable layout,
accessibility, or a portable registry installation.

## Solution

Provide an opt-in `ShaderHeroText` React component with exactly six effects:
`liquid-ripple`, `chromatic-refraction`, `noise-dissolve`, `wave-distortion`, and
`liquid-metal`, and `particle-follow`. The first five use real WebGL shaders and
resolve into crisp HTML text. Particle follow renders the letters as individual
dots that follow the mouse and return to their original letter positions on exit.
Publish individual showcase examples, controls, documentation, Storybook
states and registry installation support. Present it alongside HeroTextAnimation.

## User Stories

1. As a landing-page engineer, I want a liquid ripple across my headline so that a launch feels fluid and tactile.
2. As a designer, I want prismatic text refraction so that a technology hero has a distinctive optical accent.
3. As a designer, I want a noise dissolve reveal so that a headline assembles organically.
4. As an editorial designer, I want a traveling text wave so that large type can feel dimensional.
5. As a brand designer, I want a liquid-metal treatment so that a short headline can suggest a reflective material.
6. As an engineer, I want a consistent typed API across all six effects so that switching effects does not require rewriting a hero.
7. As a user, I want the complete heading to remain readable without JavaScript or WebGL so that I never lose the page's message.
8. As a screen-reader user, I want the heading announced once with the intended semantics so that decorative output is not repeated.
9. As a user who prefers reduced motion, I want immediate static text and no ongoing GPU animation so that my preference is respected.
10. As a keyboard user, I want replay controls that work normally and no canvas focus target so that the effect does not obstruct navigation.
11. As a mobile visitor, I want bounded rendering work and stable wrapping so that a hero does not overflow or waste resources.
12. As an engineer, I want loaded fonts, resizes and text updates handled safely so that the GPU rendering remains aligned with the heading.
13. As a theme author, I want semantic color variables for the base and accents so that light, dark and brand themes remain portable.
14. As a registry consumer, I want all required source files and CSS variables installed together so that copied code works in a clean app.
15. As an existing consumer, I want the original HeroTextAnimation API and dependency requirements preserved so that this addition is opt-in.
16. As a visitor, I want work suspended when the page or heading is not visible so that hidden animations do not consume resources.
17. As a visitor whose GPU context is lost, I want readable fallback text immediately so that rendering failure never blanks the headline.
18. As a QA engineer, I want reproducible animation frames and lifecycle scenarios so that visual failures can be caught reliably.
19. As an author, I want copy, selection, direction and explicit line breaks preserved so that the visual enhancement behaves like real text.
20. As an engineer, I want bounded timing and explicit replay so that animation finishes without an indefinite loop.
21. As a designer, I want dots themselves to form the headline so that the particle treatment remains visible at rest.
22. As a mouse user, I want the particles to gather around and trail my pointer so that the headline responds directly to my movement.
23. As a mouse user, I want every particle to return to its original letter position on pointer exit so that the headline reforms reliably.
24. As a visitor, I want interrupted following to recover and settled particles to stop consuming animation frames so that the effect remains predictable and efficient.
25. As a touch or reduced-motion user, I want static readable text without simulated hover so that the same content works on my device.

## Implementation Decisions

- Add a separate `ShaderHeroText` component and registry item. Preserve the ten
  existing HeroTextAnimation kinds; cross-link the two documentation surfaces.
- Use an internal WebGL renderer with a text-mask texture for the first five effects
  and a point renderer for particle follow, all with original GLSL shaders.
  No new third-party graphics runtime is proposed for this 2D scope.
  Keep renderer code out of existing registry items and verify package tree shaking.
- Follow the existing hero vocabulary: `text`, `as`, `ariaLabel`, `animation`,
  `trigger` (mount, in-view, manual), `active`, `delay`, `duration`, and start/complete
  callbacks. Use `animation="liquid-ripple"` and in-view triggering by default.
- Add bounded `intensity` (0–1, default 0.5) and deterministic `seed` (default 0).
  Honor user reduced motion by default and offer a static override. Do not offer
  an override that forces motion against the system preference in this component.
- Provide `replayKey` for an explicit replay request. No automatic repeat in v1.
  Clamp duration to a documented finite maximum of five seconds. Callback behavior
  must be documented for successful runs, cancellation, replay, and static fallback;
  static fallback does not claim a GPU animation ran.
- Particle follow is an explicit exception to the one-shot lifecycle. Once enabled
  by its trigger, it uses formed, following and returning states. It initially
  displays static dotted letters, attracts the entire cloud toward mouse-relative
  targets with seeded offsets, and restores each particle's home on pointer exit.
  Motion is attraction rather than pointer repulsion. Preserve current positions
  on rapid re-entry. Stop scheduling frames at rest, including a stationary target.
- Sample particle home positions from the existing text mask. Use a bounded typed-
  array spring simulation on the CPU and WebGL point-sprite rendering. Start with
  3,000 dots maximum by default and an 8,000 hard cap; also bound mask sampling work
  and device point sizes. Fall back to HTML if glyph coverage is inadequate.
- Particle `duration` controls return-to-text settling (default 1.2 seconds, clamped
  to 0–2); zero restores home immediately. `intensity` controls attraction strength.
  `replayKey` resets formed lettering rather than inventing a timed particle loop.
  Start fires once when a following cycle begins and complete once after returning
  home. Re-entry during return continues that cycle; cancellation/reset and fallback
  do not emit completion. An inactive manual trigger restores home and disables following.
- Listen for mouse pointer movement/leave/cancel on the stable heading wrapper,
  using its current local coordinates. Do not capture the pointer or intercept
  text selection, native scrolling or touch gestures. Touch/coarse-pointer devices
  use static HTML. Reduced motion and forced colors never start the simulation.
- Window blur releases attraction. Hidden/offscreen states stop work and reset home
  before resuming; require fresh movement rather than stale pointer coordinates.
  Font/text/layout changes rebuild home positions and reset the interaction safely.
- Expose base/accent/sheen colors through documented semantic CSS custom properties.
  Resolve computed colors for uniforms, including themes that use modern color
  syntax. Keep Tailwind as the styling layer for layout and semantic HTML.
- Use the real semantic text for layout, selection, copying and accessibility.
  The canvas is decorative, non-focusable and ignores pointer events. Show HTML
  during SSR, loading and fallback; switch visuals only after a successful draw.
  At one-shot completion, restore crisp HTML without changing its bounding box.
  Particle follow retains a static particle-formed headline at rest; semantic HTML
  remains available throughout and becomes visible for fallback and selection.
- Rasterize complete shaped text lines with the loaded font. Support plain text,
  explicit newlines and verified responsive wrapping. Font, size, text, direction,
  line layout and relevant style changes invalidate the mask. Keep static HTML
  for unsupported typography instead of claiming arbitrary DOM rasterization.
- Disable animation for reduced motion and forced colors; use HTML for print.
  Respond to preference changes during an active animation.
- Suspend animation offscreen and in hidden tabs. Cancel callbacks, observers,
  listeners and frame requests on unmount; delete allocated GPU objects.
- Catch context creation, compile/link, texture allocation and rendering failures.
  Context loss restores HTML immediately. Recreate resources only when applicable
  on restoration, without replaying already-completed animations.
- Initially cap DPR at 2 and each surface at two million pixels, respecting GPU
  texture limits. Avoid eager contexts for inactive showcase previews. Measure
  actual frame costs before stating performance claims.
- Each effect is a complete vertical slice with public export, registry coverage,
  showcase example, Storybook states, documentation and relevant checks. The first
  slice proves the shared lifecycle through a working liquid ripple.

## Testing Decisions

- Test public behavior at the highest practical seam. Reuse the existing hero
  rendered-component, axe, SSR/hydration, Storybook and registry smoke patterns.
- Verify semantic tags and one accessible label, static fallback, active/trigger
  behavior, explicit replay, bounded timing, callbacks and cancellation.
- Add real browser WebGL verification. Require non-empty rendered glyphs and
  visibly different deterministic intermediate frames, then a crisp final heading.
  Mocked WebGL methods alone do not prove shader correctness.
- For particle follow, verify formed dots move toward successive mouse positions,
  then return to their original glyph positions on exit within the configured bound.
  Verify re-entry during return, stationary-target settling, cancellation, blur,
  mid-follow layout/text changes, visibility restoration, touch scrolling, and no
  scheduled frames at rest. Test bounded spring integration and convergence at the
  pure simulation seam alongside the rendered interaction and visual checks.
- Cover context failure/loss/restoration, font readiness and replacement, live
  text changes, resize, theme switching, reduced motion mid-run, hidden/offscreen
  suspension, and repeated mounting/unmounting with no accumulating GPU resources.
- Compare light/dark, mobile, explicit multiline, ordinary wrapping, supported RTL,
  200% zoom and forced-colors states. Document typography limitations discovered.
- Check selection/copy and manual keyboard replay. Confirm final heading bounds
  do not jump during the HTML-to-canvas-to-HTML handoff.
- Use Chromium automation already available; record Firefox/Safari verification
  separately, extending browser configuration only if needed for this scope.
- Verify a clean registry consumer, package build/types, relevant lint/format checks,
  and a representative consumer bundle without the optional shader component.
- Record performance observations with hardware, browser, resolution and instance
  count; establish evidence before promising frame-rate or bundle-size numbers.

## Out of Scope

- Replacing the existing hero animations or landing backgrounds.
- True 3D extruded fonts, camera scenes, WebGPU-only effects, or MSDF asset tooling.
- Arbitrary rich HTML rendering or refraction of the webpage behind the heading.
- Fluid simulation, general particle systems or emitters, bloom pipelines, or a shader editor.
- Continuous ambient loops, scroll hijacking, pointer effects beyond particle follow, or audio reactions.
- Rasterizing the only semantic text, animating body copy, or forcing motion.

## Further Notes

Research and references are recorded in the companion research document. The
six-effect direction, proposed test seams and vertical-slice breakdown are ready
for review. After approval, publish this PRD with `ready-for-agent`, publish the
implementation issues, and use the repository's stacked PRD/issue branch workflow.
No commit or integration into the default branch is authorized by this document.
