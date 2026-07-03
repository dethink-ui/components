# Table Component Spec

Status: Published to GitHub issue tracker.

Tracker issue: https://github.com/parveshh/dethink-components/issues/130.

Source: `react_component_library_prd.docx` data-display component inventory,
`docs/development-path.md`, `docs/high-impact-component-priority.md`,
current primitive conventions, shadcn/ui Table/DataTable documentation fetched
through Context7 on 2026-07-03, MDN table accessibility guidance, W3C WAI
table tutorials, and the WHATWG HTML table model.

Package target: `@dethink/components`.

## Branch Workflow

Branch names follow the repository workflow in `AGENTS.md`:

1. `feature/prd-130-table`
2. `feature/issue-131-table-contract-docs`
3. `feature/issue-132-table-source-tests`
4. `feature/issue-133-table-registry-storybook`

Create the PRD branch from the current integration base. Create Issue 1 from
the PRD branch, then stack each later issue branch from the previous issue
branch unless the GitHub issue dependency graph says otherwise. The final
implementation PR should target the PRD branch, not the repository default
branch, unless explicitly requested.

## Candidate Selection

Table is the next workable high-impact component after the completed overlay
primitive group and before DataTable.

GitHub currently has no previous Table PRD or implementation issue set, and
there is no existing Table planning folder. Main already has the primitives
Table should compose with: Typography, Box, Container, Stack, Flex, Grid,
Separator, Card, Button, IconButton, Link, Checkbox, Dialog, Popover, Tooltip,
DropdownMenu, Select, Combobox, and form/input controls.

## Purpose

Table is a semantic data-display primitive for tabular product data in SaaS
dashboards, internal tools, admin systems, billing screens, audit logs,
permissions matrices, settings pages, and CRUD examples.

Table should replace ad hoc `<table>` markup and repeated utility strings with
consistent native table anatomy, responsive overflow behavior, provider-token
styling, caption and header patterns, stable data attributes, Storybook
examples, registry metadata, and package exports.

Table v1 should stay intentionally structural. It is not DataTable, DataGrid,
Grid, List, DataList, Card, or an app-level CRUD table. It should provide the
semantic table surface that future DataTable behavior can consume.

## Research Decisions

- shadcn/ui uses a small anatomy around native table elements: `Table`,
  `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead`,
  `TableCell`, and `TableCaption`.
- shadcn/ui DataTable examples compose TanStack Table output into those
  semantic Table slots, which supports the Dethink split between Table v1 and
  future DataTable.
- MDN and W3C WAI guidance both emphasize native table markup, captions, header
  cells, `scope`, and explicit `id`/`headers` relationships for complex tables.
- WHATWG defines table cell relationships through native table semantics. Table
  should preserve those native attributes rather than replacing them with
  custom abstractions.
- Static data tables should not use `role="grid"` or roving tabindex unless
  they are actually interactive grids. Those behaviors belong to DataGrid or
  future DataTable features.
- Responsive behavior should preserve the native table instead of converting
  rows to cards in v1. Horizontal overflow is the predictable baseline.
- Sorting, filtering, pagination, selection state, column visibility, row
  actions orchestration, virtualization, and live announcements belong to
  DataTable.

## Dependencies

- Foundation tokens for color, border, radius, spacing, density, theme, and
  direction.
- Tailwind CSS v4 utilities with static class maps.
- Shared `cn` class name utility.
- Existing Card, Grid, Separator, Select, Combobox, Popover, Tooltip, and
  DropdownMenu conventions for stable data attributes, Storybook coverage, SSR
  tests, accessibility tests, and registry smoke.
- Registry base setup under `registry/items/base.json`.

No new runtime dependency should be introduced.

## Public API

The implementation issue should finalize names, but the planned public surface
is:

