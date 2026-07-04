# NavigationMenu Component Spec

Status: Published to GitHub issue tracker.

Parent PRD: https://github.com/parveshh/dethink-components/issues/188

Package target: `@dethink/components`.

## Purpose

NavigationMenu provides a high-polish top-level navigation primitive for
product sites, admin consoles, documentation hubs, and SaaS dashboards. It sits
between simple `Link` rows and app-shell `Sidebar`: persistent navigation with
optional disclosure/flyout panels, current-route state, rich grouped links,
animated active indicators, and responsive composition guidance.

The component must treat navigation as navigation. Ordinary page links should
remain anchors, current page state should use `aria-current`, and flyout panels
should use disclosure semantics instead of defaulting to ARIA menu roles. Action
menus remain the responsibility of DropdownMenu.

## Component Family

- `NavigationMenu`: root state and semantic navigation wrapper.
- `NavigationMenuList`: ordered or unordered navigation item list.
- `NavigationMenuItem`: item container with stable value and state hooks.
- `NavigationMenuLink`: semantic link surface for normal navigation.
- `NavigationMenuTrigger`: disclosure trigger for a flyout panel.
- `NavigationMenuContent`: flyout or inline panel content.
- `NavigationMenuViewport`: shared panel viewport for rich flyouts.
- `NavigationMenuIndicator`: active/open item indicator.
- `NavigationMenuSection`: grouped panel section.
- `NavigationMenuFeaturedItem`: larger highlighted link/card inside a panel.
- `NavigationMenuLabel`: section or group label.
- `NavigationMenuDescription`: supporting copy for links and featured items.
- `NavigationMenuSeparator`: visual grouping boundary.

## Dependencies

- Existing Dethink primitives: Link, Button/IconButton where useful, Popover,
  Dialog composition examples, Tooltip, DropdownMenu examples, Stack, Flex,
  Grid, Separator, Card, Typography, provider tokens, class-name merging, and
  registry conventions.
- Existing provider-aware portal and positioning utilities when flyout panels
  leave normal document flow.
- Motion is allowed only for the premium motion slice if layout or exit
  choreography justifies the dependency. Simple hover, focus, color, and opacity
  states should use tokenized CSS transitions.

## Public API Direction

Root-level props should support:

- `value`, `defaultValue`, and `onValueChange` for the active/open item where
  applicable.
- `activationMode`: `click`, `hover`, `focus`, or `manual`.
- `orientation`: `horizontal` or `vertical`, with horizontal as the main v1
  target.
- `variant`: quiet app navigation, product navigation, or expressive
  presentation variants if needed.
- `size` and density-aware spacing.
- `motion`: `none`, `subtle`, `standard`, or `expressive` if exposed publicly.
- `delay` and `closeDelay` for hover intent where hover activation is enabled.
- `className`, refs, and data-slot hooks.

Item and link props should support:

- Stable `value` for controlled state, indicator mapping, and motion direction.
- `href`, `target`, `rel`, `asChild`, and route-framework composition.
- `current` or `ariaCurrent` for current page/location state.
- `disabled`, `external`, `icon`, `label`, `description`, and metadata slots.
- `onAction` only for exceptional non-navigation actions; links are the default.

Trigger and content props should support:

- Controlled/open state inherited from the root where possible.
- Accessible expanded/collapsed state.
- `placement`, `offset`, `crossOffset`, `containerPadding`, and `shouldFlip`
  only if the panel uses the existing positioned overlay path.
- Rich content layout through sections, featured items, columns, descriptions,
  icons, separators, and custom children.

## Semantics And Accessibility

- Render a labelled navigation landmark by default.
- Keep normal navigation links as anchors. Do not default to `role="menu"` or
  `menuitem` for ordinary site/app navigation.
- Apply `aria-current="page"` or `aria-current="location"` to current links as
  documented.
- Disclosure triggers must expose expanded state and control relationships when
  content is mounted in a way that can be referenced.
- Tab order should remain predictable. Users should be able to tab to links and
  triggers without entering an application-style composite widget unless a
  future issue explicitly validates that behavior.
- Enter and Space should activate disclosure triggers. Escape should close the
  open panel and restore focus to the trigger where applicable.
- Hover activation must not be the only way to access a panel.
- Disabled items must not be focus traps. Disabled navigation links should be
  visibly disabled and use documented semantics.
- External links need a visible or accessible external affordance when examples
  use one.
- Focus-visible styling must be token-backed and clear in light, dark,
  high-contrast, density, and RTL states.
- Reduced-motion users must receive the same state information without
  transform-heavy movement.

## Motion Dependency Decision

NavigationMenu v1 ships its premium motion layer without a Motion (Framer
Motion) dependency. Issue #194 allows Motion only when layout or exit
choreography cannot be expressed cleanly in CSS; every required behavior maps
to tokenized CSS with small measurement hooks:

- Active indicator movement uses measured `transform`/size CSS transitions on
  fixed pixel values.
- Viewport morphing animates measured width/height values (fixed-dimension CSS
  transitions, observed through `ResizeObserver`).
- Directional panel transitions use `data-motion` attributes plus
  `dt-nav-slide-in`/`dt-nav-slide-out` keyframes with CSS variables, flipped
  automatically in RTL.
