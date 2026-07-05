# NavDock Component PRD

Status: Published to GitHub issue tracker.

Tracker issue: https://github.com/parveshh/dethink-components/issues/205.

Package target: `@dethink/components`.

## Problem Statement

Teams building production SaaS dashboards, internal tools, B2B applications, and
AI-native interfaces need a compact navigation surface that can stay close to
the user's work without becoming a full Sidebar or top NavigationMenu. The
library already has NavigationMenu for link bars and flyout navigation, and
Sidebar for app-shell navigation, but it lacks a dock-style navigation primitive
for edge-mounted, icon-first access with high-polish spatial feedback.

Without NavDock, consumers either hand-roll macOS Dock-like navigation with
inconsistent animation and accessibility, misuse Sidebar for small local
navigation, or use Tooltip/Popover combinations that do not provide a coherent
route state, submenu, responsive collapsed mode, reduced-motion, registry, or
theming contract.

## Solution

Ship a standalone NavDock component family for dock-style navigation and
in-page navigation. NavDock should provide edge placement, icon-first items,
optional visible titles, Motion-powered hover/focus magnification, optional
submenus, current route matching, responsive collapsed mode, provider-aware
theming, and a shadcn-compatible registry surface.

NavDock is link-first by default. Items can be route links, in-page navigation
actions, or submenu triggers, but a single item should not combine those roles.
The component should feel dock-like through Motion animation while preserving
native anchors, native buttons, `aria-current`, focus-visible styling, Escape
dismissal, predictable touch behavior, and reduced-motion-safe state.

## User Stories

1. As a SaaS user, I want compact dock-style navigation, so that primary destinations stay close to my workspace.
2. As an internal-tool user, I want icon-first navigation, so that repeated workflows take less screen space.
3. As a dashboard user, I want the current navigation item to be visible, so that I can orient myself quickly.
4. As a mobile user, I want a collapsed dock trigger, so that navigation does not crowd the viewport.
5. As a mobile user, I want the dock to expand through an explicit button, so that item taps are not stolen by hidden first-tap behavior.
6. As a touch user, I want submenu items to behave as disclosure triggers, so that tapping does not ambiguously navigate and open a submenu.
7. As a keyboard user, I want Tab to reach dock items in normal order, so that navigation remains predictable.
8. As a keyboard user, I want arrow-key movement inside the dock, so that I can move between dock items efficiently.
9. As a keyboard user, I want Escape to close submenus and collapsed dock state, so that I can recover from open UI.
10. As a screen-reader user, I want every icon-only item to have an accessible name, so that navigation is understandable without visible titles.
11. As a screen-reader user, I want current route state exposed with `aria-current`, so that my present location is announced.
12. As a screen-reader user, I want submenu triggers to expose expanded state, so that disclosure state is clear.
13. As a motion-sensitive user, I want magnification and spatial movement reduced automatically, so that the dock remains comfortable.
14. As a design-system consumer, I want Motion-powered hover and focus magnification, so that the component feels premium.
15. As a design-system consumer, I want a press/tap animation, so that dock item activation feels responsive.
16. As a design-system consumer, I want motion presets, so that the same component can feel restrained or expressive.
17. As a product engineer, I want a required Motion dependency declared in registry metadata, so that copied installs do not miss animation dependencies.
18. As a product engineer, I want data-driven item configuration, so that common navigation can be declared simply.
19. As a product engineer, I want compound component composition, so that custom dock items and submenu content remain possible.
20. As a product engineer, I want items to accept `icon` and `title` props, so that the common API is direct.
21. As a product engineer, I want `currentValue`, so that simple route matching can mark the current item.
22. As a product engineer, I want a custom current matcher, so that pathnames, query params, route groups, and router-specific state can decide current state without router-specific APIs.
23. As a product engineer, I want `onAction` for in-page navigation, so that a NavDock can switch panels or local modes without route changes.
24. As a product engineer, I want item role exclusivity, so that an item is either a link, an in-page action, or a submenu trigger.
25. As a product engineer, I want submenu arrays and custom submenu children, so that simple and richer dock submenus are both possible.
26. As a product engineer, I want submenus to open away from the dock edge, so that the dock hit area stays clear.
27. As a product engineer, I want `showTitle` modes, so that titles can be hidden, revealed on hover/focus, or always visible.
28. As a product engineer, I want titles to appear away from the dock edge, so that title reveal works on bottom, top, left, and right placements.
29. As an app-shell author, I want bottom, top, left, and right placement, so that the dock can match product-specific layouts.
30. As an app-shell author, I want static, absolute, and fixed positioning options, so that the dock can be embedded or viewport anchored.
31. As a mobile app-shell author, I want fixed docks to respect safe-area insets, so that controls do not collide with device edges.
32. As a package consumer, I want variants backed by existing tokens, so that NavDock inherits my brand theme.
33. As a package consumer, I want provider density and component size support, so that the dock can fit compact and comfortable screens.
34. As a package consumer, I want external link affordances, so that off-site navigation is clear and safe.
35. As a package consumer, I want disabled items with optional reasons, so that unavailable destinations can remain visible without being interactive.
36. As a package consumer, I want long item sets to scroll along the dock axis, so that the dock does not wrap unpredictably.
37. As a package consumer, I want stable layout dimensions, so that magnification does not cause page content to jump.
38. As a right-to-left user, I want horizontal keyboard behavior and alignment to respect direction, so that navigation feels natural.
39. As a maintainer, I want NavDock to stay distinct from NavigationMenu and Sidebar, so that component responsibilities remain clear.
40. As a maintainer, I want submenus to reuse existing overlay patterns where practical, so that NavDock does not add unnecessary positioning dependencies.
41. As a maintainer, I want Storybook examples for placements, collapsed mode, titles, submenus, current state, dark mode, density, RTL, and reduced motion, so that regressions are visible.
42. As a maintainer, I want SSR and hydration coverage, so that NavDock can be used in Next.js and Vite apps.
43. As a registry user, I want accurate files, dependencies, registry dependencies, and CSS variables, so that copied NavDock installs cleanly.
44. As a docs reader, I want clear guidance on link items, in-page action items, and submenu items, so that I do not create ambiguous dock behavior.

