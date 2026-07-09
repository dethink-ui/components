# Dynamic Branching Steps Component PRD

Status: Published to GitHub issue tracker.

Tracker issue: https://github.com/parveshh/dethink-components/issues/349

Package target: `@dethink/components`.

## Problem Statement

Production SaaS workflows need a reusable process indicator that can change
its next and future steps when an answer changes. The package has no component
that combines that data contract with current-step semantics, optional
navigation, progress, responsive layouts, Motion, registry installation, and
public-behavior tests.

## Solution

Ship a data-driven Steps component. Consumers calculate the active branch and
pass keyed item data. Steps preserves the current item, derives status and
progress, renders horizontal or vertical ordered-list content, optionally
activates enabled items, and animates only high-level branch changes while
respecting reduced motion.

## Implementation Decisions

- Consumer-owned item arrays; no imperative mutation API.
- Stable unique IDs for state and animation identity.
- Controlled and uncontrolled current state.
- Derived status with complete, upcoming, error, and skipped overrides.
- Optional native-button navigation; validation stays consumer-owned.
- Component-owned semantics around an optional typed `renderItem` callback.
- Ordinal progress with an explicit override.
- Motion through `motion/react`, with a static SSR and reduced-motion path.
- Tailwind CSS v4, semantic tokens, registry dependency on `dethink-base`, and
  Motion dependency metadata when choreography lands.

## Testing Decisions

Test the public component seam: item/state rendering, branch replacement,
navigation, progress, orientation, custom rendering, Motion data hooks,
accessibility, SSR/hydration, Storybook interaction, registry installation,
package build, and TypeScript declarations.

## Out of Scope

Panels, answer validation, workflow controls, branch calculation, persistence,
router synchronization, async orchestration, drag reordering, and current-step
removal.
