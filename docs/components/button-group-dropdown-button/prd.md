# ButtonGroup And DropdownButton PRD

Status: Published to GitHub issue tracker.

Tracker issue: https://github.com/parveshh/dethink-components/issues/371

Package target: `@dethink/components`.

## Problem Statement

Teams building production SaaS dashboards, internal tools, B2B applications,
and AI-native interfaces need to present related actions without creating
inconsistent borders, focus behavior, keyboard semantics, responsive fallbacks,
or menu interactions. The library already ships Button and DropdownMenu, but
consumers must currently hand-assemble adjacent action groups, menu buttons,
and split buttons. Those recipes repeatedly leave accessible naming, native
button behavior, async coordination, menu positioning, RTL geometry, reduced
motion, registry dependencies, and the boundary between action groups,
selection groups, and toolbars to each product team.

The ecosystem has abundant ButtonGroup and SplitButton components, but many are
either styling-only wrappers or monolithic model-driven controls. Dethink needs
an open-code action-composition family that is semantically explicit, reuses the
existing action-menu system, remains predictable under async work, and fits
dense responsive application surfaces without turning ButtonGroup into a
toolbar or overflow engine.

## Solution

Ship ButtonGroup and DropdownButton as one planned component family with two
separate registry items.

ButtonGroup will be a small semantic layout primitive for related native
actions. It will support attached and separated modes plus horizontal and
vertical orientation while leaving every child independently focusable and
actionable. It will not own pressed selection, roving focus, action persistence,
or automatic overflow.

DropdownButton will be a policy component built from Button, ButtonGroup, and
the existing React Aria-backed DropdownMenu. Its discriminated API will support
an explicit menu-button mode and an explicit split-button mode. It will enforce
accessible split-trigger naming, coordinate primary/menu disabled and loading
state, anchor menu geometry to the complete composite, preserve controlled and
uncontrolled open state, use the existing menu roles and keyboard behavior, and
ship a tested responsive action-handoff recipe.

Any animation added or changed for this family will use Motion primitives from
`motion/react`. ButtonGroup will remain static. The shared DropdownMenu animation
path reused by DropdownButton will migrate narrowly from CSS animation and
transition utilities to Motion so the composite does not mix animation systems.

## User Stories

