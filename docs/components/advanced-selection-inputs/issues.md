# Advanced Selection Inputs Issue Breakdown

Status: Published to GitHub issue tracker.

## Published Issues

- Parent PRD: https://github.com/parveshh/dethink-components/issues/167
- Advanced selection inputs contract and local planning docs: https://github.com/parveshh/dethink-components/issues/171
- MultiSelect component workflow: https://github.com/parveshh/dethink-components/issues/172
- AsyncSelect component workflow: https://github.com/parveshh/dethink-components/issues/173
- TagInput component workflow: https://github.com/parveshh/dethink-components/issues/174
- Advanced selection registry, Storybook, a11y, SSR, and verification: https://github.com/parveshh/dethink-components/issues/175
- Advanced selection showcase app pages: https://github.com/parveshh/dethink-components/issues/180

## Branch Stack

1. `feature/prd-167-advanced-selection-inputs`
2. `feature/issue-171-advanced-selection-contract-docs`
3. `feature/issue-172-multi-select-workflow`
4. `feature/issue-173-async-select-workflow`
5. `feature/issue-174-tag-input-workflow`
6. `feature/issue-180-advanced-selection-showcase`
7. `feature/issue-175-advanced-selection-registry-storybook`

Create the PRD branch from the current integration base. Create issue #171
from the PRD branch, then stack each later issue branch from the previous issue
branch unless the GitHub issue dependency graph says otherwise. The final
implementation PR should target the PRD branch unless explicitly requested.

## Published Breakdown

