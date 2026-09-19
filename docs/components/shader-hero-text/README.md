# ShaderHeroText

Six WebGL headline treatments with a real HTML heading underneath. The five
one-shot effects resolve to ordinary text; particle follow leaves the words formed
from dots, attracts those dots to the mouse, and returns them home on pointer exit.

Planning: [PRD #462](https://github.com/parveshh/dethink-components/issues/462).
Implementation: [#463](https://github.com/parveshh/dethink-components/issues/463),
[#464](https://github.com/parveshh/dethink-components/issues/464),
[#465](https://github.com/parveshh/dethink-components/issues/465),
[#466](https://github.com/parveshh/dethink-components/issues/466),
[#467](https://github.com/parveshh/dethink-components/issues/467),
[#468](https://github.com/parveshh/dethink-components/issues/468).

## Installation

Install the `shader-hero-text` registry item with the Dethink registry configured:

```sh
npx shadcn@latest add @dethink/shader-hero-text
```

The registry includes the component, renderer, shader strings, text-mask and
particle helpers, types, class merge utility and the `dethink-base` dependency.
There is no Three.js, Motion, or other graphics runtime dependency. The existing
HeroTextAnimation registry item is unchanged.

Package consumers import from `@dethink/components` and load the documented
Dethink base styles. The component is also copied as a client component by the
registry. The library source and package export expose its public prop/data types.

```tsx
import { ShaderHeroText } from "@dethink/components";

export function LaunchHeadline() {
  return (
    <ShaderHeroText
      animation="particle-follow"
      text={"A thousand points.\nOne idea."}
      className="text-6xl leading-tight font-semibold"
    />
  );
}
```

## Anatomy

- Semantic root (`h1` by default): controls font, layout, direction and pointer region.
- Text span: the complete accessible, selectable string; owns browser line wrapping.
- Decorative visual span and disposable canvas: never focusable or hit-tested.

`data-slot="shader-hero-text"` identifies the root. `data-animation` identifies the
effect. `data-state` reports static, fallback, running, complete, formed, following,
or returning. `data-rendering` reports whether the canvas is displayed;
`data-animating` reports whether another animation frame is scheduled. These states
are useful for inspection, while application logic should use props and callbacks.

## Effects and API

| Animation              | Behavior                                      | Default duration |
| ---------------------- | --------------------------------------------- | ---------------- |
| `liquid-ripple`        | Radial letter distortion                      | 1.4 s            |
| `chromatic-refraction` | Warped, separated color samples               | 1.2 s            |
| `noise-dissolve`       | Seeded organic reveal                         | 1.6 s            |
| `wave-distortion`      | A directional wave through the line           | 1.4 s            |
| `liquid-metal`         | Reflective bands across letter interiors      | 1.8 s            |
| `particle-follow`      | Local pointer tail followed by return to text | 1.2 s return     |

`text` is required. `as` accepts `h1`, `h2`, `p`, or `span`. `ariaLabel` optionally
overrides the accessible name. Native root attributes and a forwarded ref are
supported. The text must be a plain string; nested rich text is not part of this API.

`trigger` defaults to `in-view`; `mount` and `manual` are also accepted. All modes
suspend when offscreen. Set `active={false}` to disable rendering; with a manual
trigger, turn it on from an action. Change `replayKey` to rerun a one-shot effect or
reset particles to their formed state. There is no automatic repeat loop.

Particle follow affects only dots whose original letter positions are near the
pointer (a font-scaled radius of 64–160 CSS pixels). They gather into a tapered tail
behind the direction of travel, with a soft lag and seeded spacing. Distant letters stay intact.
Moving to another word releases the previous area; leaving restores every dot.

`duration` uses seconds, clamped to 0–5 for one-shots and 0–2 for particle return.
Zero returns particles immediately. `delay` applies only to one-shots, clamped to
0–5 seconds. `intensity` defaults to 0.5 and is clamped to 0–1. `seed` defaults to 0
and makes noise and per-particle target offsets deterministic. Non-finite controls
use defaults. Reduced motion is always respected; `reducedMotion="always"` forces
the static fallback, while the default `user` follows the system preference.

`onAnimationStart` fires when a one-shot actually starts drawing its effect, or
when a particle-following cycle starts. `onAnimationComplete` fires when the
one-shot finishes or the particles finish returning home. Re-entry while returning
continues the same cycle. Cancellation, unmount, replay/reset, unsupported rendering
and static fallbacks do not report completion. Hidden/offscreen particle previews
reset home and require fresh pointer input on re-entry.

## Theming

The normal Tailwind font, size, weight, line-height, alignment and direction utilities
apply to the semantic heading. Use the component CSS variables to change shader
colors through `style`:

```tsx
<ShaderHeroText
  animation="liquid-metal"
  text="Forged in motion."
  style={
    {
      "--shader-hero-text-base": "var(--dt-color-foreground)",
      "--shader-hero-text-accent": "var(--dt-color-primary)",
      "--shader-hero-text-sheen": "var(--dt-color-muted-foreground)",
    } as React.CSSProperties
  }
/>
```

These are also the defaults and registry token values. Computed CSS colors are
converted to sRGB uniforms, supporting the repository's oklch themes. Use tokens
with adequate contrast; the final one-shot HTML uses the heading's text styling.

## Accessibility and content limits

The complete text is server-rendered and remains in the accessibility tree; the
canvas is `aria-hidden`. Reduced motion, forced colors, print, failed WebGL and
unsupported typography use HTML. Particle follow additionally uses static HTML
on coarse/non-hover input. Selection reveals the HTML while preserving the selection.
Pointer handling never captures the pointer or prevents native scrolling.

Use concise headings. Explicit newlines and measured responsive wrapping are
supported; complete line runs preserve font shaping. Font readiness, root/ancestor
style changes, theme changes and resize rebuild the mask. Vertical writing,
text-transform and unsupported small-caps/spacing/shaping fall back to HTML.
Strings longer than 2,000 code units also fall back. Complex-script and unusual
font layouts must pass the mask alignment check before enhancement is enabled.
Particle dots are raster-sized; they are not scalable 3D glyph geometry.

Keyboard acceptance: tab to replay/reset/static controls, activate with Enter or
Space, and confirm the headline stays readable with no extra canvas focus stop.
On touch devices, normal scroll and text selection should work without hover.

## Rendering and performance

One canvas and draw call per active instance. Textures rebuild on layout/font/content
changes, not every frame. Particle physics uses bounded typed arrays on the CPU;
the GPU draws the dots with point sprites. No idle drift or animation frames after
particles settle. All buffers/programs/textures and contexts are released when a
preview leaves view or unmounts; context loss restores HTML immediately.

DPR is capped at 2, the mask at two million pixels and the GPU texture-size limit,
and very low-resolution masks fall back to HTML. Particle sampling targets roughly
3,000 dots and refuses sets above 8,000. The shared sampler caps text-mask memory.
Do not assume a fixed frame rate on every GPU; measure the intended device and copy.

## Testing and migration

Run `pnpm test:shader-hero` for the dedicated browser suite and
`pnpm registry:smoke:shader-hero` for a clean registry consumer install, typecheck and
Vite build. Component tests cover SSR/hydration, semantic fallback, callbacks,
manual activation, cancellation and spring convergence. Storybook covers all six
effects, static/reduced motion, dark, wrapping, RTL and manual replay.

The browser tests inspect actual rendered pixels, verify attraction and exact return
to the original glyph pattern, count idle GPU draws, and exercise context recovery,
live copy/font changes, themes, mobile, reduced motion and forced colors. Check the
companion verification notes for the tested environment and results.

No migration is required for HeroTextAnimation. Adopt ShaderHeroText explicitly on
headlines that benefit from GPU effects; existing DOM/SVG effects remain available.
