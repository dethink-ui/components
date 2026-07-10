# Dynamic Branching Steps Component PRD

Status: Published to GitHub issue tracker.

Tracker issue: https://github.com/parveshh/dethink-components/issues/349

Workflow API extension:
https://github.com/parveshh/dethink-components/issues/360

Package target: `@dethink/components`.

## Problem Statement

Production SaaS workflows need a reusable process indicator that can change
its next and future steps when an answer changes. The package has no component
that combines that data contract with current-step semantics, optional
navigation, progress, responsive layouts, Motion, registry installation, and
public-behavior tests.

## Solution

Ship a data-driven Steps component. Consumers can pass keyed item data directly
or use an optional headless controller and provider to share the same branch
and current ID across indicators, controls, and dynamic panels. Steps preserves
the current item, derives status and progress, renders horizontal or vertical
ordered-list content, optionally activates enabled items, and animates only
high-level branch changes while respecting reduced motion.

## Implementation Decisions

- The original prop-driven `items` API remains consumer-owned and unchanged.
- An optional `useStepsState` controller provides guarded future-suffix
  mutations through `useNextSteps`; it never mutates the current prefix.
- `StepsProvider`, `useSteps`, and `useCurrentStep` share visible collection and
  current metadata without coupling the visual indicator to workflow content.
- `StepsPanel` resolves the current step through a consumer-owned typed panel
  registry and adds no tab semantics.
- Stable unique IDs for state and animation identity.
- Controlled and uncontrolled current state.
- Derived status with complete, upcoming, error, and skipped overrides.
- Optional native-button navigation; validation stays consumer-owned.
- Conditional branch replacement is demonstrated by changing only the next and
  future item IDs while the current ID remains present.
- Component-owned semantics around an optional typed `renderItem` callback.
- Ordinal progress with an explicit override.
- Explicit horizontal/vertical layouts, three sizes, safe horizontal overflow,
  logical RTL placement, and component-owned semantics around custom content.
- Motion through `motion/react`, with a static SSR and reduced-motion path.
- Tailwind CSS v4, semantic tokens, registry dependency on `dethink-base`, and
  a declared `motion` runtime dependency.

## Testing Decisions

Test the public component seam: item/state rendering, branch replacement,
navigation, progress, orientation, custom rendering, Motion data hooks,
accessibility, SSR/hydration, Storybook interaction, registry installation,
package build, and TypeScript declarations.

## Out of Scope

Component-authored panels, answer validation, built-in workflow controls,
branch rules, persistence, router synchronization, async orchestration, drag
reordering, and current-step removal. `StepsPanel` is only a typed render bridge
to content owned by the consumer.