1. **Title**: Advanced selection inputs contract and local planning docs (#171)
   **Type**: AFK
   **Blocked by**: #167
   **User stories covered**: 38-46

2. **Title**: MultiSelect component workflow (#172)
   **Type**: AFK
   **Blocked by**: #171
   **User stories covered**: 1-15, 38-42, 44-46

3. **Title**: AsyncSelect component workflow (#173)
   **Type**: AFK
   **Blocked by**: #172
   **User stories covered**: 16-27, 38-46

4. **Title**: TagInput component workflow (#174)
   **Type**: AFK
   **Blocked by**: #172
   **User stories covered**: 29-46

5. **Title**: Advanced selection registry, Storybook, a11y, SSR, and verification (#175)
   **Type**: AFK
   **Blocked by**: #172, #173, #174, and #180
   **User stories covered**: 13-15, 24-28, 36-46

6. **Title**: Advanced selection showcase app pages (#180)
   **Type**: AFK
   **Blocked by**: #172, #173, and #174
   **User stories covered**: 28, 42-46

## Published Issue #171

## Parent

- #167

## What to build

Create the advanced selection inputs planning contract from the published PRD.
The docs should define MultiSelect, AsyncSelect, and TagInput as one cohesive
suite, identify how they reuse Select and Combobox behavior, and document
research, scope, public API direction, testing seams, registry expectations, and
out-of-scope boundaries before implementation starts.

## Acceptance criteria

- [ ] Local specification, PRD mirror, and issue breakdown documents exist and link back to the published PRD.
- [ ] The docs identify MultiSelect, AsyncSelect, and TagInput as the next high-impact component group after the date suite.
- [ ] The docs capture React Aria research and existing Select/Combobox prior art.
- [ ] The docs define shared chip, selection, async, validation, form serialization, theming, accessibility, registry, and testing expectations.
- [ ] The docs clearly separate this PRD from virtualization, command palette, TreeSelect, QueryBuilder, remote cache clients, form adapters, and drag-sorted tags.

## Blocked by

- #167

## Published Issue #172

## Parent

- #167

## What to build

Build the MultiSelect workflow for known option sets. The component should let
users search, select multiple options, view selected values as removable chips,
deselect options, clear all, submit selected values through forms, and use the
same provider-token styling and accessibility expectations as the rest of
Dethink inputs.

## Acceptance criteria

- [ ] MultiSelect supports controlled and uncontrolled selected values with ergonomic public value arrays.
- [ ] MultiSelect supports searchable filtering, data-driven items, static items, disabled keys, disabled items, and selected chip rendering.
- [ ] Users can select, deselect, remove chips, clear all values, open/close the menu, and complete the workflow with keyboard controls.
- [ ] MultiSelect supports label, description, error message, required, disabled, read-only, invalid, control size, form name, and predictable form serialization.
- [ ] MultiSelect uses provider-aware popover/listbox patterns and tokenized chip styling with light, dark, density, RTL, responsive, and theme override support.
- [ ] Unit, rendered behavior, a11y, and SSR tests cover public behavior without asserting private implementation details.

## Blocked by

- #171

## Published Issue #173

## Parent

- #167

## What to build

Build the AsyncSelect workflow for server-backed option lookup. The component
should accept app-owned query, items, loading, empty, error, and retry state,
keep selected option identity stable across result changes, and provide single
or explicitly approved multi-selection behavior without introducing a data
client or remote cache framework.

## Acceptance criteria

- [ ] AsyncSelect supports controlled query text, controlled selected value, default selected value where appropriate, and app-owned async items.
- [ ] AsyncSelect exposes loading, empty, error, retry, and minimum-query-length states with accessible status text.
- [ ] Selected values remain visible and serializable when the current search results no longer include them.
- [ ] AsyncSelect supports disabled/read-only/required/invalid state, labels, descriptions, errors, keyboard interaction, focus return, and form serialization.
- [ ] AsyncSelect stories use deterministic fake async data for loading, empty, error, retry, single-select, and approved multi-select examples.
- [ ] Unit, rendered behavior, a11y, and SSR tests cover async state transitions, stale result scenarios, and stable selected value behavior.

## Blocked by

- #172

## Published Issue #174

## Parent

- #167

## What to build

Build the TagInput workflow for free-form token authoring. The component should
let users create tags from keyboard delimiters, remove tags, paste bulk text,
prevent duplicates, normalize values, enforce validation rules, serialize tags
through forms, and use the shared chip visual language.

## Acceptance criteria

- [ ] TagInput supports controlled and uncontrolled tag arrays.
- [ ] Users can create tags with Enter, comma, and Tab; delete tags with Backspace; remove tags with named remove buttons; and paste comma-separated or newline-separated values.
- [ ] TagInput supports duplicate prevention, normalization, max count, max length, invalid tag handling, custom validation hooks, and clear error presentation.
- [ ] TagInput supports label, description, error message, required, disabled, read-only, invalid, control size, form name, and predictable form serialization.
- [ ] TagInput uses shared tokenized chip styling with light, dark, density, RTL, responsive, and theme override support.
- [ ] Unit, rendered behavior, a11y, and SSR tests cover public behavior, keyboard flows, paste parsing, validation, and focus management.

## Blocked by

- #172

## Published Issue #175

## Parent

- #167

## What to build

Add final integration coverage for the advanced selection inputs suite. This
slice should publish Storybook examples, registry metadata, package exports,
docs, playground smoke usage, registry smoke coverage, accessibility coverage,
SSR coverage, and final verification for MultiSelect, AsyncSelect, and
TagInput.

This final verification should also include the showcase webapp issue so the
developed components are visible in the public showcase surface as well as
Storybook.

## Acceptance criteria

- [ ] Registry metadata exists for MultiSelect, AsyncSelect, and TagInput with accurate files, dependencies, registry dependencies, and CSS variable expectations.
- [ ] Package exports are available for all public components, helper class-name functions, and public prop/data types.
- [ ] Storybook examples cover realistic filters, role assignment, labels, recipients, AI model/tool selection, server-backed lookup, controlled state, form usage, disabled/read-only, invalid/required, theme overrides, dark mode, density, RTL, and responsive chip wrapping.
- [ ] Accessibility tests cover labelled fields, descriptions, errors, invalid state, required state, chip remove buttons, async announcements, disabled/read-only states, and no axe violations.
- [ ] SSR tests cover rendering and hydration for MultiSelect, AsyncSelect, and TagInput without warnings.
- [ ] Playground and registry smoke checks verify copied component imports, dependency metadata, provider-token styling, and form serialization.
- [ ] Showcase app coverage from #180 is complete and included in final validation.
- [ ] Final verification runs typecheck, tests, a11y tests, build, Storybook build, registry validation, registry smoke, and showcase build/typecheck.

## Blocked by

- #172
- #173
- #174
- #180

## Published Issue #180

## Parent

- #167

## What to build

Add showcase webapp coverage for the advanced selection inputs suite. The
showcase should include public-facing documentation pages and realistic runnable
examples for MultiSelect, AsyncSelect, and TagInput after the components are
developed, so the components are visible outside Storybook and easy to evaluate
in the component showcase app.

The pages should follow the existing showcase structure, navigation, props
table, example-source, and component metadata patterns. Examples should cover
practical SaaS and internal-tool workflows such as report filters, role
assignment, labels, recipients, AI model/tool selection, and server-backed
lookup.

## Acceptance criteria

- [ ] Showcase routes/pages exist for MultiSelect, AsyncSelect, and TagInput using the established showcase app page patterns.
- [ ] Showcase navigation and component metadata include the new advanced selection components.
- [ ] Examples demonstrate realistic workflows: multi-value filters, role assignment, labels, recipients, AI model/tool selection, and server-backed lookup.
- [ ] Examples include base, controlled, form serialization, disabled/read-only, invalid/required, theme/density/RTL, async loading/empty/error/retry, and responsive chip wrapping where relevant.
- [ ] Props tables document the public APIs for each developed component.
- [ ] Showcase examples use the shipped package exports and do not duplicate component internals.
- [ ] Showcase typecheck/build passes as part of final verification.

## Blocked by

- #172
- #173
- #174
