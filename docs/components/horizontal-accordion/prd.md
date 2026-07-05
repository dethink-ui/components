# HorizontalAccordion PRD

Status: Published to GitHub issue tracker.

GitHub PRD: https://github.com/parveshh/dethink-components/issues/220

## Problem Statement

Dashboards and marketing-style product surfaces often need to present a small set of rich content sections in a fixed-height band where exactly one section is expanded at a time. The existing vertical Accordion pattern stacks content and pushes the page down, and Tabs hide the collapsed sections entirely. Product builders using Dethink Components have no component that keeps every section visible as a compact vertical "blade" while the active section expands horizontally to fill the remaining space — so they hand-roll flex hacks with inconsistent animation, broken keyboard support, and no responsive fallback on narrow containers.

A working implementation of this pattern already exists as a standalone package prototype (`@dethink/horizontal-accordion`) with a proven compound API, tabs-pattern semantics, and Motion-based active-blade choreography. It needs to be brought into the Dethink Components system as a first-class, registry-installable component with tokens, density/theme support, Storybook coverage, and the full definition of done.

## Solution

Add a `HorizontalAccordion` compound component to the component library. It renders a horizontal band of items; each item contributes a slim clickable Blade (with optional BladeIcon and BladeLabel parts) and a Panel. Activating a blade expands its panel to fill the remaining width with polished Motion choreography: the active-blade highlight glides between blades as a shared layout element, panel content enters and exits with a subtle fade/translate, and the structural expansion animates smoothly. On narrow containers the component switches to a Compact Layout where the active panel sits above a horizontal blade tray.

The component ships open-code through the shadcn-compatible registry, styles itself exclusively with Tailwind utilities backed by Dethink semantic tokens, exposes per-part `className` overrides and `data-slot`/`data-state`/`data-layout` attributes, supports controlled and uncontrolled state, follows the tabs accessibility pattern with roving tabindex and RTL-aware arrow keys, and fully respects reduced-motion preferences.

## User Stories

