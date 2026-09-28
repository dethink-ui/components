---
format: 1920x1080
duration: 30s
message: "80+ production-ready React components. Copy, paste, ship."
arc: Feature-Benefit Cascade (blitz) — hook → brand promise → component blitz → effects blitz → stat proof → copy-paste mechanism → wall reveal → CTA
audience: React / SaaS developers and design engineers
mode: autonomous
music: driving energetic electronic tech promo, punchy drums, 128 bpm, confident, no vocals
---

## Video direction

- **palette system** (frame.md): ground = ink-black #071D1C (dark register) with ink-black-alt #0B312D for depth panels; text = cream #DEEBE9, muted #8FA6A2; the single accent = lime #B6F06B ("fire-orange" role). Lime register (lime ground, ink text) is used ONLY on frames 2 and 8 — the two brand declarations. Captured UI plates keep their own mint #55D7BE accents; present them as floating plates, 12px radius, 1px #1B3236 border, soft drop shadow into the ground (the one sanctioned exception to the flat plane).
- **type**: display ramp = Manrope 800, lowercase, negative tracking, massive (display role ~13cqw); chrome = JetBrains Mono uppercase 0.14em labels ("/ DATA TABLE", "/ 01"). One statement per beat.
- **motion grammar**: FAST. This is a beat-cut promo on a 128 bpm grid (one beat ≈ 0.47s). Entrances are expo.out / power4.out fast arrivals (≤0.35s), settle smooth — no bounce, no elastic. Cuts inside frames are velocity-matched (cut-the-curve / zoom-through, `cut-catalog.md`) with motion-blur streaks on fly-ins (`motion-blur-streak`). No narration — reveals are paced to the BEAT GRID instead of a voiceover: at most one new element per beat, never the whole canvas at t=0.
- **rhythm / holds**: frames 1, 3, 4 are max-energy (a new hit every beat). Frame 5 builds to a count-up peak. Frame 6 is the one breather (typing is slower, legible). Frame 7 is the awe pull-back. Frame 8 holds still for the last ~1.5s so the URL can be read — that final hold is deliberate.
- **persistent chrome**: a thin mono top-left tag "DETHINK / COMPONENTS" and top-right frame counter "0N / 08" appear on dark frames 1, 3, 5, 6 only (suppressed on declarative frames 2, 4, 7, 8).
- **negative list**: no bouncy/elastic eases; no lazy breathing or back-half slow drift; no infinite loops / repeat / yoyo; no Math.random; no purple/blue AI gradients or bokeh; no browser chrome or cursors except the frame-6 terminal; no slideshow (front-load then freeze); no screensaver (everything floating independently). Keep key content in the top ~83% (captions are off, but keep the bottom band calm).

## Frame 1 — Stop rebuilding

- scene: Massive lowercase words slam in one per beat — "stop" / "rebuilding" / "the same UI." — while ghosted button variants flicker behind
- voiceover: ""
- duration: 3s
- transition_in: cut
- status: animated
- src: compositions/frames/01-stop-rebuilding.html
- type: hook
- persuasion: Pain validation
- beat: frustration → curiosity
- blueprint: kinetic-type-beats
- asset_candidates: assets/ui-button.png — button variants row (Solid, Soft, Outline, Ghost, Link, Destructive)

- focal: assets/ui-button.png
- roles: ui-button = background (dim ~25%, oversized, blurred, flickers between offsets on each beat)
- sfx: impact-bass-1, glitch-1, whoosh-short

Adapt (kinetic-type-beats): keep the hard-cut word-swap signature; three beats then a slam payoff.
Scene 1 (0.0–0.9s): dark ground; oversized button-variants plate sits huge behind, dim ~25%, slightly blurred and tilted. "stop" slams in dead-centre at display scale (kinetic beat-slam → `kinetic-beat-slam`), impact on the downbeat. Centered, type ~70% width.
Scene 2 (0.9–1.9s): hard-cut word-swap (`discrete-text-sequence`) → "rebuilding" (fills the width); the background plate jump-cuts to a new offset and scale on the same beat (a glitch flicker `glitch-1`).
Scene 3 (1.9–3.0s): swap → "the same UI." on two lines, "UI." in lime; three stacked ghost copies of the line stutter behind it (echo) then collapse into the one line; hold ~0.4s with subtle jitter. Mono chrome tag "/ 01" top-right.

