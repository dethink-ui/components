# DataTable Component PRD

Status: Published to GitHub issue tracker.

Tracker issue: https://github.com/parveshh/dethink-components/issues/135.

Package target: `@dethink/components`.

## Problem Statement

Teams building production SaaS dashboards, internal tools, admin systems, B2B
applications, and AI-native React interfaces need a first-class DataTable
component for common CRUD and reporting workflows. The library now has semantic
Table anatomy plus the surrounding primitives DataTable needs: form fields,
inputs, selection controls, Select, Combobox, Popover, Tooltip, DropdownMenu,
Dialog, layout primitives, theme/density infrastructure, Storybook, registry
validation, and package exports.

Without DataTable, consumers still have to wire TanStack Table, table markup,
filters, pagination, row selection, column visibility, empty/loading/error
states, row actions, responsive overflow, ARIA sort state, and
registry-compatible styling themselves. That creates repeated boilerplate,
inconsistent accessibility, inconsistent density and theme behavior, and a weak
path toward CRUD blocks and analytics dashboards.

## Solution

Ship DataTable as the high-impact data workflow component after Table.
DataTable should use TanStack Table as the headless table state engine and
render through Dethink Table anatomy, Dethink controls, and provider tokens. The
component should provide an opinionated but open-code baseline for sorting,
filtering, pagination, row selection, column visibility, row actions
composition, loading, empty, and error states.

DataTable v1 should support both local/client-side state and controlled/manual
modes for app-owned server queries. It should remain a table workflow
component, not a spreadsheet-like DataGrid. It should not own data fetching,
persistence, URL syncing, virtualization, editable cells, drag/drop, column
resizing, or server-cache integrations in v1.

## User Stories

1. As a dashboard engineer, I want a DataTable component, so that common tabular workflows do not require rebuilding TanStack Table wiring every time.
2. As an internal-tool engineer, I want DataTable to render through Dethink Table anatomy, so that semantic table styling stays consistent with the base Table component.
3. As a package consumer, I want typed column definitions, so that row data and cell renderers are type-safe.
4. As a package consumer, I want sorting support, so that users can reorder rows by common columns.
5. As a package consumer, I want controlled sorting state, so that apps can sync sort changes to server queries or URL state.
6. As a package consumer, I want uncontrolled sorting state, so that simple tables work with minimal setup.
7. As a screen-reader user, I want sorted headers to expose the correct ARIA sort state, so that I can understand the active sort column and direction.
8. As a keyboard user, I want sortable headers to use real buttons, so that sorting works without a pointer.
9. As a dashboard engineer, I want global filtering, so that users can quickly search rows in small to medium datasets.
10. As a dashboard engineer, I want column filtering hooks, so that specific columns can expose text, select, or custom filter controls.
11. As a package consumer, I want controlled filter state, so that server-side filtering can be driven by the app.
12. As a package consumer, I want uncontrolled filter state, so that client-side filtering works quickly for local datasets.
13. As an internal-tool engineer, I want pagination controls, so that large result sets can be split into readable pages.
14. As an internal-tool engineer, I want controlled pagination state, so that server pagination can own page index, page size, and row count.
15. As an internal-tool engineer, I want uncontrolled pagination state, so that local tables can paginate without app-managed state.
16. As a dashboard engineer, I want row selection, so that users can select one or more records for bulk actions.
17. As a keyboard user, I want row selection controls to be native and labeled, so that selection is operable without a pointer.
18. As a package consumer, I want stable row IDs, so that selection state survives sorting, filtering, and pagination.
19. As a package consumer, I want column visibility controls, so that users can hide low-priority columns in dense admin views.
20. As a responsive user, I want DataTable to preserve horizontal overflow behavior, so that dense tables remain usable on narrow screens.
21. As a design-system lead, I want DataTable to use provider tokens and density modes, so that compact and comfortable tables match the rest of the library.
22. As a design-system lead, I want DataTable styles to use static Tailwind class maps, so that registry-installed code remains portable.
23. As a docs author, I want Storybook examples for sorting, filtering, pagination, selection, visibility, row actions, empty, loading, error, density, dark mode, RTL, and theme overrides, so that consumers can copy realistic patterns.
24. As a registry consumer, I want DataTable metadata to include TanStack Table and Dethink dependencies, so that registry installation works without manual package discovery.
25. As an SSR app developer, I want DataTable to render and hydrate without warnings, so that it can be used in Next.js-style apps.
26. As an accessibility reviewer, I want DataTable to preserve native table markup by default, so that it does not expose misleading grid semantics.
27. As an accessibility reviewer, I want DataTable to avoid roving tabindex unless it becomes a true grid, so that keyboard behavior stays predictable.
28. As an accessibility reviewer, I want selection, sorting, filtering, pagination, loading, empty, and error states to be announced or described where appropriate, so that assistive technology users understand table changes.
29. As a QA engineer, I want tests for local and manual modes, so that app-owned server workflows do not regress.
30. As a QA engineer, I want tests for sorting, filtering, pagination, selection, column visibility, row actions, loading, empty, error, SSR, a11y, registry install, and package exports, so that DataTable is trustworthy.
31. As a maintainer, I want DataTable to stay separate from DataGrid, so that spreadsheet editing, virtualized panes, column resizing, row grouping, tree tables, and advanced keyboard grids remain future work.
32. As a maintainer, I want DataTable to stay separate from data-fetching adapters, so that teams can use TanStack Query, SWR, server actions, or their own cache layer without a forced dependency.
33. As an AI coding tool user, I want predictable DataTable examples, so that generated CRUD screens use the library's table, filter, pagination, and row-action patterns consistently.
34. As a product engineer, I want empty, loading, and error surfaces, so that asynchronous CRUD pages feel complete even before dedicated feedback primitives are fully built.
35. As a product engineer, I want row actions to compose with DropdownMenu and buttons, so that edit, duplicate, archive, and delete actions are easy to add without DataTable owning business behavior.