1. As a dashboard developer, I want a horizontal accordion where one panel is expanded at a time, so that I can present rich sections in a fixed-height band without vertical page growth.
2. As a developer, I want a compound API (`HorizontalAccordion`, `.Item`, `.Blade`, `.BladeIcon`, `.BladeLabel`, `.Panel`), so that I control composition and markup per part.
3. As a developer, I want every part exported both as a static property and as a named export, so that I can use whichever import style my codebase prefers.
4. As a developer, I want uncontrolled usage via `defaultValue`, so that simple cases need no state wiring.
5. As a developer, I want controlled usage via `value` and `onValueChange`, so that app state can drive the active section.
6. As a developer, I want `undefined` to represent "no active item", so that the accordion can render fully collapsed.
7. As a developer, I want clicking the active blade to collapse it by default (`collapsible`), so that users can dismiss content.
8. As a developer, I want `collapsible={false}` to keep one section always open once activated, so that the band never renders an empty panel area.
9. As a developer, I want an `activationMode` of `manual` (default) or `automatic`, so that keyboard focus can either preview or immediately activate blades.
10. As a developer, I want `bladeWidth`, `height`, and `compactBreakpoint` numeric props with sensible defaults, so that the core geometry is configurable without CSS.
11. As a developer, I want every part to accept `className` merged through the library's class-merge helper, so that my Tailwind utilities win over defaults.
12. As a developer, I want `data-state="active|inactive"`, `data-layout="default|compact"`, and `data-slot` attributes on the parts, so that I can style states with Tailwind data variants and target parts in tests.
13. As a developer, I want blade content to be composition-based (text-only, icon-only, image-only, icon + label mixes), so that I am not constrained by a fixed prop API.
14. As a developer, I want `BladeLabel` to support rotated and true-vertical text with `bottom-to-top`/`top-to-bottom` direction, so that blade identity reads well in a slim column.
15. As a developer, I want `Blade` to control icon position (`start`/`end`, with `top`/`bottom` aliases), so that icon/label arrangement matches my design.
16. As a developer, I want inactive panels to stay mounted by default with an opt-in `unmountInactivePanels`, so that panel state persists unless I choose otherwise for heavy content.
17. As a user, I want the active-blade highlight to glide between blades as a shared element, so that switching sections feels continuous and polished.
18. As a user, I want panel content to enter with a subtle fade/slide after the expansion starts and exit cleanly, so that the transition feels choreographed rather than abrupt.
19. As a user, I want the structural expand/collapse to animate smoothly, so that layout changes are easy to follow.
20. As a user with reduced-motion preferences, I want all non-essential movement disabled or minimized, so that the component never causes discomfort.
21. As a keyboard user, I want blades to behave as a tab list with roving tabindex, so that a single Tab stop enters the component and arrows move within it.
22. As a keyboard user, I want ArrowLeft/ArrowRight (direction-aware in RTL), Home, End, Enter, and Space to work on blades, so that I can navigate and activate without a mouse.
23. As a screen-reader user, I want blades and panels wired with the tabs pattern (`tablist`/`tab`/`tabpanel`, `aria-controls`, `aria-expanded`/`aria-selected`, `aria-labelledby`), so that relationships are announced correctly.
24. As a screen-reader user, I want icon-only or image-only blades to accept an accessible name, so that every blade is announced meaningfully.
25. As a developer, I want disabled blades to be skipped by keyboard navigation and excluded from the roving tab stop, so that disabled sections cannot be activated.
26. As a mobile user, I want the accordion to switch to a Compact Layout below a container-width breakpoint (panel above a horizontal blade tray), so that the pattern stays usable on narrow screens.
27. As a developer, I want the compact switch driven by container width, not viewport width, so that the component adapts correctly inside sidebars, cards, and split panes.
28. As a developer, I want the component styled entirely with Dethink semantic tokens (background, foreground, muted, primary, border, ring), so that it follows light, dark, and brand themes automatically.
29. As a developer, I want density support through the provider tokens, so that the component sits well in compact and comfortable UIs.
30. As a developer, I want the component installable from the Dethink registry with accurate dependency metadata (including the Motion dependency), so that a copy into my app works on first install.
31. As a developer, I want the component exported from the package root with its `*ClassNames` helpers and prop types, so that npm consumers get a typed public API.
32. As a developer, I want development-time validation of composition (unique item values; exactly one Blade and one Panel per Item), so that mistakes fail fast with clear messages.
33. As a developer, I want Storybook stories covering variants, states, blade content mixes, compact layout, RTL, density, dark mode, and reduced motion, so that I can evaluate the component visually.
34. As a developer, I want documented specs, PRD, and issue planning mirrored in the repo docs, so that the component's contract is discoverable.
35. As a developer, I want SSR-safe rendering (no window access during render), so that the component works in Next.js server rendering.
36. As a developer, I want interaction and accessibility tests (including axe automation), so that regressions in behavior or semantics are caught in CI.

## Implementation Decisions

- Port the proven prototype architecture into the components package as a compound component: root `HorizontalAccordion` plus `Item`, `Blade`, `BladeIcon`, `BladeLabel`, and `Panel` parts, exposed both as static properties on the root and as named exports, with per-part `*ClassNames` helper functions and exported prop types following the library's established recipe pattern.
- Single-active-item state model: `value`, `defaultValue`, `onValueChange(value | undefined)`; `collapsible` defaults to `true`; controlled mode detected by presence of the `value` prop. `activationMode` supports `manual` (default) and `automatic` focus activation.
- Geometry props `bladeWidth` (default 72), `height` (default 420), and `compactBreakpoint` (default 640) are numbers interpreted as pixels and surfaced as component-scoped CSS custom properties so Tailwind overrides remain possible.
- Compact Layout activates from container width via ResizeObserver (SSR-safe, guarded), switching the root to a grid with the active panel above a horizontal blade tray; exposed as `data-layout="compact"` on all parts.
- Animation uses Motion (`motion/react`), already a dependency of the package and externalized in the library build:
  - Shared active-blade highlight animated between blades via a Motion layout element with a shared `layoutId` inside a `LayoutGroup` scoped by `useId`.
  - Panel content entrance and exit choreographed with `AnimatePresence` using opacity/translate only.
  - Structural expand/collapse uses a tokenized CSS flex-basis transition (simple static state change, per the repo motion policy), synchronized with the Motion timings through shared CSS custom properties.
  - An `animation` prop (`duration`, `easing`, `content`) tunes the choreography globally per instance.
  - Reduced motion respected via `MotionConfig reducedMotion="user"` plus a `prefers-reduced-motion` CSS fallback for the CSS-driven transitions; state is never communicated by animation alone.
