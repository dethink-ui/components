# Table Component PRD

Status: Published to GitHub issue tracker.

Tracker issue: https://github.com/parveshh/dethink-components/issues/130.

Package target: `@dethink/components`.

## Problem Statement

Teams building production SaaS dashboards, internal tools, admin systems, B2B
applications, and AI-native React interfaces need a dependable semantic Table
primitive before the heavier DataTable workflow. The library already has layout
primitives, form controls, selection controls, overlays, Card, Dialog, Popover,
Tooltip, DropdownMenu, DateTimePicker, and Timeline, but there is still no
first-class way to render tabular data with consistent Dethink styling,
accessible captions and headers, responsive overflow behavior, provider-token
styling, Storybook examples, registry metadata, and package exports.

Without a Table component, consumers will keep copying ad hoc `<table>` markup
and utility classes into dashboards, settings pages, billing screens, audit
logs, permissions matrices, and CRUD examples. That creates inconsistent
density, dark-mode, border, hover, caption, and responsive-scroll behavior. It
also makes the future DataTable harder to build because TanStack-powered
sorting, filtering, pagination, row selection, column visibility, and row
actions need a stable semantic table anatomy underneath them.

## Solution

Ship Table as a dependency-free P0 data-display primitive for
`@dethink/components`. Table should expose shadcn-compatible anatomy for native
table markup: `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableRow`,
`TableHead`, `TableCell`, and `TableCaption`.

Table v1 should focus on semantic HTML tables and reusable styling, not
data-grid behavior. It should provide token-backed Tailwind classes, stable
`data-slot` attributes, ref forwarding, className composition, density-aware
spacing, dark mode, RTL-safe alignment, responsive overflow wrapping, caption
placement, header scope support, row hover/selected visual hooks, and examples
that make tabular product data easy to copy.

The future DataTable component should consume this Table anatomy and add
TanStack Table behavior later. Table v1 should not implement sorting,
filtering, pagination, virtualization, column resizing, row selection state
management, async loading orchestration, or data fetching.

## User Stories

1. As a dashboard engineer, I want a Table primitive, so that tabular dashboard data uses consistent structure and styling.
2. As an internal-tool engineer, I want TableHeader, TableBody, and TableFooter components, so that table sections are explicit and easy to scan in source.
3. As an internal-tool engineer, I want TableRow, so that rows use consistent border, hover, selected, disabled, and density styling hooks.
4. As an internal-tool engineer, I want TableHead, so that column and row headers use native `<th>` semantics instead of styled `<div>` elements.
5. As an internal-tool engineer, I want TableCell, so that data cells use native `<td>` semantics and consistent padding/alignment.
6. As an internal-tool engineer, I want TableCaption, so that tables can expose a concise accessible summary of their data.
7. As a package consumer, I want Table to render native table markup, so that browser and assistive-technology table navigation works without custom roles.
8. As a package consumer, I want Table to forward refs to the native table and expose a stable wrapper slot, so that app code can measure table markup or tune overflow containers when needed.
9. As a package consumer, I want every table slot to forward refs, so that tests and advanced integrations can target the rendered DOM.
10. As a package consumer, I want className composition on every slot, so that product teams can extend styles without replacing the base component.
11. As a package consumer, I want stable `data-slot` attributes on every slot, so that tests and local theme overrides can target table anatomy reliably.
12. As a package consumer, I want TableHead to support `scope`, so that simple column and row header relationships can be explicit.
13. As a package consumer, I want TableCell and TableHead to preserve native attributes such as `colSpan`, `rowSpan`, `headers`, and `abbr`, so that complex table relationships remain possible when needed.
14. As an accessibility reviewer, I want Table examples to use captions, column headers, row headers, and scopes where appropriate, so that examples teach accessible table patterns.
15. As an accessibility reviewer, I want Table to avoid fake grid roles, so that static tabular data does not expose misleading interactive semantics.
16. As an accessibility reviewer, I want complex table behavior documented as a consumer responsibility or future DataTable concern, so that v1 does not imply unsupported relationships are automatic.
17. As a screen-reader user, I want captions and scoped headers to be available in examples, so that I can understand what the table represents and how cells relate to headers.
18. As a keyboard user, I want Table to preserve normal document and focus order, so that links, buttons, checkboxes, and menus inside cells remain predictable.
19. As a mobile user, I want wide tables to scroll horizontally without breaking page layout, so that dense tables remain usable on narrow viewports.
20. As an RTL user, I want cell alignment, caption placement, and responsive overflow behavior to work in right-to-left layouts.
21. As a design-system lead, I want Table to use provider-level color, border, muted, foreground, background, radius, density, and focus tokens, so that tables match the rest of Dethink Components.
22. As a design-system lead, I want static Tailwind class maps, so that registry-installed source stays predictable and build output remains small.
23. As a design-system lead, I want density-aware row and cell spacing, so that compact administrative views and comfortable reports can share the same component.
24. As a dashboard engineer, I want numeric alignment examples, so that currency, counts, and percentages are easy to scan.
25. As a dashboard engineer, I want status and action cells to compose with Badge, Button, IconButton, DropdownMenu, Checkbox, and Link, so that future CRUD examples can use the same table anatomy.
26. As a dashboard engineer, I want sticky-header styling documented as a className recipe rather than a mandatory behavior, so that simple tables remain lightweight.
27. As a docs author, I want examples for basic data, captions, row headers, numeric cells, compact density, dark mode, RTL, responsive overflow, empty rows, and row actions, so that consumers can copy realistic table patterns.
28. As a registry consumer, I want Table to install without new runtime dependencies, so that adopting it keeps the base dependency surface small.
29. As a package consumer, I want all Table components and prop types exported from the package, so that the API is discoverable and reusable.
30. As an SSR app developer, I want Table and all slots to render and hydrate without warnings, so that it works in Next.js-style environments.
31. As an AI coding tool user, I want predictable Table examples, so that generated code uses semantic table elements instead of CSS grid or div-based faux tables.
32. As a maintainer, I want Table to stay separate from DataTable, so that semantic table styling can stabilize before TanStack behavior is layered on top.
33. As a maintainer, I want Table to stay separate from DataGrid, so that spreadsheet-like editing, virtualization, and complex keyboard roving focus remain future work.
34. As a maintainer, I want Table to avoid data fetching, formatting, sorting, filtering, pagination, and selection state, so that it remains a stable, dependency-free primitive.
35. As a QA engineer, I want tests for native semantics, refs, class composition, captions, header scopes, responsive wrapper behavior, selected/hover hooks, SSR, accessibility, registry metadata, package exports, and Storybook examples, so that Table remains stable as DataTable and CRUD blocks build on it.