- Content exit uses a small presence hook that keeps the panel mounted until
  its exit animation finishes; when no animation applies (reduced motion or
  `motion="none"`), the panel unmounts immediately.
- Staggered link reveal is gated behind the `expressive` preset with
  `nth-child` animation delays.

Motion presets are exposed through the root `motion` prop
(`none | subtle | standard | expressive`) and the `data-motion-preset`
attribute. Registry metadata therefore declares no Motion dependency. If a
future slice needs shared-element or gesture choreography beyond this, the
Motion decision should be revisited there.

## Motion Contract

NavigationMenu should stand out through motion, but motion must remain a layer
on top of accessible state.

Required motion behaviors:

- Active/current indicator movement between items.
- Open-item indicator movement for flyout triggers.
- Directional content transitions based on previous and next item order.
- Viewport width/height morphing for panels of different dimensions.
- Content enter/exit animation for flyout panels.
- Optional staggered reveal for rich panel links.
- Hover, focus, and pressed micro-interactions through CSS transitions.

Reduced-motion behavior:

- Disable transform-heavy directional transitions, layout morphs, and stagger.
- Preserve opacity/color/focus state where useful.
- Never rely on animation alone to indicate current, open, disabled, or focused
  state.

Performance requirements:

- Prefer transform and opacity.
- Avoid animating layout properties directly except through scoped Motion layout
  primitives or fixed-dimension CSS transitions that are verified.
- Use stable dimensions for indicator and viewport wrappers to avoid layout
  shifts.

## Styling And Tokens

- Use Tailwind CSS utility maps with no runtime-generated class fragments.
- Use semantic provider tokens for background, foreground, muted, border, ring,
  primary, destructive, radius, shadow, spacing, density, and motion.
- Expose stable `data-slot` attributes for all anatomy parts.
- Expose state attributes for open, current, active, disabled, external,
  placement, orientation, motion direction, entering, and exiting where
  supported.
- Support light, dark, density, RTL, custom themeConfig, long labels, wrapping
  descriptions, and narrow layouts.

## Responsive Composition

NavigationMenu should support compact top navigation and documented handoff to
Dialog or future Sidebar patterns for small screens. It should not implement a
full mobile Sidebar or Dashboard Shell. Responsive examples should preserve
semantic links, current state, focus visibility, and reduced-motion behavior.

### v1 responsive API decision

No dedicated responsive runtime API ships in v1. Tailwind responsive utilities
are the public styling contract for this library, so breakpoint behavior is
composed with existing primitives instead of a bespoke prop surface:

- `size="sm"` plus `variant="quiet"` produce compact topbar density.
- `orientation="vertical"` provides the stacked layout used in narrow
  containers and mobile overlays.
- Responsive utilities (`max-md:hidden`, `md:hidden`, `lg:hidden`,
  `max-lg:hidden`) on the root, items, or wrapper elements switch between
  desktop and mobile compositions.

### Documented collapse recipes

- **Mobile Dialog handoff**: render the desktop NavigationMenu with
  `max-md:hidden` and a `md:hidden` Dialog whose content hosts the same links
  in a vertical NavigationMenu. The Dialog owns overlay behavior (focus trap,
  Escape, restore); NavigationMenu stays a navigation primitive and keeps
  `aria-current`, disabled, and external semantics.
- **Overflow "More" collapse**: keep primary links inline and collapse
  secondary destinations into a `NavigationMenuTrigger` + panel item that is
  `lg:hidden`, mirroring the same links inline with `max-lg:hidden` for wide
  screens.
- **Compact wrap**: for small link sets, `NavigationMenuList` accepts
  `flex-wrap` through `className` to wrap instead of collapsing.

Full Sidebar, Dashboard Shell, auth/account menus, and notification menus
remain out of scope for NavigationMenu (see Out Of Scope below); the mobile
recipes intentionally compose Dialog rather than reimplementing drawer
behavior.

## Testing Seams

- Rendered behavior tests for simple links, current state, disabled/external
  links, triggers, open/close state, controlled state, activation modes, Escape,
  focus restoration, className composition, and data attributes.
- Keyboard tests for Tab order, Enter/Space trigger activation, Escape close,
  and arrow-key behavior only where documented.
- Accessibility tests for simple link nav, flyout nav, rich panels, current
  links, disabled items, disclosure semantics, and no default ARIA menu role
  misuse.
- SSR smoke tests for simple and flyout examples.
- Storybook coverage for simple nav, product flyout, docs flyout, animated
  indicator, viewport morph, directional transitions, responsive composition,
  dark mode, density, RTL, reduced motion, and theme overrides.
- Showcase recipes for product navigation, app topbar, documentation hub, and
  dashboard composition.
- Registry validation and registry smoke for copied source portability,
  dependency metadata, aliases, CSS variable reliance, and package exports.

## Out Of Scope

- Full Sidebar implementation.
- Full Dashboard Shell block.
- Router-specific active matching.
- Global command palette behavior.
- Auth/account menus and notification menus.
- Arbitrary nested menubar systems for desktop applications.
- Drag-and-drop navigation editing.
- Data fetching or server-owned navigation trees.

