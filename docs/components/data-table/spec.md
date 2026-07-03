# DataTable Component Spec

Status: Published to GitHub issue tracker.

Tracker issue: https://github.com/parveshh/dethink-components/issues/135.

Source: `react_component_library_prd.docx` data-display component inventory,
`docs/development-path.md`, `docs/high-impact-component-priority.md`, current
component surface, Context7 TanStack Table documentation fetched on
2026-07-03, TanStack Table v8 documentation, W3C WAI sortable table guidance,
and MDN `aria-sort` guidance.

Package target: `@dethink/components`.

## Branch Workflow

Branch names follow the repository workflow in `AGENTS.md`:

1. `feature/prd-135-data-table`
2. `feature/issue-136-data-table-contract-docs`
3. `feature/issue-137-data-table-core-sorting`
4. `feature/issue-138-data-table-workflows`
5. `feature/issue-139-data-table-registry-storybook`

Create the PRD branch from the current integration base. Create Issue 1 from
the PRD branch, then stack each later issue branch from the previous issue
branch unless the GitHub issue dependency graph says otherwise. The final
implementation PR should target the PRD branch, not the repository default
branch, unless explicitly requested.

## Candidate Selection

DataTable is the next workable high-impact component after Table.

The repository now has the major dependencies DataTable needs: semantic Table
anatomy, Button, IconButton, Link, Typography, Box, Container, Stack, Flex,
Grid, Separator, Card, Form/Field, Input, Textarea, NumberInput, Checkbox,
RadioGroup, Switch, Select, Combobox, Popover, Tooltip, DropdownMenu, Dialog,
DateTimePicker, provider theming, density, registry validation, Storybook, SSR
tests, accessibility tests, and package builds.

There is no existing DataTable planning folder, source component, registry item,
or open DataTable issue set. The published parent PRD is issue #135.

## Purpose

DataTable provides the production table workflow layer for SaaS dashboards,
internal tools, admin systems, B2B applications, analytics views, permissions
matrices, audit logs, billing screens, user-management screens, CRUD examples,
and AI-native product interfaces.

Table remains the semantic table primitive. DataTable adds typed data modeling,
TanStack Table state, sorting, filtering, pagination, row selection, column
visibility, row action composition, loading, empty, error, manual/server modes,
documentation, Storybook examples, registry metadata, and tests.

DataTable v1 should solve the repeated workflow assembly problem without
becoming a spreadsheet-like DataGrid.

## Research Decisions

- TanStack Table is the planned headless state engine because it composes
  explicit row models, controlled state slices, and consumer-owned markup.
- TanStack Table React usage renders through app-owned markup using table
  instances, column definitions, row models, and render helpers.
- TanStack Table supports client-side and manual server-side filtering,
  sorting, and pagination patterns. DataTable v1 should expose both.
- TanStack Table supports controlled state slices for sorting, filtering,
  pagination, row selection, and column visibility. DataTable should not hide
  these state channels behind app-specific assumptions.
- TanStack Table does not own DOM accessibility. Dethink DataTable must render
  semantic table markup and accessible controls.
- W3C WAI sortable table guidance keeps native table markup, wraps sortable
  header labels in buttons, and sets `aria-sort` on the currently sorted header
  cell.
- MDN `aria-sort` guidance says the attribute belongs on the sorted table or
  grid header and should be set on only the current sorted column or row.
- DataTable v1 should not use `role="grid"` or roving tabindex by default. That
  behavior belongs to a future DataGrid or spreadsheet-like component.
- Virtualization should remain an explicit future decision. TanStack Table can
  pair with virtualization, but v1 should ship pagination and manual modes
  first.

## Dependencies

- Existing Dethink Table component and semantic table slots.
- Existing provider theme, density, direction, and CSS variable system.
- Tailwind CSS v4 utilities with static class maps.
- Shared `cn` class name utility.
- Existing Button, IconButton, Checkbox, Input, Select, Combobox, Popover,
  Tooltip, DropdownMenu, Form/Field, Card, Stack, Flex, Grid, and Separator
  conventions.
