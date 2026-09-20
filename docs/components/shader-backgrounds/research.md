# Shader background research

Researched 2026-09-19. Five new effects complement the existing DOM/SVG backgrounds.

| Component              | Visual direction                             | Original shader technique                                        |
| ---------------------- | -------------------------------------------- | ---------------------------------------------------------------- |
| LiquidMeshBackground   | Broad, softly blended pools of color         | Moving analytic color fields with smooth coordinate warping      |
| SilkFlowBackground     | Satin folds crossing a quiet dark surface    | Directional sine bands modulated by low-frequency flow           |
| CausticLightBackground | Bright, interconnected light beneath water   | Layered trigonometric interference sharpened into moving ridges  |
| ContourFieldBackground | Slowly evolving topographic lines            | Domain-warped fractal noise, quantized into antialiased contours |
| OrbitalGlowBackground  | Luminous elliptical rings around a soft core | Analytic elliptical distance fields with moving arc highlights   |

## Sources and decisions

- [WebGL Fundamentals: Shadertoy-style rendering](https://webglfundamentals.org/webgl/lessons/webgl-shadertoy.html), fetched through authenticated Context7, establishes a fullscreen primitive with time and resolution uniforms. Use one draw per background, no textures or postprocessing.
- [The Book of Shaders: fBM and domain warping](https://thebookofshaders.com/13/) explains layered noise and warped coordinates. Use a bounded three-octave field for contour shapes; other effects use cheaper analytic fields. The shaders are original implementations, not copied examples.
- [Paper Shaders](https://shaders.paper.design/) is a visual reference for mesh, wave and orbital treatments. No Paper package or source code is incorporated.
- [MDN WebGL best practices](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices) informs bounded drawing-buffer resolution and prompt GPU resource disposal. Cap DPR at 1.5, drawing buffers at one million pixels, and draw frequency at 30 fps. These are budgets, not measured performance claims.
- Modern Web Guidance's `efficient-background-processing` guide recommends suspending rendering when skipped/offscreen. Keep foreground HTML unconstrained; use IntersectionObserver for baseline support and also honor content-visibility skip events on the decorative layer.

## Architecture

Five independently installable components share a private WebGL lifecycle and public
prop types. No new graphics or animation runtime. Use existing speed/intensity tiers,
an optional gentle mouse parallax, and CSS variables backed by semantic theme tokens.
Foreground content is ordinary HTML; the decorative canvas never receives pointer
events or focus. SSR, reduced motion, forced colors, print and failed WebGL use static
CSS compositions. Each effect gets its own showcase page with pause, theme and
interaction controls, plus a collection overview. Do not replace existing backgrounds.

Validate actual pixels in Chromium, Firefox and WebKit, interaction/accessibility,
SSR/hydration, reduced motion, context recovery, resize, offscreen cleanup and a clean
registry consumer. Physical-device frame-rate profiling remains a separate measurement.
