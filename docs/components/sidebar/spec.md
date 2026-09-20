# Sidebar Component Spec

Status: Published to GitHub issue tracker.

GitHub PRD: https://github.com/parveshh/dethink-components/issues/189

Package target: `@dethink/components`.

## Purpose

Sidebar is the app navigation primitive for SaaS dashboards, internal tools,
admin consoles, analytics surfaces, settings areas, and AI workspaces.

Sidebar owns persistent side navigation, desktop collapse, icon rail behavior,
mobile drawer behavior, grouped and nested navigation, active route styling,
skip-link composition, and navigation-specific motion. It should stay separate
from NavigationMenu top navigation, Breadcrumb hierarchy navigation,
CommandPalette keyboard command surfaces, and future Dashboard Shell blocks.

## Public Anatomy

The v1 component family should include:

- `SidebarProvider`
- `Sidebar`
- `SidebarHeader`
- `SidebarFooter`
- `SidebarContent`
- `SidebarGroup`
- `SidebarGroupLabel`
- `SidebarGroupTrigger`
- `SidebarGroupContent`
- `SidebarMenu`
- `SidebarMenuItem`
- `SidebarMenuLink`
- `SidebarMenuButton`
- `SidebarMenuBadge`
- `SidebarMenuAction`
- `SidebarTrigger`
- `SidebarRail`
- `SidebarMobile`
- `SidebarMobileTrigger`
- `SidebarInset`
- `SidebarSkipLink`

Implementation slices may add helper exports for class-name maps, data types,
and state hooks when they make composition clearer.

## Public Contract

- Sidebar renders a labelled navigation landmark by default.
- Navigational items use real anchors by default. Button-style items are for
  actions that do not navigate.
- `asChild` composition should be available where framework router links need
  to provide the underlying element.
- Desktop collapsed state and mobile drawer open state are separate state
  channels.
- Desktop collapsed state supports controlled and uncontrolled usage through
  `collapsed`, `defaultCollapsed`, and `onCollapsedChange`-style props.
- Mobile drawer state supports controlled and uncontrolled usage through
  `mobileOpen`, `defaultMobileOpen`, and `onMobileOpenChange`-style props.
- Side placement supports left and right sidebars. RTL should not invert the
  public `side` value unexpectedly.
- Visual variants include at least default, floating, inset, rail, and bordered
  treatments.
- Density should integrate with the provider density contract and avoid
  component-local density systems.
- `SidebarInset` is a lightweight main-content companion. It should not become
  a full Dashboard Shell layout.
- `SidebarSkipLink` targets the app main content region and becomes visible on
  focus.
- `SidebarTrigger` is the default desktop collapse control: a visible 40px
  panel-icon button with action-specific label, native tooltip and focus ring.
  Place it in the Sidebar header for standalone navigation, or at the start of
  SidebarShellHeader before the page title/breadcrumb for a shell.
- Keep one primary desktop toggle visible in expanded and collapsed states.
  Hide branding text when the standalone header collapses; retain the button.
- `SidebarRail` remains an optional edge control for existing consumers. Render
  it as a direct child of Sidebar when intentionally choosing that alternative.
  Do not combine it with the primary header trigger in standard compositions.
- Mobile uses SidebarMobileTrigger and the drawer close button. Its open state
  stays separate from the desktop collapse preference.

## Item Contract

Sidebar menu items may expose:

- icon
- label
- description
- badge
- keyboard shortcut
- trailing action
- disabled state
- disabled reason
- external indicator
- nested group indicator
- active/current state

Current page links set `aria-current="page"` by default. Alternate
`aria-current` values may be supported for location-like navigation. Active and
current state should also be available through stable data attributes.

Disabled links should prevent activation, expose disabled state visually, and
avoid claiming normal link affordances. Disabled action buttons should use
native disabled behavior where possible.

## Group And Disclosure Behavior

- Groups provide visible labels and structural grouping for dense navigation.
- Nested collapsible groups use real buttons for disclosure triggers.
- Disclosure triggers expose `aria-expanded` and stable data attributes.
- Group open state can be uncontrolled by default and controlled where needed.
- Collapsed icon-rail mode should preserve accessible names even when visual
  labels are hidden.
- Collapsed mode should not make hidden text focusable or hide focusable
  controls from assistive technology.

## Mobile Drawer Behavior

- Mobile drawer behavior is a responsive composition layer over the same
  navigation content.
- The drawer should reuse the existing Dialog/provider/focus patterns where
  practical.
- Opening the drawer should move focus to the drawer or first meaningful
  control.
- Closing the drawer should restore focus to the trigger when possible.
- Escape key, outside click, explicit close controls, and route activation can
  close the drawer as documented.
- Drawer side placement and RTL behavior should be tested.
- Long navigation content should remain scrollable without trapping page
  scroll in awkward states.

## Motion Contract

Sidebar animation is visible but never the only carrier of state.

Named presets should include:

- `none`
- `subtle`
- `standard`
- `expressive`

Built-in choreography may include:

- active/current item indicator movement
- collapsed rail width transition
- icon-to-label reveal
- nested group expand/collapse
- mobile drawer enter/exit
- optional staggered item entrance
- hover and focus micro-interactions

Sidebar uses CSS transitions for color, opacity, background, border, mounted
menu/drawer entrance, and fixed-width state changes. The visible edge handle
uses `motion/react` primitives for transform-only hover/tap feedback and
direction-aware chevron rotation. The `animate` provider prop disables animation
globally by resolving all Sidebar surfaces to `motion="none"`; the edge handle
also respects `prefers-reduced-motion`. Registry metadata declares Motion.

