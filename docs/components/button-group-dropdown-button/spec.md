# ButtonGroup And DropdownButton Component Spec

Status: Approved; base family published under GitHub PRD #371 and selectable
primary-action mode under PRD #378.

Tracker issue: https://github.com/parveshh/dethink-components/issues/371

Selectable-mode tracker: https://github.com/parveshh/dethink-components/issues/378

Source: `react_component_library_prd.docx`, current Button and DropdownMenu
implementation, and `research.md` in this folder.

Package target: `@dethink/components`.

## Purpose

ButtonGroup visually and semantically groups a small set of related native
actions without changing the behavior of those actions.

DropdownButton provides a trustworthy menu button, fixed split button, or
selectable-primary action by composing Button, ButtonGroup, and DropdownMenu.
It owns action hierarchy, accessible anatomy, coordinated async state, menu
anchoring, and Motion-based state polish without creating another menu system.

## Product Boundaries

- ButtonGroup is layout grouping, not selection. ToggleGroup will own pressed
  state and single/multiple selection.
- ButtonGroup is not a Toolbar. It leaves every child in the document Tab order
  and does not implement roving focus or arrow-key navigation.
- DropdownButton is an action control, not a Select, Combobox, or value picker.
- DropdownButton uses DropdownMenu for menu roles, collection behavior,
  typeahead, disabled items, submenus, dismissal, portals, and positioning.
- The family may provide a documented responsive handoff recipe, but it does
  not automatically measure or hide actions in v1.

## Public Components

- `ButtonGroup`
- `ButtonGroupSeparator`
- `DropdownButton`

DropdownButton menu content continues to use the existing public DropdownMenu
item, section, label, separator, shortcut, and submenu components.

## ButtonGroup Contract

Public props:

| Prop          | Type                         | Default        | Purpose                                                 |
| ------------- | ---------------------------- | -------------- | ------------------------------------------------------- |
| `mode`        | `"attached" \| "separated"`  | `"attached"`   | Joins or spaces the related actions.                    |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | Controls logical action flow and separator orientation. |
| `className`   | `string`                     | -              | Composes consumer classes with the group contract.      |
| `children`    | `ReactNode`                  | -              | Native buttons or compatible Dethink action primitives. |

The root accepts native `div` attributes including `aria-label` and
`aria-labelledby`.

Behavior:

- Renders `role="group"` and `data-slot="button-group"`.
- Exposes `data-mode` and `data-orientation`.
- Attached mode merges adjacent borders and logical corner radii without
  cloning children or replacing their semantics.
- Separated mode uses the density gap token.
- Horizontal and vertical geometry uses logical properties and remains RTL
  safe.
- Each child remains independently focusable, disabled, busy, and actionable.
- The group does not accept a group-level loading or selection value.
- `ButtonGroupSeparator` is decorative, orientation-aware, token-backed, and
  removed from the accessibility tree.

## DropdownButton Contract

DropdownButton uses a discriminated `mode` contract.

Shared public props:

- `variant`
- `size`
- `open`
- `defaultOpen`
- `onOpenChange`
- `disabled`
- `placement`
- `offset`
- `crossOffset`
- `containerPadding`
- `shouldFlip`
- `className`
- `menuClassName`
- `motionPreset`

`motionPreset` is `"none" | "subtle" | "standard"` with
`"standard"` as the default. Every preset remains subject to the user's reduced
motion preference.

Menu mode:

- `mode="menu"` is the default.
- `label` and existing DropdownMenu `children` define the trigger and commands.
- The visible button only opens the menu.
- Direct-action props are rejected by the TypeScript union.
- The visible label supplies the accessible name unless an explicit label is
  required by the consumer's composition.

Split mode:

- `mode="split"` requires `onPrimaryAction` and `menuLabel`.
- `label` and existing DropdownMenu `children` define the fixed primary and its
  alternatives.
- The primary side is a native Button that performs the dominant action.
- The secondary side is an icon-only menu button. `menuLabel` provides its
  accessible name and must be localizable.
- The dominant action should not be repeated in the menu.
- Both controls are independently reachable with Tab. No arrow-key navigation
  is added between the two controls.
- `loading` marks the primary action busy and prevents duplicate activation.
- `loadingBehavior="all"` is the default and disables both halves while the
  primary action is busy.
- `loadingBehavior="primary"` disables only the primary half and keeps the
  menu available for product-declared safe alternatives.
- `primaryDisabled` and `menuDisabled` may independently disable either half;
  `disabled` disables the complete composite.