1. As a registry consumer, I want to install ButtonGroup without DropdownMenu or Motion, so that a small layout primitive does not pull unrelated runtime behavior.
2. As a registry consumer, I want to install DropdownButton with accurate Button, ButtonGroup, DropdownMenu, provider, positioning, and Motion dependencies, so that copied source works immediately.
3. As a package consumer, I want public TypeScript props and data types, so that ButtonGroup and DropdownButton are discoverable without reading implementation details.
4. As a product engineer, I want to group two or more related actions in attached mode, so that they read as one action family without losing their individual behavior.
5. As a product engineer, I want separated mode, so that related actions can retain grouping semantics without visually sharing borders.
6. As a product engineer, I want horizontal and vertical orientations, so that related actions fit headers, side panels, narrow cards, and stacked layouts.
7. As a keyboard user, I want each ButtonGroup child to remain in normal Tab order, so that grouping does not invent unexpected arrow-key behavior.
8. As a keyboard user, I want each grouped button to retain native Enter and Space activation, so that the visual group does not replace native button semantics.
9. As a screen-reader user, I want a labelled group, so that I understand the shared purpose of adjacent actions.
10. As a product engineer, I want grouped children to keep independent disabled, loading, busy, form, and event behavior, so that the wrapper does not create hidden shared state.
11. As a design-system user, I want ButtonGroup to remain distinct from ToggleGroup, so that action grouping is not confused with pressed selection.
12. As a design-system user, I want ButtonGroup to remain distinct from Toolbar, so that roving focus is introduced only by the correct composite widget.
13. As a design-system user, I want an orientation-aware decorative separator, so that solid and ghost button groups can preserve visual boundaries without adding accessibility noise.
14. As a theming consumer, I want attached seams, borders, radii, focus rings, and spacing to use semantic tokens, so that brand, dark, high-contrast, and density modes remain coherent.
15. As an RTL user, I want logical corner, separator, spacing, and orientation behavior, so that attached groups mirror correctly.
16. As a product engineer, I want a menu-mode DropdownButton, so that one visible button can reveal equally important related actions without performing a direct action.
17. As a product engineer, I want a split-mode DropdownButton, so that a dominant action remains one click away while related secondary actions stay available.
18. As a TypeScript consumer, I want menu and split modes to be a discriminated union, so that direct-action props cannot accidentally appear on a menu-only button.
19. As a screen-reader user, I want the split menu trigger to require a localizable accessible name, so that an icon-only trigger is never unnamed.
20. As a keyboard user, I want the split primary and menu trigger to be two normal Tab stops, so that I can choose the direct action or menu explicitly.
21. As a keyboard user, I want Enter and Space on the primary side to perform only the primary action, so that the menu never opens accidentally.
22. As a keyboard user, I want Enter, Space, and supported Up/Down Arrow behavior on the menu trigger, so that the existing menu-button pattern remains efficient.
23. As a keyboard user, I want menu arrow navigation, typeahead, disabled-item skipping, item activation, Escape dismissal, and focus return, so that DropdownButton behaves like the existing DropdownMenu.
24. As a product engineer, I want controlled and uncontrolled open state, so that DropdownButton can work independently or coordinate with application state.
25. As a product engineer, I want collision-aware placement props, so that menus remain visible near viewport and container edges.
26. As a design-system user, I want the menu minimum width to match the full DropdownButton composite, so that the overlay does not look anchored only to the narrow chevron half.
27. As a product engineer, I want longer menu labels to expand within established overlay limits, so that content remains readable without widening the action button.
28. As a form or workflow engineer, I want a running primary action to disable the whole split button by default, so that conflicting actions do not run concurrently.
29. As a workflow engineer, I want an explicit primary-only loading behavior, so that safe secondary actions can remain available when a product flow requires it.
30. As a product engineer, I want independent primary and menu disabled state, so that action availability can reflect real permissions and workflow conditions.
31. As a screen-reader user, I want the primary busy state announced while its readable label remains present, so that progress does not erase action context.
32. As a user, I want the dominant action to remain predictable, so that choosing a menu action does not silently replace the primary action.
33. As an application engineer, I want to control the visible primary action when a product intentionally promotes another action, so that persistence remains explicit application state.
34. As a responsive-product engineer, I want a tested recipe that hands wide ButtonGroup actions to DropdownButton or overflow menu at a declared container threshold, so that narrow layouts remain intentional.
35. As a maintainer, I want ButtonGroup v1 to avoid automatic measurement and overflow, so that it does not become an implicit Toolbar or action-bar system.
36. As a motion-sensitive user, I want all new action animation to follow my reduced-motion preference, so that motion is never required to understand state.
37. As a design-system maintainer, I want DropdownButton animation to use only Motion primitives, so that the composite does not mix CSS keyframes, CSS transitions, and Motion.
38. As a user, I want open, loading, disabled, and focus state to remain obvious when animation is disabled, so that motion is decorative rather than informational.
39. As a Storybook user, I want complete menu, split, orientation, variant, size, theme, density, RTL, async, long-label, narrow-container, and reduced-motion examples, so that I can evaluate the contract visually.
40. As an accessibility reviewer, I want automated axe coverage and documented keyboard/screen-reader acceptance, so that review is repeatable.
41. As an SSR application developer, I want closed, default-open, menu, split, loading, and provider-portalled states to render and hydrate safely, so that the family works in Next.js and Vite SSR contexts.
42. As a registry maintainer, I want clean-consumer smoke tests for both registry items, so that dependencies, aliases, CSS variables, package exports, and copied files stay accurate.
43. As an AI coding-tool user, I want explicit semantic guidance and stable examples, so that generated code chooses ButtonGroup, ToggleGroup, Toolbar, DropdownButton, and DropdownMenu correctly.
44. As a maintainer, I want the existing DropdownMenu roles, portal path, positioning engine, and collection behavior reused, so that DropdownButton does not create a parallel menu system.

