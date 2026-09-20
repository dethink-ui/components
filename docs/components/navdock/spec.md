# NavDock Component Spec

Status: Published to GitHub issue tracker.

Parent PRD: https://github.com/parveshh/dethink-components/issues/205

Implementation issue: https://github.com/parveshh/dethink-components/issues/206

Package target: `@dethink/components`.

## Purpose

NavDock is a dock-style navigation primitive for quick access to primary
destinations or in-page navigation from an edge of a product interface. It is
distinct from NavigationMenu flyouts and Sidebar app-shell navigation: NavDock's
defining behavior is compact, icon-first spatial navigation with Motion-powered
hover/focus magnification, optional title reveal, optional submenus, and
responsive collapsed mode.

NavDock must treat navigation as navigation. Route destinations should render
real anchors, in-page navigation should render real buttons, and submenu items
should behave as disclosure triggers. Ordinary NavDock submenus are not ARIA
application menus.

## Component Family

The v1 family should include:

- `NavDock`: root navigation surface, state coordinator, placement, positioning,
  collapsed-mode, and Motion configuration boundary.
- `NavDockList`: item list for the dock axis.
- `NavDockItem`: item container and data/slot bridge. It accepts `icon` and
  `title` props in the common path.
- `NavDockLink`: anchor item for route navigation.
- `NavDockButton`: button item for in-page navigation.
- `NavDockSeparator`: decorative list separator for compound dock groups.
  `NavDockDivider` is a compatibility alias.
- `NavDockSubmenu`: submenu state/content wrapper for compound composition.
- `NavDockSubmenuTrigger`: disclosure trigger for a submenu item.
- `NavDockSubmenuContent`: disclosure panel content.
- `NavDockIndicator`: optional current/open/active visual indicator.

Do not require `NavDockIcon` or `NavDockTitle` public parts in v1. The common
API should use `icon` and `title` props, while compound children remain
available where consumers need custom markup.

## Dependencies

- Existing Dethink primitives and utilities: provider tokens, density and
  direction attributes, class-name merging, Link/Button/IconButton conventions,
  existing positioned overlay utilities where practical, Storybook/showcase
  patterns, registry conventions, a11y test harness, and SSR test patterns.
- `motion` / `motion/react` is a required runtime dependency for NavDock. ADR
  0001 records why NavDock intentionally differs from CSS-only NavigationMenu
  and Sidebar motion decisions.
- Do not add Floating UI, Radix, a new overlay manager, router adapters, or a
  component-local theming runtime for v1 unless a later implementation issue
  proves the existing utilities insufficient.

## Public API Direction

Root-level props should support:

- `items` for the recommended data-driven API.
- `children` for compound composition.
- `placement`: `bottom`, `top`, `left`, or `right`; default `bottom`.
- `position`: `static`, `absolute`, or `fixed`; default `static`.
- `variant`: `default`, `glass`, or `solid`.
- `size`: `sm`, `md`, or `lg`; default `md`.
- `showTitle`: `never`, `hover`, or `always`; default `hover`.
- `motion`: `none`, `subtle`, `standard`, or `expressive`; default
  `standard`.
- `CollapseDock` as the explicit compound slot for collapsed mode.
- `collapseMode`, `collapsed`, `defaultCollapsed`, `onCollapsedChange`,
  `triggerIcon`, `triggerLabel`, and `collapseLabel` remain available as
  compatibility/configuration props.
- `value`, `defaultValue`, and `onValueChange` for the active interaction
  value used by hover/focus magnification.
- `openValue`, `defaultOpenValue`, and `onOpenValueChange` for the open
  submenu.
- `currentValue` and `isItemCurrent` for current navigation item state.
- `portal` override for submenu portal behavior.
- `className`, refs, and stable `data-slot` hooks.

Data-driven item types should distinguish link, in-page action, and submenu
trigger items. A single root item must not combine `href`, `onAction`, and
`submenu`.

Link item data should support:

- `value`
- `title`
- `icon`
- `href`
- `current` or `ariaCurrent` where explicit state is needed
- `description`
- `badge`
- `disabled`
- `disabledReason`
- `external`
- `target`
- `rel`

In-page action item data should support:

- `value`
- `title`
- `icon`
- `onAction`
- `description`
- `badge`
- `disabled`
- `disabledReason`

Submenu trigger item data should support:

- `value`
- `title`
- `icon`
- `submenu`
- `description`
- `badge`
- `disabled`
- `disabledReason`

Submenu child item data should be narrower than root dock item data. It should
support related links, in-page actions, labels, separators, descriptions, badges,
disabled state, disabled reasons, and external links without inheriting root-only
placement, collapsed-mode, or dock-axis concerns.

## State Model

NavDock has three separate state channels:

- **Active interaction value**: `value`, `defaultValue`, and `onValueChange`.
  This state tracks the item currently being hovered or focused for
  magnification and title reveal.