- A consumer may control the visible primary label and handler, but the
  component does not persist or promote the last selected menu action.

Selectable mode:

- `mode="selectable"` requires `actions` and a separately localizable
  `menuLabel`; arbitrary menu children, fixed `label`, `primaryIcon`, and
  `onPrimaryAction` props are rejected by the TypeScript union.
- Every `DropdownButtonSelectableAction` owns a stable unique `id`, textual
  `label`, execution handler, and optional description, icon, disabled state,
  and destructive state.
- Controlled state requires `selectedActionId` and
  `onSelectedActionChange`. Uncontrolled state requires
  `defaultSelectedActionId` and may observe changes through
  `onSelectedActionChange`.
- Choosing a menu item updates only the selected action. It does not invoke the
  action handler. A later primary click, Enter, or Space runs the current
  selected action handler.
- The choice menu uses single-selection semantics (`menuitemradio` and
  `aria-checked`) plus a visible checkmark that does not replace the semantic
  announcement.
- Selection stays stable when descriptors update. The current label, icon,
  handler, disabled state, and destructive state are resolved by stable action
  ID on every render, so stale handler or presentation data is not retained.
- A disabled selected action remains selected and visible but disables the
  primary half. The menu remains available unless the complete composite or
  menu half is disabled.
- Loading and independent disabled policies match fixed split mode. A
  destructive selected action applies the existing destructive Button recipe
  to the complete attached composite.
- The component does not persist selection between sessions, choose an initial
  action implicitly, or invoke an action during selection.

## Overlay Geometry

- Split and selectable DropdownButton use the complete composite root as the
  positioning reference.
- Both attached button segments inherit the same public Button `size`. The menu
  trigger changes only its square inline size, keeping `xs` through `xl`
  heights and typography aligned with the primary segment.
- Menu content defaults to logical `bottom start` placement and collision
  flipping through the existing positioned-overlay foundation.
- The menu minimum width matches the full composite width and may expand to the
  existing DropdownMenu maximum width for longer labels.
- Start/end alignment, submenu direction, and focus styling follow provider
  direction.
- The provider-aware portal root remains the only portal path.

## Accessibility And Keyboard Behavior

| Focus location     | Key                                  | Behavior                                                                                       |
| ------------------ | ------------------------------------ | ---------------------------------------------------------------------------------------------- |
| ButtonGroup child  | `Tab` / `Shift+Tab`                  | Moves through each native child in normal document order.                                      |
| ButtonGroup child  | `Enter` / `Space`                    | Uses the child's native activation behavior.                                                   |
| Menu-mode trigger  | `Enter` / `Space`                    | Opens the menu and places focus according to the menu-button pattern.                          |
| Menu-mode trigger  | `Down Arrow`                         | Opens the menu and focuses the first item where React Aria supports the optional APG behavior. |
| Menu-mode trigger  | `Up Arrow`                           | Opens the menu and focuses the last item where React Aria supports the optional APG behavior.  |
| Split primary      | `Enter` / `Space`                    | Performs the primary action and does not open the menu.                                        |
| Split menu trigger | `Enter` / `Space`                    | Opens the menu.                                                                                |
| Split menu trigger | `Down Arrow` / `Up Arrow`            | Opens and focuses the first/last item where supported.                                         |
| Selectable primary | `Enter` / `Space`                    | Invokes the currently selected action without opening the menu.                                |
| Selectable trigger | `Enter` / `Space`                    | Opens the single-selection menu without invoking an action.                                    |
| Selectable menu    | Arrow keys, `Home`, `End`, typeahead | Moves through declared choices; disabled choices cannot be selected.                           |
| Selectable choice  | `Enter` / `Space`                    | Changes selection, closes the menu, and returns focus without executing the chosen action.     |
| Open menu          | Arrow keys, `Home`, `End`, typeahead | Uses existing DropdownMenu behavior.                                                           |
| Open menu          | `Escape`                             | Closes the menu and returns focus to its menu trigger.                                         |

Additional requirements:

- ButtonGroup is labelled with `aria-label` or `aria-labelledby` in docs and
  complex examples.
- The split menu trigger always has an explicit accessible name.
- The selectable menu trigger always has an explicit accessible name; selected
  state is announced semantically and reinforced by the checkmark.
- The primary action and menu trigger expose independent disabled state.
- Busy state uses `aria-busy` on the primary button and retains readable text.
- Focus-visible treatment is visible around each actionable half, including at
  attached seams and in forced/high-contrast modes.
