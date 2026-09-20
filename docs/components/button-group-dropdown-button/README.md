# ButtonGroup And DropdownButton

Implementation status: complete through GitHub issues #372–#376 under PRD #371
and selectable-primary issues #379–#381 under PRD #378.

ButtonGroup groups related independent actions without changing their native
behavior. DropdownButton composes Button, ButtonGroup, and the existing
React Aria-backed DropdownMenu into one menu button, an explicit fixed split
button, or a selectable primary action.

## Installation

Registry consumers install the pieces they use:

```text
button-group
dropdown-button
```

`button-group` stays static and does not depend on Motion or DropdownMenu.
`dropdown-button` depends on ButtonGroup and DropdownMenu and therefore installs
the provider-aware portal and positioned-overlay path. DropdownButton and the
migrated DropdownMenu declare `motion` because their source imports
`motion/react`.

Package consumers import from the public entry point:

```tsx
import {
  Button,
  ButtonGroup,
  DropdownButton,
  type DropdownButtonSelectableAction,
  DropdownMenuItem,
} from "@dethink/components";
```

## Anatomy And State

ButtonGroup exposes:

- `button-group` root with `role="group"`, `data-mode`, and `data-orientation`;
- `button-group-separator`, a decorative separator removed from the
  accessibility tree.

DropdownButton exposes:

- `dropdown-button` root with mode, open, loading, loading policy, disabled,
  and Motion data states;
- `dropdown-button-composite`, the ButtonGroup and split-menu anchor;
- `dropdown-button-primary` and `dropdown-button-primary-icon` in split and
  selectable modes;
- `dropdown-button-trigger` in menu mode;
- `dropdown-button-menu-trigger` and `dropdown-button-trigger-icon` in split
  and selectable modes;
- `dropdown-button-menu-anchor` and `dropdown-button-content` around the reused
  DropdownMenu path.

Selectable mode additionally exposes `data-selected-action-id` on the root,
`dropdown-button-selectable-item` on each choice, and
`dropdown-button-selection-indicator` for the Motion-owned Lucide checkmark.
The checkmark is redundant visual feedback for the choice's
`menuitemradio`/`aria-checked` semantics.

## API Summary

ButtonGroup:

- `mode="attached" | "separated"`;
- `orientation="horizontal" | "vertical"`;
- native group labelling attributes and independent Button children.

DropdownButton shared props include Button `variant` and `size`, controlled or
uncontrolled open state, positioning/collision props, class composition props,
and `motionPreset`. Menu and fixed split modes accept `label` plus existing
DropdownMenu children; selectable mode accepts action descriptors instead.

Menu mode is the default. It renders one menu button and rejects primary-action
props in TypeScript.

Split mode requires:

- `mode="split"`;
- `onPrimaryAction` for the native primary Button;
- `menuLabel` for the separately named icon-only menu trigger;
- optional `primaryIcon`, `primaryDisabled`, and `menuDisabled`.

Async split and selectable props are:

- `loading`, which marks the primary Button busy and prevents duplicate
  activation;
- `loadingBehavior="all"`, the default that disables both halves;
- `loadingBehavior="primary"`, an opt-in that leaves product-declared safe menu
  alternatives available.

## Semantic Decision Guide

| Need                                                      | Use                          |
| --------------------------------------------------------- | ---------------------------- |
| A small set of related independent actions                | ButtonGroup                  |
| Pressed selection with a group-owned value                | ToggleGroup, not ButtonGroup |
| A command surface with toolbar semantics and roving focus | Toolbar                      |
| One labelled button revealing related commands            | DropdownButton menu mode     |
| One dominant command plus related alternatives            | DropdownButton split mode    |
| Choose one declared command, then run it from the primary | DropdownButton selectable    |
| Product-specific trigger or row overflow menu             | DropdownMenu directly        |
| A value that persists in a field                          | Select                       |
| A searchable value picker                                 | Combobox                     |
| Input addons participating in field semantics             | InputGroup                   |

DropdownButton menu items are commands. They do not become the trigger value,
and selecting one never promotes it to the fixed split primary action. Use
selectable mode only when choosing a declared action should change the later
primary execution target.

Selectable mode requires:

- `mode="selectable"` and a separately named `menuLabel`;
- `actions` with stable IDs, labels, optional descriptions/icons,
  disabled/destructive state, and one execution handler each;
- either controlled `selectedActionId` plus `onSelectedActionChange`, or
  uncontrolled `defaultSelectedActionId` with an optional change callback.

Choosing a menu item changes the selected primary action without invoking its
handler. The handler runs only when the primary half is activated. The menu
uses accessible single-selection semantics and a redundant visual checkmark.
Stable IDs are the state boundary: descriptor updates immediately replace the
selected label, icon, handler, disabled state, and destructive state without
changing selection or retaining stale execution behavior.

The initial action is always explicit. Selectable mode throws a clear runtime
error for an empty action collection, duplicate IDs, or a selected ID that is
not present. It does not silently choose the first action.