- **Open submenu value**: `openValue`, `defaultOpenValue`, and
  `onOpenValueChange`. This state tracks the open disclosure panel.
- **Current navigation item**: `currentValue`, explicit `current`/`ariaCurrent`,
  or `isItemCurrent(item, context)`. This state represents the user's current
  route or location and maps to `aria-current`.

Do not use selected-route language. "Current navigation item" is the canonical
term for route-derived state.

## Placement And Positioning

- `placement="bottom"` and `placement="top"` render a horizontal dock.
- `placement="left"` and `placement="right"` render a vertical dock.
- Public placement values are physical and do not flip in RTL.
- Horizontal arrow-key behavior and logical alignment should respect RTL.
- `position="static"` is the default so NavDock does not unexpectedly overlay
  app content.
- `position="fixed"` is opt-in and must respect safe-area insets for all
  placements.
- Long item sets scroll along the dock axis rather than wrapping. Keyboard
  focus should scroll focused items into view.
- Magnification must use transforms while the dock reserves stable cross-axis
  space so surrounding layout does not jump.

## Submenus

NavDock submenus are disclosure panels attached to dock items. They should open
away from the dock edge:

- bottom dock opens upward
- top dock opens downward
- left dock opens rightward
- right dock opens leftward

Submenus should open through hover/focus for discovery and through click/tap for
explicit control. Hover must not be the only access path. Escape closes the open
submenu and restores focus to the trigger where possible.

Submenus use `openValue`, `defaultOpenValue`, and `onOpenValueChange` as the
controlled state channel. Triggers expose `aria-expanded` and `aria-controls`
without opting into ARIA `menu`/`menuitem` semantics.

Data-driven submenu arrays support lightweight labels, separators, links,
actions, badges, descriptions, disabled state, current link state, and external
link affordances. Compound composition uses `NavDockSubmenu`,
`NavDockSubmenuTrigger`, and `NavDockSubmenuContent` for custom children.

The v1 submenu slice renders anchored panels inline inside the dock item and
uses existing token, shadow, and Motion primitives. Fixed/portal collision
behavior can be refined in the placement and final verification issues if the
static implementation proves insufficient.

## Responsive Collapsed Mode

Responsive collapsed mode is a NavDock interaction state, not a mobile drawer or
Sidebar handoff.

- Consumers opt into the explicit collapsed mode by rendering `CollapseDock`
  inside `NavDock` and defining the collapsed dock items there.
- `CollapseDock` defaults to `collapseMode="always"` and can opt into
  `collapseMode="auto"` or `collapseMode="none"`.
- Collapsed state supports `collapsed`, `defaultCollapsed`, and
  `onCollapsedChange` on `CollapseDock`.
- Collapsed mode uses a dedicated trigger button with `aria-expanded`.
- `CollapseDock` content is icon-only; item titles remain available as
  accessible names but are not shown visually.
- Expanded collapsed-mode docks always render as a vertical rail, regardless of
  the requested dock placement.
- Expanded collapsed-mode docks render in an absolutely positioned shell over
  nearby content rather than increasing the page layout footprint.
- Opening and closing the collapsed shell uses the same Motion spring presets
  and reduced-motion handling as the rest of NavDock.
- The trigger is the only visible control while collapsed and becomes the last
  control in the expanded vertical rail. Activating it again collapses the rail.
- `triggerIcon`, `triggerLabel`, and `collapseLabel` on `CollapseDock`
  customize the control.
- A stable default trigger icon should be used rather than swapping to the
  current item icon.
- Outside click/tap and Escape collapse an expanded responsive dock, with focus
  restored to the trigger when possible.
- Do not use double-tap navigation. Items remain role-exclusive: link items
  navigate, in-page action items run local view switching, and submenu trigger
  items open submenus.

## Semantics And Accessibility

- Render a labelled `nav` landmark by default.
- Use anchors for route navigation.
- Use buttons for in-page navigation and submenu triggers.
- Do not default to `role="menu"` or `menuitem` for ordinary NavDock
  navigation.
- Every item requires an accessible name. `title` is required in the data API
  and remains the accessible label when visual titles are hidden.
- Current navigation item state should use `aria-current="page"` or
  `aria-current="location"` where appropriate.
- Submenu triggers expose `aria-expanded` and stable state attributes.
- Disabled anchors should suppress activation and expose disabled state without
  claiming normal link affordance. Disabled buttons should use native disabled
  behavior where possible.
- Disabled items may expose `disabledReason` for accessible/help text and docs
  examples.
- External links should expose a visible or accessible external affordance and
  safe `target`/`rel` defaults when `external` is true unless consumers override
  them.
- Tab moves through interactive dock items in normal document order.
- Arrow keys are a convenience after focus is inside the dock: Left/Right for
  top/bottom placements and Up/Down for left/right placements.
