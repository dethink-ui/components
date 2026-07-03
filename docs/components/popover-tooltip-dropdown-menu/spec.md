# Popover Tooltip DropdownMenu Spec

Status: Published to GitHub issue tracker.

Tracker issue: https://github.com/parveshh/dethink-components/issues/122

Package target: `@dethink/components`.

## Branch Workflow

Branch names follow the repository workflow in `AGENTS.md`:

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

## Purpose

Popover, Tooltip, and DropdownMenu provide the anchored overlay layer for
settings panels, filters, inline help, row actions, toolbar actions, account
menus, and dense dashboard controls. They should make non-modal overlays
accessible and collision-aware by default while preserving Dethink provider
tokens, shadcn-compatible anatomy, Storybook/docs coverage, registry
portability, and SSR safety.

This component group also establishes the reusable positioned-overlay
foundation needed before Table, DataTable, DatePicker, Sidebar,
CommandPalette, and AI workflow surfaces build on the same behavior.

## Public API

The planned component family is:

- `Popover`
- `PopoverTrigger`
- `PopoverContent`
- `PopoverArrow`
- `PopoverClose`
- `PopoverHeader`
- `PopoverFooter`
- `PopoverTitle`
- `PopoverDescription`
- `Tooltip`
- `TooltipTrigger`
- `TooltipContent`
- `TooltipArrow`
- `DropdownMenu`
- `DropdownMenuTrigger`
- `DropdownMenuContent`
- `DropdownMenuItem`
- `DropdownMenuItemIcon`
- `DropdownMenuItemLabel`
- `DropdownMenuItemDescription`
- `DropdownMenuShortcut`
- `DropdownMenuGroup`
- `DropdownMenuLabel`
- `DropdownMenuSeparator`
- `DropdownMenuSub`
- `DropdownMenuSubTrigger`
- `DropdownMenuSubContent`
- `DropdownMenuArrow`

Exports should include class-name helpers and public prop/data types for every
public slot. The implementation may collapse or rename anatomy where React Aria
composition makes a smaller API clearer, but it should keep the shadcn-style
consumer experience familiar.

## Prop Contract

Use Dethink public prop names while mapping to React Aria internals:

| Prop | Purpose |
| --- | --- |
| `open` | Controlled overlay open state where supported. Maps to React Aria `isOpen`. |
| `defaultOpen` | Uncontrolled initial open state where supported. |
| `onOpenChange` | Called when the overlay opens or closes. |
| `placement` | Position relative to the trigger. Supports React Aria placement strings such as `bottom`, `bottom start`, `top end`, `start`, and `end`. |
| `offset` | Main-axis distance from trigger. Defaults follow React Aria unless Dethink sets a documented tokenized default. |
| `crossOffset` | Cross-axis offset from the chosen placement. |
| `containerPadding` | Viewport/container collision padding. |
| `shouldFlip` | Whether the overlay flips when it would overflow. |
| `arrowBoundaryOffset` | Minimum arrow distance from overlay edges where arrows are used. |
| `keyboardDismissDisabled` | Disables Escape/platform close requests where React Aria supports it. Requires another visible close path. |
| `shouldCloseOnInteractOutside` | Optional outside-interaction close filter. |
| `delay` | Tooltip open delay. |
| `closeDelay` | Tooltip close delay. |
| `trigger` | Tooltip or menu trigger mode where React Aria supports it. |
| `disabled` | Tooltip or item disabled state depending on slot. |
| `destructive` | DropdownMenu item visual state for dangerous actions. |
| `shouldCloseOnSelect` | Menu/menu item selection close behavior. |
| `onAction` | DropdownMenu item action callback. |
| `className` | Consumer class composition for the public slot. |

## Default Prop Decisions

Use React Aria defaults unless the implementation issue documents a stronger
Dethink reason to override them:

| Prop | Default |
| --- | --- |
| Popover `placement` | `bottom` from React Aria positioning. |
| Popover `offset` | `8` from React Aria Components Popover. |
| Tooltip `placement` | `top` from React Aria Components Tooltip. |
| Generic positioned overlay `offset` | `0` from React Aria positioning when a component does not override it. |
| `crossOffset` | `0`. |
| `containerPadding` | `12`. |
| `shouldFlip` | `true`. |
| `arrowBoundaryOffset` | `0`. |
| Tooltip `delay` | `1500` ms. |
| Tooltip `closeDelay` | `500` ms. |
| Tooltip `trigger` | `hover`, which opens on both hover and focus. |
| Tooltip `shouldCloseOnPress` | `true`. |
| DropdownMenu `trigger` | `press`. |

If Dethink sets component-specific defaults, the implementation must document
them in the component docs and cover them with render or Storybook tests.

## Public Contract

- Popover is for anchored interactive or rich content. Interactive Popover
  content should expose dialog semantics and accessible names.
- Tooltip is for supplemental non-interactive text. It must not be the only
  label for required information, and v1 should not support focusable content
  inside Tooltip.
- DropdownMenu is for action menus, not value selection. Select, Combobox,
  MultiSelect, and CommandPalette remain separate controls.
- New overlay primitives should use the shared provider-aware portal path based
  on `UNSAFE_PortalProvider`; they should not introduce new direct
  `UNSTABLE_portalContainer` usage.
