# NavigationMenu Component PRD

Status: Published to GitHub issue tracker.

Tracker issue: https://github.com/parveshh/dethink-components/issues/188.

Package target: `@dethink/components`.

## Problem Statement

Product sites, admin consoles, documentation hubs, and complex SaaS dashboards need top-level navigation menus with sections, flyouts, active indicators, responsive behavior, and polished movement. The library already has Link, Button, Popover, Tooltip, DropdownMenu, Dialog, and positioning helpers, but it lacks a purpose-built NavigationMenu that treats site/app navigation differently from action menus.

Without NavigationMenu, consumers misuse DropdownMenu for page navigation, lose route semantics, hand-roll focus and hover behavior, and struggle to create animated megamenu-style panels that remain accessible and responsive.

## Solution

Ship a NavigationMenu component family for persistent navigation with optional disclosure/flyout panels, grouped links, featured cards, active/current state, indicator and viewport animation, responsive collapse behavior, and keyboard-safe interactions. It should feel premium through motion: animated underline or pill indicators, directional panel transitions, viewport size morphing, hover intent, and reduced-motion fallbacks.

NavigationMenu should support both simple link bars and richer flyout panels. It should avoid forcing ARIA menu roles for ordinary site navigation unless a true menu interaction is required. For most navigation, links and disclosure buttons are the right semantic foundation.

## User Stories

1. As a SaaS user, I want a top navigation menu, so that I can move between major product areas.
2. As a docs user, I want grouped navigation flyouts, so that I can discover related pages quickly.
3. As a marketing-site user, I want featured links and descriptions, so that product areas are easier to scan.
4. As a keyboard user, I want predictable focus behavior, so that opening a panel does not trap or confuse me.
5. As a screen-reader user, I want links to remain links, so that navigation behaves like navigation.
6. As a screen-reader user, I want expanded state on disclosure triggers, so that panel state is announced.
7. As a product engineer, I want active/current top-level state, so that current product area is visible and announced.
8. As a product engineer, I want directional panel animation, so that moving between triggers feels spatially coherent.
9. As a product engineer, I want viewport size animation, so that panels of different sizes transition smoothly.
10. As a product engineer, I want an animated indicator, so that the active trigger is visually anchored.
11. As a product engineer, I want hover and focus activation options, so that the menu fits desktop and keyboard behavior.
12. As a product engineer, I want click activation options, so that touch and hybrid devices remain reliable.
13. As a product engineer, I want responsive collapse behavior, so that top navigation can hand off to Sidebar or Dialog on small screens.
14. As a product engineer, I want item descriptions and icons, so that flyouts can communicate purpose beyond labels.
15. As a product engineer, I want disabled and external states, so that unavailable or external links are clear.
16. As a design-system consumer, I want layout slots for featured cards, columns, and lists, so that the component supports rich navigation without bespoke CSS.
17. As a motion-sensitive user, I want panel and indicator animation reduced automatically, so that navigation remains comfortable.
18. As a package consumer, I want token-backed variants, so that NavigationMenu can be quiet in apps or expressive in product pages.
19. As a package consumer, I want RTL support, so that directional animation and arrow keys adapt correctly.
20. As a maintainer, I want NavigationMenu to reuse existing overlay and portal patterns, so that it does not duplicate Popover or DropdownMenu internals.
21. As a maintainer, I want clear docs separating NavigationMenu from DropdownMenu, so that action menus and page navigation do not blur.
22. As a docs reader, I want examples for product nav, dashboard top nav, documentation nav, and mobile collapse, so that I can choose the right composition.
23. As a registry user, I want dependency metadata to be exact, so that Motion and overlay dependencies install only when needed.
24. As a future block author, I want NavigationMenu to compose with Sidebar and Breadcrumb, so that app shells can be built from consistent primitives.

## Implementation Decisions

- Build a NavigationMenu family with root, list, item, link, trigger, content, viewport, indicator, featured item, section, label, description, and separator parts.
- Prefer semantic navigation links and disclosure buttons for site/app navigation. Do not default to `role="menu"` for ordinary navigation.
- Support controlled and uncontrolled active/open item state.
- Support activation modes: click, hover with intent delay, focus, and manual. The default should be accessible and predictable across pointer and keyboard users.
- Support `aria-current="page"` or `aria-current="location"` for current links.
- Support rich content panels with columns, featured cards, descriptions, icons, and grouped links.
- Reuse existing Popover/positioning/provider patterns where panels leave normal document flow. For inline viewport rendering, preserve focus order and avoid unnecessary portals.
- Animation should be a differentiator. Provide active indicator movement, viewport width/height morphing, content enter/exit, directional transitions based on previous and next item order, and optional staggered link reveal.
- Use Motion for viewport morphing, directional panel exit/enter, and shared indicator layout when the implementation needs stateful layout animation. Use CSS transitions for simple hover, focus, and color states.
- Respect reduced motion by disabling transform-heavy movement, replacing directional panel transitions with opacity changes or instant state changes.
- Support mobile collapse patterns but do not implement a full Sidebar inside NavigationMenu. Examples may compose with Sidebar or Dialog.
- Expose data attributes for open, active, current, disabled, motion direction, placement, and orientation.
- Keep NavigationMenu distinct from DropdownMenu. DropdownMenu is for actions; NavigationMenu is for links and app/product areas.

## Testing Decisions

- Rendered tests should cover link activation, trigger open/close, controlled state, disabled links, current state, hover/click activation, focus behavior, Escape dismissal, outside click where applicable, and responsive collapse composition.
- Keyboard tests should verify Tab order, Enter/Space trigger activation, arrow-key behavior only where documented, and focus restoration.
- Axe tests should cover simple link nav, flyout nav, rich panel, current link, disabled item, and mobile-composed states.
- SSR smoke tests should cover simple and flyout menus.
- Storybook should cover simple nav, product flyout, docs flyout, animated indicator, viewport morph, directional transitions, dark mode, density, RTL, reduced motion, and mobile composition.
- Showcase should include product navigation, app topbar, docs hub, and dashboard composition recipes.

## Out of Scope

- Full Sidebar implementation.
- Full Dashboard Shell block.
- Router-specific active matching.
- Global command palette behavior.
- Auth/account menus and notification menus.
- Arbitrary nested menubar systems for desktop applications.

## Further Notes

Research inputs:

- Radix Navigation Menu exposes a viewport and indicator pattern and supports advanced animation through viewport sizing and directional motion attributes: https://www.radix-ui.com/primitives/docs/components/navigation-menu
- WAI-ARIA APG disclosure navigation examples support navigation flyouts without overusing application menu roles: https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/
- Adrian Roselli warns against using ARIA menu roles for ordinary site navigation, reinforcing the need for link/disclosure semantics: https://adrianroselli.com/2019/06/link-disclosure-widget-navigation.html
- Motion docs support layout animation, exit animation, gestures, and reduced-motion configuration for animated React components: https://motion.dev/docs/react-motion-component
