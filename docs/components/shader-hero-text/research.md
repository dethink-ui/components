# Shader hero text research

Researched 2026-09-19. Status: proposed direction; no component implemented.

## Recommendation

Add six WebGL effects through an opt-in `ShaderHeroText` component, discoverable
alongside the existing ten `HeroTextAnimation` effects. Use a small shared WebGL
renderer and original GLSL shaders. Keep the current component API unchanged.
Each effect should have a distinct silhouette or material behavior, rather than
being a recolored version of the same animation.

| Effect | Visual direction | Shader technique | Proposed default |
| --- | --- | --- | --- |
| Liquid ripple | A soft ripple bends the letters, then settles into crisp type. | Radial, damped UV displacement of the text mask. | One 1.4-second pass. |
| Chromatic refraction | Prismatic fringes separate around the letter edges and reunite. | Slightly offset mask samples, token-derived accent colors, and a moving distortion band. | One 1.2-second pass; no flashing. |
| Noise dissolve | Fine organic fragments assemble into the complete headline. | Seeded noise threshold multiplied by the text alpha, with a narrow highlighted edge. | One 1.6-second reveal. |
| Wave distortion | A broad, fabric-like wave travels through the line and flattens. | Directional sinusoidal UV displacement with a decaying amplitude envelope. | One 1.4-second pass. |
| Liquid metal | Reflective bands flow across the letter interiors before resolving. | Procedural lighting bands, warped coordinates, and mask-edge shading. | One 1.8-second pass ending in readable foreground text. |
| Particle follow | Dots form the letters, gather around and trail the mouse, then return to the same letter positions on pointer exit. | Text-mask sampling into home positions; spring-updated point buffers; WebGL point sprites. | Static particle lettering at rest; motion only while following or returning. |

These timings and the six-effect selection are design proposals, not performance
measurements or claims from the references. The metal effect is stylized shading,
not a physically simulated metal surface. Chromatic refraction acts on the text
texture; it does not refract arbitrary HTML behind the component.

## What the sources establish

