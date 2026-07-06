# Breadcrumb Issue Breakdown

Status: Published to GitHub issue tracker.

This uses the `to-issues` tracer-bullet format.

Package target: `@dethink/components`.

## Parent PRD

- Parent PRD: https://github.com/parveshh/dethink-components/issues/186

## Published Issues

- Parent PRD: https://github.com/parveshh/dethink-components/issues/186
- AFK Breadcrumb contract and local planning docs: https://github.com/parveshh/dethink-components/issues/230
- AFK Breadcrumb core semantics, links/actions, current state, and package surface: https://github.com/parveshh/dethink-components/issues/231
- AFK Breadcrumb collapse, overflow, responsive truncation, and tokenized polish: https://github.com/parveshh/dethink-components/issues/232
- AFK Breadcrumb registry, Storybook, showcase, a11y, SSR, and final verification: https://github.com/parveshh/dethink-components/issues/233

## Branch Stack

1. `feature/prd-186-breadcrumb`
2. `feature/issue-230-breadcrumb-contract-docs`
3. `feature/issue-231-breadcrumb-core-semantics`
4. `feature/issue-232-breadcrumb-collapse-overflow`
5. `feature/issue-233-breadcrumb-registry-storybook`

Create the PRD branch from the current integration base. Create Issue 1 from
the PRD branch, then stack each later issue branch from the previous issue
branch unless the GitHub issue dependency graph says otherwise. The final
implementation PR should target the PRD branch, not the repository default
branch, unless explicitly requested.

## Proposed Breakdown

