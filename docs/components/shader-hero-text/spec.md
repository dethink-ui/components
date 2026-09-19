# ShaderHeroText implementation specification

Public behavior and examples are documented in [README.md](./README.md); research
and tradeoffs are in [research.md](./research.md). GitHub PRD #462 and issues
#463–#468 are the approved source of truth.

## Modules

- `types`: public props and six animation names, finite numeric bounds.
- `text-mask`: browser line measurement, font/layout validation, capped raster
  mask, conversion from computed theme colors to sRGB uniforms.
- `shaders`: five full-plane effects and the particle point shaders.
- `particles`: bounded home-position sampling and critically damped spring stepping.
- `renderer`: GPU initialization, first-draw validation, draws and resource disposal.
- `shader-hero-text`: semantic markup, visibility/preferences/fonts, replay and
  callbacks, pointer lifecycle, selection handoff and failure recovery.

## Lifecycle

One-shot: readable HTML → fonts/layout ready and visible → successful first GPU
draw → bounded animation → readable HTML. Offscreen/hidden suspends elapsed time
and releases the renderer. Completion never automatically replays.

Particles: readable HTML → successful formed-dot draw → formed → following →
returning → formed. Following may settle at a stationary target with no scheduled
frames. Re-entry during returning continues the existing cycle. Every return
restores the stored homes exactly. Offscreen/hidden cancels the cycle and resets
homes before future interaction. WebGL failure, forced colors, touch/non-hover
input and reduced motion keep or restore HTML.

## Invariants

- The complete accessible text is never replaced with particle coordinates.
- The canvas is decorative and cannot change the heading's layout box.
- Start/completion callbacks represent successful animation cycles, not fallback.
- A particle returns to its own home, never a newly randomized letter position.
- No per-frame React state updates, DOM measurements, or text texture uploads.
- A stale pointer position is not resumed after a hidden/offscreen interruption.
- GPU contexts and observers are released on unmount; context loss cannot blank text.
- Existing hero text and background registry items gain no shader dependency.

## Definition of done

Public exports/types, portable registry metadata, docs and API tables, six editable
showcase previews, Storybook states, playground smoke coverage, Changeset,
semantic/SSR/callback/simulation tests, actual browser GPU verification, and clean
consumer/package builds. Work remains uncommitted until the user requests a commit.