- TanStack Table React package for headless table state and row models.
- Registry base setup under `registry/items/base.json`.

No data-fetching, router, cache, virtualization, drag/drop, charting, or
framework-specific runtime dependency should be introduced in v1.

## Public API

The implementation issues should finalize exact names, but the planned public
surface is:

```ts
export type DataTableDensity = "compact" | "default" | "comfortable";
export type DataTableStateMode = "client" | "manual";
export type DataTableSelectionMode = "none" | "single" | "multiple";
export type DataTableStatus = "idle" | "loading" | "error" | "empty";

export interface DataTableProps<TData> {
  data: TData[];
  columns: DataTableColumnDef<TData>[];
  getRowId?: (row: TData, index: number) => string;
  density?: DataTableDensity;
  selectionMode?: DataTableSelectionMode;
  sorting?: SortingState;
  defaultSorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  columnFilters?: ColumnFiltersState;
  defaultColumnFilters?: ColumnFiltersState;
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>;
  globalFilter?: string;
  defaultGlobalFilter?: string;
  onGlobalFilterChange?: (value: string) => void;
  pagination?: PaginationState;
  defaultPagination?: PaginationState;
  onPaginationChange?: OnChangeFn<PaginationState>;
  rowCount?: number;
  pageCount?: number;
  rowSelection?: RowSelectionState;
  defaultRowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  columnVisibility?: VisibilityState;
  defaultColumnVisibility?: VisibilityState;
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>;
  manualSorting?: boolean;
  manualFiltering?: boolean;
  manualPagination?: boolean;
  loading?: boolean;
  error?: React.ReactNode;
  emptyContent?: React.ReactNode;
  renderRowActions?: (row: DataTableRow<TData>) => React.ReactNode;
  className?: string;
  tableClassName?: string;
}
```

Planned exports should include:

- `DataTable`
- `DataTableToolbar`
- `DataTableGlobalFilter`
- `DataTableColumnVisibility`
- `DataTablePagination`
- `DataTableEmpty`
- `DataTableLoading`
- `DataTableError`
- DataTable class name helpers
- public prop and data types
- re-exported or wrapped TanStack types where useful for consumers

## Behavior

- DataTable renders a table workflow from typed data and column definitions.
- DataTable uses Dethink Table slots for native table structure.
- Header groups, rows, cells, sorting, filters, pagination, selection, and
  visibility are derived from TanStack Table.
- Local mode should apply client-side sorting, filtering, and pagination row
  models where enabled.
- Manual mode should let consumers own server sorting, filtering, pagination,
  row counts, and data updates without DataTable applying conflicting client
  row models.
- Sorting can be controlled or uncontrolled.
- Filtering can be controlled or uncontrolled.
- Pagination can be controlled or uncontrolled.
- Row selection can be controlled or uncontrolled.
- Column visibility can be controlled or uncontrolled.
- Selection should require or strongly encourage stable row IDs.
- Row actions are provided through a render slot/function and remain business
  logic owned by the consumer.
- Loading, empty, and error states render accessible fallback surfaces while
  preserving table workflow context.
- Consumer `className` values compose after default classes.

## Accessibility

- Use native table elements by default.
- Do not add `role="grid"` or roving tabindex by default.
- Sortable header labels should be buttons.
- `aria-sort` should be set only on the active sorted header cell where the
  current sort direction is known.
- Sorting should be keyboard-operable.
- Row selection should use labeled checkbox controls.
- Select-all should have an accessible name that describes the scope.
- Filter controls should have visible labels or accessible names.
- Pagination controls should have accessible names and disabled states.
- Loading, empty, and error states should expose useful text alternatives or
  descriptions.
- Row action controls should have accessible names and normal focus behavior.
- Manual/server updates should not depend on motion or color alone to
  communicate changed state.

## Styling