## Implementation Decisions

- Build NavDock as a standalone navigation primitive, not a NavigationMenu or Sidebar variant.
- Use the canonical name NavDock. Avoid "dock menu", "navigation dock", and "app dock" in public docs.
- Keep NavDock link-first. Route destinations should render real anchors by default. In-page navigation should render real buttons.
- Allow `onAction` only for in-page navigation or local view switching. Destructive commands, mutations, account menus, notification menus, and broad command surfaces remain out of scope.
- Support both data-driven items and compound children. Data-driven items are the recommended default for common navigation. Compound children preserve open-code composition.
- Define a small public anatomy around `NavDock`, `NavDockList`, `NavDockItem`, `NavDockLink`, `NavDockButton`, `NavDockSeparator`/`NavDockDivider`, `NavDockSubmenu`, `NavDockSubmenuTrigger`, `NavDockSubmenuContent`, and `NavDockIndicator`. Do not require separate `NavDockIcon` or `NavDockTitle` public parts in v1.
- `NavDockItem` should accept `icon` and `title` props. `title` is required for data items and provides the accessible name when visual titles are hidden.
- Each item should have a stable `value`. Data items require `value`. Compound items should prefer explicit `value`.
- Separate state channels:
  - `value`, `defaultValue`, and `onValueChange` control the active interaction value used for hover/focus magnification.
  - `openValue`, `defaultOpenValue`, and `onOpenValueChange` control the currently open submenu.
  - `currentValue` and `isItemCurrent` control current navigation item state.