- Focus-visible styling must be token-backed and clear in light, dark,
  high-contrast-ready, density, and RTL states.

## Motion Contract

NavDock uses Motion because animation is core behavior, not optional polish.
Required behaviors:

- pointer proximity drives continuous, spring-smoothed icon magnification: the
  icon under the pointer magnifies to the preset maximum (`1.3` subtle, `1.45`
  standard, `1.6` expressive) and nearby icons follow a smooth cosine falloff
  within roughly two item widths with zero slope at the falloff boundary, so handoff between items is continuous rather
  than stepped
- keyboard focus magnifies the focused icon to the preset maximum without
  requiring a pointer
- horizontal icons magnify away from their shelf (bottom grows upward, top
  grows downward); vertical icons grow around the rail centerline without
  drifting sideways. Labels and the dock surface stay stationary.
- press/tap state briefly scales the icon down before returning to the
  hover/focus target
- title reveal animates for `showTitle="hover"`
- submenu enter/exit uses Motion presence
- collapsed-mode expansion/collapse measures intrinsic content rather than the
  animated shell. The trigger stays anchored at the bottom while the shell
  changes height without overshoot; content fades without a second spatial
  animation. Reduced motion removes spatial movement.

Reduced-motion behavior:

- Disable transform-heavy magnification and spatial movement.
- Preserve current, focus, hover, open, disabled, collapsed, and title state
  through color, background, opacity, outline, labels, ARIA attributes, and data
  attributes.
- NavDock must provide reduced-motion-safe behavior without requiring consumers
  to wrap the app in a top-level Motion configuration.

Expose motion presets:

- `none`
- `subtle`
- `standard`
- `expressive`

## Styling And Tokens

- Use Tailwind CSS v4 utilities and static class maps.
- Use `cn` for class merging.
- Use provider-level CSS variables for background, foreground, muted, border,
  ring, primary, radius, shadow, spacing, density, direction, and motion.
- Variants are limited to `default`, `glass`, and `solid` in v1.
- `size` controls the dock item icon box; provider density controls global
  spacing rhythm. Defaults should approximate `sm=2.25rem`, `md=2.75rem`, and
  `lg=3.25rem` before magnification.
- Avoid hard-coded brand colors.
- Avoid CSS-in-JS, styled-components, Emotion, runtime style parsers, and
  component-local theme runtimes.
- Expose stable `data-slot` attributes for every public anatomy part.
- Expose state attributes for placement, position, variant, size, motion,
  active interaction, open submenu, current, disabled, external, title
  visibility, collapsed, and collapse mode.

## Registry Requirements

- Registry metadata must declare the required Motion dependency.
- Registry metadata must include all component files, utility dependencies,
  registry dependencies, and CSS variables needed for copied installs.
- NavDock should depend on the base/provider registry surface rather than
  re-declaring foundation tokens.
- Registry smoke checks must verify copied component portability, aliases,
  dependency metadata, and styles.

## Testing Seams

- Rendered behavior tests for data-driven items, compound children, link items,
  in-page action items, item role exclusivity, current matching, disabled state,
  external links, className composition, refs, and data attributes.
- Keyboard tests for normal Tab order, placement-aware arrows, RTL horizontal
  behavior, Enter/Space activation, Escape close/collapse, and focus
  restoration.
- Submenu tests for hover/focus/click open, controlled state, dismissal, reduced
  motion, and activation.
- Responsive collapsed-mode tests for trigger labels, controlled/uncontrolled
  state, outside dismissal, Escape collapse, focus restoration, and touch-safe
  item roles.
- Axe tests for simple docks, icon-only docks, title modes, current state,
  disabled/external state, submenus, and collapsed mode.
- SSR/hydration smoke tests for static dock, fixed opt-in markup, closed
  submenu state, and collapsed mode.
- Storybook interaction and visual stories for placements, title modes,
  submenus, collapsed mode, variants, sizes, density, dark mode, RTL, reduced
  motion, long labels, overflow, external links, disabled items, and custom
  current matching.
- Showcase examples for product-area navigation, local workspace section
  switching, AI workspace quick access, and mobile collapsed dock.
- Registry validation, registry smoke, package build, and typecheck coverage.

## Out Of Scope

- Multi-step proximity-wave scaling beyond immediate neighboring items.
- Full Sidebar, drawer, Dashboard Shell, account menu, notification menu, or
  command palette behavior.
- Destructive mutations and general action-command surfaces.
- Router-specific active matching APIs.
- Arbitrary nested menubar or desktop-application menu semantics.
- Drag-and-drop dock item reordering.
- Persistent local-storage preferences for collapsed state.
- Floating UI, Radix, or a new overlay manager unless a later issue proves the
  existing utilities insufficient.
- Tooltip dependency for title reveal.
- Wrapping dock item layouts.
- Manual orientation independent of placement.