1. [WebGL Fundamentals: text textures](https://webglfundamentals.org/webgl/lessons/webgl-text-texture.html)
   demonstrates generating a text texture with Canvas 2D and drawing it with
   WebGL. It also explains alpha handling and non-power-of-two texture settings.
   This is the proposed foundation for rendering the consumer's loaded font.
2. [Codrops: heat distortion](https://tympanus.net/codrops/2016/05/03/animated-heat-distortion-effects-webgl/)
   demonstrates fragment-shader distortion of images and text. It informs the
   liquid treatment; its older integration code is not a current dependency guide.
3. [Codrops: refraction and shader effects](https://tympanus.net/codrops/2019/12/16/scroll-refraction-and-shader-effects-in-three-js-and-react/)
   combines RGB offsets and warping. Use the visual technique as inspiration,
   without adopting its historic React integration APIs or scroll system.
4. [Codrops: kinetic typography](https://tympanus.net/codrops/2020/06/02/kinetic-typography-with-three-js/)
   describes rendering text into a texture and manipulating its sampling in
   shaders. It supports exploring coherent waves rather than per-letter DOM motion.
5. [Codrops: noise-driven text dissolve](https://tympanus.net/codrops/2026/01/28/webgpu-gommage-effect-dissolving-msdf-text-into-dust-and-petals-with-three-js-tsl/)
   shows an MSDF/WebGPU dissolve and particles. Borrow only the noise-threshold
   concept, reversed into a reveal. Its emitted dust/petals, WebGPU, and bloom are
   outside v1; the separate particle-follow effect is now explicitly in scope.
6. [Paper: Liquid Metal](https://shaders.paper.design/liquid-metal)
   is a visual reference for reflective stripes constrained by a transparent
   image mask. Its distortion, contour, and color dispersion controls help define
   the material direction. No Paper runtime dependency or copied shader is proposed.
7. [MDN: WebGL best practices](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices)
   covers resource disposal, pixel budgets, texture upload costs, and accurate
   canvas sizing. These inform the proposed render budget and lifecycle checks.
8. [Khronos: WebGL specification](https://registry.khronos.org/webgl/specs/latest/1.0/)
   documents context loss/restoration and texture upload behavior. Context7 was
   checked while logged in and used to retrieve these specification details first.
9. [WebGL Fundamentals: particle rendering](https://webglfundamentals.org/webgl/lessons/webgl-gpgpu.html)
   demonstrates drawing particle positions with `gl.POINTS` and point-size control.
   Its GPU simulation is an alternative, not required by the proposed bounded CPU
   spring simulation. Context7 supplied this reference for the particle addition.
10. [WebGL Fundamentals: pointer coordinates](https://webglfundamentals.org/webgl/lessons/webgl-shadertoy.html)
    demonstrates converting mouse coordinates to canvas-relative coordinates.

## Rendering options

| Approach | Benefits | Costs | Decision |
| --- | --- | --- | --- |
| Canvas 2D text mask + raw WebGL | Consumer fonts; small renderer; no additional runtime dependency; texture effects and particle home-position sampling. | Must own raster/layout alignment, shader lifecycle, point buffers, and cleanup. | Recommended. |
| Three.js + custom shader material | Useful scene abstractions and a path to 3D typography. | Additional dependency and scene machinery for a flat text effect. | Reconsider if genuine 3D geometry becomes a requirement. |
| SDF/MSDF glyph atlas | Strong scaling for large or deeply transformed glyphs. | Font preparation, glyph coverage, shaping and asset distribution complexity. | Defer. |
| Paper shader package | Existing material effects and controls. | Text masking/layout still needed; external runtime and API. | Visual reference for this original open-code implementation. |
| HTML-in-canvas | Potential future direct DOM-to-texture integration. | Retrieved guidance flags limited browser availability. | Do not make it a v1 requirement or ship a polyfill. |

The required modern-web-guidance search returned `apply-webgl-shaders`. That guide
was retrieved and its progressive-enhancement constraints reviewed. The CLI also
reported the local skill version as outdated; the guide content was fetched live.

## Integration and boundaries

- Existing prior art: `HeroTextAnimation` provides semantic elements, timing,
  triggers, reduced motion, Storybook, showcase examples, registry delivery,
  rendered tests, axe checks, and SSR/hydration coverage.
- The existing landing-background family explicitly excludes WebGL in its PRD;
  this feature should not silently change those components.
- Keep a real semantic heading as the source of truth. Hide the decorative canvas
  from assistive technology and pointer hit testing. Preserve text selection and
  copying, including while the shader is visible.
- Initially support plain string headings and explicit newlines, plus ordinary
  responsive wrapping validated against measured HTML lines. Preserve complete
  shaped line runs rather than drawing separate characters. Unsupported font or
  layout cases retain the HTML rendering instead of showing misaligned glyphs.
- Match the loaded font, font weight, size, line height, alignment, direction and
  supported letter spacing. Rebuild the texture on relevant layout, text or font
  changes, not each animation frame. Complex scripts need explicit verification;
  use static HTML when alignment cannot be reproduced reliably.
- Keep HTML visible until the texture is ready and the first successful GPU draw
  has completed. Restore HTML on one-shot completion, errors, reduced motion, forced colors,
  print, or context loss. No empty heading while waiting for fonts or WebGL.
  Particle follow retains its static dotted lettering at rest, with semantic HTML
  available throughout; it does not become solid text after every pointer exit.
- Pause work offscreen and in hidden tabs. Release GPU resources on unmount and
  context replacement. Restore after context loss only when still mounted and
  allowed to animate; restoration must not repeatedly restart a completed effect.
- Start with a DPR cap of 2 and a two-million-pixel surface budget, additionally
  clamped to device texture limits. These are proposed bounds to validate on real
  devices, not a guarantee of 60 fps. Lower resolution or use HTML when necessary.
- Do not allocate all six shader contexts eagerly on a documentation page.
  Initialize near visibility and release inactive preview resources.
- The original five effects are one shot by default, with maximum five-second
  automatic motion and explicit replay. Particle follow is an input-driven effect
  with a bounded return, no ambient drift, and no animation loop while settled.

## Particle-follow interaction added by user request

- **Rest:** sample the text alpha mask into evenly distributed dots with permanent
  home positions. The dots themselves form a readable headline; this is not a
  particle background or an image of dots laid over solid letters.
- **Follow:** mouse movement inside the stable heading wrapper attracts the cloud
  toward the pointer. Keep small seeded offsets around the target so particles
  trail as a visible cluster rather than collapsing into one pixel. Attraction,
  not repulsion, is the requested behavior. Use a spring with damping for lag.
- **Return:** `pointerleave` releases attraction and each dot springs to its own
  home. Re-entry during return redirects from the current positions without a
  teleport or rebuilding the point set. Stop frame scheduling once settled; snap
  the tiny remainder home after a bounded return period (initial target: 1.2 s,
  hard stop within 2 s). These are proposed tuning values.
- Listen on the fixed semantic wrapper, not the moving dots. The canvas ignores
  pointer events. Recompute local coordinates from the current bounds when needed
  so scrolling and resizing cannot leave stale hit regions. Do not capture the
  pointer or block selection, links, native scrolling, or touch gestures.
- On cancellation or window blur, return home. Hidden/offscreen, reduced-motion,
  context-loss and unmount paths must cancel work; on visibility restoration show
  the home state and require a fresh pointer movement rather than chasing an old
  coordinate. Rebuild home positions after font, text, or layout changes.
- Fine hover-capable mouse input enables following. Touch/coarse-pointer devices
  use readable static HTML by default. Reduced motion and forced colors also use
  HTML. No hover interaction is needed to discover or understand the heading.
- Start with a bounded CPU spring simulation in typed arrays and one WebGL point
  draw. The vertex shader positions/sizes dots; the fragment shader produces soft
  circular dots. GPU rendering is not a claim of GPU-simulated physics. Reuse the
  text-mask and lifecycle infrastructure, with a separate point renderer.
- Initially target at most 3,000 dots by default, capped at 8,000, with a bounded
  mask-readback size. Validate readable letter coverage before enabling the visual
  handoff; use HTML if the budget cannot represent the headline adequately. Clamp
  point size to the device-supported range and cap time steps after interruptions.

Verify actual pointer movement makes the particle cloud follow successive pointer
positions; leaving restores the initial dotted glyph pattern within the deadline.
Also verify stationary-pointer settling, rapid re-entry, scroll/resize mid-follow,
window blur, cancellation, touch scrolling, reduced motion mid-follow, and no frame
requests once at rest. Use pure simulation tests only for bounded integration and
convergence, alongside real-browser visual verification of the full interaction.

## Verification proposal

Reuse rendered component, axe, SSR/hydration, Storybook and registry smoke seams.
Add actual browser WebGL checks for first-draw handoff, distinct intermediate
frames, final crisp text, font/resize changes, context loss, and repeated mount /
unmount. A DOM canvas assertion or mocked GL unit test is not evidence of working
shaders. Keep deterministic seed/progress fixtures for visual comparisons.

Check Chromium through the existing Playwright suite and explicitly record manual
or automated Firefox/Safari results; the current root configuration covers only
Chromium. Test mobile layouts, 200% zoom, RTL examples, light/dark themes, reduced
motion toggled during a run, forced colors, and a browser with WebGL unavailable.
Record the device, viewport, DPR and visible instances for any performance result.