- Use current route language, not selected route language. Current navigation state maps to `aria-current`.
- Support both direct `currentValue` matching and an `isItemCurrent(item, context)` callback for pathname-derived or router-derived state.
- Enforce item role exclusivity in v1: a data item is either a link item, an in-page action item, or a submenu trigger. If an overview destination is needed for a submenu, put it inside the submenu as a child item.
- Submenus are navigation disclosure panels by default, not ARIA `menu`/`menuitem` widgets.
- Submenus open on hover/focus for discovery and on click/tap for explicit control. Hover must not be the only access path. Triggers expose expanded/controlled state without `aria-haspopup` unless a future issue adopts a matching ARIA popup role.
- Escape closes an open submenu and restores focus to the trigger where possible.
- `placement` supports `bottom`, `top`, `left`, and `right`, with `bottom` as the default.
- Top and bottom placements lay items horizontally. Left and right placements lay items vertically. Manual orientation is out of scope for v1.
- `position` supports `static`, `absolute`, and `fixed`, with `static` as the default. Fixed positioning is opt-in.
- Fixed positioning respects safe-area insets for all placements.
- `showTitle` supports `never`, `hover`, and `always`, with `hover` as the default.
- Hover/focus title labels render away from the dock edge: bottom opens upward, top downward, left rightward, and right leftward.
- Use NavDock's own title reveal instead of depending on Tooltip.
- Magnify only the hovered or focused item's icon to `1.5x` in v1. Immediate neighboring item icons should scale down to `0.8x` to create visual space during active handoff while the item background and hit target remain stationary.
- When inline titles are visible, scale the active item's title down to `0.92x` and immediate neighboring titles down to `0.8x` during hover/focus handoff.
- Keyboard focus triggers the same magnification and title reveal behavior as pointer hover.
- Press/tap state should briefly scale the active icon down before returning to its hover/focus target scale.
- NavDock requires `motion/react` as a runtime dependency. ADR 0001 records this deliberate departure from the CSS-only motion precedent in NavigationMenu and Sidebar.
- Use Motion for dock magnification, adjacent-item handoff, title presence, submenu presence, and press/tap interaction. Use transform and opacity as the primary animated properties.
- Expose `motion="none" | "subtle" | "standard" | "expressive"` to align with existing navigation component APIs.
- NavDock must guarantee reduced-motion-safe behavior without requiring consumers to provide a top-level Motion configuration. It should still respect any outer Motion configuration where compatible.
- In reduced motion, disable transform-heavy magnification and spatial movement while preserving state through color, opacity, outline, labels, backgrounds, ARIA attributes, and data attributes.
- `icon` accepts `ReactNode`. NavDock normalizes the icon box visually and does not require a specific icon library.
- Data-driven item fields should cover value, title, icon, href, onAction, disabled, disabledReason, external, description, badge, ariaCurrent, and submenu content. Submenu child data should be narrower than root dock item data.
- External links opt into external behavior through `external`. When true, examples should provide an external affordance and safe `target`/`rel` defaults unless consumers override them.
- Disabled items stay visible but should not be activatable. Disabled anchors use `aria-disabled` semantics and suppressed activation. Disabled buttons use native disabled behavior where possible.
- Responsive collapsed mode is a first-class feature through an explicit `CollapseDock` child inside `NavDock`.
- `CollapseDock` supports `collapseMode="none" | "auto" | "always"`, defaulting to `always`.
- Collapsed state supports `collapsed`, `defaultCollapsed`, and `onCollapsedChange` on `CollapseDock`.
- Collapsed mode uses a dedicated trigger button with `aria-expanded`.
- `CollapseDock` content is icon-only; item titles remain available as accessible names but are not shown visually.
- Expanded collapsed-mode docks always render as a vertical rail regardless of the requested dock placement.
- Expanded collapsed-mode docks render in an absolutely positioned shell over nearby content rather than increasing the page layout footprint.
- Opening and closing the collapsed shell uses the same Motion spring presets and reduced-motion handling as the rest of NavDock.
- The trigger is the only visible control while collapsed and becomes the last control in the expanded rail; clicking it again collapses the dock.
- Collapsed trigger customization uses `triggerIcon`, `triggerLabel`, and `collapseLabel` on `CollapseDock`.
- Use a stable default trigger icon rather than swapping to the current item icon.
- Outside click/tap and Escape collapse an expanded responsive dock. Focus should return to the trigger where possible.
- The initial submenu slice should render anchored panels inline inside the dock item using existing token, shadow, and Motion primitives. Fixed or portalled submenu refinements should use provider-aware overlay and layer patterns where practical if a later placement issue proves the static implementation insufficient.
- Submenus open away from the dock edge. Collision handling can be documented and improved later if needed.
- Long item sets scroll along the dock axis rather than wrapping. Keyboard focus should scroll items into view.
- Magnification uses transforms while the dock reserves stable cross-axis space so page content does not jump.
- Variants are limited to `default`, `glass`, and `solid` in v1.
- Variants must be token-backed and provider-aware. Use existing color, background, foreground, muted, border, ring, radius, shadow, spacing, density, direction, and motion tokens.
- Expose `size="sm" | "md" | "lg"` in addition to provider density. Default size is `md`.
- Approximate pre-magnification icon boxes should be `sm=2.25rem`, `md=2.75rem`, and `lg=3.25rem`, refined during implementation through CSS variables.
- `placement="left"` and `placement="right"` remain physical and do not flip in RTL. Horizontal arrow-key movement and logical alignment should respect RTL.
- Tab order remains normal document order. Do not make v1 a roving-tabindex-only composite widget.
- Arrow keys are a convenience once focus is inside the dock: Left/Right for top and bottom placements, Up/Down for left and right placements, with RTL-aware horizontal behavior.
- Stable data attributes should expose slot, placement, position, variant, size, motion, active interaction value, open submenu value, current state, disabled state, external state, collapsed state, collapse mode, title visibility, submenu state, and reduced-motion-relevant states.