Reduced-motion mode should remove transform-heavy movement, layout morphing,
and staggered effects while preserving visible state changes.

## Accessibility

- Use semantic HTML and native controls first.
- Render a labelled `nav` landmark for navigation content.
- Do not use ARIA menu roles for ordinary app navigation.
- Use real anchors for navigation and real buttons for actions/disclosures.
- Use `aria-current` for the current route.
- Keep focus order logical in expanded, collapsed, and mobile states.
- Provide visible `:focus-visible` styling on every interactive part.
- Keep icon-only controls named with visible or visually hidden text.
- Keep decorative icons hidden from assistive technology.
- Support skip links before long repeated navigation.
- Restore focus when mobile drawer closes where possible.
- Test keyboard operation with Tab, Shift+Tab, Enter, Space, Escape, and
  disclosure navigation.

## Styling

- Use Tailwind CSS v4 utilities and explicit static class maps.
- Use `cn` for class merging.
- Use token-backed background, foreground, muted, border, ring, radius, shadow,
  spacing, and density utilities.
- Avoid hard-coded brand colors.
- Avoid runtime class-name generation that Tailwind cannot detect.
- Avoid CSS-in-JS, styled-components, Emotion, and component-local theme
  runtimes.
- Use logical properties and `start`/`end` alignment where practical.
- Preserve light, dark, density, high-contrast-ready, responsive, and RTL
  behavior through tokens and data attributes.

## Data Attributes

Sidebar should expose stable data attributes:

- `data-slot="sidebar-provider"`
- `data-slot="sidebar"`
- `data-slot="sidebar-viewport"`
- `data-slot="sidebar-header"`
- `data-slot="sidebar-footer"`
- `data-slot="sidebar-content"`
- `data-slot="sidebar-group"`
- `data-slot="sidebar-group-label"`
- `data-slot="sidebar-group-content"`
- `data-slot="sidebar-menu"`
- `data-slot="sidebar-menu-item"`
- `data-slot="sidebar-menu-link"`
- `data-slot="sidebar-menu-button"`
- `data-slot="sidebar-menu-badge"`
- `data-slot="sidebar-menu-action"`
- `data-slot="sidebar-trigger"`
- `data-slot="sidebar-rail"`
- `data-slot="sidebar-rail-handle"`
- `data-slot="sidebar-rail-chevron"`
- `data-slot="sidebar-mobile"`
- `data-slot="sidebar-inset"`
- `data-slot="sidebar-skip-link"`
- `data-state`
- `data-collapsed`
- `data-mobile-open`
- `data-side`
- `data-variant`
- `data-density`
- `data-animate`
- `data-active`
- `data-current`
- `data-disabled`
- `data-motion`
- `data-motion-behavior`
- `data-reduced-motion`

## Registry Requirements

- Add a `sidebar` registry item with source, index export, needed helpers, and
  tests where registry metadata supports them.
- Depend on `dethink-base` and any copied Dethink primitives used by the
  source.
- Declare Motion only if the Sidebar implementation imports Motion.
- Keep dependency metadata accurate for provider portals, Dialog composition,
  icons, and utilities.
- Registry smoke should verify copied source, dependency metadata, aliases,
  style imports, CSS variable reliance, and package exports.

## Documentation Requirements

- Overview: Sidebar is the app navigation primitive for persistent and
  responsive side navigation.
- Installation through registry and package import.
- Relationship to NavigationMenu, Breadcrumb, CommandPalette, and Dashboard
  Shell.
- Anatomy and stable data attributes.
- Controlled and uncontrolled collapsed state.
- Controlled and uncontrolled mobile drawer state.
- Active/current route semantics.
- Grouped and nested navigation.
- Badges, actions, shortcuts, descriptions, and external links.
- Skip-link composition.
- Theming, density, RTL, dark mode, and high-contrast notes.
- Motion presets and reduced-motion behavior.
- Accessibility and keyboard behavior.
- Testing and migration notes.

## Out Of Scope

- Full Dashboard Shell block composition.
- Router adapters for Next.js, React Router, Remix, TanStack Router, or Expo
  Router.
- Auth-aware navigation, permissions engines, or server-driven route loaders.
- Account switchers, notification centers, command palette behavior, top bars,
  breadcrumbs, and toasts.
- Drag-and-drop navigation reordering.
- Persistent local-storage preferences.
- Virtualized navigation trees.

## Testing Seams

- Render tests for component slots, class merging, refs, current state,
  disabled state, external state, collapsed state, group state, mobile drawer
  state, and data attributes.
- Interaction tests for controlled/uncontrolled collapse, trigger and rail
  behavior, disclosure buttons, mobile open/close, Escape dismissal, outside
  dismissal, route activation close, and focus restoration.
- Accessibility tests for expanded, collapsed, mobile drawer, grouped, nested,
  current link, disabled item, skip link, and no ARIA menu role misuse.
- SSR tests for expanded, collapsed, and mobile-capable markup.
- Storybook stories for dashboard, settings, analytics, AI workspace, variants,
  collapsed rail, mobile drawer, nested groups, badges/actions, long labels,
  dark mode, density, RTL, reduced motion, and theme overrides.
- Showcase recipes for dashboard navigation, settings navigation, analytics
  navigation, and AI workspace navigation.
- Registry validation and smoke checks for copied install behavior.
