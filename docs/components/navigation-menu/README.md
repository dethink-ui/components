# NavigationMenu

NavigationMenu is the persistent site/app navigation primitive for
`@dethink/components`: real links, disclosure flyout panels, current-page
state, an animated indicator, viewport morphing, and responsive collapse
recipes — without ARIA menu roles.

## Installation

Package import:

```tsx
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@dethink/components";
import "@dethink/components/styles.css";
```

Registry item:

```sh
navigation-menu
```

The registry item depends only on `dethink-base` (Tailwind tokens, base
styles, and the `cn` helper). It declares no runtime dependencies — the motion
layer is CSS-first and does not pull in Motion.

## Anatomy

```tsx
<NavigationMenu aria-label="Product">
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuLink current href="/overview">Overview</NavigationMenuLink>
    </NavigationMenuItem>
    <NavigationMenuItem value="platform">
      <NavigationMenuTrigger>Platform</NavigationMenuTrigger>
      <NavigationMenuContent>
        <NavigationMenuFeaturedItem href="/platform">…</NavigationMenuFeaturedItem>
        <NavigationMenuSeparator orientation="vertical" />
        <NavigationMenuSection>
          <NavigationMenuLabel>Products</NavigationMenuLabel>
          <NavigationMenuLink href="/analytics" icon={<ChartIcon />}>
            Analytics
            <NavigationMenuDescription>Usage dashboards.</NavigationMenuDescription>
          </NavigationMenuLink>
        </NavigationMenuSection>
      </NavigationMenuContent>
    </NavigationMenuItem>
    <NavigationMenuIndicator />
  </NavigationMenuList>
  <NavigationMenuViewport />
</NavigationMenu>
```

- `NavigationMenu` renders a labelled `<nav>` landmark (defaults to
  `aria-label="Main"` when unlabelled).
- `NavigationMenuList`/`NavigationMenuItem` are a real `ul`/`li` list.
- `NavigationMenuLink` renders an anchor; `asChild` composes router links.
- `NavigationMenuTrigger` is a native disclosure `<button>` with
  `aria-expanded` and `aria-controls`.
- `NavigationMenuContent` renders inline in the item by default; when a
  `NavigationMenuViewport` is present, panels portal into the shared viewport.
- `NavigationMenuIndicator` is an optional animated marker for the open
  trigger or current link.

## API

Root props: `variant` (`default | quiet | underline`), `size`
(`sm | md | lg`), `orientation` (`horizontal | vertical`), `value` /
`defaultValue` / `onValueChange` (controlled or uncontrolled open item),
`activationMode` (`click | hover | focus | manual`, default `click`), `delay` /
`closeDelay` (hover intent, ms), and `motion`
(`none | subtle | standard | expressive`).

Link props: `current` (`boolean | "page" | "location"` → `aria-current`),
`disabled` (drops `href`, sets `aria-disabled`, never a focus trap),
`external` (safe `rel` merging, `_blank` default), `icon`, and `asChild`.

Item props: `value` for controlled state, indicator mapping, and directional
transitions.

All parts expose stable `data-slot` attributes plus state attributes
(`data-state`, `data-current`, `data-disabled`, `data-external`,
`data-motion`, `data-motion-preset`, `data-orientation`) and export
`*ClassNames` helpers for class composition.

## Semantics, Keyboard, and Focus

- Ordinary navigation stays links + disclosure buttons. No `role="menu"`,
  `menubar`, or `menuitem` is ever applied.
- Tab moves through links and triggers in document order and continues into an
  open panel. There is no roving-arrow composite widget in v1.
- Enter/Space toggle a trigger (native button behavior).
- Escape closes the open panel and returns focus to its trigger.
- Clicking outside or moving focus out of the navigation closes the open
  panel (suppressed in `activationMode="manual"`).
- Hover activation adds an intent delay but never replaces click/keyboard
  activation.

## Theming

Every class is token-backed (`background`, `foreground`, `muted`, `border`,
`ring`, `primary`, density, and radius tokens). Light/dark, density, RTL, and
`themeConfig` overrides flow through `DethinkProvider` with no
component-specific setup. Panel width can be tuned with
`--dt-navigation-menu-content-max-width`.

## Animation and Reduced Motion

The motion layer is CSS-first (see `spec.md` → Motion Dependency Decision):

- `motion` presets: `none` (static), `subtle` (fades), `standard` (fades +
  directional slides + indicator/viewport movement, default), `expressive`
  (adds staggered link reveal).
- Directional panel transitions use `data-motion`
  (`from-start | from-end | to-start | to-end`) computed from item order and
  flipped automatically in RTL.
- The indicator and viewport animate measured pixel values with CSS
  transitions.
- Everything is gated behind `motion-safe`; with `prefers-reduced-motion`,
  panels swap instantly, the indicator snaps, and exit presence unmounts
  immediately. No state is communicated by animation alone.

## Responsive Composition

See `spec.md` → Responsive Composition for the v1 API decision and recipes:
compact topbar (`size="sm" variant="quiet"`), mobile Dialog handoff
(`max-md:hidden` nav + `md:hidden` Dialog with a vertical NavigationMenu),
overflow "More" collapse, and compact wrap. Full Sidebar, Dashboard Shell,
auth/account menus, and notification menus are out of scope.

## Recipes

Showcase pages under `/components/navigation-menu` cover product navigation,
app topbar with mobile handoff, documentation hub, dashboard composition, and
overflow collapse. Storybook (`Components/NavigationMenu`) covers all variants,
sizes, states, activation modes, motion presets, dark mode, density, and RTL.

## Testing

Co-located Vitest suites cover rendered behavior, keyboard interaction,
activation modes, controlled state, dismissal, rich panels, viewport hosting,
motion attributes, responsive composition, axe accessibility, and SSR
hydration (`navigation-menu*.test.tsx`, `navigation-menu.a11y.test.tsx`,
`navigation-menu.ssr.test.tsx`). Registry validation and the registry smoke
script assert anatomy slots, semantics, tokenized classes, and the absence of
Radix/Motion dependencies.

## Migration Notes

- Coming from Radix NavigationMenu: the anatomy maps closely
  (Root/List/Item/Link/Trigger/Content/Viewport/Indicator). Differences:
  activation defaults to click (Radix defaults to hover), `motion` presets
  replace consumer keyframe wiring, and panels are unstyled-by-consumer rich
  slots (`Section`, `Label`, `Description`, `FeaturedItem`, `Separator`).
- Do not migrate DropdownMenu action menus to NavigationMenu: DropdownMenu is
  for actions (`role="menu"`), NavigationMenu is for destinations.

## Out of Scope (v1)

Full Sidebar, Dashboard Shell block, router-specific active matching, command
palette behavior, auth/account and notification menus, and nested desktop
menubar systems.
