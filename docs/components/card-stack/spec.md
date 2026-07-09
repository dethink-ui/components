# CardStack Component Spec

GitHub PRD: https://github.com/parveshh/dethink-components/issues/71

CardStack is an interactive composition component for presenting direct Card
children as a visual deck. Card remains a static surface primitive; CardStack
owns active index state, deck transforms, arrow navigation, click-to-front
behavior, and inactive-card accessibility.

## Public Contract

- `CardStack` accepts direct `Card` children. Arrays produced by mapping Card
  elements are supported. Direct fragments, wrappers, strings, and non-Card
  elements are out of scope for v1.
- `mode` is `"stack"` or `"open"` and defaults to `"stack"`.
- `activeIndex`, `defaultActiveIndex`, and `onActiveIndexChange` provide
  controlled and uncontrolled active-card state.
- `loop` defaults to `true`. When false, previous/next navigation stops at the
  first and last card and controls disable at the boundaries.
- `angle` defaults to `15` and controls neighboring-card rotation in open mode.
- `stackOffset` defaults to `8` and controls visual depth in stack mode.
- `showControls` defaults to true in stack mode when there is more than one card
  and false in open mode.
- `showPreviousControl` and `showNextControl` default to `showControls` and toggle
  each arrow control independently, so the previous or next icon button can be
  hidden on its own.
- `previousLabel` and `nextLabel` provide accessible names for arrow controls.

## Behavior

- The root renders a stable `data-slot="card-stack"` element with `data-mode`,
  `data-loop`, `data-count`, and `data-active-index`.
- The root is keyboard-focusable when there is more than one card. ArrowLeft and
  ArrowUp activate the previous card. ArrowRight and ArrowDown activate the next
  card. Home and End activate the first and last card.
- In stack mode, the active card is topmost. Other cards layer behind with
  capped depth, translate, rotate, scale, opacity, and z-index values.
- In open mode, every card is visible as a fanned hand around the active card.
  Clicking an inactive card activates it.
- Inactive cards are visually present but inert and `aria-hidden`. Only the
  active card exposes nested controls to keyboard users and assistive
  technology.
- The implementation uses Tailwind CSS utilities, CSS variables, individual CSS
  transform properties, `motion-safe` transitions, and reduced-motion fallbacks.
  It does not add Motion, Framer Motion, drag, swipe, or physics behavior.

## Testing Seams

- Render tests cover defaults, direct-child validation, mapped Card arrays,
  controlled/uncontrolled state, loop behavior, controls, keyboard navigation,
  open-mode click-to-front, inactive `inert` and `aria-hidden`, refs, class
  merging, and empty/single-card behavior.
- Accessibility tests cover axe smoke, named controls, active-only nested
  controls, and no carousel/widget role.
- SSR tests cover server markup and hydration without mismatch warnings.
- Storybook covers base stack, open fan mode, angle tuning, controlled state,
  dark mode, density, RTL, and cards with media/icons.
- Registry and playground smoke checks verify package exports and registry
  metadata.
