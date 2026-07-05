# NavDock

NavDock is the icon-first navigation dock for `@dethink/components`. It places
quick destinations or local workspace sections on an app edge, magnifies the
active item with Motion, reveals titles on hover by default, supports disclosure
submenus, and can collapse into a vertical icon rail for constrained screens.

Use NavDock for compact spatial navigation. Use NavigationMenu for site/app
navigation with rich top-level flyouts, Sidebar for full app-shell navigation,
DropdownMenu for action menus, and Command Palette for searchable commands.

## Installation

Package import:

```tsx
import {
  CollapseDock,
  NavDock,
  NavDockButton,
  NavDockItem,
  NavDockLink,
  NavDockList,
  NavDockSeparator,
  NavDockSubmenu,
  NavDockSubmenuContent,
  NavDockSubmenuTrigger,
} from "@dethink/components";
import "@dethink/components/styles.css";
```

Registry item:

```sh
navdock
```

The registry item depends on `dethink-base` for tokens and `cn`, and declares
`motion` as a runtime dependency because magnification, submenu presence, title
reveal, and collapsed rail animation are part of the component contract.

## Anatomy

Data-driven usage is the recommended path:

```tsx
<NavDock
  aria-label="Workspace"
  currentValue="/dashboard"
  items={[
    {
      value: "dashboard",
      title: "Dashboard",
      icon: <DashboardIcon aria-hidden="true" />,
      href: "/dashboard",
    },
    {
      value: "activity",
      title: "Activity",
      icon: <ActivityIcon aria-hidden="true" />,
      onAction: () => setPanel("activity"),
    },
    {
      value: "docs",
      title: "Docs",
      icon: <BookIcon aria-hidden="true" />,
      submenu: [
        { kind: "label", value: "docs-label", title: "Docs" },
        { value: "components", title: "Components", href: "/docs/components" },
        { kind: "separator", value: "docs-separator" },
        { kind: "action", value: "refresh", title: "Refresh docs", onAction },
      ],
    },
  ]}
/>
```

Compound composition is available when the dock needs custom item markup:

```tsx
<NavDock aria-label="Workspace" currentValue="overview">
  <NavDockList>
    <NavDockItem icon={<HomeIcon aria-hidden="true" />} title="Overview" value="overview">
      <NavDockLink href="/overview" />
    </NavDockItem>
    <NavDockSeparator />
    <NavDockItem icon={<SettingsIcon aria-hidden="true" />} title="Admin" value="admin">
      <NavDockSubmenu>
        <NavDockSubmenuTrigger />
        <NavDockSubmenuContent>
          <a href="/admin/users">Users</a>
        </NavDockSubmenuContent>
      </NavDockSubmenu>
    </NavDockItem>
  </NavDockList>
</NavDock>
```

Collapsed mode is explicit:

```tsx
<NavDock aria-label="Mobile workspace" currentValue="runs">
  <CollapseDock
    items={items}
    triggerLabel="Open dock"
    collapseLabel="Close dock"
  />
</NavDock>
```

## API

Root props: `items`, `children`, `placement` (`bottom | top | left | right`,
default `bottom`), `position` (`static | absolute | fixed`, default `static`),
`variant` (`default | glass | solid`), `size` (`sm | md | lg`), `showTitle`
(`never | hover | always`, default `hover`), and `motion`
(`none | subtle | standard | expressive`, default `standard`).

State props: `value` / `defaultValue` / `onValueChange` track the hovered or
focused interaction value; `openValue` / `defaultOpenValue` /
`onOpenValueChange` track the open submenu; `currentValue`, explicit
`current`/`ariaCurrent`, and `isItemCurrent(item, context)` drive
`aria-current`.

Collapsed props: render `CollapseDock` inside `NavDock` and configure
`collapseMode` (`none | auto | always`, default `always` on `CollapseDock`),
`collapsed`, `defaultCollapsed`, `onCollapsedChange`, `triggerIcon`,
`triggerLabel`, and `collapseLabel`. Collapsed content is icon-only and always
expands as a vertical rail. The trigger becomes the last icon in the expanded
rail and clicking it again collapses the dock.

The collapsed rail is bottom-anchored: the trigger stays put and the rail grows
upward from it. Give collapse-mode docks `position="absolute"` (inside a
`position: relative` container) or `position="fixed"` so the trigger is pinned
to the bottom edge and the rail has room to expand. With the default
`position="static"` the trigger sits wherever it lands in normal flow, so a
dock placed near the top of the screen would expand out of view.

Item data is role-exclusive:

- Link items have `href` and may use `current`, `ariaCurrent`, `external`,
  `target`, `rel`, `badge`, `description`, `disabled`, and `disabledReason`.
- Action items have `onAction` for in-page navigation or panel switching.
- Submenu items have `submenu` and must not also have `href` or `onAction`.
- Submenu child items can be links, actions, labels, or separators.

All public parts expose stable `data-slot` attributes and state attributes such
as `data-placement`, `data-position`, `data-variant`, `data-size`,
`data-show-title`, `data-current`, `data-active`, `data-disabled`,
`data-external`, `data-open`, `data-collapsed`, and `data-collapse-mode`.
Class-name helpers are exported for root, list, item, link, button, separator,
submenu, submenu trigger/content, and title composition.

## Current Matching