## Keyboard And Focus

- ButtonGroup leaves every enabled child in normal Tab order. It does not add
  Left/Right Arrow behavior or roving tabindex.
- Menu mode uses Enter, Space, and supported Up/Down Arrow opening behavior
  from React Aria.
- Split primary Enter/Space runs only `onPrimaryAction`; it never opens the
  menu.
- Split and selectable menu triggers are the second normal Tab stop and always
  have the localizable `menuLabel` name.
- Selectable choices use `menuitemradio`. Selection closes the menu and returns
  focus without invocation; a later primary Enter/Space or click runs the
  selected handler. Escape returns focus without changing selection.
- Open menus inherit arrow navigation, Home/End, typeahead, disabled-item
  skipping, item activation, submenus, Escape dismissal, and focus return from
  DropdownMenu.
- If an open split menu becomes unavailable, it closes. Focus moves to the
  primary action when that action remains available.

See [manual acceptance](./manual-acceptance.md) for the keyboard and
screen-reader matrix.

## Positioning, Theme, Density, And RTL

Menu content defaults to logical `bottom start` placement and uses the existing
collision/flipping foundation. Split and selectable modes supply the complete
composite as the positioning reference, so `--trigger-width` reflects both
native buttons.

All geometry uses existing Button and provider tokens. Stories cover light,
dark, high-contrast tokens, compact/default/comfortable density, logical RTL
corners, long labels, narrow containers, every relevant Button variant and
size, and open/closed states. In split and selectable modes, both native button
segments inherit the same public `size`; the menu trigger overrides only its
square inline size, so `xs` through `xl` remain exactly height-aligned.

## Motion And Reduced Motion

ButtonGroup has no intrinsic motion. DropdownButton uses Motion for chevron,
controlled or selected primary label/icon, selected-check presence, and busy
feedback. DropdownMenu uses Motion for surface presence and changed item
feedback. Stable action IDs and transform/opacity are used where motion
clarifies continuity. When a controlled or selected label changes length,
DropdownButton measures the new intrinsic label width and animates the label
viewport's numeric width with Motion. The attached buttons and border geometry
are never scale-transformed, so seams and focus rings remain crisp.

`motionPreset="none"` resolves state immediately without animation. The user's
reduced-motion preference removes transform choreography and leaves only brief
opacity feedback on the menu surface. Open, busy, disabled, destructive,
selected, and focused meaning never depends on animation. The DropdownButton
and DropdownMenu source paths do not add Tailwind `animate-*` or `transition-*`
animation utilities.

## Responsive Action Handoff

The documented recipe defines one inline-size container threshold:

- the safe fallback is a narrow ButtonGroup plus DropdownButton overflow;
- at the declared wide threshold, the same action definitions render in a full
  ButtonGroup;
- action IDs, labels, permission/disabled rules, destructive meaning, and
  handlers are shared across both render paths.

This is application-owned. ButtonGroup does not measure, rank, hide, or move
children and does not install ResizeObserver. See the showcase example
`button-group/responsive-action-handoff.tsx`.

Use separated mode for the narrow outer ButtonGroup: DropdownButton already
owns its internal attached group, so an outer attached group cannot own the
composite's inner seam.

## Testing

Coverage includes rendered behavior, TypeScript discriminants, controlled and
uncontrolled selection, choose-versus-execute delivery, descriptor updates,
pointer and keyboard flows, async policies, disabled combinations, focus
continuity, single-selection semantics, Motion presets, reduced motion, axe,
SSR/hydration, package declarations/builds, registry validation, registry
dependency smoke, Storybook interactions/builds, and showcase/playground
consumer builds.

## Migration Notes

DropdownMenu surface entry/exit and changed item feedback migrated from
Tailwind keyframes/transitions to `motion/react`. Registry consumers must retain
the new `motion` dependency. Roles, focus behavior, collection behavior,
submenus, provider portals, positioning props, and public menu anatomy remain
unchanged.

Selectable mode adds `lucide-react` for the tree-shakeable selected checkmark.
Registry consumers upgrading the `dropdown-button` item receive both
`lucide-react` and `motion`; product-supplied action icons remain ordinary
React nodes and do not require another icon system.

Button and ButtonGroup now allow their stable `data-slot` value to be
overridden by policy compositions. Button also accepts `loadingIndicator` so a
composition can provide Motion-owned busy feedback while retaining Button's
busy and disabled semantics.

## Known Limitations

- No Toolbar or ToggleGroup semantics are included.
- No automatic responsive overflow, child measurement, or priority inference
  is included.
- No built-in last-used-action persistence is included.
- No multi-selection, implicit first-action selection, automatic persistence,
  or action invocation during menu selection is included.
- DropdownButton does not own async work or promises; applications control
  `loading` and the primary label/icon/handler.
- Menu checkbox/radio selection and async menu data remain DropdownMenu or
  application concerns.