1. **Title**: Breadcrumb contract and local planning docs (#230)
   **Type**: AFK
   **Blocked by**: #186
   **User stories covered**: 1-24

2. **Title**: Breadcrumb core semantics, links/actions, current state, and package surface (#231)
   **Type**: AFK
   **Blocked by**: #230
   **User stories covered**: 1-9, 14-16, 21, 22

3. **Title**: Breadcrumb collapse, overflow, responsive truncation, and tokenized polish (#232)
   **Type**: AFK
   **Blocked by**: #231
   **User stories covered**: 10-19, 23, 24

4. **Title**: Breadcrumb registry, Storybook, showcase, a11y, SSR, and final verification (#233)
   **Type**: AFK
   **Blocked by**: #231 and #232
   **User stories covered**: 1-24

## Published Issue #230

## What to build

Create the local Breadcrumb contract and planning documents from the published PRD. The docs should define Breadcrumb as a location-hierarchy navigation primitive, capture the public component family, data-driven and children-driven APIs, current-page semantics, separator accessibility, overflow strategy, token/theming approach, testing seams, branch stack, and out-of-scope boundaries.

This slice should not implement runtime component source beyond documentation examples needed to clarify the contract.

## Acceptance criteria

- [ ] Local Breadcrumb specification and issue breakdown documents exist and link back to the parent PRD.
- [ ] The docs define Breadcrumb as location hierarchy and clearly separate it from Sidebar, NavigationMenu, Pagination, CommandPalette, and page-header layout.
- [ ] The docs define public anatomy for root, list, item, link, page/current item, separator, ellipsis, and overflow parts.
- [ ] The docs define data-driven and children-driven usage, `asChild` router composition, href/action modes, current-page semantics, disabled items, icons, and custom separators.
- [ ] The docs define the collapse and overflow contract, including hidden ancestor reachability and reuse of existing Popover/DropdownMenu patterns rather than a new overlay layer.
- [ ] The docs define accessibility expectations for labelled nav landmarks, ordered lists, `aria-current`, non-interactive current page text, hidden decorative separators, focus visibility, overflow keyboard behavior, and SSR safety.
- [ ] The docs list render, unit, accessibility, SSR, Storybook, showcase, registry, package export, and verification seams.
- [ ] The branch stack and child issue dependency order are documented locally.

## Blocked by

- #186

## Published Issue #231

## What to build

Build the first runtime Breadcrumb slice for semantic hierarchy navigation. The completed slice should provide the core Breadcrumb family for root, ordered list, item, link, page/current item, separator, data-driven rendering, children composition, href/action modes, `asChild` router composition, current-page semantics, disabled state, icon slots, tokenized classes, public exports, and focused behavior tests.

This slice should make Breadcrumb usable for normal page headers and detail pages without long-path collapse or overflow surfaces.

## Acceptance criteria

- [ ] Breadcrumb core components are exported with public prop/data types and helper class-name maps.
- [ ] Breadcrumb renders a labelled `nav` landmark and ordered list by default.
- [ ] Data-driven and children-driven usage both render stable semantic markup.
- [ ] Links render real anchors for `href`; local actions render buttons; router links can compose through `asChild`.
- [ ] Current linked items expose `aria-current="page"` by default and stable current-state data attributes.
- [ ] Current non-link page items render non-interactive text and are not keyboard focusable.
- [ ] Disabled items avoid activation and expose stable disabled data attributes.
- [ ] Separators are decorative and hidden from assistive technology.
- [ ] Icons, sizes, separators, density, dark mode, focus-visible state, RTL, and className composition are represented with explicit Tailwind class maps.
- [ ] Render tests cover nav label, list structure, href links, action buttons, router composition, current link, current text, disabled state, separators, icon slots, className composition, and data attributes.
- [ ] Package exports and initial registry metadata are present for the non-overflow Breadcrumb path.

## Blocked by

- #230

## Published Issue #232

## What to build

Extend Breadcrumb with long-path handling. The completed slice should add item-window generation, `maxItems`, `collapseFrom`, `preserveRoot`, `preserveCurrent`, stable ellipsis controls, overflow content for hidden ancestors, responsive truncation, long-label handling, CSS-only transition polish, reduced-motion behavior, and tests/stories for collapsed breadcrumbs.

Overflow should keep hidden ancestors reachable while preserving their link/action semantics and should reuse existing Popover/DropdownMenu patterns instead of implementing a new overlay stack.

## Acceptance criteria

- [ ] Breadcrumb supports `maxItems`, `collapseFrom`, `preserveRoot`, `preserveCurrent`, and `overflowLabel` options.
- [ ] Collapse/window generation handles beginning, middle, end, small item counts, disabled/current item edge cases, and invalid `maxItems` values.
- [ ] Collapsed hidden ancestors are reachable through a labelled ellipsis/overflow trigger.
- [ ] Overflow content preserves real link semantics for hidden href items and button semantics for hidden action items.
- [ ] Overflow composes an existing overlay primitive and returns focus to the trigger on close.
- [ ] Responsive truncation keeps long labels from overlapping neighboring page-header actions.
- [ ] CSS-only transitions cover current state, separator affordances, trigger affordances, and overflow reveal without making motion required for meaning.
- [ ] Reduced-motion mode keeps state changes visible while disabling unnecessary movement.
- [ ] Unit, render, keyboard, and accessibility tests cover collapse generation, hidden item reachability, overflow focus behavior, long labels, RTL, and reduced motion.
- [ ] Storybook examples cover long paths, collapse placement, hidden ancestors, overflow, responsive widths, dark mode, density, RTL, and reduced motion.

## Blocked by

- #231

## Published Issue #233

## What to build

Finish Breadcrumb as a documented, installable, provider-themed component surface. This slice should complete registry metadata, package exports, Storybook coverage, showcase recipes, accessibility automation, SSR smoke coverage, registry validation, package build coverage, and final verification for the full Breadcrumb v1 experience.

The completed component should be installable through the registry and should give consumers realistic examples for page headers, object detail pages, data-table drill-ins, settings sections, compact toolbars, long paths, overflow, icons, dark mode, density, RTL, custom separators, and reduced motion.

## Acceptance criteria

- [ ] Registry metadata exists for Breadcrumb and includes accurate files, dependencies, registry dependencies, and CSS variable expectations.
- [ ] Package exports include Breadcrumb components, helper class maps, and public prop/data types.
- [ ] Storybook examples cover basic breadcrumbs, current link, current text, href/action modes, router composition, separators, sizes, icons, disabled items, long labels, collapse/overflow, dark mode, density, RTL, reduced motion, and custom theme overrides.
- [ ] Showcase examples cover page header, object detail, data-table drill-in, settings section, and compact toolbar recipes using realistic SaaS/internal-tool content.
- [ ] Accessibility tests cover labelled nav, ordered list, current state, hidden separators, disabled items, overflow trigger/content, keyboard reachability, and focus return.
- [ ] SSR tests cover data-driven, children-driven, collapsed, and overflow-closed Breadcrumb rendering without mismatch warnings.
- [ ] Registry validation and registry smoke verify copied source portability, dependency metadata, aliases, style imports, tokenized classes, CSS variable reliance, and package exports.
- [ ] Documentation covers overview, installation, anatomy, API, semantics, overflow behavior, keyboard behavior, theming, reduced motion, responsive guidance, recipes, testing, migration notes, and out-of-scope boundaries.
- [ ] Final verification commands pass or are documented with specific blockers: typecheck, tests, a11y tests, package build, Storybook build, registry validation, and registry smoke where available.

## Blocked by

- #231
- #232
