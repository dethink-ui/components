# Popover Tooltip DropdownMenu Issue Breakdown

Status: Published to GitHub issue tracker.

This uses the `to-issues` tracer-bullet format.

Package target: `@dethink/components`.

## Published Issues

- Parent PRD: https://github.com/parveshh/dethink-components/issues/122
- AFK Popover Tooltip DropdownMenu contract and local planning docs: https://github.com/parveshh/dethink-components/issues/123
- AFK Shared positioned overlay foundation and provider portal path: https://github.com/parveshh/dethink-components/issues/124
- AFK Popover primitive source, tests, registry, and base stories: https://github.com/parveshh/dethink-components/issues/125
- AFK Tooltip primitive source, tests, registry, and interaction stories: https://github.com/parveshh/dethink-components/issues/126
- AFK DropdownMenu primitive source, tests, registry, and action-menu stories: https://github.com/parveshh/dethink-components/issues/127
- AFK Popover Tooltip DropdownMenu provider theming, docs, recipes, and final verification: https://github.com/parveshh/dethink-components/issues/128

## Branch Stack

1. `feature/prd-122-popover-tooltip-dropdown-menu`
2. `feature/issue-123-overlay-menu-contract-docs`
3. `feature/issue-124-positioned-overlay-foundation`
4. `feature/issue-125-popover-primitive`
5. `feature/issue-126-tooltip-primitive`
6. `feature/issue-127-dropdown-menu-primitive`
7. `feature/issue-128-overlay-menu-integration-docs`

Create the PRD branch from the current integration base. Create Issue 1 from
the PRD branch, then stack each later issue branch from the previous issue
branch unless the GitHub issue dependency graph says otherwise. The final
implementation PR should target the PRD branch, not the repository default
branch, unless explicitly requested.

## Proposed Breakdown

