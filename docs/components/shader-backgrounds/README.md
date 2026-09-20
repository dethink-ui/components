# Shader backgrounds

Five independently installable React components with original WebGL fragment shaders:
LiquidMeshBackground, SilkFlowBackground, CausticLightBackground,
ContourFieldBackground and OrbitalGlowBackground. They complement the existing
DOM/SVG backgrounds and ShaderHeroText. There is no new graphics dependency.

## Installation and usage

With the Dethink registry configured, install the chosen item:

```sh
npx shadcn@latest add @dethink/liquid-mesh-background
```

The other names are `silk-flow-background`, `caustic-light-background`,
`contour-field-background`, and `orbital-glow-background`. Each copies the shared
renderer, its component wrapper, class helper and base token dependency. Multiple
installed backgrounds share those same files. Package consumers import the named
component from `@dethink/components` and load the normal Dethink base styles.

```tsx
const [playing, setPlaying] = useState(true);

<section>
  <button onClick={() => setPlaying(!playing)}>
    {playing ? "Pause background" : "Resume background"}
  </button>
  <LiquidMeshBackground animate={playing} className="rounded-xl p-12">
    <div className="bg-background/90 max-w-md rounded-lg p-6">
      <h1>Your next idea starts here.</h1>
      <a href="/start">Get started</a>
    </div>
  </LiquidMeshBackground>
</section>;
```

## Anatomy and API

The root is a forwarded div accepting native attributes, events, styles and classes.
An inert CSS fallback and an aria-hidden canvas layer sit behind a normal content
div. Padding, minimum height and border radius come from consumer Tailwind classes;
the background fills the available root size and does not set a viewport height.

| Prop        | Default | Behavior                                                |
| ----------- | ------- | ------------------------------------------------------- |
| children    | —       | Real foreground HTML, unchanged by the renderer         |
| animate     | true    | False releases WebGL and shows static CSS               |
| speed       | normal  | slow, normal, fast; bounded phase speed                 |
| intensity   | subtle  | faint, subtle, bold; strength of the effect             |
| seed        | 1       | Repeatable initial composition; non-finite values use 1 |
| interactive | false   | Gentle fine-pointer mouse parallax                      |

Native refs/events and named prop types are exported for each component. Shared
`ShaderBackgroundProps` and `ShaderBackgroundEffect` types are also exported.
`data-state` is static, running, or fallback; it is diagnostic, not application state.
`data-effect` names the material and `data-slot` identifies the component root.
Changing a material setting rebuilds its renderer; theme changes update color uniforms.

## Theming and recipes

The root CSS variables are `--shader-background-base` (Dethink background),
`--shader-background-accent` (primary), and `--shader-background-secondary` (info).
Override them using CSS or `style` typed as `CSSProperties`. Computed CSS colors,
including oklch theme tokens, are converted into sRGB shader uniforms. Do not infer
contrast from the shader alone: use a foreground surface or scrim behind text.

Use liquid mesh for broad atmosphere, silk for directional material, caustics for
watery light, contours for technical landscapes, and orbits for centered hero art.
The collection and each component's showcase provide working examples, theme and
motion controls, seed variations, and clickable foreground content.

## Accessibility and lifecycle

Offer a pause control for continuous animation, as shown above. OS reduced motion
always wins over animate=true. Reduced motion, forced colors, print, unavailable
WebGL and failed shader initialization preserve readable content and static CSS.
The fallback is a designed approximation of each material, not an exact shader frame.
No canvas receives focus, pointer events, or accessible meaning. Native touch scroll,
selection and keyboard controls remain available; optional parallax uses only a fine
mouse pointer and never captures a gesture. RTL affects foreground HTML naturally.

SSR renders the same deterministic HTML as the first client render. Animation starts
only when visible and allowed. IntersectionObserver provides widely supported
offscreen suspension; the decorative layer also honors content-visibility skip events.
Hidden or offscreen instances release contexts, programs and buffers; elapsed phase
is retained for re-entry. Explicit pause displays CSS. Context loss immediately
reveals the fallback and restoration reinitializes the renderer. Unmount removes
observers/listeners and cancels frames.

## Performance and limits

One fullscreen triangle and one draw per active instance. No textures, scene graph,
postprocessing, frame-state React updates or per-frame DOM measurements. Shader
programs include only the selected material. DPR is limited to 1.5, the drawing buffer
to one million pixels and GPU dimensions, and drawing to at most 30 fps. Contours use
three noise octaves; other materials use analytic fields. A shader is decorative,
not a fluid simulation or a guarantee of a fixed frame rate on every device.

## Verification and migration

Run `pnpm test:shader-backgrounds` and `pnpm registry:smoke:shader-backgrounds`.
Component tests cover deterministic SSR/hydration, refs, foreground events, axe and
drawing-buffer limits. Browser tests inspect pixels during real draws and exercise
all five individual pages, pause/resume, themes, context recovery, resizing, mouse
parallax, mobile input, reduced motion, print and missing WebGL/JavaScript.
See [verification](./verification.md) for measured results and limitations.

No migration or new dependencies are required for existing background components.
Planning: [PRD #469](https://github.com/parveshh/dethink-components/issues/469) and
[implementation issues](./issues.md). Sources: [research](./research.md).