```ts
export type TableDensity = "compact" | "default" | "comfortable";
export type TableCaptionPlacement = "top" | "bottom";
export type TableCellAlign = "start" | "center" | "end";
export type TableRowTone = "default" | "muted";

export interface TableProps
  extends React.TableHTMLAttributes<HTMLTableElement> {
  containerClassName?: string;
  density?: TableDensity;
}

export interface TableHeaderProps
  extends React.HTMLAttributes<HTMLTableSectionElement> {}

export interface TableBodyProps
  extends React.HTMLAttributes<HTMLTableSectionElement> {}

export interface TableFooterProps
  extends React.HTMLAttributes<HTMLTableSectionElement> {}

export interface TableRowProps
  extends React.HTMLAttributes<HTMLTableRowElement> {
  hoverable?: boolean;
  selected?: boolean;
  tone?: TableRowTone;
}

export type TableHeadProps = Omit<
  React.ThHTMLAttributes<HTMLTableCellElement>,
  "align"
> & {
  align?: TableCellAlign;
};

export type TableCellProps = Omit<
  React.TdHTMLAttributes<HTMLTableCellElement>,
  "align"
> & {
  align?: TableCellAlign;
  numeric?: boolean;
};

export interface TableCaptionProps
  extends React.HTMLAttributes<HTMLTableCaptionElement> {
  placement?: TableCaptionPlacement;
}
```

Exports should include:

- `Table`
- `TableHeader`
- `TableBody`
- `TableFooter`
- `TableRow`
- `TableHead`
- `TableCell`
- `TableCaption`
- class name helpers where consistent with existing primitives
- prop and token types

## Behavior

- `Table` renders a responsive wrapper plus an inner native `<table>`.
- The responsive wrapper owns horizontal overflow and a stable wrapper slot.
- The inner table preserves native table layout and attributes.
- `TableHeader` renders `thead`.
- `TableBody` renders `tbody`.
- `TableFooter` renders `tfoot`.
- `TableRow` renders `tr`.
- `TableHead` renders `th`.
- `TableCell` renders `td`.
- `TableCaption` renders `caption`.
- `TableHead` defaults to `scope="col"` for normal column headers unless a
  consumer supplies another valid `scope`.
- Row-header examples should use `TableHead scope="row"`.
- Complex tables can use native `id`, `headers`, `scope`, `colSpan`, `rowSpan`,
  and `abbr` attributes, but Table v1 does not generate or validate complex
  header associations.
- `TableRow` may expose selected and muted visual hooks, but it does not own
  selection state.
- `TableCell` may expose alignment and numeric visual hooks, but it does not
  format values.
- Consumer `className` composes after default classes so local recipes can
  extend or override styles.
- Table preserves normal document and focus order. Interactive controls inside
  cells remain responsible for their own behavior.

## Accessibility

- Use native table elements for tabular data.
- Do not add `role="grid"` or roving tabindex by default.
- Do not use Table for layout tables in docs or Storybook examples.
- Use `TableCaption` for concise table descriptions in examples.
- Use `TableHead scope="col"` for column headers.
- Use `TableHead scope="row"` for row headers.
- Preserve `headers`, `id`, `scope`, `colSpan`, `rowSpan`, and `abbr` native
  attributes for complex tables.
- Sorting, filtering, selection, pagination, and live announcements are not
  automatic in Table v1.
- Nested controls inside cells must keep their own accessible names and keyboard
  behavior.
- Horizontal overflow must not trap focus or hide focused controls.

## Styling

- Use Tailwind CSS v4 utilities and explicit class maps.
- Use `cn` for class merging.
- Use token-backed background, foreground, muted, border, ring, radius, shadow,
  and spacing utilities.
- Keep the visual language restrained for SaaS dashboards and internal tools.
- Use density-aware row height and cell padding.
- Use logical alignment and spacing where possible.
- Use `tabular-nums` for numeric cell recipes where approved by implementation.
- Avoid hard-coded brand colors.
- Avoid CSS-in-JS, Emotion, styled-components, style-system runtimes, `sx`,
  arbitrary CSS prop parsing, runtime class generation, and responsive object
  props.

## Data Attributes

Table should expose stable data attributes:

