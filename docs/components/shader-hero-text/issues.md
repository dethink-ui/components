# ShaderHeroText implementation slices

Status: approved and published. All six effects and their showcase examples are implemented.
The acceptance lists below preserve the approved issue plan. See
[verification](./verification.md) for actual results.
Parent: [PRD #462](https://github.com/parveshh/dethink-components/issues/462).
Slices 1–6: GitHub issues [#463](https://github.com/parveshh/dethink-components/issues/463), [#464](https://github.com/parveshh/dethink-components/issues/464), [#465](https://github.com/parveshh/dethink-components/issues/465), [#466](https://github.com/parveshh/dethink-components/issues/466), [#467](https://github.com/parveshh/dethink-components/issues/467), [#468](https://github.com/parveshh/dethink-components/issues/468).

All six slices are AFK after scope approval. Each includes its public API/types,
registry distribution, documentation, showcase example, Storybook and relevant
behavior, accessibility, SSR, visual and real-WebGL checks. There is no separate
infrastructure-only or documentation-only slice.

| #   | Title                                                     | Type | Blocked by | User stories |
| --- | --------------------------------------------------------- | ---- | ---------- | ------------ |
| 1   | Ship liquid ripple with the shared shader lifecycle       | AFK  | None       | 1, 6–20      |
| 2   | Add chromatic refraction                                  | AFK  | 1          | 2, 6–20      |
| 3   | Add noise dissolve reveal                                 | AFK  | 1          | 3, 6–20      |
| 4   | Add wave distortion                                       | AFK  | 1          | 4, 6–20      |
| 5   | Add liquid-metal lighting                                 | AFK  | 1          | 5, 6–20      |
| 6   | Add particle lettering that follows the mouse and reforms | AFK  | 1          | 6–25         |

Slices 2–6 need only slice 1 semantically. Their issue branches may all derive from
the completed slice-1 branch, as allowed by the dependency graph; combine them on
the PRD integration branch according to the repository workflow. Do not mark them
as blocked by one another solely to impose an artificial sequence.

## 1. Ship liquid ripple with the shared shader lifecycle

### What to build

Deliver the first usable ShaderHeroText component: a liquid ripple that resolves
to crisp HTML, including the reusable renderer, font/layout texture pipeline,
motion preferences, error fallback, timing/replay contract, and distribution.

### Acceptance criteria

- [ ] Typed component exports and a clean registry install render a real liquid ripple.
- [ ] SSR/no-JavaScript, unsupported WebGL, shader failure and reduced motion leave readable text.
- [ ] Accessible heading is announced once; selection, copying and keyboard replay work.
- [ ] Font loading, resizing and wrapped/multiline text do not create a handoff jump.
- [ ] Offscreen/hidden work suspends; unmount cleans up; context loss restores HTML.
- [ ] Real-browser intermediate/final frames prove rendering, with deterministic fixtures.
- [ ] Light/dark, mobile, RTL, zoom, forced colors and typography limitations are documented and checked.
- [ ] Docs, showcase, Storybook, registry, package and relevant test/check surfaces are complete.
- [ ] Existing HeroTextAnimation contracts and registry dependencies remain unchanged.

## 2. Add chromatic refraction

### What to build

Add a prismatic edge treatment that smoothly separates and reunites the text's
color samples while a controlled distortion band crosses the headline.

### Acceptance criteria

- [ ] `chromatic-refraction` is available in types, docs and effect controls.
- [ ] Intermediate frames show colored edge separation distinct from liquid ripple.
- [ ] Final output is crisp foreground text with no persistent misregistration.
- [ ] No flashing; themes, reduced motion, timing and replay use the shared contract.
- [ ] Example, Storybook, registry, real-browser visual and behavior checks ship together.

## 3. Add noise dissolve reveal

### What to build

Assemble glyphs through a seeded organic noise mask and a narrow highlighted
boundary, resolving the full message by the end of the bounded reveal.

### Acceptance criteria

- [ ] `noise-dissolve` is available in types, docs and effect controls.
- [ ] Seeded intermediate frames reproduce the same organic reveal pattern.
- [ ] Every glyph fully resolves, including punctuation, counters and multiline text.
- [ ] No particle system or additional rendering passes are required.
- [ ] Example, Storybook, registry, fallback and real-WebGL checks ship together.

## 4. Add wave distortion

### What to build

Pass a coherent broad wave through text, creating a fabric-like bend that decays
to the original baseline and letter shapes.

### Acceptance criteria

- [ ] `wave-distortion` is available in types, docs and effect controls.
- [ ] Visual motion is directional and visibly distinct from the radial ripple.
- [ ] Displacement remains inside documented padding and creates no mobile overflow.
- [ ] Final output has no residual wobble, baseline shift or clipped ascenders/descenders.
- [ ] Example, Storybook, registry, responsive and real-WebGL checks ship together.

## 5. Add liquid-metal lighting

### What to build

Move warped reflective bands across the interiors and edges of the letters,
then settle into readable foreground text using the same bounded lifecycle.

### Acceptance criteria

- [ ] `liquid-metal` is available in types, docs and effect controls.
- [ ] Letter interiors show a reflective material distinct from a flat gradient wipe.
- [ ] Highlights remain masked to glyphs, respect theme tokens and avoid flashing.
- [ ] Light/dark final states remain crisp; fallback does not depend on shader shading.
- [ ] All five examples are discoverable with replay, reduced-motion and theme controls.
- [ ] Example, Storybook, registry, visual checks and documented rendering observations ship together.

## 6. Add particle lettering that follows the mouse and reforms

### What to build

Add `particle-follow`: the headline is drawn from individual dots sampled from its
text mask. Mouse movement inside the stable heading wrapper attracts the cloud
to the pointer with a soft lag and small seeded offsets. On pointer exit each dot
returns to its original home, reforming the same dotted letters. Reuse slice 1's
font/mask, semantic fallback, registry and lifecycle foundation with a point renderer.

### Acceptance criteria

- [ ] Particle follow is exported, documented and selectable alongside the other five effects.
- [ ] Dots themselves form readable letters at rest; the effect is not a particle background.
- [ ] Actual mouse movement attracts the cloud toward successive pointer positions rather than repelling it.
- [ ] Pointer exit restores each dot to its home within the bounded return duration; zero duration resets immediately.
- [ ] Rapid re-entry resumes from current positions without teleporting or duplicating particles.
- [ ] A stationary target and completed return stop frame scheduling; there is no idle jitter or ambient loop.
- [ ] Pointer cancellation, window blur, hidden/offscreen transitions and unmount stop or release following safely.
- [ ] Scroll, resize, font and copy changes keep coordinates and newly formed lettering aligned.
- [ ] Touch scrolling and text selection work normally; reduced motion and touch defaults show static HTML.
- [ ] Point counts, mask sampling, device point sizes and spring time steps are bounded; context failure restores HTML.
- [ ] Trigger/active, replay reset, start/complete and cancellation semantics match the PRD's interactive lifecycle.
- [ ] Real-browser formed/following/returning captures and pointer-driven tests verify the complete interaction.
- [ ] Pure spring tests verify bounded integration/convergence; axe, SSR/hydration and consumer smoke checks pass.
- [ ] Showcase, Storybook, registry metadata and docs ship together, making all six effects discoverable.