## Implementation Decisions

- Table is the next workable high-impact component after the completed overlay primitives and before DataTable.
- Table is a semantic data-display primitive, not a TanStack-powered DataTable, DataGrid, spreadsheet, list, layout grid, or card collection.
- The component set is `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead`, `TableCell`, and `TableCaption`.
- The public anatomy should follow shadcn-compatible naming and native table element defaults.
- `Table` should render a responsive overflow wrapper plus an inner native `<table>` so wide tables can scroll without breaking page layout.
- The responsive wrapper should expose a stable slot, and the native table should expose its own stable slot where useful for tests and styling.
- Table slots should preserve native table attributes rather than replacing them with custom prop systems.
- `TableHead` should default to `scope="col"` for normal header cells unless a consumer provides another valid scope. Row-header examples should show `scope="row"`.
- Complex multi-level headers should remain possible with native `id`, `headers`, `scope`, `colSpan`, `rowSpan`, and `abbr` attributes, but Table v1 should not automate header association.
- Table styling should use Tailwind CSS v4 utilities, semantic tokens, explicit class maps, shared class-name merging, stable data attributes, and no runtime style parser.
- Table should provide visual hooks for row hover, row selected state, muted rows, numeric cells, and compact/comfortable density through classes and data attributes where appropriate, without owning selection state.
- Table should compose predictably with Typography, Badge, Checkbox, Button, IconButton, Link, DropdownMenu, Card, Stack, Flex, Grid, Separator, and future EmptyState, Pagination, DataTable, Chart, and CRUD page blocks.
- Table must not introduce TanStack Table, React Aria grid, Floating UI, CSS-in-JS, `sx`, arbitrary CSS props, runtime class generation, data fetching, formatting, sorting, filtering, pagination, virtualization, column resizing, row selection state management, editable cells, or keyboard roving-focus behavior.
- Table should remain dependency-free beyond the existing base utility stack.

## Testing Decisions

- Tests should assert public DOM behavior and native semantics rather than private implementation details.
- Render tests should cover the responsive wrapper, native table element, all anatomy slots, refs, className composition, custom attributes, captions, header scopes, colSpan, rowSpan, headers, row selected hooks, numeric alignment, and provider-density class coverage.
- Accessibility tests should cover axe smoke for captioned tables, column headers, row headers, scoped header examples, action cells with nested buttons/menus/links, and avoidance of fake interactive grid roles.
- SSR tests should cover server rendering and hydration without warnings for Table and all slots.
- Storybook should cover base table anatomy, captioned table, row-header table, numeric alignment, compact/default/comfortable density, dark mode, RTL, responsive horizontal overflow, empty-row recipe, status cells, and row-action composition with existing Button/IconButton/DropdownMenu components.
- Registry validation and smoke coverage should prove Table installs cleanly, has no new runtime dependencies, exposes all anatomy files/exports, and works through both package and registry consumption paths.
- Existing Card, Grid, Separator, Select, Combobox, and overlay primitive tests/stories are the closest prior art for class maps, stable slots, provider theming, SSR smoke, a11y smoke, Storybook coverage, registry validation, and registry smoke.

## Out of Scope

- TanStack Table integration.
- DataTable sorting, filtering, faceting, pagination, row selection state, column visibility, column resizing, row actions orchestration, and toolbar/filter bar behavior.
- Virtualization, infinite loading, sticky column pinning, frozen columns, spreadsheet editing, editable cells, drag-to-reorder, grouped rows, tree tables, pivot tables, and DataGrid behavior.
- Data fetching, async loading orchestration, cache integration, remote pagination, query-state synchronization, or server actions.
- Built-in currency/date/status formatting.
- Built-in EmptyState, Skeleton, Spinner, Alert, Pagination, Toolbar, LiveRegion, Announcer, or Toast behavior.
- Layout tables or non-data-table examples.
- Automatic complex header association beyond preserving native `id`, `headers`, and `scope` attributes.
- ARIA grid roles, roving tabindex, custom keyboard navigation, or screen-reader announcements for sorting and selection.
- CSS-in-JS, styled-components, Emotion, arbitrary CSS prop parsing, `sx`, responsive object props, or runtime class generation.

## Further Notes

- Research basis: repository high-impact priority plan and current implemented component surface; Context7 shadcn/ui documentation for Table/DataTable composition; MDN table accessibility guidance; W3C WAI table tutorials; and the WHATWG HTML table model for native header scope and table cell relationships.
- Table should deliberately unlock DataTable, CRUD page examples, audit-log screens, billing tables, permissions matrices, and analytics summaries without prematurely adding DataTable behavior.
- The implementation issues should keep the component small, semantic, and dependency-free while giving future DataTable work a stable anatomy to consume.