## Implementation Decisions

- ButtonGroup and DropdownButton are planned together because DropdownButton is
  the first high-value composition of ButtonGroup, Button, and DropdownMenu.
  They publish as separate registry items so ButtonGroup stays lightweight.
- ButtonGroup renders a semantic group container and accepts native labelling
  attributes. It supports `mode="attached" | "separated"` and
  `orientation="horizontal" | "vertical"`.
- ButtonGroup preserves child semantics and normal document Tab order. It does
  not add arrow-key navigation, roving tabindex, pressed selection, a shared
  loading value, or action persistence.
- ButtonGroupSeparator is decorative and orientation-aware. ButtonGroup does
  not expand into a generic InputGroup or mixed control addon system.
- DropdownButton exposes a discriminated `mode="menu" | "split"` API. Menu mode
  is the default and performs no direct action. Split mode requires a primary
  action handler and a localizable accessible name for the icon-only menu
  trigger.
- DropdownButton accepts existing DropdownMenu content as React children rather
  than introducing a model-driven second menu-item API.
- DropdownButton reuses the existing React Aria-backed DropdownMenu semantics,
  keyboard behavior, collections, dismissal, provider-aware portals, and
  positioned-overlay foundation.
- Split mode presents two adjacent native buttons. The primary side performs
  only the dominant action; the secondary side implements the menu-button
  pattern. Both remain normal Tab stops.
- The dominant primary action is not repeated in the menu. Content guidance
  will explain menu-button, split-button, and overflow-menu labelling.
- DropdownButton supports controlled and uncontrolled open state plus existing
  placement, offset, collision-padding, and flipping concepts.
- The complete composite acts as the menu positioning reference. Menu content
  defaults to logical start alignment and a minimum width equal to the full
  composite, while retaining existing maximum-width and collision behavior.
- `loadingBehavior="all"` is the safe default and disables both halves while the
  primary action is busy. `loadingBehavior="primary"` keeps explicitly safe menu
  alternatives available. Primary and menu disabled state can also be
  controlled independently.
- DropdownButton does not persist or promote the last selected action. Products
  may control the primary label and handler when that behavior is intentional.
- ButtonGroup v1 does not measure, rank, hide, or overflow children. A tested
  responsive recipe will preserve declared action IDs, labels, permissions, and
  handlers across wide and narrow representations.
- ButtonGroup has no intrinsic animation and no Motion dependency.
- DropdownButton uses `motion/react` primitives for open-state chevron feedback,
  state-preserving label/busy presence where used, and shared menu presence.
- The DropdownMenu animation path reused by DropdownButton will migrate narrowly
  from Tailwind/CSS keyframes and transitions to Motion primitives. Existing
  menu roles, focus behavior, positioning, tokens, and public API remain intact.
- Motion uses stable keys, transform and opacity where appropriate, and reduced
  motion handling through Motion configuration or `useReducedMotion`. It does
  not scale the full attached composite or animate border geometry.
- New and migrated animation paths do not introduce CSS keyframes, Tailwind
  `animate-*`, or Tailwind `transition-*` utilities.
- Styling uses Tailwind CSS v4, existing Button recipes, semantic CSS variables,
  logical properties, stable data slots, and public state attributes. No
  component-level theme prop or CSS-in-JS runtime is introduced.
- Documentation covers overview, installation, anatomy, API, semantic decision
  guidance, keyboard behavior, async behavior, theming, density, RTL, Motion,
  reduced motion, responsive handoff, recipes, testing, migration notes, and
  known limitations.

