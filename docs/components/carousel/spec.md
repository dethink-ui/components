# Carousel specification

Carousel is a Motion-powered, generic-children carousel with three staging variants (`flat`, `tilt`, `floor`) tracked by PRD [#439](https://github.com/parveshh/dethink-components/issues/439) and implementation issues [#440](https://github.com/parveshh/dethink-components/issues/440), [#441](https://github.com/parveshh/dethink-components/issues/441), [#442](https://github.com/parveshh/dethink-components/issues/442), and [#443](https://github.com/parveshh/dethink-components/issues/443).

## Installation

Install `carousel` from the Dethink registry. The registry item installs the Dethink base, IconButton, and the shared class utility, and pulls Motion as its only npm dependency. Package consumers import `Carousel`, `CarouselContent`, `CarouselItem`, `CarouselPrevious`, `CarouselNext`, `CarouselDots`, `useCarousel`, the `carousel*ClassNames` helpers, and the public types from `@dethink/components`, and import `@dethink/components/styles.css` once at the application root.

## Anatomy

```tsx
<Carousel staging="floor" aria-label="Featured work">
  <CarouselContent>
    <CarouselItem>{/* any content, sized by the carousel */}</CarouselItem>
    <CarouselItem>{/* … */}</CarouselItem>
  </CarouselContent>
  <CarouselPrevious />
  <CarouselNext />
  <CarouselDots />
</Carousel>
```

- `Carousel` is the root: it owns the offset engine and state, exposes context via `useCarousel()`, establishes the query container, and carries `role="region"`, `aria-roledescription="carousel"`, and the `data-staging`/`data-intensity`/`data-reduced-motion` attributes plus the `--carousel-offset` variable.
- `CarouselContent` renders the clipping viewport (the drag and keyboard surface) and the 3D track, and provides each direct child its slide index.
- `CarouselItem` is one slide (`role="group"`, `aria-roledescription="slide"`, labeled "N of M"). It sets `--carousel-item-index`, stands on `transform-origin: 50% 100%`, and (for tilt/floor) renders an aria-hidden contact-shadow node.
- `CarouselPrevious` / `CarouselNext` wrap `IconButton`, are disabled at the bounds (no loop), never move focus, and flip their chevrons in RTL.
- `CarouselDots` renders one button per slide with `aria-current` on the active dot.

Only direct children of `CarouselContent` are treated as slides.

## API

### Carousel

| Prop            | Type                                   | Default      | Purpose                                                                   |
| --------------- | -------------------------------------- | ------------ | ------------------------------------------------------------------------- |
| `staging`       | `"flat" \| "tilt" \| "floor"`          | `"flat"`     | Visual staging: flat slider, restrained tilt, or floor-standing 3D scene. |
| `index`         | `number`                               | —            | Controlled active-slide index.                                            |
| `defaultIndex`  | `number`                               | `0`          | Initial uncontrolled active-slide index (clamped to bounds).              |
| `onIndexChange` | `(index: number) => void`              | —            | Fires exactly once when a slide settles.                                  |
| `drag`          | `boolean`                              | `true`       | Enables pointer-drag browsing with momentum.                              |
| `intensity`     | `"subtle" \| "standard" \| "dramatic"` | `"standard"` | Scales the rotate/depth/blur multipliers (≈ ×0.6 / ×1 / ×1.4).            |

The root also accepts standard `HTMLAttributes<HTMLDivElement>`. Supply an accessible name via `aria-label` or `aria-labelledby`; a development-only warning fires if neither is present. `align` is center-only in v1 and is not exposed as a prop.

### CarouselContent / CarouselItem

`CarouselContent` accepts `HTMLAttributes<HTMLDivElement>` and its slide children. `CarouselItem` accepts `HTMLAttributes<HTMLDivElement>` and arbitrary children.

### CarouselPrevious / CarouselNext / CarouselDots

`CarouselPrevious` and `CarouselNext` accept an accessible `label` (defaulting to "Previous slide" / "Next slide") and forward IconButton props. `CarouselDots` accepts an optional `label` factory for each dot's accessible name (defaulting to "Go to slide N").

### useCarousel

Returns `{ index, count, staging, canScrollPrev, canScrollNext, scrollPrev, scrollNext, scrollTo }`. Throws when called outside a `Carousel`.

## Offset engine, drag, and controls

Position is a single `offset` MotionValue in float index units, mirrored to the `--carousel-offset` CSS variable on the root. Every per-card transform is a CSS `calc()` of `--carousel-distance: calc(var(--carousel-item-index) - var(--carousel-offset))`, so the whole scene — track position, per-card rotateY/translateZ/scale/blur, and contact-shadow size/opacity — is computed in CSS from one number. Cards are absolutely centered and sized in container-query units, so the center-to-center step is a resolvable CSS length and the resting pose renders correctly on the server with zero JavaScript.

Pointer drag captures after a ~10px threshold, tracks `offset` directly, rubber-bands (~0.35 resistance) past the ends, and on release projects pointer velocity to an index target, rounds, clamps, and settles with a spring. Buttons, dots, keyboard, and controlled syncing all funnel through one `scrollTo(index)` (spring, or `offset.jump` under reduced motion). Previous/next move one logical slide and disable at the bounds; there is no loop. `onIndexChange` fires once per settle.

## Accessibility and keyboard behavior

- Give the root an accessible name with `aria-label` or `aria-labelledby`.
- The root is `role="region"` + `aria-roledescription="carousel"`; each slide is `role="group"` + `aria-roledescription="slide"` + `aria-label="{i+1} of {count}"`.
- `ArrowRight`/`ArrowLeft` on the viewport move to the next/previous slide, mapped to the writing direction in RTL. Previous/next controls and dots are separately tabbable and never move focus.
- A polite live region announces control-driven slide changes; announcements are silenced during drag so momentum browsing is not noisy.
- Fully out-of-view slides receive the `inert` attribute on settle (never per frame), so Tab never lands on a hidden slide's nested link or button. The visible radius scales with staging (flat 0, tilt 1, floor 2).
- Reduced motion flattens the 3D staging, zeroes the motion tokens, replaces the spring with an instant jump, and communicates the active-slide change with a gentle opacity crossfade.

## Responsive styling and theming

Cards are sized in container-query units against the root container, so the scene scales with available width without per-frame measurement. Spacing follows the density tokens (gap from `--dt-density-gap`); colors, borders, rings, and the contact-shadow tones use semantic theme variables, including dedicated light/dark contact-shadow tokens. Light, dark, compact/comfortable density, and RTL examples live in Storybook.

The floor scene puts a shared `perspective` and a downward `perspective-origin` on the viewport (never per-card), tilts the track on `rotateX` with `preserve-3d`, and stands cards on `transform-origin: 50% 100%`. Depth blur is floor-only, capped at ≤3px, and dropped to 0 at `intensity="subtle"`. No `filter` or containment is placed on the track (which would flatten the scene); the viewport uses `overflow-x: clip; overflow-y: visible` with generous block padding so cards translated toward the camera are not clipped; and `backface-visibility: hidden` + `translateZ(0)` guard Safari shimmer. Carousel adds a Motion runtime only for the single-number physics.

## Testing

Pure-math tests cover snap-target selection, rubber-band clamping, pixel-to-index conversion, and RTL sign. Rendered tests cover slots and data attributes per staging, controlled/uncontrolled index, once-per-settle `onIndexChange`, bounds-disabled controls, dots `aria-current`, keyboard navigation, the resting `--carousel-offset`, staging-specific shadow nodes, and `inert` behavior. Axe covers each staging; SSR tests verify a resting-pose string and warning-free hydration; motion tests verify reduced-motion jumps and zeroed tokens. Storybook provides interaction coverage across every staging, intensity, controlled usage, RTL, density, dark mode, reduced motion, nested focusables, and an Aurora-backed hero. A Playwright drag run (including WebKit) exercises the 3D scene. Registry validation, typechecking, and the Storybook build are release gates.

## Migration and limitations

Carousel is additive and changes no existing component. Use CardScroller for a selectable scroll-snap row and CardStack for a single active deck; use Carousel to browse a strip of slides with a featured center item and optional depth. Only direct children of `CarouselContent` are slides. Loop and autoplay are out of v1 (loop conflicts with the continuous distance math and "N of M" labels; autoplay's pause-control requirements belong in a future `CarouselAutoplay`). Ambient backdrops are composed with `AuroraBackground` rather than built in. `align` is center-only in v1.
