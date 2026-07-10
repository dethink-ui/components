# ButtonGroup And DropdownButton Issue Breakdown

Status: Published to GitHub issue tracker.

This uses the `to-issues` tracer-bullet format.

Parent PRD: https://github.com/parveshh/dethink-components/issues/371

Package target: `@dethink/components`.

## Published Issues

- Parent PRD: https://github.com/parveshh/dethink-components/issues/371
- AFK ButtonGroup semantic and installable baseline tracer: https://github.com/parveshh/dethink-components/issues/372
- AFK DropdownButton menu mode and Motion-only menu tracer: https://github.com/parveshh/dethink-components/issues/373
- AFK DropdownButton split semantics and group-anchored overlay tracer: https://github.com/parveshh/dethink-components/issues/374
- AFK DropdownButton async coordination and controlled primary action tracer: https://github.com/parveshh/dethink-components/issues/375
- AFK ButtonGroup DropdownButton responsive recipes and final verification: https://github.com/parveshh/dethink-components/issues/376

## Proposed Breakdown

1. **Title**: ButtonGroup semantic and installable baseline tracer (#372)
   **Type**: AFK
   **Blocked by**: Parent PRD #371
   **User stories covered**: 1, 3-15, 39-44

2. **Title**: DropdownButton menu mode and Motion-only menu tracer (#373)
   **Type**: AFK
   **Blocked by**: #372
   **User stories covered**: 2-3, 16, 18-19, 22-27, 36-44

3. **Title**: DropdownButton split semantics and group-anchored overlay tracer (#374)
   **Type**: AFK
   **Blocked by**: #373
   **User stories covered**: 17-27, 32-33, 36-44

4. **Title**: DropdownButton async coordination and controlled primary action tracer (#375)
   **Type**: AFK
   **Blocked by**: #374
   **User stories covered**: 28-33, 36-44

5. **Title**: ButtonGroup DropdownButton responsive recipes and final verification (#376)
   **Type**: AFK
   **Blocked by**: #375
   **User stories covered**: 1-44, especially 34-35 and 39-43

## Proposed Branch Stack

1. `feature/prd-371-button-group-dropdown-button`
2. `feature/issue-372-button-group-baseline`
3. `feature/issue-373-dropdown-button-menu-motion`
4. `feature/issue-374-dropdown-button-split`
5. `feature/issue-375-dropdown-button-async`
6. `feature/issue-376-action-family-integration`

Create Slice 1 from the PRD branch, then stack each later slice from the previous
issue branch. The final implementation pull request targets the PRD branch, not
the repository default branch, unless the user explicitly requests the
integration step.

## Published Slice 1 (#372)

### Parent

- #371

### What to build

Ship the smallest complete ButtonGroup path as an installable semantic layout
primitive. The completed slice should group related native actions in attached
or separated horizontal and vertical layouts, preserve each child's native
focus and activation behavior, expose an orientation-aware decorative
separator, and include package exports, registry metadata, documentation,
stories, behavior tests, accessibility coverage, SSR coverage, and clean
consumer smoke verification.

ButtonGroup remains structural. It must not implement selection, pressed state,
roving focus, automatic overflow, shared loading state, or intrinsic animation.

### Acceptance criteria

- [ ] `ButtonGroup` and `ButtonGroupSeparator` are exported with public prop/data types and class-name helpers.
- [ ] ButtonGroup supports attached and separated modes plus horizontal and vertical orientation with documented defaults.
- [ ] The root exposes `role="group"`, native labelling attributes, stable group/separator slots, mode state, and orientation state.
- [ ] Attached mode merges adjacent borders and logical corner radii without replacing child semantics or event behavior.
- [ ] Separated mode and vertical/horizontal geometry use provider spacing, border, radius, focus, and density tokens.
- [ ] RTL uses logical geometry and mirrors attached start/end corners without consumer overrides.
- [ ] Every child remains an independent document Tab stop with native Enter/Space activation, disabled state, loading state, form behavior, and focus-visible treatment.
- [ ] ButtonGroup does not add arrow-key navigation, roving tabindex, `aria-pressed`, selection values, automatic child measurement, or overflow behavior.
- [ ] ButtonGroup and its registry item do not import or declare Motion or DropdownMenu.
- [ ] Stories cover attached/separated, horizontal/vertical, Button variants and sizes, mixed disabled/loading children, light/dark/high-contrast, density, and RTL.
- [ ] Rendered behavior, axe, SSR/hydration, registry validation, package export, and clean-consumer smoke tests verify the baseline path.
- [ ] Documentation explains ButtonGroup versus ToggleGroup, Toolbar, DropdownButton, and InputGroup boundaries.

### Blocked by

- #371

## Published Slice 2 (#373)

### Parent

- #371

### What to build

Ship DropdownButton's menu mode as the first complete composition tracer. The
completed slice should expose one visible menu button, reuse ButtonGroup,
Button, and the existing React Aria-backed DropdownMenu internally, support
controlled and uncontrolled open state plus existing positioning props, and
include an installable registry path, docs, stories, interaction tests,
accessibility coverage, SSR coverage, and consumer smoke verification.

To satisfy the approved Motion-only constraint, this slice also migrates the
shared DropdownMenu animation path used by DropdownButton from Tailwind/CSS
keyframes and transitions to Motion primitives. The migration must preserve the
existing public DropdownMenu API, roles, focus behavior, provider portal path,
positioning, and token contract.

### Acceptance criteria

- [ ] `DropdownButton` ships with menu mode as the default and a discriminated prop contract that rejects direct primary-action props in menu mode.
- [ ] Menu mode renders one visible, accessible button that opens an action menu and performs no direct action.
- [ ] DropdownButton reuses existing DropdownMenu items, sections, labels, separators, shortcuts, submenus, collection behavior, dismissal, and provider-aware portal behavior rather than introducing a second menu model.
- [ ] Menu mode supports Button variant/size styling, class composition, stable slots/states, `open`, `defaultOpen`, `onOpenChange`, and existing placement/collision props.
- [ ] Pointer and keyboard flows preserve Enter/Space open behavior, supported Up/Down Arrow opening, menu navigation, typeahead, disabled-item skipping, item activation, Escape close, and focus return.
- [ ] The shared DropdownMenu surface presence and changed item feedback use Motion primitives imported from `motion/react`; changed paths do not retain CSS keyframes, Tailwind `animate-*`, or Tailwind `transition-*` animation utilities.
- [ ] Reduced motion removes transform choreography while open, closed, focus, disabled, destructive, and selected states remain immediately understandable.
- [ ] Existing DropdownMenu behavior, accessibility, SSR, positioning, provider-portal, submenu, and registry tests continue to pass after the Motion migration.
- [ ] Registry metadata and migration notes declare Motion only for copied sources that import it, including DropdownMenu if the shared migration makes it a runtime dependency.
- [ ] Stories cover menu-mode base, controlled open, grouped/destructive/disabled items, placement, theme/density/RTL, Motion presets, and reduced motion.
- [ ] New menu-mode render, interaction, axe, SSR/hydration, package export, registry, and clean-consumer smoke tests pass.
- [ ] Documentation explains menu-button usage and keeps Select, Combobox, value selection, Toolbar, and split behavior out of this slice.

### Blocked by

- #372

## Published Slice 3 (#374)

### Parent

- #371

### What to build

Extend the installable DropdownButton path with explicit split-button semantics
and group-anchored overlay geometry. The completed slice should render a native
primary action beside a separately named icon-only menu trigger, preserve two
normal Tab stops, keep primary and menu activation unambiguous, and position the
menu from the full composite so its minimum width and logical alignment feel
intentional in dense headers and RTL layouts.

### Acceptance criteria

- [ ] `mode="split"` is represented by the discriminated public type and requires a primary action handler plus a localizable `menuLabel` for the icon-only trigger.
- [ ] Split mode renders two adjacent native buttons with stable primary, menu-trigger, trigger-icon, composite, and menu-anchor slots.
- [ ] The primary side performs only the primary action on click, Enter, and Space; it does not open the menu.
- [ ] The menu side exposes menu-button semantics and preserves existing Enter/Space, supported Up/Down Arrow, menu navigation, Escape, and focus-return behavior.
- [ ] Tab and Shift+Tab move through the primary and menu buttons in normal document order; ButtonGroup does not add Left/Right Arrow roving focus.
- [ ] The icon-only menu trigger always has an explicit accessible name and focus-visible treatment remains clear at the attached seam.
- [ ] Variant, size, border, radius, density, disabled, dark, high-contrast, and RTL styling remain coherent across both halves without duplicating Button recipes.
- [ ] The complete split composite is the positioning reference; menu content defaults to logical start alignment and a minimum width equal to the full composite while retaining existing collision flipping and maximum-width behavior.
- [ ] Long labels, narrow containers, logical start/end placement, and RTL do not detach the menu visually from the composite or clip the menu trigger.
- [ ] The open-state chevron uses Motion primitives, respects Motion presets and reduced motion, and is not the only indicator of open state.
- [ ] The dominant primary action is not repeated in menu examples, and content guidance distinguishes menu, split, and overflow actions.
- [ ] Stories, interaction tests, rendered behavior tests, axe coverage, SSR/hydration, registry metadata, and clean-consumer smoke verify split semantics and full-group anchoring.

### Blocked by

- #373

## Published Slice 4 (#375)

### Parent

- #371

### What to build

Complete DropdownButton's async and controlled-primary action contract. The
completed slice should prevent duplicate primary activation, expose safe
whole-composite and primary-only loading policies, support independent primary
and menu disabled state, preserve readable busy context, and let products
control the visible primary label and handler without adding built-in
last-action persistence.

### Acceptance criteria

- [ ] `loading` marks the primary action busy, prevents duplicate activation, retains readable label context, and exposes useful busy semantics.
- [ ] `loadingBehavior="all"` is the documented default and disables both primary and menu halves while the primary action is running.
- [ ] `loadingBehavior="primary"` disables only the primary half and keeps the menu trigger operable for product-declared safe alternatives.
- [ ] `disabled` disables the complete composite, while `primaryDisabled` and `menuDisabled` independently control either half without corrupting focus or open state.
- [ ] Controlled open state remains consistent when loading or disabled props change, including close/focus behavior when the menu trigger becomes unavailable.
- [ ] Products can update the visible primary label, icon, and handler through controlled props without DropdownButton storing or promoting the last selected menu action.
- [ ] Any label or busy-indicator presence animation uses Motion primitives, stable keys, and transform/opacity only where useful; reduced motion resolves immediately without losing state.
- [ ] No async state is communicated by animation or color alone, and destructive alternatives remain explicit in text/context.
- [ ] Event tests cover single primary delivery, loading prevention, each disabled combination, menu availability under both loading policies, controlled prop updates, and focus continuity.
- [ ] Stories cover whole-composite loading, primary-only loading, independently disabled halves, controlled primary changes, open-state transitions, reduced motion, theme, density, and RTL.
- [ ] Rendered behavior, keyboard, axe, SSR/hydration, registry, package export, and clean-consumer smoke tests verify the async contract.
- [ ] Documentation warns that primary-only loading is opt-in and that last-used-action persistence belongs to application state.

### Blocked by

- #374

## Published Slice 5 (#376)

### Parent

- #371

### What to build

Finish ButtonGroup and DropdownButton as a documented, responsive, themed,
installable action-composition family. This slice should ship the explicit
wide-to-narrow action handoff recipe, complete semantic decision guidance,
exercise the full Storybook and accessibility state matrix, finalize registry
and package documentation, and run the repository's highest-level verification
paths.

The responsive recipe is declarative and product-owned. It must not add hidden
measurement, child ranking, automatic overflow, or a Toolbar implementation to
ButtonGroup.

### Acceptance criteria

- [ ] Documentation covers overview, installation, anatomy, API, semantic decision guidance, keyboard behavior, open state, async policies, positioning, theming, density, RTL, Motion, reduced motion, testing, migration notes, and known limitations.
- [ ] Guidance clearly distinguishes ButtonGroup, ToggleGroup, Toolbar, menu-mode DropdownButton, split-mode DropdownButton, DropdownMenu, overflow menu, Select, Combobox, and InputGroup.
- [ ] A tested responsive recipe renders declared actions in ButtonGroup at a product-owned wide/container threshold and hands less important actions to DropdownButton or an overflow DropdownMenu at the narrow threshold.
- [ ] The responsive recipe preserves action IDs, labels, permission/disabled rules, handler ownership, destructive meaning, and accessible names across both representations.
- [ ] ButtonGroup does not gain ResizeObserver measurement, implicit child hiding, priority inference, overflow state, roving focus, or Toolbar semantics.
- [ ] Storybook interaction and visual coverage spans menu/split modes, attached/separated and horizontal/vertical groups, every Button size and relevant variant, open/closed, loading policies, independent disabled states, long labels, narrow containers, responsive handoff, light/dark/high-contrast, density, RTL, Motion presets, and reduced motion.
- [ ] Manual keyboard and screen-reader acceptance documents labelled groups, normal group Tab order, two-tab-stop split anatomy, menu-button naming, busy announcements, focus-visible seams, menu navigation, Escape/focus return, forced/high contrast, RTL, and reduced motion.
- [ ] Package and registry documentation list accurate separate install paths and Motion implications for ButtonGroup, DropdownButton, and the migrated DropdownMenu.
- [ ] Registry validation and clean-consumer smoke prove dependency metadata, aliases, CSS variables, package exports, provider-aware portals, positioned overlays, Motion imports, and copied-source portability.
- [ ] SSR/hydration smoke covers closed, default-open, menu, split, async, responsive, themed, RTL, and reduced-motion-safe examples.
- [ ] Typecheck, build, unit tests, accessibility tests, Storybook build/interactions, registry validation, and registry smoke pass or have specific documented blockers.
- [ ] Follow-up work is recorded separately for any future ResponsiveActionGroup, Toolbar, ToggleGroup, or automatic overflow product evidence.

### Blocked by

- #375
