# Pagination Component PRD

Status: Published to GitHub issue tracker.

Tracker issue: https://github.com/parveshh/dethink-components/issues/190.

Package target: `@dethink/components`.

## Problem Statement

Tables, data tables, search results, audit logs, inboxes, and admin lists all need pagination that is compact, accessible, and predictable. DataTable currently includes local pagination behavior, but the library does not provide a standalone Pagination primitive that can be reused by pages, cards, search results, and server-driven workflows.

Without Pagination, consumers repeat page-window logic, inconsistent ellipsis behavior, unclear page labels, weak current-page semantics, and non-tokenized styling. This creates friction for CRUD, search, analytics, and future product blocks.

## Solution

Ship a Pagination component family with bounded and unbounded modes, first/previous/next/last controls, page-window generation, ellipsis indicators, responsive compact mode, link and callback modes, current-page semantics, and polished but restrained animation. The component should make pagination understandable at a glance and robust for assistive technology.

Pagination should animate the current-page indicator, page-window changes, and control state transitions without causing layout shift or relying on motion for meaning. It should support reduced-motion users and remain highly usable in dense internal-tool screens.

## User Stories

1. As a data-table user, I want pagination controls, so that I can move through large result sets.
2. As a search user, I want current-page context, so that I know where I am in the result set.
3. As a screen-reader user, I want the current page to be announced, so that page state is not only visual.
4. As a keyboard user, I want every navigation control to be reachable and labelled, so that I can move without a pointer.
5. As a product engineer, I want bounded pagination, so that lists with known totals expose first and last pages.
6. As a product engineer, I want unbounded pagination, so that search or cursor-backed lists can avoid pretending there is a final page.
7. As a product engineer, I want link mode, so that server-rendered and route-driven pagination uses real URLs.
8. As a product engineer, I want callback mode, so that client-side lists can update state without navigation.
9. As a product engineer, I want custom href generation, so that query strings and route params can be controlled.
10. As a product engineer, I want page-window options, so that desktop and mobile layouts can show different page counts.
11. As a product engineer, I want ellipsis indicators, so that omitted page ranges are clear.
12. As a product engineer, I want previous and next controls, so that common navigation remains one click away.
13. As a product engineer, I want optional first and last controls, so that high-volume lists can jump quickly.
14. As a product engineer, I want disabled boundary behavior, so that users do not activate impossible actions.
15. As a product engineer, I want compact mode, so that pagination fits cards, popovers, and mobile layouts.
16. As a product engineer, I want page-size composition guidance, so that Pagination pairs well with select controls without owning page-size UI.
17. As a design-system consumer, I want animated current-page movement, so that state changes are easy to follow.
18. As a design-system consumer, I want page numbers to enter and exit smoothly as the window changes, so that jumps feel intentional.
19. As a motion-sensitive user, I want animations reduced automatically, so that pagination remains stable.
20. As a package consumer, I want token-backed sizes, variants, and density, so that Pagination fits table footers and page sections.
21. As a package consumer, I want RTL support, so that previous/next affordances and icon direction are correct.
22. As a maintainer, I want page-window generation tested independently, so that edge cases do not regress.
23. As a maintainer, I want Pagination to be reusable outside DataTable, so that DataTable can eventually consume the same primitive.
24. As a docs reader, I want examples for bounded, unbounded, compact, and data-table footer pagination, so that I can choose a pattern confidently.

## Implementation Decisions

- Build a Pagination family with root, list, item, link/button, previous, next, first, last, ellipsis, and status/summary slots.
- Support bounded mode with `page`, `pageCount`, and page-window options.
- Support unbounded mode with `page`, `hasNextPage`, and optional known lower-bound metadata.
- Support link mode through `hrefForPage` and action mode through `onPageChange`.
- Prefer anchors when a page has a stable URL. Use buttons when pagination changes local state without navigation.
- Apply `aria-current="page"` to the current page item when it is interactive. Provide explicit labels such as "Page 4" and "Last page, page 20".
- Allow previous/next controls to be hidden at boundaries or rendered disabled, with a clear default documented by the PRD.
- Keep ellipsis non-interactive by default. If jump menus are added later, they should be a separate enhancement.
- Support page-window generation options: sibling count, boundary count, max slots, compact mode, and unbounded behavior.
- Animation should include current-item indicator movement, page-window enter/exit, and pressed/hover affordances. Use CSS transitions by default; use Motion only if list enter/exit layout choreography requires it and the dependency is justified for this registry item.
- Use stable dimensions for controls to avoid layout shift when page numbers change.
- Pair with DataTable but do not require DataTable.
- Do not own page size, result fetching, router state, or URL parsing. Those remain consumer responsibilities.

## Testing Decisions

- Unit tests should cover page-window generation for bounded, unbounded, beginning, middle, end, small page counts, compact mode, and RTL label cases.
- Rendered tests should cover link mode, callback mode, current page, disabled boundaries, hidden boundaries, first/last controls, ellipsis, custom labels, and keyboard activation.
- Axe tests should cover bounded, unbounded, compact, and disabled-boundary states.
- SSR smoke tests should cover link and callback modes.
- Storybook should cover bounded sets, unbounded sets, compact card layout, DataTable footer composition, dark mode, density, RTL, long page counts, and reduced motion.
- Showcase should include search results, audit log, DataTable footer, and card-list recipes.

## Out of Scope

- Data fetching, cursor storage, cache invalidation, and query-string management.
- Page-size select implementation.
- Infinite scrolling or virtualization.
- Jump-to-page input.
- Table/DataTable integration work beyond examples and compatibility.

## Further Notes

Research inputs:

- USWDS pagination guidance recommends showing set size, highlighting current page, keeping first/previous/next visible where possible, avoiding excessive slots, using generous touch targets, and voicing current page with `aria-current="page"`: https://designsystem.digital.gov/components/pagination/
- MDN documents `aria-current` values for current items in sets, including pages: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-current
- Accessibility guidance commonly recommends wrapping pagination in a navigation landmark with an accessible label.