narrativeRole: Name the pain every product engineer knows in three hard beats.
keyMessage: You keep rebuilding the same UI.

## Frame 2 — Own the components

- scene: Lime register floods the frame; the Dethink mark assembles from its three angular pieces, wordmark snaps beside it, then "build interfaces. own the components." punches in
- voiceover: ""
- duration: 3.5s
- transition_in: zoom-through
- status: animated
- src: compositions/frames/02-own-the-components.html
- type: product_intro
- persuasion: Category announcement
- beat: relief + power
- blueprint: logo-assemble-lockup
- asset_candidates: assets/logo-da14f826.svg — the Dethink brand mark (angular d glyph)

- focal: assets/logo-da14f826.svg
- roles: logo-da14f826 = cutout (inline SVG, fill ink #071D1C on the lime ground)
- sfx: whoosh-cinematic, impact-bass-2

Reproduce (logo-assemble-lockup): the signature is the mark assembling from its pieces into the lockup.
Scene 1 (0.0–1.2s): lime ground floods in (zoom-through arrival). The Dethink mark's three angular path pieces fly in from three directions with motion-blur streaks and lock together at left-of-centre (`depth-scatter-assemble` in its assemble half); impact on the lock.
Scene 2 (1.2–1.9s): wordmark "dethink" (Manrope 800, ink) wipes out from behind the mark to its right; a thin ink vertical rule + mono "COMPONENTS" label snaps in after it. Lockup sits upper-third, ~45% width.
Scene 3 (1.9–3.5s): lockup scale-swaps up and out (`scale-swap-transition`) as the headline arrives centered on two beats: "build interfaces." then "own the components." (second line heavier, ink). Hold still ~0.8s.

narrativeRole: Deliver the promise by beat 2 — the answer is Dethink, and you own the code.
keyMessage: Dethink Components — build interfaces, own the components.

## Frame 3 — Component blitz

- scene: Rapid-fire UI plates on the dark ground, one every ~0.6s on the beat — data table, command palette, calendar, chat, sidebar shell, timeline, slot planner — each with a mono label chip; tilt and slam in, previous plate punches back
- voiceover: ""
- duration: 5s
- transition_in: push-slide LEFT
- status: animated
- src: compositions/frames/03-component-blitz.html
- type: feature_showcase
- persuasion: Show-don't-tell proof
- beat: excitement
- blueprint: grid-card-assemble
- asset_candidates: assets/ui-data-table.png — deployments data table; assets/ui-command-palette.png — command palette; assets/ui-calendar.png — month calendar; assets/ui-chat.png — AI chat conversation; assets/ui-sidebar-shell.png — app shell with sidebar; assets/ui-timeline.png — status timeline; assets/ui-slot-planner.png — week slot planner

- focal: assets/ui-data-table.png
- roles: all seven = cutout plates (one hero at a time); ui-data-table first and largest
- sfx: whoosh-short, click, whoosh, click, whoosh-short

Adapt (grid-card-assemble): keep the card-assemble signature, but as a rapid stacking blitz that ends in the assembled grid.
Scene 1 (0.0–0.7s): dark ground with a faint 1px hairline grid. Data-table plate slams in from the right with a motion-blur streak, tilted ~-6° in 3D, settling to centre (~60% width). Mono chip "/ DATA TABLE" pops beside its top-left corner.
Scene 2 (0.7–3.5s): on every beat (~0.47s) the next plate — command palette, calendar, chat, sidebar shell, timeline, slot planner — slams in from alternating sides (cut-the-curve, `cut-catalog.md`) and the previous plate is punched back in Z (scaled down ~20%, dimmed, pushed to a side slot). Each carries its own mono chip label. Never more than one arrival per beat.
Scene 3 (3.5–5.0s): the stack snaps into an assembled 4+3 asymmetric grid of all seven plates (`center-outward-expansion`) with lime hairlines between; a lowercase h1 "real ui. real products." slams across the grid centre on a dark band; hold ~0.6s with subtle jitter.

narrativeRole: Prove breadth for real product surfaces — dashboards, tools, AI.
keyMessage: Real, production-grade SaaS components.

## Frame 4 — Motion included

- scene: Full-bleed hard cuts through the animated effect backgrounds — aurora, liquid mesh, orbital glow, starfield, magnetic beams, dot matrix — with a giant "motion included." type lockup riding over them
- voiceover: ""
- duration: 4s
- transition_in: zoom-through
- status: animated
- src: compositions/frames/04-motion-included.html
- type: benefit_highlight
- persuasion: Value stacking
- beat: awe
- asset_candidates: assets/ui-aurora-background.png — aurora gradient hero; assets/ui-liquid-mesh-background.png — liquid mesh hero; assets/ui-orbital-glow-background.png — orbital glow hero; assets/ui-starfield-background.png — starfield hero; assets/ui-magnetic-beams-background.png — grid beams hero; assets/ui-dot-matrix-background.png — dot matrix hero

- focal: assets/ui-aurora-background.png
- roles: all six = background (full-bleed, one at a time, not dimmed more than ~15%)
- sfx: riser, whoosh-cinematic, impact-bass-1

Compose: full-bleed effects montage under one type lockup.
Scene 1 (0.0–2.4s): full-bleed hard cuts on each beat through the effect captures — aurora → liquid mesh → orbital glow → starfield → magnetic beams → dot matrix — each cropped to fill the frame, each with a quick scale punch-in (1.08→1.0) on its cut. A riser builds underneath.
Scene 2 (0.6–2.4s, overlapping): giant lowercase "motion" builds letter-by-letter (per-char reveal, `dynamic-content-sequencing`) centred in cream with a soft dark shadow for legibility; mono "/ EFFECTS & BACKGROUNDS" above it.
Scene 3 (2.4–4.0s): on the downbeat "included." slams under "motion" in lime; the background freezes on the aurora capture and dims ~40% so the lockup reads; hold still.

narrativeRole: Escalate from functional to spectacular — landing-page effects ship too.
keyMessage: Hero effects and motion come in the box.

## Frame 5 — The numbers

- scene: Three stats count up on the beat in massive type — 80+ components · 24 recipes · 1 command — lime accent on each value, mono labels beneath
- voiceover: ""
- duration: 3.5s
- transition_in: squeeze
- status: animated
- src: compositions/frames/05-the-numbers.html
- type: benefit_highlight
- persuasion: Statistical proof + rule of three
- beat: confidence
- blueprint: dataviz-countup
- asset_candidates:

- focal: (typography only)
- roles: none
- sfx: click-soft, click-soft, impact-bass-2

Reproduce (dataviz-countup): value-scaled counters on a triptych.
Scene 1 (0.0–1.2s): dark ground; triptych of three columns separated by 1px hairlines. Column 1: "80+" counts up 0→80 (`counting-dynamic-scale`) at stat-value scale in lime, mono label "COMPONENTS" beneath. Nothing else on screen yet.
Scene 2 (1.2–2.2s): column 2 reveals on the next beat: "24" counts up, label "RECIPES".
Scene 3 (2.2–3.5s): column 3 slams in: "1" (no count, just a heavy slam + impact), label "COMMAND"; a lime underline draws under all three (`svg-path-draw`); hold still ~0.8s.

narrativeRole: Put hard numbers on the breadth just shown.
keyMessage: 80+ components, 24 recipes, one command.

## Frame 6 — One command

- scene: A code-surface terminal types `npx shadcn@latest add @dethink/data-table`, enter flashes, and the data table plate springs out of the terminal full-size — "copy. paste. ship." tags in
- voiceover: ""
- duration: 4s
- transition_in: crossfade
- status: animated
- src: compositions/frames/06-one-command.html
- type: feature_showcase
- persuasion: Friction reduction
- beat: ease + control
- blueprint: prompt-type-submit-generate
- asset_candidates: assets/ui-data-table.png — deployments data table

- focal: assets/ui-data-table.png
- roles: ui-data-table = cutout (springs out of the terminal)
- sfx: typing, key-press, whoosh, pop

Adapt (prompt-type-submit-generate): the prompt is a terminal; the "generation" is the component appearing.
Scene 1 (0.0–1.8s): centred terminal card (code surface #05171B, 1px #1B3236 border, three muted dots, mono "~/my-app" title) ~55% width. Command types on with caret (`discrete-text-sequence`): `npx shadcn@latest add @dethink/data-table` — "@dethink/data-table" in lime. Camera holds still.
Scene 2 (1.8–2.4s): enter press — the terminal compresses (`press-release-spring`), a "✓ Added components/ui/data-table.tsx" line prints in mint.
Scene 3 (2.4–4.0s): the data-table plate springs up out of the terminal (card morph-anchor, `card-morph-anchor`) to ~70% width, terminal sinks behind it dimmed; mono tags "OPEN CODE · YOU OWN IT" pop under it on the next beat; hold.

narrativeRole: Show the mechanism — shadcn registry, open code you own.
keyMessage: One command copies real source into your app.

## Frame 7 — The wall

- scene: Camera starts tight on one plate then pulls back fast to reveal a tilted mosaic wall of 16 component plates, drifting in parallax; "copy. paste. ship." locks centre
- voiceover: ""
- duration: 3.5s
- transition_in: zoom-through
- status: animated
- src: compositions/frames/07-the-wall.html
- type: benefit_highlight
- persuasion: Value stacking
- beat: awe → FOMO
- blueprint: zoom-out-workspace-reveal
- asset_candidates: assets/ui-carousel.png — kinetic carousel; assets/ui-hero-text-animation.png — hero text animation; assets/ui-card-stack.png — card stack; assets/ui-file-upload.png — file upload; assets/ui-slider.png — vertical sliders; assets/ui-tabs.png — tabs; assets/ui-avatar-group.png — avatar groups; assets/ui-multi-select.png — multi-select; assets/ui-voice-input.png — voice input; assets/ui-date-range-picker.png — date range picker; assets/ui-shader-hero-text.png — particle text (light); assets/ui-aurora-background.png — aurora hero; assets/ui-command-palette.png — command palette; assets/ui-calendar.png — calendar; assets/ui-chat.png — chat; assets/ui-timeline.png — timeline

- focal: assets/ui-carousel.png
- roles: ui-carousel = cutout (the start of the pull-back); the other fifteen = supporting tiles of the wall
- sfx: whoosh-cinematic, impact-bass-1

Reproduce (zoom-out-workspace-reveal): signature is the fast pull-back from one tile to the whole wall.
Scene 1 (0.0–0.5s): tight on the carousel plate filling the frame.
Scene 2 (0.5–1.8s): fast camera pull-back (`multi-phase-camera`, expo.out) reveals a 3D-tilted mosaic wall (~6×4 grid, rotateX ~18°, rotateZ ~-8°) of all sixteen plates; rows settle in slight parallax (alternate rows offset), finite motion only.
Scene 3 (1.8–3.5s): a dark vignette closes in; "copy. paste. ship." slams centred over the wall on three consecutive beats (one word per beat, `kinetic-beat-slam`), "ship." in lime; hold still.

narrativeRole: One overwhelming image of the whole catalog — the itch to go browse it.
keyMessage: There's a whole gallery waiting.

## Frame 8 — Explore the gallery

- scene: Lime register; "explore the gallery." slams in, a pill CTA button presses, Dethink mark + URL components.dethink.co.uk/components locks up and holds
- voiceover: ""
- duration: 3.5s
- transition_in: blur-crossfade
- status: animated
- src: compositions/frames/08-explore-the-gallery.html
- type: cta
- persuasion: Urgency-to-act
- beat: motivation
- blueprint: cta-morph-press
- asset_candidates: assets/logo-da14f826.svg — the Dethink brand mark

- focal: assets/logo-da14f826.svg
- roles: logo-da14f826 = cutout (inline SVG, ink on lime)
- sfx: whoosh-short, click, chime

Reproduce (cta-morph-press): signature is the CTA pill pressed.
Scene 1 (0.0–0.8s): lime ground; "explore the gallery." slams in at h1 scale centred (per-word reveal on two beats).
Scene 2 (0.8–1.8s): an ink pill button "browse 80+ components →" scales up beneath it, then presses (`press-release-spring`) with a ripple on the click sfx.
Scene 3 (1.8–3.5s): the pill morphs into the URL lockup: Dethink mark + "components.dethink.co.uk/components" in mono/ink, centred lower-middle (above the bottom band); hold completely still for the final ~1.5s so the URL reads. Final exit: none (video ends on the hold).

narrativeRole: Convert curiosity into a visit.
keyMessage: components.dethink.co.uk/components
