# Steps Component Spec

Status: Approved through GitHub PRD #349.

Package target: `@dethink/components`.

## Summary

Steps is a P1 navigation component for branching multi-step workflows. It
renders consumer-owned item data as an accessible ordered process indicator,
preserves the current item while next and future items change, and supports
horizontal and vertical presentation, optional navigation, percentage
progress, custom content, and reduced-motion-safe Motion choreography.

## Public Contract

- `Steps`
- `StepsProps<TData>`
- `StepItemData<TData>`
- `StepRenderState`
- `StepStatus`
- `StepsOrientation`
- `StepsSize`
- `StepsMotionPreset`

Items require a stable unique `id` and visible `label`. Optional fields cover
description, icon, disabled, optional, status override, and typed domain data.
The root supports controlled and uncontrolled current state.

## Behavioral Invariants

- Consumers own conditional branch calculation and replace next/future items
  through the `items` array.
- The current ID remains present during branch changes. Removing it is an
  unsupported programming error and never selects a fallback.
- Status derives from current position unless an exceptional item override is
  supplied.
- Navigation is opt-in and any enabled item may be activated.
- Default progress is current ordinal divided by visible item count; explicit
  progress can replace the derived value.
- Custom rendering cannot replace component-owned list, current, activation,
  status, or progress semantics.

## Accessibility

- The process is an ordered list with one list item per visible step.
- Exactly one enabled or static step surface exposes `aria-current="step"`.
- Interactive steps use native buttons and natural document tab order.
- Status and progress are readable without relying on color or motion.
- Horizontal overflow, RTL, 200% zoom, reduced motion, and visible focus are
  part of acceptance.

## Styling and Motion

Use Tailwind CSS v4 utilities, semantic tokens, logical properties, static
class maps, and data attributes. Motion is limited to keyed future-branch
presence, surviving-item layout, a namespaced current marker, and transform-
based progress. The first render and reduced-motion path are static.
