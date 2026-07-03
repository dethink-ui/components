# DataTable Issue Breakdown

Status: Published to GitHub issue tracker.

This uses the `to-issues` tracer-bullet format.

Package target: `@dethink/components`.

## Published Issues

- Parent PRD: https://github.com/parveshh/dethink-components/issues/135
- AFK contract and local planning docs: https://github.com/parveshh/dethink-components/issues/136
- AFK core source, sorting, and render tests: https://github.com/parveshh/dethink-components/issues/137
- AFK filtering, pagination, selection, visibility, and states: https://github.com/parveshh/dethink-components/issues/138
- AFK registry, Storybook, a11y, SSR, and verification: https://github.com/parveshh/dethink-components/issues/139

## Branch Stack

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

## Proposed Breakdown

1. **Title**: DataTable contract and local planning docs (#136)
   **Type**: AFK
   **Blocked by**: #135
   **User stories covered**: 1-35

2. **Title**: DataTable core source, sorting, and render tests (#137)
   **Type**: AFK
   **Blocked by**: #136
   **User stories covered**: 1-8, 20-22, 25-31, 33

3. **Title**: DataTable filtering, pagination, selection, visibility, and states (#138)
   **Type**: AFK
   **Blocked by**: #137
   **User stories covered**: 9-19, 23, 28-30, 34-35

4. **Title**: DataTable registry, Storybook, a11y, SSR, and verification (#139)
   **Type**: AFK
   **Blocked by**: #138
   **User stories covered**: 1-35

## Published Issue #136

## What to build

Create the local contract and planning documents for the DataTable component
from the published PRD. The docs should define DataTable as the
TanStack-powered workflow layer on top of the existing semantic Table anatomy,
define the public API shape, controlled and uncontrolled state contracts, local
and manual/server modes, sorting/filtering/pagination/selection/visibility
boundaries, loading/empty/error surfaces, accessibility invariants, registry
expectations, testing seams, and stacked branch mapping.

This slice should not implement runtime DataTable source beyond documentation
examples needed to clarify the contract.

## Acceptance criteria

- [ ] The local specification captures DataTable as a data workflow component built on TanStack Table and Dethink Table, not a replacement for Table or a spreadsheet-like DataGrid.
- [ ] The local PRD mirrors the published GitHub PRD decisions and links back to the parent PRD issue.
- [ ] The local issue breakdown maps this PRD to the approved stacked child issues.
- [ ] The docs define the planned component family, typed public API, column definition expectations, data model, row ID contract, labels, state callbacks, feature toggles, and class/data-attribute hooks.
- [ ] The docs define local/client-side and controlled/manual modes for sorting, filtering, pagination, row selection, and column visibility.
- [ ] The docs define accessibility expectations for native table markup, sortable header buttons, `aria-sort`, row selection labels, filter labels, pagination labels, empty/loading/error descriptions, and no ARIA grid behavior by default.
- [ ] The docs define how DataTable composes existing Table, Checkbox, Input, Select, Combobox, Popover, Tooltip, DropdownMenu, Button/IconButton, Form/Field, provider density, theme, and RTL behavior.
- [ ] The docs clearly separate DataTable from DataGrid, virtualization, infinite loading, editable cells, drag/drop, column resizing, data fetching, URL syncing, cache adapters, and saved views.
- [ ] The docs list rendered behavior, interaction, accessibility, SSR, Storybook, registry, package export, playground, and smoke testing seams.

## Blocked by

- #135

## Published Issue #137

## What to build

Build the first runtime DataTable slice from the approved contract. The
completed slice should deliver the core DataTable component, typed generic API,
TanStack Table integration, semantic rendering through Dethink Table anatomy,
package exports, base column/cell/header rendering, sorting support, controlled
and uncontrolled sorting state, stable row IDs where required, className
composition, stable data attributes, and focused render/behavior tests.

This slice should make DataTable usable for a basic sortable table without the
full toolbar, filter, pagination, selection, visibility, registry, or Storybook
completion work.

## Acceptance criteria

- [ ] DataTable renders native table markup through the existing Dethink Table slots and does not replace table semantics with div-based grid markup.
- [ ] DataTable accepts typed columns and data and renders header/cell content through TanStack Table-compatible render functions.
- [ ] DataTable supports uncontrolled sorting for simple client-side tables.
- [ ] DataTable supports controlled sorting and change callbacks for app-owned state.
- [ ] Sortable headers use native buttons inside header cells where sorting is enabled.
- [ ] Only the active sorted header cell exposes the correct `aria-sort` value where applicable.
- [ ] DataTable preserves custom row IDs or documents the default ID fallback used by TanStack Table.
- [ ] DataTable exposes stable slots/data attributes for root, toolbar/placeholder hooks where relevant, table, header, body, row, header cell, cell, and sort controls.
- [ ] DataTable styles use token-backed Tailwind utility maps, density-aware table spacing, class-name merging, and no runtime-generated Tailwind class strings.
- [ ] Public components, helper class maps, and prop/data types are exported from the package entry point.
- [ ] Render and interaction tests cover basic rendering, typed columns, custom cells, sortable headers, keyboard sorting, controlled sorting, uncontrolled sorting, row IDs, className composition, data attributes, and absence of ARIA grid roles by default.
- [ ] Existing component tests continue to pass for the touched package surface.

## Blocked by

- #136

## Published Issue #138

## What to build

Extend the core DataTable into the complete v1 workflow surface. The completed
slice should add global and column filtering hooks, pagination controls, row
selection, select-all behavior, column visibility controls, row action
composition, loading state, empty state, error state, local/client-side row
models, and controlled/manual modes for server-owned filtering, sorting,
pagination, row counts, selection, and visibility.

This slice should be demoable as a production-style CRUD table workflow before
registry and Storybook are finalized.

## Acceptance criteria

- [ ] DataTable supports global filtering with existing Input-style controls and controlled/uncontrolled state.
- [ ] DataTable supports column filter hooks or render slots for text, select, combobox, or custom filter controls without hard-coding app-specific filters.
- [ ] DataTable supports client-side pagination and controlled/manual pagination with externally supplied row count or page count.
- [ ] Pagination controls are labeled, keyboard-operable, density-aware, and expose page size/page navigation changes through callbacks.
- [ ] DataTable supports row selection and select-all behavior using the existing Checkbox primitive or approved native equivalent.
- [ ] Row selection remains stable across sorting, filtering, and pagination when stable row IDs are supplied.
- [ ] DataTable supports controlled row selection state and change callbacks for bulk actions.
- [ ] DataTable supports column visibility controls using existing Popover or DropdownMenu composition and controlled/uncontrolled visibility state.
- [ ] DataTable exposes a row actions slot or render function that composes with existing Button/IconButton/DropdownMenu components without owning business actions.
- [ ] DataTable supports loading, empty, and error surfaces with accessible labels/descriptions and token-backed styling.
- [ ] DataTable supports manual/server modes for sorting, filtering, and pagination without applying conflicting client-side row models.
- [ ] Tests cover filtering, pagination, selection, select-all, visibility toggles, row actions, loading, empty, error, manual modes, controlled state callbacks, keyboard interactions, and accessibility labels.
- [ ] Existing tests from the core slice continue to pass.

## Blocked by

- #137

## Published Issue #139

## What to build

Finish DataTable as an installable and documented component surface. Add
registry metadata, Storybook coverage, accessibility automation, SSR smoke
coverage, playground smoke coverage, registry smoke coverage, package build
coverage, and final verification for the complete DataTable v1 workflow.

The completed slice should make DataTable installable through the registry and
give consumers realistic examples for base tables, sorting, filtering,
pagination, row selection, column visibility, row actions, loading, empty,
error, manual/server mode, dense data, dark mode, RTL, density modes, and theme
overrides.

## Acceptance criteria

- [ ] Registry metadata exists for DataTable and includes accurate files, runtime dependencies, dev dependencies, registry dependencies, and CSS variable expectations.
- [ ] Registry metadata includes TanStack Table and all Dethink source/helper files required for copied-code portability.
- [ ] Package exports include DataTable components, helper class maps, and public prop/data types.
- [ ] Storybook examples cover base rendering, sorting, global filtering, column filtering, pagination, row selection, select-all, column visibility, row actions, loading, empty, error, manual/server mode, dense data, dark mode, RTL, density, responsive overflow, and theme overrides.
- [ ] Storybook examples use realistic SaaS/internal-tool data and existing Dethink primitives rather than marketing-only examples.
- [ ] Accessibility tests cover sortable headers, `aria-sort`, row selection labels, select-all labels, filter labels, pagination labels, loading/empty/error descriptions, row actions, keyboard interactions, and absence of ARIA grid roles by default.
- [ ] SSR tests cover server rendering and hydration without warnings for common DataTable examples.
- [ ] Playground smoke coverage exercises DataTable through the package export path.
- [ ] Registry smoke coverage verifies DataTable metadata, copied source files, dependency metadata, stable data attributes, tokenized classes, CSS variable reliance, and package exports.
- [ ] Documentation or examples clearly direct users to Table for semantic-only tables and future DataGrid/virtualization work for spreadsheet-like or very large interactive grids.
- [ ] Verification commands pass for the implemented slice: typecheck, tests, a11y tests, package build, Storybook build, registry validation, and registry smoke where available.

## Blocked by

- #138