- Stable slot attributes follow the existing `data-slot` convention for root,
  trigger, content, arrow, portal host, menu item, item icon, item content,
  item description, shortcut, group, label, separator, submenu trigger, and
  submenu content slots.
- State is exposed through data attributes rather than private classes:
  `data-placement`, `data-entering`, `data-exiting`, `data-open`,
  `data-disabled`, `data-focused`, `data-focus-visible`, `data-hovered`,
  `data-pressed`, `data-selected`, and `data-has-submenu` where available.
- Examples should prefer start/end placements and logical spacing so RTL is not
  an afterthought.

## Implementation Substrate

- Use `react-aria-components` for `Popover`, `OverlayArrow`,
  `DialogTrigger`/`Dialog` where Popover content is interactive,
  `TooltipTrigger`, `Tooltip`, `MenuTrigger`, `Menu`, `MenuItem`,
  `MenuSection`, `SubmenuTrigger`, `Header`, `Separator`, and `Keyboard` where
  appropriate.
- Use the installed React Aria Components 1.19 and React Aria 3.50 prop
  surface for positioning, open state, tooltip timing, menu behavior, dismissal,
  and overlay render states.
- Reuse `DethinkPortalProvider` and `useProviderPortalRoot` from the Dialog
  work, hardening them only where needed for anchored overlays.
- Do not add Radix UI, Floating UI, Motion, native Popover polyfills, or a
  global OverlayManager in v1.
- Document native Popover API, `popover="hint"`, interest invokers, CSS Anchor
  Positioning, and anchored container queries as future platform alignment.

## Accessibility

- Popover examples with interactive content must include an accessible name and
  keyboard path to close the content.
- Tooltip opens on hover and focus, remains supplemental, is dismissible where
  supported, and is not the only accessible name for an icon-only trigger.
- DropdownMenu uses menu/menuitem semantics, arrow-key navigation, typeahead,
  Escape dismissal, disabled item skipping, submenu behavior where supported,
  and focus return through React Aria.
- Destructive menu items should be visibly distinct without relying on color
  alone in examples.
- Mobile and touch examples should avoid tooltip-only required information.
- Entry/exit animation must respect `prefers-reduced-motion` through
  `motion-safe:` utilities.

## Styling And Theming

Popover, Tooltip, and DropdownMenu are themed through `DethinkProvider` and
`dethink-base`. They must not accept a component-level `theme` prop.

Use provider-level tokens for:

- `--dt-color-background`
- `--dt-color-foreground`
- `--dt-color-muted`
- `--dt-color-muted-foreground`
- `--dt-color-border`
- `--dt-color-ring`
- `--dt-color-primary`
- `--dt-color-primary-foreground`
- `--dt-color-destructive`
- `--dt-color-destructive-foreground`
- `--dt-space-*`
- `--dt-radius-sm`
- `--dt-radius-md`
- `--dt-radius-lg`
- `--dt-shadow-*`
- `--dt-density-control`
- `--dt-density-gap`

Component-scoped CSS variables are acceptable for local geometry such as arrow
size, content max width, menu max height, or trigger width. They must not
replace provider-level color, spacing, radius, density, or motion tokens.

## Out Of Scope

- Drawer/Sheet, ContextMenu, Menubar, NavigationMenu, CommandPalette, Select,
  Combobox, MultiSelect, AsyncSelect, TagInput, Toast, HoverCard,
  Tour/Onboarding, and global OverlayManager.
- Native browser Popover API, CSS Anchor Positioning, interest invokers,
  `popover="hint"`, anchored container queries, and polyfill management as
  runtime requirements for v1.
- Virtualized menus, async menu loading, fuzzy search, command scoring, and
  remote data orchestration.
- Interactive tooltip content and tooltip-only required information.
- Checkbox/radio menu item public APIs and menu-as-form-control patterns unless
  a later slice explicitly validates them.

## Verification Requirements

- Rendered component tests for public props, controlled/uncontrolled open
  state, positioning props, dismissal props, refs, className composition, data
  slots, provider portal context, density, dark mode, and RTL.
- Tooltip tests with fake timers for delay and close-delay behavior.
- DropdownMenu interaction tests for pointer and keyboard open, item action,
  disabled item skipping, typeahead, submenu behavior, Escape close, and focus
  return.
- Accessibility automation with axe for labelled Popover, Tooltip on an
  accessible icon button, and DropdownMenu action groups.
- Storybook stories and play tests for base, controlled, destructive, grouped,
  submenu, theme/density/RTL, custom theme override, reduced-motion, and
  responsive viewport examples.
- SSR render/hydration smoke tests.
- Registry validation and smoke tests for dependency metadata, helper files,
  copied source portability, provider tokens, package exports, and clean
  consumer imports.

## Research Sources

- Context7 React Aria docs for Popover, Tooltip, Menu, MenuTrigger, and
  positioning, fetched 2026-07-03.
- Installed React Aria Components 1.19 and React Aria/React Stately type
  declarations.
- Modern Web Guidance resilient popover/menu, interest-triggered tooltip, and
  position-aware tooltip guidance, fetched 2026-07-03.
- Existing Select, Combobox, DateTimePicker, Dialog, and provider portal
  implementation context in this repository.