## Implementation Decisions

- DataTable is the next workable high-impact component after Table.
- DataTable should depend on TanStack Table for headless state and row models.
- DataTable should render with Dethink Table slots rather than custom div-based grids.
- DataTable should expose a typed generic public API for row data, column definitions, state callbacks, labels, and feature toggles.
- DataTable should support local/client-side sorting, filtering, pagination, row selection, and column visibility for small to medium datasets.
- DataTable should support controlled/manual modes for server sorting, server filtering, server pagination, externally owned row counts, and externally owned row selection.
- DataTable should require or strongly encourage stable row IDs when selection is enabled.
- Sortable headers should use native buttons inside header cells and expose ARIA sort only on the active sorted column where applicable.
- Selection should compose with the existing Checkbox primitive and expose labeled select-all and row selection controls.
- Filtering controls should compose with existing Input, Select, and Combobox primitives where possible.
- Column visibility should compose with DropdownMenu or Popover rather than introducing a new overlay system.
- Row actions should be a composition slot or render function, not a hard-coded action model.
- Loading, empty, and error states should be built into the DataTable surface as lightweight slots/props because DataTable needs them before the broader feedback-state suite lands.
- DataTable should preserve normal document and focus order; v1 should not use ARIA grid roles, roving tabindex, spreadsheet interaction, editable cells, or custom cell navigation.
- DataTable should use provider-level tokens, density modes, dark mode, RTL-safe alignment, stable data attributes, static Tailwind class maps, and shared class-name merging.
- DataTable registry metadata should include TanStack Table as a runtime dependency and list every copied component/helper file needed for registry portability.
- DataTable should not introduce TanStack Query, SWR, React Router, Next.js, virtualization, drag/drop, charting, or data-fetching dependencies in v1.

## Testing Decisions

- Tests should assert public behavior and DOM semantics rather than private TanStack internals.
- Rendered component tests should cover data rendering, column definitions, custom cell/header renderers, sorting, filtering, pagination, selection, visibility, row actions, empty/loading/error states, labels, controlled/uncontrolled state, manual mode flags, row IDs, className composition, data attributes, density, dark mode hooks, and RTL-safe layout.
- Accessibility tests should cover labeled controls, sortable header buttons, ARIA sort placement, row selection labels, select-all behavior, filter controls, pagination controls, empty/loading/error descriptions, nested row actions, and absence of grid roles by default.
- Interaction tests should cover keyboard sorting, filter input changes, pagination changes, row checkbox selection, select-all, column visibility toggles, and row action menu opening.
- SSR tests should cover server rendering and hydration without warnings for common local and manual-mode examples.
- Storybook should cover base, sortable, filterable, paginated, selectable, column visibility, row actions, loading, empty, error, server/manual mode fixture, dense data, dark mode, RTL, density, and theme override examples.
- Registry validation and smoke tests should verify dependency metadata, copied files, package exports, CSS variables, registry install portability, and consumer app import behavior.
- Existing Table, Select, Combobox, Checkbox, DropdownMenu, Popover, FormField, and input-control tests are the closest prior art for API shape, a11y seams, interaction seams, and registry smoke.

## Out of Scope

- Data fetching, cache integration, URL syncing, server actions, TanStack Query, SWR, router adapters, or persistence of table preferences.
- Virtualization, infinite scrolling, column resizing, column pinning, row grouping, tree rows, expandable subrows, row drag/drop, column reordering, pivot tables, spreadsheet editing, editable cells, or DataGrid behavior.
- Complex faceted search engines, fuzzy matching dependencies, saved views, advanced query builders, CSV export, import flows, batch mutation orchestration, optimistic updates, or audit logging.
- Fully custom pagination components beyond what DataTable needs for v1.
- Replacing the base Table primitive.
- ARIA grid roles, roving tabindex, and custom cell navigation in v1.
- Component-level theme props, CSS-in-JS, styled-components, Emotion, arbitrary CSS prop parsing, `sx`, responsive object props, and runtime-generated Tailwind class names.

## Further Notes

- Research basis: repository high-impact priority plan, existing Table PRD, current implemented component surface, Context7 TanStack Table documentation, TanStack Table v8 docs for sorting/filtering/pagination/state, W3C WAI sortable table guidance, and MDN `aria-sort` guidance.
- TanStack Table research highlights: table behavior is composed from explicit row models and controlled state slices; React usage renders through consumer-owned markup; client-side and manual server-side modes are both first-class patterns.
- Accessibility research highlights: sortable native tables should keep table markup, put `aria-sort` on the active sorted header cell, use buttons for sortable header labels, and avoid adding grid behavior unless the widget is actually a grid.
- DataTable should unlock CRUD page blocks, audit logs, billing tables, user-management tables, permissions matrices, analytics drilldowns, and admin dashboards.
