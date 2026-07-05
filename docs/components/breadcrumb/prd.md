# Breadcrumb Component PRD

Status: Published to GitHub issue tracker.

Tracker issue: https://github.com/parveshh/dethink-components/issues/186.

Package target: `@dethink/components`.

## Problem Statement

Production SaaS and internal-tool pages need a compact way to communicate hierarchy, current location, and parent-page navigation. The library already has Link, Typography, layout primitives, and navigation planning underway, but it lacks a Breadcrumb primitive with accessible current-page semantics, truncation behavior, and responsive overflow handling.

Without Breadcrumb, each app shell and detail page invents its own separators, current-page treatment, link wrappers, and overflow rules. That creates inconsistent accessibility, brittle responsive layouts, and weak route context in dashboard examples.

## Solution

Ship a Breadcrumb component family that renders a labelled navigation landmark with an ordered list of items. It should support href and action items, current-page state, configurable separators, max item collapse, responsive truncation, menu-backed overflow, icon-leading roots, and subtle built-in motion for overflow expansion and current-location changes.

Breadcrumb should stay lightweight. It should use CSS transitions for separators, current-item emphasis, and overflow reveal by default. If it composes DropdownMenu or Popover for collapsed overflow, it should reuse existing overlay primitives instead of carrying its own overlay system.

## User Stories

1. As a dashboard user, I want breadcrumbs, so that I understand where I am in the application.
2. As a detail-page user, I want parent-page breadcrumb links, so that I can navigate back without using browser history.
3. As a screen-reader user, I want breadcrumbs inside a labelled navigation landmark, so that I can locate page hierarchy quickly.
4. As a screen-reader user, I want the current page exposed with `aria-current="page"` when it is a link, so that current location is announced.
5. As a product engineer, I want the current item to be non-interactive when desired, so that detail pages do not link to themselves.
6. As a product engineer, I want href and onAction modes, so that breadcrumbs can navigate through routers or update local state.
7. As a product engineer, I want `asChild` composition for links, so that framework routing stays possible.
8. As a product engineer, I want configurable separators, so that breadcrumbs can fit different product styles.
9. As a product engineer, I want separators hidden from assistive technology, so that screen readers do not announce visual punctuation.
10. As a product engineer, I want max-item collapsing, so that long object paths fit in constrained headers.
11. As a product engineer, I want collapse placement options, so that product teams can preserve root, parent, or current context.
12. As a product engineer, I want a menu-backed overflow item, so that hidden ancestors remain reachable.
13. As a product engineer, I want responsive truncation, so that long page titles do not overlap actions.
14. As a product engineer, I want root icons and item icons, so that dashboards can show home, workspace, or resource cues.
15. As a package consumer, I want token-backed size and density options, so that breadcrumbs fit table headers, page headers, and dialogs.
16. As a theme author, I want color and separator tokens, so that Breadcrumb matches light, dark, and high-contrast themes.
17. As a motion-sensitive user, I want breadcrumb animation reduced automatically, so that location changes do not feel distracting.
18. As a design-system consumer, I want subtle current-item transitions, so that route changes feel polished.
19. As a design-system consumer, I want animated overflow reveal, so that hidden hierarchy feels discoverable.
20. As a docs reader, I want examples for page headers, data-table detail pages, settings, and command-navigation results, so that I can choose the right breadcrumb shape.
21. As a maintainer, I want Breadcrumb to stay separate from Sidebar and NavigationMenu, so that each navigation primitive keeps a clear role.
22. As a maintainer, I want tests around current page semantics, so that route context remains accessible.
23. As a maintainer, I want overflow behavior tested, so that hidden items remain keyboard reachable.
24. As a maintainer, I want registry metadata to capture DropdownMenu/Popover dependencies only if overflow uses them.

## Implementation Decisions

- Build a Breadcrumb family with root, list, item, link, page/current item, separator, ellipsis/overflow trigger, and overflow content parts.
- Render a `nav` landmark with a default accessible label such as "Breadcrumb" and allow consumers to override it.
- Render an ordered list by default. Keep separators outside the accessible name and mark decorative separator content as hidden from assistive technology.
- Support item data and explicit children composition. Data items should include key, label, href, current, disabled, icon, onAction, and metadata for overflow.
- Support `current` and `ariaCurrent` options. Use `aria-current="page"` for current linked items and allow non-link current text.
- Support `maxItems`, `collapseFrom`, `preserveRoot`, `preserveCurrent`, and `overflowLabel` options.
- Support visual sizes and densities suitable for compact table headers through large page headers.
- Support separator variants: chevron, slash, dot, custom element, and none.
- Built-in animation should include current-item emphasis, ellipsis-to-menu reveal, and optional item enter/exit transitions when the breadcrumb path changes.
- Breadcrumb should not force Motion as a dependency. Prefer tokenized CSS transitions and compose existing overlay components for overflow menus. Motion can be considered only if path-change layout animation becomes a core differentiator and is scoped to this registry item.
- Overflow menus should reuse DropdownMenu or Popover behavior rather than implementing a separate menu stack.
- Breadcrumb should be safe in SSR and should not depend on browser-only route APIs.

## Testing Decisions

- Tests should verify labelled navigation landmark rendering, ordered list structure, href behavior, onAction behavior, current item semantics, disabled items, separator hiding, collapse behavior, overflow item accessibility, and custom labels.
- Rendered component tests should cover data-driven and children-driven usage.
- Axe tests should cover normal, collapsed, icon, current-link, and current-text states.
- SSR smoke tests should cover default and collapsed breadcrumbs.
- Storybook should cover separators, sizes, long labels, max item collapse, overflow menu, icons, dark mode, density, RTL, and reduced motion.
- Showcase should include page header, object detail, data table drill-in, settings section, and compact toolbar recipes.

## Out of Scope

- Router adapters.
- Full page-header or app-shell layout.
- Sidebar, NavigationMenu, Pagination, or CommandPalette behavior.
- Server-driven path resolution.
- Analytics tracking for navigation.
- Breadcrumb generation from route files.

## Further Notes

Research inputs:

- WAI-ARIA APG describes Breadcrumb as a labelled navigation landmark and recommends `aria-current="page"` for the current linked page: https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/
- React Aria exposes `useBreadcrumbs` and breadcrumb item behavior for accessible breadcrumb navigation: https://react-aria.adobe.com/Breadcrumbs/useBreadcrumbs.html
- MDN and accessibility guidance use breadcrumb navigation as a hierarchy pattern with clear separators and current-page state: https://developer.mozilla.org/en-US/docs/Web/CSS/How_to/Layout_cookbook/Breadcrumb_navigation