## Testing Decisions

- Tests should verify public behavior rather than Motion internals or private implementation details.
- Reuse rendered component behavior tests like existing NavigationMenu and Sidebar tests for public props, state transitions, activation, disabled behavior, current state, and keyboard flows.
- Add rendered tests for data-driven items, compound composition, link activation, in-page action callbacks, item role exclusivity, currentValue, custom current matching, external link attributes, disabled reasons, and className composition.
- Add submenu behavior tests for hover, focus, click/tap, Escape close, focus restoration, `openValue` controlled state, and submenu item activation.
- Add responsive collapsed mode tests for trigger labels, controlled and uncontrolled collapsed state, outside dismissal, Escape collapse, focus restoration, and collapse mode behavior.
- Add keyboard tests for normal Tab order, placement-aware arrow keys, RTL horizontal behavior, Enter/Space activation, and focus scrolling long docks into view.
- Add axe coverage for simple link docks, icon-only docks, visible-title docks, submenu docks, collapsed responsive docks, disabled items, external links, and current route state.
- Add reduced-motion tests or stories verifying that transform-heavy magnification and spatial movement are disabled while visible state remains.
- Add SSR and hydration smoke tests for default static dock, closed submenu state, collapsed responsive state, and fixed-position opt-in markup.
- Add Storybook stories for all placements, all title modes, link items, in-page navigation items, submenus, collapsed mode, variants, sizes, density, dark mode, RTL, reduced motion, long labels, overflow, and external/disabled states.
- Add Storybook interaction tests for hover/focus title reveal, submenu open/close, collapsed trigger expansion, item activation, and keyboard navigation.
- Add showcase examples for product-area navigation, local workspace section switching, AI workspace quick access, and mobile collapsed dock.
- Add registry validation and install smoke coverage to verify NavDock files, `motion` dependency metadata, registry dependencies, CSS variables, aliases, and copied component portability.
- Add package build and typecheck coverage for exported props, item data types, and compound component exports.

## Out of Scope

- Multi-step proximity-wave scaling beyond immediate neighboring items.
- Full Sidebar, drawer, Dashboard Shell, account menu, notification menu, or command palette behavior.
- Destructive mutations and general action-command surfaces.
- Router-specific active matching APIs for Next.js, React Router, Remix, TanStack Router, or Expo Router.
- Arbitrary nested menubar or desktop-application menu semantics.
- Drag-and-drop dock item reordering.
- Persistent local-storage preferences for collapsed state.
- Floating UI, Radix, or new positioning dependencies unless a later implementation issue proves existing utilities insufficient.
- Tooltip dependency for title reveal.
- Wrapping item layouts.
- Manual orientation independent of placement.

## Further Notes

- ADR 0001 records the decision that NavDock requires Motion.
- Context7 Motion documentation confirmed `whileHover`, `whileTap`, hover event handlers, variants, and transition customization as appropriate React Motion primitives for this work.
- Existing NavigationMenu and Sidebar docs establish the navigation semantics precedent: links remain anchors, route state uses current language, and ARIA menu roles are avoided for ordinary navigation.
- Existing provider theming docs establish that NavDock should inherit theme, density, direction, and custom token values from `DethinkProvider`.
