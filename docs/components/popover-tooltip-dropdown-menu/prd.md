# Popover Tooltip DropdownMenu PRD

Status: Published to GitHub issue tracker.

Tracker issue: https://github.com/parveshh/dethink-components/issues/122.

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

## Problem Statement

Teams building SaaS dashboards, internal tools, B2B applications, admin
settings, CRUD screens, data tables, AI configuration panels, and dense
dashboard surfaces need a consistent non-modal overlay layer after Dialog and
AlertDialog. The library now has Select, Combobox, DateTimePicker, and
Dialog/AlertDialog, but consumers still need to hand-assemble generic
popovers, hover/focus tooltips, dropdown action menus, row action menus, nested
menu groups, keyboard handling, overlay positioning, collision behavior,
provider-token inheritance through portals, reduced-motion animation, and
registry-safe examples.

## Solution

Ship a provider-themed Popover, Tooltip, and DropdownMenu component family for
`@dethink/components` using `react-aria-components` and the existing
provider-aware portal helper as the accessibility and positioning substrate.
The public API should feel familiar to shadcn-style consumers while preserving
Dethink prop names, stable `data-slot` attributes, controlled/uncontrolled open
state where supported, collision-aware placement props, optional arrows,
class-name helper exports, token-backed styling, Storybook/docs coverage,
accessibility tests, SSR smoke coverage, and registry portability.

The component group should also establish the reusable positioned-overlay
foundation that future overlays can share. Select and Combobox currently carry
local portal-host synchronization, and DateTimePicker uses React Aria Popover
directly. This PRD should align the next overlay work around
`UNSAFE_PortalProvider`, React Aria positioning props, `data-placement`,
`data-entering`, `data-exiting`, provider-level theme inheritance, and
documented future alignment with native Popover and CSS Anchor Positioning
without making those newer platform APIs required for v1.

## User Stories

1. As a dashboard engineer, I want Popover, so that compact settings, filters, and contextual panels can open near a trigger without building positioning logic.
2. As an internal-tool engineer, I want DropdownMenu, so that row actions, toolbar menus, account menus, and command groups use consistent action-menu semantics.
3. As a product engineer, I want Tooltip, so that icon-only controls and dense UI labels expose supplemental text on hover and focus.
4. As a package consumer, I want controlled and uncontrolled open state for Popover and DropdownMenu, so that product flows can coordinate overlays with app state.
5. As a package consumer, I want Tooltip delay and close-delay props, so that hover/focus help feels deliberate rather than noisy.
6. As a package consumer, I want placement, offset, crossOffset, containerPadding, and shouldFlip props, so that overlays can be tuned without custom CSS positioning.
7. As a package consumer, I want optional arrow components, so that popovers and tooltips can visually point to their trigger when the design calls for it.
8. As a package consumer, I want stable trigger, content, arrow, item, label, separator, group, and shortcut slots, so that tests and local styles can target anatomy reliably.
9. As a package consumer, I want className composition and exported class-name helpers, so that local product styling can extend the defaults safely.
10. As a package consumer, I want ref forwarding on public slots, so that app code can integrate measurement, focus, and imperative positioning hooks where needed.
11. As a package consumer, I want DropdownMenu items to support disabled and destructive states, so that dangerous actions are visually clear and unavailable actions remain discoverable.
12. As a package consumer, I want DropdownMenu items to support icons, descriptions, and keyboard shortcut text, so that dense menus remain scannable.
13. As a package consumer, I want menu sections and separators, so that related actions can be grouped without fake disabled menu items.
14. As a package consumer, I want submenus where React Aria supports them, so that nested action groups can be represented without custom hover timers.
15. As a keyboard user, I want DropdownMenu to open from keyboard, move through items with arrow keys, support typeahead, skip disabled items, close with Escape, and return focus to the trigger.
16. As a keyboard user, I want Popover content to receive focus when interactive and close predictably with Escape or outside interaction where appropriate.
17. As a keyboard user, I want Tooltip content to appear on focus as well as hover, so that icon-only buttons are understandable without a pointer.
18. As a screen-reader user, I want Popover examples with interactive content to include a proper dialog label or description when needed.
19. As a screen-reader user, I want DropdownMenu triggers and items to expose menu and menuitem semantics through React Aria rather than generic divs.
20. As a screen-reader user, I want Tooltip to be associated with the trigger through React Aria semantics and not replace visible labels.
21. As a mobile or touch user, I want tooltips to avoid becoming the only way to access required information.
22. As an RTL user, I want start/end placements, submenu direction, icon spacing, and arrow placement to respect provider direction.
23. As a design-system lead, I want all overlay surfaces to inherit DethinkProvider theme, density, direction, font, and custom themeConfig through portals.
24. As a design-system lead, I want overlay color, border, shadow, radius, spacing, focus ring, destructive, muted, and motion states to use provider tokens only.
25. As a motion-sensitive user, I want overlay animations gated behind `motion-safe:` utilities, so that reduced-motion users do not get unnecessary transforms.
26. As a Storybook user, I want examples for base popover, controlled popover, form/filter popover, tooltip on icon buttons, delayed tooltip, action dropdown, destructive menu item, grouped menu, submenu, theme/density/RTL, and provider token overrides.
27. As a registry consumer, I want accurate registry metadata for each overlay primitive, so that copied components include the required helper files and dependencies.
28. As an SSR app developer, I want closed overlays to render and hydrate without mismatch warnings, and default-open examples to hydrate safely where supported.
29. As a maintainer, I want shared overlay behavior tested at public seams, so that future DatePicker, DataTable, Sidebar, CommandPalette, and AI components reuse the same foundation.
30. As a maintainer, I want native Popover API, CSS Anchor Positioning, and interest-triggered tooltip behavior documented as future platform alignment, so that v1 does not depend on APIs with incomplete baseline support.
31. As a maintainer, I want DropdownMenu to stay separate from Select, Combobox, CommandPalette, ContextMenu, Menubar, and NavigationMenu, so that the first action-menu primitive stays focused.
32. As a maintainer, I want Popover to stay separate from Dialog and Drawer, so that lightweight anchored panels do not inherit modal-dialog responsibilities.
33. As a maintainer, I want Tooltip to stay informational and non-interactive in v1, so that hover/focus help does not become a hidden command surface.