For simple cases, set `currentValue` to the item `value`. Link items can also
set `current` or `ariaCurrent` directly. Action buttons derive current state
the same way and announce it with `aria-current="true"`, since they switch
local panels rather than pages.

The current item's icon and label render in `text-primary` — color only, no
background fill — so it reads clearly on the default, glass, and solid
variants in light and dark mode without weighing down the dock surface.

Use `isItemCurrent` when the current route is derived from a pathname or a
router-specific match function:

```tsx
<NavDock
  currentValue={pathname}
  isItemCurrent={(item, { currentValue }) => {
    if (!("href" in item) || !currentValue) return undefined;
    return currentValue === item.href || currentValue.startsWith(`${item.href}/`)
      ? "location"
      : undefined;
  }}
  items={items}
/>
```

This keeps route-derived state separate from the active hover/focus state and
the open submenu state.

## Placement And Positioning

`bottom` and `top` render a horizontal dock. `left` and `right` render a
vertical dock. Physical placement values do not flip in RTL, while keyboard
direction and logical spacing follow provider direction where relevant.

`position="static"` is the default. `absolute` and `fixed` opt into overlay
positioning and apply edge offsets; fixed positioning accounts for safe-area
insets. Long item sets scroll along the dock axis rather than wrapping, and
hover titles and submenus portal when needed so overflowed docks can still show
their layers.

## Titles

`showTitle="hover"` is the default. The visual title is hidden until hover or
focus, but the title still provides the accessible name. `showTitle="always"`
keeps inline labels visible. `showTitle="never"` keeps the dock icon-only while
preserving accessible labels.

Icon magnification tracks the pointer continuously: the icon under the pointer
magnifies to the motion preset's maximum (`1.3` subtle, `1.45` standard, `1.6`
expressive) and nearby icons follow a smooth falloff, so moving along the dock
feels fluid rather than stepped. Keyboard focus magnifies the focused icon to
the same maximum. Icons grow away from the dock edge, visible titles stay
stationary, and pressing an item briefly compresses its icon. These effects are
disabled when reduced motion is requested or `motion="none"`.

## Submenus

Submenus are disclosure panels, not ARIA application menus. Triggers are native
buttons with `aria-expanded` and `aria-controls`; panel content remains normal
links, buttons, labels, and separators.

Panels open away from the dock edge: bottom opens upward, top opens downward,
left opens rightward, and right opens leftward. They open through hover/focus
for discovery and click/tap for explicit control. Escape closes the submenu and
returns focus to the trigger where possible.

## Theming

NavDock uses Dethink provider tokens for background, foreground, muted, border,
ring, primary, radius, shadow, spacing, density, direction, and motion. Light,
dark, density, RTL, and `themeConfig` overrides flow through
`DethinkProvider`. Component-specific knobs are CSS variables such as
`--navdock-item-size`, `--navdock-icon-size`, `--navdock-position-offset`, and
`--navdock-submenu-offset`.

## Accessibility

- `NavDock` renders a labelled navigation landmark.
- Route destinations are anchors; in-page destinations are buttons.
- Submenu root items are disclosure buttons and do not also navigate.
- Disabled links drop normal activation and expose disabled state.
- External links get safe target/rel behavior and an external affordance.
- Tab follows document order. Arrow keys move focus along the dock axis as a
  convenience after focus enters the dock.
- Escape closes open submenus and expanded collapsed rails.
- Focus-visible rings, current state, disabled state, and open state are
  visible without relying on animation alone.

## Reduced Motion

NavDock calls `useReducedMotion` internally and configures Motion at the
component boundary. With `motion="none"` or a reduced-motion user preference,
transform-heavy magnification and spatial movement are removed while labels,
focus rings, current state, submenu state, and collapsed state remain visible
through static styles and ARIA/state attributes.

## Recipes

Showcase pages under `/components/navdock` cover product-area navigation, local
workspace section switching with `onAction`, AI workspace quick access with a
separator, and a mobile collapsed dock. Storybook (`Components/NavDock`) covers
base usage, in-page navigation, submenus, router composition, placements,
overflow/positioning, responsive collapsed mode, variants, sizes, title modes,
Motion presets, dark mode, density, RTL, long labels, and custom current
matching.

## Testing

Co-located Vitest suites cover rendered behavior, item role exclusivity,
current matching, disabled and external state, compound composition, keyboard
focus movement, submenus, controlled state, collapsed mode, axe accessibility,
SSR markup, and hydration (`navdock*.test.tsx`,
`navdock.a11y.test.tsx`, `navdock.ssr.test.tsx`). Registry validation and the
registry smoke script assert the registry item, Motion dependency, copied file
graph, slot anatomy, semantics, tokenized classes, and dependency boundaries.

## Migration Notes

- Coming from a static icon bar: keep destinations as links, move local panel
  switching to `onAction`, and use `showTitle` rather than hand-written
  tooltips.
- Coming from a mobile drawer or Sidebar: NavDock collapsed mode is a compact
  rail, not a full navigation shell. Keep app hierarchy in Sidebar.
- Coming from DropdownMenu: use NavDock submenus only for related navigation or
  lightweight local actions. General command/action menus remain DropdownMenu
  or Command Palette territory.

## Out Of Scope (v1)

Persistent user preferences, drag-and-drop item reordering, nested desktop
menubar semantics, arbitrary router adapters, wrapping layouts, Tooltip
dependency for title reveal, Floating UI, Radix, and full Sidebar or drawer
behavior.