- Use Tailwind CSS v4 utilities and explicit class maps.
- Use `cn` for class merging.
- Use token-backed background, foreground, muted, border, ring, radius, shadow,
  spacing, and density utilities.
- Keep the visual language restrained and work-focused for dense SaaS/internal
  tool screens.
- Use density-aware toolbar spacing, cell spacing, row height, pagination
  controls, and filter controls.
- Use logical alignment and spacing where possible.
- Preserve Table's responsive overflow behavior.
- Avoid hard-coded brand colors.
- Avoid CSS-in-JS, Emotion, styled-components, `sx`, arbitrary CSS prop
  parsing, runtime class generation, and responsive object props.

## Data Attributes

DataTable should expose stable data attributes:

- `data-slot="data-table"`
- `data-slot="data-table-toolbar"`
- `data-slot="data-table-global-filter"`
- `data-slot="data-table-column-filter"`
- `data-slot="data-table-column-visibility"`
- `data-slot="data-table-pagination"`
- `data-slot="data-table-empty"`
- `data-slot="data-table-loading"`
- `data-slot="data-table-error"`
- `data-slot="data-table-row-actions"`
- `data-density`
- `data-status`
- `data-sortable`
- `data-sorted`
- `data-selected`
- `data-selectable`
- `data-manual-sorting`
- `data-manual-filtering`
- `data-manual-pagination`

## Registry Requirements

- Add a `data-table` registry item with component source, index export, needed
  helpers, and `cn` utility.
- Depend on `dethink-base` and the existing Dethink components needed by the
  copied source.
- Add TanStack Table React as a runtime dependency.
- Keep dependency metadata accurate so registry installation is portable.
- Add registry smoke coverage for copied source, dependency metadata, aliases,
  CSS variables, package exports, and example imports.

## Documentation Requirements

- Overview: DataTable is the workflow layer for sortable, filterable,
  paginated, selectable tables.
- Installation through registry and package import.
- Relationship to Table and future DataGrid.
- Anatomy and stable data attributes.
- Base table example.
- Sortable table example.
- Global filter example.
- Column filter example.
- Paginated table example.
- Row selection and bulk actions example.
- Column visibility example.
- Row actions example.
- Loading, empty, and error examples.
- Manual/server mode example.
- Compact/default/comfortable density example.
- Dark mode, RTL, responsive overflow, and theme override examples.
- Accessibility guidance for sorting, row selection, filters, pagination, and
  no grid roles by default.
- Theming, SSR, registry installation, testing, and migration guidance.

## Out Of Scope

- Data fetching, cache integration, URL syncing, server actions, TanStack
  Query, SWR, router adapters, and saved preferences.
- Virtualization, infinite scrolling, column resizing, column pinning, row
  grouping, tree rows, expandable subrows, row drag/drop, column reordering,
  pivot tables, spreadsheet editing, editable cells, and DataGrid behavior.
- Complex faceted search engines, fuzzy matching dependencies, saved views,
  advanced query builders, CSV export, import flows, batch mutation
  orchestration, optimistic updates, and audit logging.
- Replacing the base Table primitive.
- ARIA grid roles, roving tabindex, and custom cell navigation in v1.
- Component-level theme props, CSS-in-JS, styled-components, Emotion,
  arbitrary CSS prop parsing, `sx`, responsive object props, and runtime
  Tailwind generation.

## Verification Requirements

- Unit/render tests for public API, typed columns, row rendering, sorting,
  filtering, pagination, selection, visibility, states, controlled/uncontrolled
  state, manual modes, row IDs, className composition, and data attributes.
- Interaction tests for keyboard sorting, filter changes, pagination changes,
  row selection, select-all, visibility toggles, and row action menus.
- Accessibility tests with axe for sorting, filters, selection, pagination,
  empty/loading/error states, and row actions.
- SSR render/hydration smoke tests.
- Storybook coverage for meaningful variants and workflows.
- Registry validation and smoke tests.
- Package build/typecheck tests.