- `data-slot="table-container"`
- `data-slot="table"`
- `data-slot="table-header"`
- `data-slot="table-body"`
- `data-slot="table-footer"`
- `data-slot="table-row"`
- `data-slot="table-head"`
- `data-slot="table-cell"`
- `data-slot="table-caption"`
- `data-density`
- `data-selected="true"` on selected rows when requested.
- `data-tone` on rows where useful.
- `data-align` on cells/headers where useful.
- `data-numeric="true"` on numeric cells where requested.
- `data-placement` on captions where useful.

## Registry Requirements

- Add a `table` registry item with component source, index export, and `cn`
  utility.
- Depend on `dethink-base`.
- Add no runtime dependencies.
- Keep metadata compatible with existing registry validation and smoke scripts.

## Documentation Requirements

- Overview: Table is a semantic native table primitive.
- Installation through registry and package import.
- Anatomy and stable data attributes.
- Base table example.
- Captioned table example.
- Row-header table example.
- Numeric alignment example.
- Responsive overflow example.
- Compact/default/comfortable density example.
- Dark mode and RTL examples.
- Empty-row recipe without depending on EmptyState.
- Status and row-action composition examples with existing primitives.
- Accessibility guidance for captions, scopes, complex headers, and nested
  controls.
- Theming, SSR, RTL, responsive overflow, testing, and migration guidance.
- Known limitations and out-of-scope behavior.

## Testing Requirements

Render and type tests:

- Responsive wrapper and native table structure.
- Every slot renders the approved native element.
- Ref forwarding for the native table and all table slots, with wrapper access
  through `data-slot="table-container"` and `containerClassName`.
- `className` merging.
- Custom attributes.
- Caption placement.
- `scope` defaults and overrides.
- `headers`/`id` associations pass through.
- `colSpan`, `rowSpan`, and `abbr` pass through.
- Selected row hooks.
- Muted row hooks.
- Numeric cell alignment hooks.
- Density class coverage.
- Stable data attributes.

Accessibility tests:

- Axe smoke for captioned tables.
- Column-header examples.
- Row-header examples.
- Complex header pass-through examples where practical.
- Nested action controls inside cells.
- No fake grid/widget role behavior by default.

SSR tests:

- Server render smoke.
- Hydration smoke without warnings.

Storybook tests and examples:

- Base anatomy.
- Captioned table.
- Row-header table.
- Numeric alignment.
- Status cells.
- Action cells.
- Empty-row recipe.
- Responsive horizontal overflow.
- Dark mode.
- Density.
- RTL.
- Composition with existing Button, IconButton, Link, Checkbox, DropdownMenu,
  Card, Stack, Flex, Grid, and Separator where useful.

Registry and playground tests:

- Registry metadata validates.
- Registry smoke verifies files, dependency-free behavior, stable slot data,
  tokenized classes, and copied source files.
- Playground imports and renders Table and all slots from
  `@dethink/components`.

## Out Of Scope

- TanStack Table integration.
- DataTable sorting, filtering, faceting, pagination, row selection state,
  column visibility, column resizing, row actions orchestration, and toolbar or
  filter bar behavior.
- Virtualization, infinite loading, sticky column pinning, frozen columns,
  spreadsheet editing, editable cells, drag-to-reorder, grouped rows, tree
  tables, pivot tables, and DataGrid behavior.
- Data fetching, async loading orchestration, cache integration, remote
  pagination, query-state synchronization, or server actions.
- Built-in currency, date, or status formatting.
- Built-in EmptyState, Skeleton, Spinner, Alert, Pagination, Toolbar,
  LiveRegion, Announcer, or Toast behavior.
- Layout tables or non-data-table examples.
- Automatic complex header association beyond preserving native `id`,
  `headers`, and `scope` attributes.
- ARIA grid roles, roving tabindex, custom keyboard navigation, or screen-reader
  announcements for sorting and selection.
- CSS-in-JS, styled-components, Emotion, arbitrary CSS prop parsing, `sx`,
  responsive object props, or runtime class generation.