## Testing Decisions

- Tests assert public behavior, accessible semantics, focus movement, event
  delivery, open state, async coordination, overlay geometry, Motion behavior,
  and installability rather than private implementation details.
- Rendered ButtonGroup tests cover attached/separated geometry, horizontal and
  vertical orientation, group labelling, class composition, stable slots,
  independent child disabled/loading state, and preservation of native button
  activation.
- Rendered DropdownButton tests cover menu and split unions, primary action,
  required split-trigger naming, controlled/uncontrolled open state,
  independent disabled state, both loading behaviors, positioning props,
  full-composite anchoring, menu width, and stable slots/states.
- Keyboard tests cover normal ButtonGroup Tab order; primary Enter/Space;
  menu-trigger Enter/Space and supported Up/Down Arrow open behavior; menu arrow
  navigation, Home/End, typeahead, disabled-item skipping, item activation,
  Escape dismissal, and focus return.
- Accessibility automation covers labelled groups, menu-only buttons,
  icon-only split triggers, busy primary actions, destructive secondary
  actions, disabled behavior, portal context, and RTL examples.
- Manual acceptance documents screen-reader naming, two-tab-stop split anatomy,
  focus-visible seams, focus restoration, busy announcements, forced/high
  contrast behavior, and reduced-motion behavior.
- Storybook interaction and visual coverage spans menu/split modes, every Button
  size and relevant variant, attached/separated orientation, light/dark/high
  contrast, density, RTL, long labels, narrow containers, controlled open,
  loading, disabled, focus-visible, menu placement, responsive handoff, Motion
  presets, and reduced motion.
- Motion-specific tests prove Motion primitives own new and migrated animation,
  reduced motion removes transform choreography, static state remains complete,
  and changed paths do not retain CSS animation utilities.
- SSR and hydration smoke covers closed, default-open, menu, split, loading,
  reduced-motion-safe, and provider-portalled states without browser-only
  access during render.
- Registry validation and clean-consumer smoke cover separate `button-group` and
  `dropdown-button` items, precise registry/runtime dependencies, Motion only
  where source imports it, CSS variable sufficiency, aliases, package exports,
  provider portals, and copied-source portability.
- Final verification uses the repository typecheck, build, unit, accessibility,
  Storybook, registry validation, and registry smoke commands.

## Out Of Scope

- ToggleButton and ToggleGroup pressed-state behavior.
- Toolbar semantics, roving focus, keyboard shortcuts, or multi-row navigation.
- Automatic ResizeObserver-based overflow, action ranking, or priority
  algorithms.
- A generic ResponsiveActionGroup or action-bar component.
- Built-in last-used action persistence or storage.
- A new menu item model, menu role implementation, focus manager, collection
  engine, portal path, positioning engine, or native Popover polyfill.
- Select, Combobox, value selection, checkbox/radio menu API expansion,
  virtualized menus, async menu loading, fuzzy search, or remote action data.
- InputGroup, input addons, mixed form controls, or compound descriptive
  buttons.
- Broad Button or DropdownMenu redesign outside the animation migration and
  composition seams required by DropdownButton.
- Analytics, permissions orchestration, confirmation flows, or server-action
  lifecycle management beyond exposed disabled/loading props.

## Further Notes

- Source research is recorded in `research.md`; the proposed component contract
  is recorded in `spec.md`.
- The original PRD defines ButtonGroup as P1 layout grouping, DropdownMenu as the
  P0 action-menu primitive, ToggleGroup as selection, Toolbar as the roving-focus
  composite, reduced-motion support as mandatory, and native overlay APIs as
  progressive-enhancement targets.
- Testing seams and the Motion-only migration scope were approved by the user on
  10 July 2026.
- Implementation issues must be reviewed for granularity, dependencies, and
  HITL/AFK classification before publication.