1. **Title**: Popover Tooltip DropdownMenu contract and local planning docs (#123)
   **Type**: AFK
   **Blocked by**: #122
   **User stories covered**: 1-33

2. **Title**: Shared positioned overlay foundation and provider portal path (#124)
   **Type**: AFK
   **Blocked by**: #123
   **User stories covered**: 6-10, 22-30

3. **Title**: Popover primitive source, tests, registry, and base stories (#125)
   **Type**: AFK
   **Blocked by**: #124
   **User stories covered**: 1, 4, 6-10, 16, 18, 22-30, 32

4. **Title**: Tooltip primitive source, tests, registry, and interaction stories (#126)
   **Type**: AFK
   **Blocked by**: #124
   **User stories covered**: 3, 5-10, 17, 20-30, 33

5. **Title**: DropdownMenu primitive source, tests, registry, and action-menu stories (#127)
   **Type**: AFK
   **Blocked by**: #124
   **User stories covered**: 2, 4, 6-15, 19, 22-31

6. **Title**: Popover Tooltip DropdownMenu provider theming, docs, recipes, and final verification (#128)
   **Type**: AFK
   **Blocked by**: #125, #126, #127
   **User stories covered**: 1-33

## Published Issue #123

## What to build

Create the local contract and planning documents for the Popover + Tooltip +
DropdownMenu PRD. The docs should define the component group scope, public
anatomy, prop contracts, React Aria behavior substrate, provider-aware portal
strategy, positioning and arrow props, accessibility invariants, theming tokens,
testing seams, out-of-scope boundaries, and stacked branch mapping.

This slice should not implement runtime component source beyond documentation
examples needed to clarify the contract.

## Acceptance criteria

- [ ] Local specification, PRD mirror, and issue breakdown documents exist for the Popover + Tooltip + DropdownMenu group.
- [ ] The docs identify Popover + Tooltip + DropdownMenu as the next high-impact component group after Dialog + AlertDialog.
- [ ] The docs define public anatomy for Popover, Tooltip, DropdownMenu, shared overlay helper, and optional arrows.
- [ ] The docs define open-state props where supported: `open`, `defaultOpen`, `onOpenChange`, tooltip delay/close delay, and menu trigger behavior.
- [ ] The docs define positioning props: `placement`, `offset`, `crossOffset`, `containerPadding`, `shouldFlip`, `arrowBoundaryOffset`, and documented defaults.
- [ ] The docs define accessibility expectations for popover-dialog content, non-interactive tooltips, menu/menuitem semantics, keyboard behavior, Escape/outside dismissal, focus return, and mobile/touch limitations.
- [ ] The docs define provider-level theme, density, direction, custom token inheritance, reduced-motion behavior, and RTL-safe placement expectations through portals.
- [ ] The docs separate this PRD from Drawer, ContextMenu, Menubar, NavigationMenu, CommandPalette, Select, Combobox, MultiSelect, Toast, HoverCard, native Popover API runtime requirements, and global OverlayManager work.
- [ ] The docs list render, interaction, accessibility, SSR, Storybook, registry, and playground smoke testing seams.

## Blocked by

- #122

## Published Issue #124

## What to build

Build the reusable positioned-overlay foundation that Popover, Tooltip, and
DropdownMenu can share. The completed slice should harden provider-aware portal
behavior through `UNSAFE_PortalProvider`, expose reusable positioning/arrow
class helpers or internal utilities where they reduce duplication, and prove
the shared path with tests and at least one Storybook-facing fixture.

This slice may migrate or wrap only the minimal existing overlay code needed to
validate the shared helper. It should not turn into a broad OverlayManager,
global stack manager, or native Popover polyfill layer.

## Acceptance criteria

- [ ] New overlay primitives can render through a provider-aware portal host without directly using deprecated `UNSTABLE_portalContainer`.
- [ ] Portal hosts mirror DethinkProvider theme, density, direction, className, font, and custom themeConfig style attributes.
- [ ] Shared positioning props are represented consistently: `placement`, `offset`, `crossOffset`, `containerPadding`, `shouldFlip`, and `arrowBoundaryOffset` where supported.
- [ ] Overlay surfaces expose stable `data-placement`, `data-entering`, and `data-exiting` state hooks where React Aria provides them.
- [ ] Optional arrow rendering has a stable slot and class helper, and arrow placement responds to React Aria placement state.
- [ ] Shared styles use provider-level tokens for background, foreground, border, radius, shadow, focus ring, spacing, density, and motion.
- [ ] Reduced-motion behavior is gated behind `motion-safe:` utilities.
- [ ] SSR smoke coverage verifies closed overlays render/hydrate without mismatch warnings.
- [ ] Render tests verify provider portal inheritance, className composition, data-slot attributes, and RTL/density propagation.
- [ ] The implementation avoids adding Floating UI, Radix UI, Motion, native Popover polyfills, or a global overlay manager.

## Blocked by

- #123

## Published Issue #125

## What to build

Build the Popover primitive path for anchored interactive or rich content. The
completed slice should provide shadcn-compatible Popover anatomy backed by
React Aria DialogTrigger, Popover, OverlayArrow, and Dialog semantics where
appropriate; support controlled/uncontrolled open state; expose placement and
dismissal props; inherit DethinkProvider theme through portals; and include
focused tests, Storybook examples, registry metadata, package exports, and
playground smoke coverage.

## Acceptance criteria

- [ ] Popover components are exported with public prop/data types and class-name helpers.
- [ ] Popover supports root, trigger, content, arrow, close, title, description, header, and footer anatomy where useful.
- [ ] Popover supports `open`, `defaultOpen`, `onOpenChange`, `placement`, `offset`, `crossOffset`, `containerPadding`, `shouldFlip`, `keyboardDismissDisabled`, `shouldCloseOnInteractOutside`, `className`, refs, and content class composition.
- [ ] Popover content uses accessible dialog semantics for interactive content and provides labelled examples.
- [ ] Popover exposes stable `data-slot` attributes for root, trigger, content, panel/dialog, arrow, close, title, description, header, footer, and portal host.
- [ ] Popover exposes relevant React Aria state attributes such as `data-placement`, `data-entering`, and `data-exiting`.
- [ ] Popover defaults handle trigger open, Escape close, outside close, focus movement, focus return, and controlled close behavior through React Aria rather than custom keyboard logic.
- [ ] Popover styles content, arrow, close affordance, title, description, footer actions, focus-visible, density, dark mode, RTL, and reduced-motion states using provider-level tokens only.
- [ ] Storybook examples cover base content, controlled state, settings/filter panel, form composition, arrow placement, disabled trigger where applicable, theme/density/RTL, and custom theme overrides.
- [ ] Render, accessibility, SSR, registry, and playground smoke coverage verify the base Popover path.

## Blocked by

- #124

## Published Issue #126

## What to build

Build the Tooltip primitive path for supplemental non-interactive help text.
The completed slice should provide Tooltip anatomy backed by React Aria
TooltipTrigger, Tooltip, and OverlayArrow behavior; support delay, close delay,
trigger mode, disabled state, positioning, optional arrows, provider-themed
portal rendering, minimal enter/exit motion, and focused tests/stories that
verify hover, focus, keyboard dismissal, and accessibility expectations.

## Motion scope

This issue should include only minimal overlay motion: a short
opacity/translate/scale enter and exit treatment driven by React Aria
`data-entering`, `data-exiting`, and `data-placement` hooks, with
`prefers-reduced-motion` support. Do not introduce richer choreography,
gesture effects, sequencing, layout animations, or a new animation dependency
in this issue; those belong in a separate animation PRD.

## Acceptance criteria

- [ ] Tooltip components are exported with public prop/data types and class-name helpers.
- [ ] Tooltip supports trigger and content anatomy with optional arrow rendering and stable `data-slot` attributes.
- [ ] Tooltip supports `delay`, `closeDelay`, `trigger`, `disabled`, `open`, `defaultOpen`, `onOpenChange`, `placement`, `offset`, `crossOffset`, `containerPadding`, `shouldFlip`, `arrowBoundaryOffset`, `className`, and refs where React Aria supports them.
- [ ] Tooltip opens on hover and focus, can be dismissed through supported keyboard behavior, and does not rely on pointer-only access.
- [ ] Tooltip content is non-interactive in v1 and docs explicitly reject focusable content inside Tooltip.
- [ ] Tooltip examples do not use tooltip text as the only accessible name for an icon-only control; the trigger retains an explicit accessible name.
- [ ] Tooltip exposes `data-placement`, `data-entering`, and `data-exiting` state hooks where React Aria provides them.
- [ ] Tooltip uses minimal provider-tokenized enter/exit motion for opacity, translate, and scale; it respects reduced motion and does not add a Motion dependency.
- [ ] Tooltip styles content and arrow with provider-level background, foreground, border, radius, shadow, spacing, density, focus ring, RTL, and reduced-motion tokens.
- [ ] Storybook examples cover icon-button tooltip, delayed tooltip, focus-triggered tooltip, disabled tooltip, arrow placement, long text wrapping, theme/density/RTL, reduced-motion class coverage, and minimal motion behavior.
- [ ] Render, fake-timer interaction, accessibility, SSR, registry, and playground smoke coverage verify the Tooltip path.

## Blocked by

- #124

## Published Issue #127

## What to build

Build the DropdownMenu primitive path for action menus. The completed slice
should provide DropdownMenu anatomy backed by React Aria MenuTrigger, Menu,
MenuItem, MenuSection, SubmenuTrigger, Popover, OverlayArrow, Header,
Separator, and Keyboard where appropriate; support controlled/uncontrolled open
state, item action callbacks, disabled/destructive states, sections, labels,
separators, shortcuts, submenus, provider-themed portals, and focused
tests/stories for pointer and keyboard flows.

## Acceptance criteria

- [ ] DropdownMenu components are exported with public prop/data types and class-name helpers.
- [ ] DropdownMenu supports root, trigger, content, item, item icon, item label/content, item description, item shortcut, group/section, label/header, separator, submenu trigger, submenu content, arrow, and portal host slots where useful.
- [ ] DropdownMenu supports `open`, `defaultOpen`, `onOpenChange`, `trigger`, `placement`, `offset`, `crossOffset`, `containerPadding`, `shouldFlip`, `disabledKeys`, `selectionMode` only where intentionally supported, `shouldCloseOnSelect`, item `onAction`, item `disabled`, item `destructive`, className composition, and refs.
- [ ] DropdownMenu uses menu/menuitem semantics through React Aria and does not masquerade as Select, Combobox, CommandPalette, ContextMenu, Menubar, or NavigationMenu.
- [ ] DropdownMenu keyboard behavior covers open from trigger, Arrow key navigation, typeahead, Enter/Space activation, disabled item skipping, submenu open/close where supported, Escape close, and focus return to trigger.
- [ ] DropdownMenu exposes stable `data-slot` attributes and relevant state attributes including disabled, focused, focus-visible, hovered, pressed, selected where supported, open, has-submenu, placement, entering, and exiting.
- [ ] DropdownMenu styles menu surface, items, icons, descriptions, shortcuts, separators, labels, submenu indicators, destructive state, disabled state, focus-visible, density, dark mode, RTL, and reduced-motion states using provider-level tokens only.
- [ ] Storybook examples cover base actions, row action menu, toolbar menu, destructive item, disabled item, grouped actions, shortcuts, submenu, controlled state, theme/density/RTL, and custom theme overrides.
- [ ] Render, interaction, accessibility, SSR, registry, and playground smoke coverage verify the DropdownMenu path.
- [ ] Checkbox/radio menu item public APIs and menu-as-form-control patterns remain out of scope unless explicitly validated in a later issue.

## Blocked by

- #124

## Published Issue #128

## What to build

Finish Popover + Tooltip + DropdownMenu as documented, installable,
provider-themed overlay primitives. This slice should complete provider
theme/density/RTL examples, custom themeConfig coverage, docs, recipes,
interaction tests, registry/playground smoke checks, and final verification for
the positioned overlay component group.

## Acceptance criteria

- [ ] Documentation covers overview, installation, anatomy, API, controlled/uncontrolled state, positioning props, collision behavior, arrows, dismissal behavior, accessibility, keyboard behavior, focus management, theming tokens, density, RTL, recipes, testing, migration notes, and out-of-scope boundaries.
- [ ] Recipes cover filter popover, settings popover, inline help tooltip, icon-only action tooltip, table row action menu, account/workspace menu, destructive action menu item, grouped toolbar menu, and submenu examples.
- [ ] Provider-level theme stories cover light, dark, system, compact, default, comfortable, nested provider scope, custom `themeConfig` tokens, and RTL direction across Popover, Tooltip, and DropdownMenu.
- [ ] Storybook interaction tests cover pointer and keyboard open/close, controlled Popover and DropdownMenu state, Escape close, outside dismissal and filtering where supported, Tooltip hover/focus delay behavior, DropdownMenu item action callbacks, submenu behavior, focus return, provider-themed portal context, reduced-motion class coverage, and responsive viewport positioning smoke.
- [ ] Accessibility tests cover labelled Popover content, Tooltip on accessible icon buttons, DropdownMenu action groups, destructive menu examples, disabled item behavior, and no missing accessible names.
- [ ] SSR tests cover closed/default Popover, Tooltip, and DropdownMenu render/hydration without mismatch warnings.
- [ ] Registry validation and registry smoke verify copied source portability, dependency metadata, aliases, style imports, CSS variable reliance, package exports, Button/IconButton dependency paths where needed, and provider-aware portal behavior.
- [ ] Playground smoke coverage exercises Popover, Tooltip, and DropdownMenu through package exports and provider theme path.
- [ ] Final verification commands pass or are documented with specific blockers.
- [ ] Follow-up cleanup is documented for any existing Select, Combobox, or DateTimePicker portal code that remains outside the shared overlay helper after this PRD.

## Blocked by

- #125
- #126
- #127