## Implementation Decisions

- The next high-impact component group is Popover + Tooltip + DropdownMenu
  because the priority overlay places it immediately after Dialog + AlertDialog
  and before Table/DataTable.
- Use `react-aria-components` as the behavior substrate: Popover,
  OverlayArrow, DialogTrigger/Dialog for interactive popover content,
  TooltipTrigger/Tooltip, MenuTrigger/Menu/MenuItem/MenuSection/SubmenuTrigger,
  Header, Separator, and Keyboard where appropriate.
- Use installed React Aria Components 1.19 and React Aria 3.50 prop surfaces:
  `placement`, `offset`, `crossOffset`, `containerPadding`, `shouldFlip`,
  `triggerRef`, `arrowBoundaryOffset`, `isOpen`, `defaultOpen`,
  `onOpenChange`, `isKeyboardDismissDisabled`,
  `shouldCloseOnInteractOutside`, tooltip `delay`, tooltip `closeDelay`,
  tooltip `trigger`, menu `trigger`, menu `selectionMode`, `disabledKeys`,
  `shouldCloseOnSelect`, item `onAction`, and submenu `delay` where supported.
- Target `UNSAFE_PortalProvider` through the existing provider-aware portal
  helper. Avoid new direct uses of deprecated `UNSTABLE_portalContainer`.
- Extract or harden a reusable positioned overlay helper only where it removes
  real duplication across Popover, Tooltip, DropdownMenu, Select, Combobox, and
  DateTimePicker. Do not create a broad OverlayManager or stacking system in v1.
- Popover is for anchored interactive or rich content and should render
  interactive content with dialog semantics when appropriate.
- Tooltip is for supplemental non-interactive text. It must not be the only
  label for required information, and v1 should not support buttons, links, or
  focusable content inside tooltips.
- DropdownMenu is for action menus, not value selection. It should support
  items, sections/groups, labels, separators, shortcuts, disabled state,
  destructive state, icon/content slots, and submenus where React Aria supports
  them.
- Keep Select, Combobox, MultiSelect, CommandPalette, ContextMenu, Menubar,
  NavigationMenu, and Toast out of scope except for shared overlay helper
  compatibility and documentation boundaries.
- Use provider-level theme tokens only; do not add a component-level theme prop.
- Use React Aria placement/open/focus/disabled/selection data attributes where
  available.
- Use logical properties and placement names that remain RTL-safe.
- Use tokenized `motion-safe:` transitions for opacity and transform. Do not
  add Motion/Framer Motion or Floating UI for v1.
- Document browser-native Popover API, `popover="hint"`, interest invokers,
  CSS Anchor Positioning, and anchored container queries as future alignment.
- Preserve React Aria defaults unless a component issue documents and tests a
  Dethink override: Popover placement `bottom`, Popover offset `8`, Tooltip
  placement `top`, generic positioning offset `0`, crossOffset `0`,
  containerPadding `12`, shouldFlip `true`, arrowBoundaryOffset `0`, Tooltip
  delay `1500` ms, Tooltip closeDelay `500` ms, Tooltip trigger `hover`,
  Tooltip shouldCloseOnPress `true`, and DropdownMenu trigger `press`.

