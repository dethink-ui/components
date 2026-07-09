# Tabs Component PRD

Status: Published to GitHub issue tracker.

Tracker issue: https://github.com/parveshh/dethink-components/issues/328.

Package target: `@dethink/components`.

## Branch Workflow

Branch names follow the repository workflow in `AGENTS.md`:

1. `feature/prd-328-tabs`
2. `feature/issue-329-tabs-contract-docs`
3. `feature/issue-330-tabs-core-primitive`
4. `feature/issue-331-tabs-animated-active-layer`
5. `feature/issue-332-tabs-docs-registry`
6. `feature/issue-333-tabs-verification`

Create the PRD branch from the current integration base. Stack each issue
branch from the previous issue branch unless the GitHub issue dependency graph
says otherwise. The final implementation PR should target the PRD branch, not
the repository default branch, unless explicitly requested.

## Problem Statement

Teams building production dashboards, internal tools, B2B applications,
settings pages, and AI-native React interfaces need a first-class Tabs
component. The source product PRD lists Tabs as a P0 disclosure component and
as a navigation pattern for settings workflows, but the package does not yet
provide tab semantics, roving focus, token-backed variants, Motion active-layer
polish, registry metadata, or tests.

Consumers currently need to rebuild ARIA tablist behavior, disabled state,
panel visibility, reduced-motion handling, and moving active backgrounds
themselves.

## Solution

Ship a `Tabs` component family with `Tabs`, `TabsList`, `TabsTrigger`, and
`TabsPanel`. It implements the WAI-ARIA Tabs pattern with controlled and
uncontrolled value state, horizontal and vertical orientation, automatic and
manual activation, disabled root/trigger state, force-mounted panels, `pill`
and `line` variants, `sm`/`md`/`lg` sizing, and
`motionPreset="none" | "subtle" | "standard" | "expressive"`.

The selected trigger renders a decorative active layer. When motion is enabled,
the layer uses Motion shared layout animation so the active background glides
from the previous tab to the new tab. Under reduced motion or
`motionPreset="none"`, the same layer renders statically. Semantic state stays
on `aria-selected`, `aria-controls`, `aria-labelledby`, hidden panels, roving
tabindex, and keyboard behavior.

## User Stories

1. As a dashboard engineer, I want a Tabs component, so that dense sections can share one surface.
2. As a settings-page builder, I want tabbed panels, so that account, billing, members, and security sections stay organized.
3. As a package consumer, I want controlled and uncontrolled value state, so that simple and app-owned flows are both supported.
4. As a keyboard user, I want arrow-key navigation, Home, End, and manual activation support, so that tabs are efficient without pointer input.
5. As an RTL user, I want horizontal arrow behavior to respect direction, so that keyboard movement matches reading order.
6. As a screen-reader user, I want labelled tablists and associated panels, so that the current section is understandable.
7. As a designer, I want a pill variant with a moving active background, so that switching from Tab 1 to Tab 5 feels spatially clear.
8. As a motion-sensitive user, I want reduced-motion behavior respected, so that decorative movement collapses to static state.
9. As a registry consumer, I want accurate `motion` and `dethink-base` metadata, so that copied source installs cleanly.
10. As a maintainer, I want route tabs, closable tabs, overflow menus, lazy loading, and panel choreography excluded from v1, so that the component stays focused.

## Implementation Decisions

- Build a custom APG-compatible primitive because installed `react-aria-components@1.19.0` does not expose Tabs components.
- Use native `button` triggers with `role="tab"` and explicit tablist/panel ARIA wiring.
- Expose named components and compound aliases on `Tabs`.
- Default to horizontal orientation, automatic activation, looping keyboard navigation, `pill` variant, `md` size, and `standard` motion.
- Use Motion from `motion/react` for the active layer only.
- Keep the active layer decorative with `aria-hidden`; selected state must remain semantic and visible without motion.
- Use `MotionConfig` and `useReducedMotion`; render a static layer under reduced motion and expose `data-reduced-motion`.
- Use provider-level semantic tokens, density utilities, dark mode, RTL-safe spacing, and static Tailwind class maps.
- Do not add route integration, lazy loading, panel animation APIs, component-level theme props, Radix, or CSS-in-JS.

## Testing Decisions

- Render tests cover controlled/uncontrolled value, defaults, className/ref composition, disabled state, variants, sizes, force-mounted panels, and data hooks.
- Keyboard tests cover arrows, Home/End, manual activation, disabled skipping, loop boundaries, vertical orientation, and RTL.
- Motion tests cover selected-only active layer, motion presets, static reduced-motion path, and reduced-motion data hooks.
- Accessibility tests cover labelled tablists, tab/panel ARIA relationships, hidden inactive panels, disabled state, vertical orientation, and axe smoke.
- SSR tests cover server markup and hydration without mismatch warnings.
- Registry smoke verifies metadata, copied files, relative imports, package exports, Motion dependency, and tokenized/reduced-motion source hooks.

## Out of Scope

- Router/link tabs, route prefetching, and framework router adapters.
- Closable/editable tabs, drag reordering, overflow menus, dynamic creation/deletion, and collapse-to-select behavior.
- Async/lazy panel loading, Suspense orchestration, data fetching, URL syncing, persistence, and analytics tracking.
- Panel crossfade/slide/presence choreography.
- Component-level theme props, CSS-in-JS, Radix, custom overlay systems, and runtime-generated Tailwind classes.

## Further Notes

- Modern Web Guidance confirmed ARIA state must match actual behavior, visible focus must remain, hidden interactive content must not be exposed, and reduced motion must be respected.
- Context7 Motion docs confirmed `layoutId` for shared-layout tab indicators, `MotionConfig` for reduced-motion handling, and `useReducedMotion` for conditional behavior.
