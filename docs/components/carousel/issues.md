# Carousel implementation issues

Tracer-bullet vertical slices for PRD [#439](https://github.com/parveshh/dethink-components/issues/439). Each slice cuts through component code, styles, registry, stories, tests, and docs, and stacks on the previous one.

## Slice 1 — Flat core + skeleton ([#440](https://github.com/parveshh/dethink-components/issues/440))

Compound API (`Carousel`, `CarouselContent`, `CarouselItem`, `CarouselPrevious`, `CarouselNext`, `CarouselDots`) and `useCarousel()` wired through React Context. Single `offset` MotionValue mirrored to `--carousel-offset`. Flat centered slider: pointer drag with momentum + spring snap, previous/next (disabled at bounds, no loop), dots with `aria-current`, arrow-key navigation. Full APG accessibility, controlled/uncontrolled index with once-per-settle `onIndexChange`, SSR resting pose, hydration-gated reduced motion. Pure math module, barrel + package export, registry item, `--carousel-*` base tokens, base stories, all five test files, local docs. `align` is center-only.

Blocked by: none.

## Slice 2 — Tilt staging ([#441](https://github.com/parveshh/dethink-components/issues/441))

`[data-staging="tilt"]` distance-driven `rotateY`/`translateZ`/scale with far-plateau clamp. `intensity` prop wired to inline CSS-var multipliers. Item-level aria-hidden contact-shadow node. Reduced motion flattens tilt to the flat pose. Tilt + intensity stories and tests.

Blocked by: [#440](https://github.com/parveshh/dethink-components/issues/440).

## Slice 3 — Floor scene ([#442](https://github.com/parveshh/dethink-components/issues/442))

Shared-vanishing-point `perspective` + downward origin on the viewport, `rotateX` track with `preserve-3d`, cards standing on `transform-origin: 50% 100%`, floor-only depth blur (≤3px, 0 at `intensity="subtle"`), ground-plane contact shadows with light/dark tokens. 3D guards (no filter/containment on track, `overflow-x: clip; overflow-y: visible` + block padding, `backface-visibility: hidden` + `translateZ(0)`). Reduced motion flattens floor. FloorGallery (hero) + DarkMode stories, floor tests.

Blocked by: [#441](https://github.com/parveshh/dethink-components/issues/441).

## Slice 4 — Polish ([#443](https://github.com/parveshh/dethink-components/issues/443))

RTL (`--carousel-dir`, drag sign, arrow mapping, chevron flip), density, `inert` edge cases, Playwright drag e2e (WebKit) or documented gap, `design-qa.md`, docs finalization, remaining stories (GenericContent, MarketingCards, RTL, Density, WithAuroraBackground). Final PR targets the PRD branch.

Blocked by: [#442](https://github.com/parveshh/dethink-components/issues/442).