## Theming Token Plan

Required provider-token coverage:

- Overlay surfaces: background, foreground, border, muted,
  muted-foreground, radius, shadow, and z-index/layer conventions.
- Menu items: hover, focus-visible, pressed, disabled, selected, destructive,
  icon, description, shortcut, and submenu indicator colors.
- Tooltip surfaces: compact spacing, max width, foreground/background contrast,
  shadow, and arrow fill/stroke.
- Popover content: content padding, header/footer spacing, title/description
  typography, close affordance, and form/filter composition.
- Focus-visible: ring tokens and outline-safe states for triggers and menu
  items.
- Density: density control and density gap tokens for trigger-adjacent spacing
  and menu item height.
- Motion: tokenized transition durations/easings applied through `motion-safe:`
  utilities and React Aria entering/exiting data attributes.
- RTL: logical spacing, start/end placements, submenu chevrons, and arrow
  alignment.

## Testing Decisions

- Tests should assert public behavior, accessible roles/names/descriptions,
  keyboard interaction, dismissal behavior, provider-token inheritance,
  positioning props, and stable slots rather than private React Aria internals.
- Shared overlay tests should cover provider-aware portal inheritance,
  className composition, arrow slots, `data-placement`, entering/exiting
  classes, default placement/offset values, SSR-safe closed rendering, and
  deprecated portal avoidance for new primitives.
- Popover tests should cover controlled/uncontrolled open state, trigger
  opening, Escape close, outside close filtering, focus behavior, close
  behavior, labelled interactive content, refs, classes, and placement props.
- Tooltip tests should cover hover and focus open paths, delay/closeDelay
  behavior with fake timers, Escape dismissal where supported, disabled
  tooltips, placement, arrow rendering, accessible association, and no axe
  violations in labelled examples.
- DropdownMenu tests should cover trigger opening, keyboard navigation,
  typeahead, item action callbacks, disabled items, destructive styling,
  sections, separators, shortcuts, submenu open/close where supported,
  `shouldCloseOnSelect`, focus return, and data-slot/data-state attributes.
- Accessibility tests should use axe for labelled Popover content, Tooltip on
  an icon button with a visible accessible trigger name, DropdownMenu action
  groups, destructive menu examples, and theme/RTL portal examples.
- Storybook interaction tests should cover pointer and keyboard open/close,
  menu item action callbacks, submenu flows, tooltip focus/hover behavior,
  provider-themed portal context, reduced-motion class coverage, and responsive
  viewport positioning smoke.
- SSR tests should cover server render and hydration without mismatch warnings.
- Registry smoke should verify dependency metadata, helper files, aliases, CSS
  variable reliance, package exports, provider-aware portal behavior, and
  copied-source portability.

## Out Of Scope

- Drawer/Sheet, ContextMenu, Menubar, NavigationMenu, CommandPalette, Select,
  Combobox, MultiSelect, AsyncSelect, TagInput, Toast, HoverCard,
  Tour/Onboarding, and global OverlayManager.
- Native browser Popover API, CSS Anchor Positioning, interest invokers,
  `popover="hint"`, anchored container queries, and polyfill management as
  runtime requirements for v1.
- Virtualized menus, async menu loading, fuzzy search, command scoring,
  typeahead beyond React Aria behavior, and remote data orchestration.
- Multi-select dropdowns, checkbox/radio menu item public APIs, and
  menu-as-form-control patterns unless a later slice explicitly validates them.
- Interactive tooltip content, focusable controls inside Tooltip, and
  tooltip-only required information.
- Complex collision debugging UI, custom boundary element APIs beyond React Aria
  supported props, and global z-index stack orchestration.
- Form library adapters, validation schema resolvers, server action
  orchestration, and app-level dirty-state protection.

## Further Notes

- Research basis: repository priority overlay and existing Select, Combobox,
  DateTimePicker, Dialog, and provider portal implementations; Context7 React
  Aria docs for Popover, Tooltip, Menu, MenuTrigger, and positioning; installed
  React Aria Components 1.19 and React Aria/React Stately type declarations;
  and Modern Web Guidance for resilient popovers, interest-triggered tooltips,
  and position-aware arrows fetched on 2026-07-03.
- The strongest implementation constraint is avoiding another one-off portal
  strategy. New overlay primitives should use the shared provider-aware portal
  path established during Dialog work, and the implementation issues should
  decide whether Select, Combobox, and DateTimePicker migrate onto the helper
  during this PRD or remain as documented follow-up cleanup.
