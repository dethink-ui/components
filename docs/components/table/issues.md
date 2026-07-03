# Table Issue Breakdown

Status: Published to GitHub issue tracker.

This uses the `to-issues` tracer-bullet format.

Package target: `@dethink/components`.

## Published Issues

- Parent PRD: https://github.com/parveshh/dethink-components/issues/130
- AFK contract and local planning docs: https://github.com/parveshh/dethink-components/issues/131
- AFK source, anatomy, and behavior tests: https://github.com/parveshh/dethink-components/issues/132
- AFK registry, Storybook, a11y, SSR, and verification: https://github.com/parveshh/dethink-components/issues/133

## Branch Stack

1. `feature/prd-130-table`
2. `feature/issue-131-table-contract-docs`
3. `feature/issue-132-table-source-tests`
4. `feature/issue-133-table-registry-storybook`

Create the PRD branch from the current integration base. Create Issue 1 from
the PRD branch, then stack each later issue branch from the previous issue
branch unless the GitHub issue dependency graph says otherwise. The final
implementation PR should target the PRD branch, not the repository default
branch, unless explicitly requested.

## Proposed Breakdown

1. **Title**: Table contract and local planning docs (#131)
   **Type**: AFK
   **Blocked by**: #130
   **User stories covered**: 1-35

2. **Title**: Table source, anatomy, and behavior tests (#132)
   **Type**: AFK
   **Blocked by**: #131
   **User stories covered**: 1-25, 28-35

3. **Title**: Table registry, Storybook, a11y, SSR, and verification (#133)
   **Type**: AFK
   **Blocked by**: #132
   **User stories covered**: 1-35

## Published Issue #131

## What to build

Create the local contract and planning documents for the Table component from
the published PRD. The docs should define Table as the dependency-free semantic
table primitive before DataTable, define the Table slot family, define
boundaries between Table, Grid, DataTable, DataGrid, List/DataList, Card,
Form/Field, EmptyState, Pagination, Toolbar, and CRUD page blocks, document the
public API shape, accessibility invariants, test seams, out-of-scope decisions,
and stacked branch mapping.

This slice should not implement runtime component source beyond documentation
examples needed to clarify the contract.

## Acceptance criteria

- [ ] The local specification captures Table as a native semantic data-display primitive, not a layout table, Grid replacement, DataTable, DataGrid, spreadsheet, virtualized grid, or list component.
- [ ] The local PRD mirrors the published GitHub PRD decisions and links back to the parent PRD issue.
- [ ] The local issue breakdown maps this PRD to the approved stacked child issues.
- [ ] The docs define Table, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell, and TableCaption behavior.
- [ ] The docs define responsive overflow behavior, native table markup, ref forwarding, className composition, stable data attributes, density behavior, dark mode, RTL, and token-backed styling.
- [ ] The docs define accessibility expectations for captions, column headers, row headers, header scope, native `headers`/`id` associations for complex tables, and no fake grid roles in v1.
- [ ] The docs clearly separate Table from DataTable sorting/filtering/pagination/selection behavior and from DataGrid spreadsheet-like editing or virtualized interaction.
- [ ] The docs explicitly reject data fetching, formatting, sorting, filtering, pagination, virtualization, row selection state, column visibility, column resizing, editable cells, ARIA grid roles, roving tabindex, CSS-in-JS, `sx`, arbitrary CSS props, and runtime class generation for v1.
- [ ] The docs list render, accessibility, SSR, Storybook, registry, package export, playground, and smoke testing seams.

## Blocked by

- #130

## Published Issue #132

## What to build

Build the Table component source and anatomy from the approved contract. The
completed slice should deliver the public Table slot family, exported prop/data
types, native semantic rendering, responsive overflow wrapping, explicit
Tailwind class maps, className composition, ref forwarding, stable data
attributes, caption and header-scope support, and behavior tests for the public
DOM and accessibility contract.

The completed slice should make Table and all slot components usable from the
package source and verify public rendering behavior without depending on
Storybook or registry metadata yet.

## Acceptance criteria

- [ ] Table renders an approved responsive wrapper and native table element without replacing table semantics with non-table roles.
- [ ] TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell, and TableCaption render the approved native elements and forward refs.
- [ ] TableHead supports native `scope` and defaults to the approved column-header behavior while preserving consumer overrides for row, rowgroup, colgroup, and complex tables.
- [ ] TableCell and TableHead preserve native table attributes such as `colSpan`, `rowSpan`, `headers`, `abbr`, custom ARIA attributes, and data attributes.
- [ ] Table and slots expose stable `data-slot` attributes and relevant visual state hooks for selected, muted, numeric, hoverable, and density-aware rows/cells where approved by the contract.
- [ ] Table styles use token-backed Tailwind utility maps for background, foreground, border, muted text, row hover, selected row, caption, density, dark mode, RTL, and responsive overflow.
- [ ] Table and slots compose consumer `className` predictably with default classes.
- [ ] Public components and prop/data types are exported from the package entry point.
- [ ] Render tests cover wrapper/table structure, every slot, refs, class merging, custom attributes, captions, scope, headers/id associations, colSpan, rowSpan, selected state hooks, numeric alignment, and responsive overflow classes.
- [ ] Accessibility tests or render assertions cover captioned tables, column headers, row headers, nested actions, and absence of fake grid/widget roles by default.
- [ ] SSR smoke tests cover server rendering and hydration without warnings for Table and all slots.
- [ ] Existing component tests continue to pass for the touched package surface.

## Blocked by

- #131

## Published Issue #133

## What to build

Finish Table as an installable and documented component surface. Add registry
metadata, Storybook coverage, accessibility tests, playground smoke coverage,
registry smoke coverage, and final verification for Table and every slot
component.

The completed slice should make the Table registry item installable and give
consumers examples for base anatomy, captions, row headers, numeric cells,
compact/default/comfortable density, dark mode, RTL, responsive horizontal
overflow, status cells, empty-row recipes, and row-action composition with
existing components.

## Acceptance criteria

- [ ] Registry metadata exists for Table and includes accurate files, dependencies, registry dependencies, and CSS variable expectations.
- [ ] Registry metadata keeps Table dependency-free beyond the base utility stack.
- [ ] Storybook examples cover base anatomy, captioned table, row-header table, numeric alignment, status cells, action cells, empty-row recipe, responsive horizontal overflow, dark mode, density, RTL, and composition with existing Button/IconButton/Link/Checkbox/DropdownMenu/Badge-like patterns where available.
- [ ] Accessibility tests cover axe smoke for captioned tables, column headers, row headers, scoped headers, nested action controls, and no fake grid/widget role behavior by default.
- [ ] SSR tests cover server rendering and hydration without warnings for Table and all slots if not already covered by the source slice.
- [ ] Playground smoke coverage exercises Table and all slot components through the package export path.
- [ ] Registry smoke coverage verifies Table metadata, dependency-free behavior, stable data attributes, tokenized classes, slot exports, and copied source files.
- [ ] Documentation or examples clearly direct users to DataTable, DataGrid, Grid, List/DataList, Card, EmptyState, Pagination, Toolbar, and future CRUD page blocks instead of overloading Table v1.
- [ ] Verification commands pass for the implemented slice: typecheck, tests, a11y tests, package build, Storybook build, registry validation, and registry smoke where available.

## Blocked by

- #132