- Accessibility follows the tabs pattern: root `role="tablist"` with `aria-orientation="horizontal"`, blades as `role="tab"` buttons with `aria-controls`/`aria-expanded`/`aria-selected`, panels as `role="tabpanel"` with `aria-labelledby` and `hidden` when inactive. Roving tabindex tracks the focused or active blade, skips disabled blades, and arrow-key direction respects RTL resolved from the DOM.
- Styling is Tailwind-first against Dethink semantic tokens (muted blade surface, primary active surface, border, ring focus treatment) with no hard-coded colors; every part accepts `className` merged via the shared class-merge helper so consumer utilities win. No `classNames` slot object.
- Parts expose `data-slot` names plus `data-state`, `data-layout`, `data-icon-position`, and label `data-orientation`/`data-direction` attributes as the public styling/testing contract.
- Development-only composition validation: duplicate item values and Items lacking exactly one Blade and one Panel throw with clear messages; validation is skipped in production builds.
- Panels stay mounted by default; `unmountInactivePanels` opts into unmounting inactive panel children.
- Registry item of type `registry:ui` with the Motion runtime dependency declared, depending on the shared base registry item, listing the real component, barrel, and class-merge helper files.
- The component is added to the package root exports, the playground smoke app, the Storybook catalog, and the showcase, matching how existing components integrate.

## Testing Decisions

- Good tests assert public behavior through roles, accessible names, and the documented `data-slot`/`data-state` attributes — never internal structure or Motion internals.
- Behavior tests (component test file, colocated): uncontrolled and controlled state, collapse via active-blade click, `collapsible={false}`, `activationMode` manual vs automatic, keyboard navigation (arrows including RTL, Home/End, Enter/Space), disabled-blade skipping and roving tabindex, composition validation errors in development, `unmountInactivePanels`, and Compact Layout switching with a mocked ResizeObserver.
- Accessibility automation: axe test rendering representative compositions (including icon-only blades with accessible names) inside the provider, following the existing jest-axe pattern.
- SSR smoke test: server-render the component and assert markup renders without window/observer access, following the existing SSR test pattern.
- Storybook interaction tests: play functions covering click activation, collapse, and keyboard flows; matrix stories for blade content mixes, density, dark theme, RTL, and reduced motion.
- Registry metadata validated with the registry validation script; playground smoke renders one instance; package typecheck, tests, and build gate the work.
- Prior art: the NavDock test suite (Motion component, keyboard + a11y + SSR files), the Sidebar test suite (state-driven compound component), and the prototype's own vitest suite which this PRD's behavior list mirrors.

## Out of Scope

- Multiple simultaneously open panels.
- Hover-to-open activation.
- A vertical-orientation variant (the existing Accordion covers vertical disclosure).
- Publishing as a standalone npm package (distribution is via the components package and registry).
- Drag-to-resize blades or persisted user sizing.
- Router/deep-link integration for the active item.
- Advanced screen-reader QA beyond the tabs pattern and axe automation (tracked as a future hardening pass).

## Further Notes

- The source prototype lives in a separate local repository and already validates the API shape, keyboard model, compact layout, and Motion active-layer approach; this work is a port into the design system's conventions (tokens, recipes, registry, Storybook, docs), not a redesign.
- The blade vocabulary (Blade, Blade Tray, Compact Layout) comes from the prototype's requirements document and should be used consistently in specs, docs, and stories.
- Default geometry (72px blades, 420px height, 640px compact breakpoint) and default animation timing (260ms, standard easing, content choreography on) carry over from the prototype as accepted baselines.
