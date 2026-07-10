# Steps Component Spec

Status: Approved through GitHub PRD #349 and workflow extension PRD #360.

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
- `useStepsState<TData>` and `UseStepsStateOptions<TData>`
- `StepsProvider` and `StepsState<TData>`
- `useSteps<TData>`, `useCurrentStep<TData>`, and `useNextSteps<TData>`
- `StepsPanel<TData>` and `StepsPanelRenderContext<TData>`

Items require a stable unique `id` and visible `label`. Optional fields cover
description, icon, disabled, optional, status override, and typed domain data.
The root supports controlled and uncontrolled current state.

The optional controller supports controlled or uncontrolled item collections
and current value. It exposes a `stepsProps` adapter for the visual component.
Provider hooks expose the full workflow, focused current metadata, or the next
suffix with add, insert, remove, replace, and clear operations. `StepsPanel`
passes the resolved current step to a consumer-owned render callback.

`orientation="horizontal" | "vertical"` and `size="sm" | "md" | "lg"`
control layout and scale. `showProgress` enables the progressbar,
`progressValue` overrides ordinal progress, and `formatProgress` customizes its
visible and accessible text. `renderItem` receives typed item data plus resolved
index, count, current, disabled, optional, orientation, size, status, and
percentage state.

## Behavioral Invariants

- Consumers own conditional branch calculation and replace next/future items
  through the `items` array.
- Controller mutations operate only after the current index, reject duplicate
  IDs and invalid indices, and leave controlled arrays parent-owned.
- The same provider state drives the indicator, current and future hooks, and
  panel renderer.
- Panel data uses a consumer-defined key/payload; `renderItem` remains scoped
  to indicator content.
- The current ID remains present during branch changes. Removing it is an
  unsupported programming error and never selects a fallback.
- Status derives from current position unless an exceptional item override is
  supplied.
- Navigation is opt-in and any enabled item may be activated.
- Interactive items are native buttons in natural document tab order. Disabled
  items remain visible and cannot request a value change.
- Duplicate IDs and a missing current ID produce development diagnostics.
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
- The progressbar is named from the process label, clamps values to 0–100, and
  exposes visible text plus `aria-valuenow`/`aria-valuetext`.

## Styling and Motion

Use Tailwind CSS v4 utilities, semantic tokens, logical properties, static
class maps, and data attributes. Motion is limited to keyed future-branch
presence, surviving-item layout, a namespaced current marker, and transform-
based progress. The first render and reduced-motion path are static.

`motionPreset="none" | "subtle" | "standard" | "expressive"` controls the
high-level choreography and defaults to `standard`. Presence uses stable item
IDs, surviving items animate position only, and each Steps instance namespaces
its shared current-marker layout ID. `MotionConfig` and `useReducedMotion`
ensure a user preference or the `none` preset applies the completed visual
state immediately without changing status, progress, or current-step semantics.

Horizontal layouts use safe inline overflow instead of silently changing
orientation. Vertical rails use logical inline-start positioning so RTL does
not require a second DOM order.