- Destructive secondary actions use text and structure in addition to color.
- Menu semantics, disabled-item skipping, typeahead, and focus restoration are
  inherited from the existing React Aria-backed DropdownMenu.

## Motion Contract

The user's Motion-only constraint is normative for this family.

- Import animation APIs from `motion/react`.
- ButtonGroup has no intrinsic animation and no Motion dependency.
- DropdownButton animates the open-state chevron and state-preserving label
  or busy-indicator presence. Selectable mode keys primary label/icon feedback
  to the stable action ID and uses Motion for selected-check presence.
- Controlled and selectable label-length changes animate a measured numeric
  label-viewport width with Motion. The composite itself is not scaled.
- The shared DropdownMenu entry/exit path used by DropdownButton uses Motion
  primitives instead of Tailwind keyframes/transitions so the composite does
  not mix animation systems.
- Use `AnimatePresence` only where exit presence is required, stable keys for
  changing content, and transform/opacity for performant feedback.
- Do not scale the attached composite or animate its border geometry; this can
  distort seams and focus rings.
- Respect reduced motion with `useReducedMotion` and the explicit
  `reducedMotion` test/documentation override.
- Reduced motion removes transform choreography and preserves immediate open,
  busy, disabled, label, width, and focus states.
- No CSS keyframes, Tailwind `animate-*`, or Tailwind `transition-*` utilities
  are introduced in ButtonGroup, DropdownButton, or the migrated menu paths.

## Styling And Theming

- Use Tailwind CSS v4 utilities backed by existing semantic CSS variables.
- Reuse Button variant and size recipes rather than copying their color maps.
- Attached geometry uses border, radius, focus ring, density control, and
  density gap tokens.
- Expose stable slots for the group root, separator, dropdown root, primary
  button, menu trigger, trigger icon, and menu anchor.
- Expose stable states including mode, orientation, open, disabled, loading,
  loading behavior, and selected action ID through data attributes.
- Support light, dark, high-contrast, density, responsive, and RTL stories.
- Do not add component-level theme props, CSS-in-JS, or runtime-generated
  Tailwind class fragments.

## Responsive Guidance

Ship an explicit recipe for page-header and dense-toolbar actions:

- wide layout: render the declared actions in ButtonGroup;
- narrow container: render the less important actions in DropdownButton or an
  existing overflow DropdownMenu;
- keep action IDs, labels, disabled rules, and handler ownership stable across
  both layouts;
- do not infer action priority from child order or measure and hide children in
  ButtonGroup v1.

## Registry And Package Requirements

- Publish `button-group` and `dropdown-button` as separate registry items.
- `button-group` depends on Button and shared utilities but does not depend on
  Motion or DropdownMenu.
- `dropdown-button` declares registry dependencies on Button, ButtonGroup,
  DropdownMenu, the positioned-overlay/provider path, and any shared Motion
  configuration required by the implementation.
- Selectable mode declares the Lucide selected-indicator dependency used by the
  copied source; custom action icons remain consumer-owned React nodes.
- Motion is declared only by registry items whose copied source imports it.
- If the shared DropdownMenu animation path migrates to Motion, update its
  registry metadata and migration notes in the same approved issue slice.
- Export components, class-name helpers, and public prop/data types from the
  package entry point.
- Registry smoke must prove copied-source portability in a clean consumer.

## Verification

- Rendered behavior tests for public props, choose-versus-execute delivery,
  controlled/uncontrolled selection, descriptor updates, and state transitions.
- Keyboard interaction tests for native group children and complete menu/split
  flows.
- Automated axe coverage and documented manual keyboard/screen-reader checks.
- Storybook interactions and visual regression across modes, variants, sizes,
  themes, density, RTL, responsive handoff, loading, disabled, focus-visible,
  open, and reduced-motion states.
- Motion-specific tests for open chevron, presence, reduced motion, and absence
  of CSS animation utilities in the changed paths.
- SSR render and hydration smoke tests.
- Registry validation and clean-consumer install smoke tests.

## Out Of Scope

- ToggleGroup and Toolbar implementation.
- Automatic responsive overflow or action-priority algorithms.
- Built-in last-used action persistence or implicit initial-action selection.
- General-purpose DropdownMenu checkbox/radio public API changes, multi-select,
  or async menu data.
- New portal, positioning, collection, or focus-management systems.
- Broad Button or DropdownMenu redesign outside the animation migration and
  composition seams required by this family.
