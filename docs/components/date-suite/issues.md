# Date Suite Issue Breakdown

Status: Published to GitHub issue tracker.

This uses the `to-issues` tracer-bullet format.

Package target: `@dethink/components`.

## Published Issues

- Parent PRD: https://github.com/parveshh/dethink-components/issues/141
- AFK contract and local planning docs: https://github.com/parveshh/dethink-components/issues/142
- AFK Calendar and RangeCalendar foundation: https://github.com/parveshh/dethink-components/issues/143
- AFK DatePicker component workflow: https://github.com/parveshh/dethink-components/issues/144
- AFK DateRangePicker component workflow: https://github.com/parveshh/dethink-components/issues/145
- AFK DateTimePicker selectable time controls: https://github.com/parveshh/dethink-components/issues/146
- AFK registry, Storybook, a11y, SSR, and verification: https://github.com/parveshh/dethink-components/issues/147

## Branch Stack

1. `feature/prd-141-date-suite`
2. `feature/issue-142-date-suite-contract-docs`
3. `feature/issue-143-calendar-range-calendar-foundation`
4. `feature/issue-144-date-picker-workflow`
5. `feature/issue-145-date-range-picker-workflow`
6. `feature/issue-146-date-time-picker-time-selector`
7. `feature/issue-147-date-suite-registry-storybook`

Create the PRD branch from the current integration base. Create issue #142 from
the PRD branch, then stack each later issue branch from the previous issue
branch unless the GitHub issue dependency graph says otherwise. The final
implementation PR should target the PRD branch unless explicitly requested.

## Published Breakdown

1. **Title**: Date suite contract and local planning docs (#142)
   **Type**: AFK
   **Blocked by**: #141
   **User stories covered**: 1-46

2. **Title**: Calendar and RangeCalendar foundation (#143)
   **Type**: AFK
   **Blocked by**: #142
   **User stories covered**: 10-12, 16-22, 28-33, 36-45

3. **Title**: DatePicker component workflow (#144)
   **Type**: AFK
   **Blocked by**: #143
   **User stories covered**: 1, 3-4, 7-20, 28-34, 36-42, 44, 46

4. **Title**: DateRangePicker component workflow (#145)
   **Type**: AFK
   **Blocked by**: #144
   **User stories covered**: 2, 5-7, 9-22, 28-33, 35-42, 44, 46

5. **Title**: DateTimePicker selectable time controls (#146)
   **Type**: AFK
   **Blocked by**: #143
   **User stories covered**: 7, 23-33, 36-40, 43-46

6. **Title**: Date suite registry, Storybook, a11y, SSR, and verification (#147)
   **Type**: AFK
   **Blocked by**: #144, #145, and #146
   **User stories covered**: 1-46

## Published Issue #142

## What to build

Create the local contract and planning documents for the date suite from the
published PRD. The docs should define Calendar, RangeCalendar, DatePicker,
DateRangePicker, and the DateTimePicker time selector improvement as one
cohesive date workflow suite. The completed slice should capture public API
direction, React Aria and `@internationalized/date` dependency decisions, shared
calendar foundation boundaries, value models, form serialization, accessibility
invariants, registry expectations, testing seams, and stacked branch mapping.

This slice should not implement runtime component source beyond documentation
examples needed to clarify the contract.

## Acceptance criteria

- [ ] Local date-suite specification, PRD mirror, and issue breakdown documents exist and link back to the published PRD.
- [ ] The docs identify DatePicker + DateRangePicker as the next high-impact component group after DataTable and include Calendar/RangeCalendar foundation plus DateTimePicker time selector improvement.
- [ ] The docs define the component family, value models, controlled/uncontrolled contracts, form serialization expectations, constraints, unavailable-date behavior, locale/week-start support, clear actions, disabled/read-only/invalid states, and class/data-slot hooks.
- [ ] The docs define DateTimePicker time selector behavior while preserving manual segment editing and timezone-aware values.
- [ ] The docs define accessibility expectations for labels, descriptions, errors, calendar keyboard behavior, range selection, popover focus return, and time selector operability.
- [ ] The docs clearly separate this PRD from standalone TimePicker, IntervalPicker, recurrence, scheduler/event calendar views, natural-language parsing, URL syncing, and data-fetching integrations.
- [ ] The docs list rendered behavior, interaction, accessibility, SSR, Storybook, registry, package export, playground, and smoke testing seams.

## Blocked by

- #141

## Published Issue #143

## What to build

Extract and ship the shared Calendar and RangeCalendar foundation needed by the
date suite. The completed slice should make reusable single-date and range
calendar surfaces available with tokenized Dethink styling, month navigation,
date constraints, unavailable-date styling, selected/today/range states, density,
RTL, dark mode, public prop types, package exports, and focused tests.

This slice should make the calendar foundation demoable before DatePicker and
DateRangePicker wrap it in field and popover behavior.

## Acceptance criteria

- [ ] Calendar renders an accessible single-date calendar using React Aria behavior and Dethink tokenized styling.
- [ ] RangeCalendar renders an accessible date-range calendar using React Aria behavior and Dethink tokenized styling.
- [ ] Shared calendar classes, slots, month navigation, cells, header cells, selected state, today state, disabled/unavailable state, range start/end/in-range state, focus state, density, dark mode, RTL, and theme override hooks are available for reuse.
- [ ] Calendar and RangeCalendar support controlled and uncontrolled values where React Aria supports them.
- [ ] Calendar and RangeCalendar support min/max constraints, unavailable-date callbacks, locale, and week-start behavior.
- [ ] Public components, prop types, and class-name helpers are exported from the package.
- [ ] Tests cover rendering, selection, range selection, month navigation, constraints, unavailable dates, className composition, data slots, density hooks, RTL hooks, and absence of custom ARIA grid behavior.
- [ ] Existing DateTimePicker tests continue to pass after shared foundation extraction work.

## Blocked by

- #142

## Published Issue #144

## What to build

Build the DatePicker component workflow on top of the shared calendar
foundation. The completed slice should deliver a labelled date field with
calendar popover, controlled and uncontrolled date values, constraints,
unavailable dates, clear action, form serialization, validation states, provider
theming, package exports, and focused tests.

This slice should be demoable as a production form date field before
DateRangePicker and DateTimePicker time selector work are complete.

## Acceptance criteria

- [ ] DatePicker renders a labelled date field with calendar popover and accessible trigger behavior.
- [ ] DatePicker supports controlled and uncontrolled date values using the approved date value model.
- [ ] DatePicker supports required, disabled, read-only, invalid, description, error message, clearable, min/max, unavailable dates, locale, week start, and form name props.
- [ ] DatePicker serializes form values predictably and documents the serialization format.
- [ ] Calendar selection, manual segment editing, clearing, validation state, constraints, unavailable dates, and focus return after popover close work through public behavior.
- [ ] DatePicker uses shared calendar classes and provider-themed tokens without duplicating calendar styling.
- [ ] Public components, helper class maps, and prop/data types are exported from the package.
- [ ] Render and interaction tests cover public behavior, labels, form values, controlled/uncontrolled state, clear action, constraints, unavailable dates, focus return, className composition, and stable data slots.

## Blocked by

- #143

## Published Issue #145

## What to build

Build the DateRangePicker component workflow on top of the shared range
calendar foundation. The completed slice should deliver a labelled range field
with range calendar popover, controlled and uncontrolled start/end values,
constraints, unavailable dates, clear action, form serialization, validation
states, provider theming, package exports, and focused tests.

This slice should be demoable as a production report or billing period filter.

## Acceptance criteria

- [ ] DateRangePicker renders labelled start/end date fields with range calendar popover and accessible trigger behavior.
- [ ] DateRangePicker supports controlled and uncontrolled range values using the approved range value model.
- [ ] DateRangePicker supports required, disabled, read-only, invalid, description, error message, clearable, min/max, unavailable dates, locale, week start, and form name props.
- [ ] DateRangePicker serializes start and end form values predictably and documents the serialization format.
- [ ] Range calendar selection, manual segment editing, clearing, validation state, constraints, unavailable dates, and focus return after popover close work through public behavior.
- [ ] Range start, range end, and in-range styling are visible, tokenized, and exposed through stable data hooks.
- [ ] Public components, helper class maps, and prop/data types are exported from the package.
- [ ] Render and interaction tests cover public behavior, labels, form values, controlled/uncontrolled state, clear action, range selection, invalid/incomplete ranges, constraints, unavailable dates, focus return, className composition, and stable data slots.

## Blocked by

- #144

## Published Issue #146

## What to build

Upgrade DateTimePicker with selectable time controls that complement the
existing manual segmented field. The completed slice should reuse the shared
date-suite foundation, add a keyboard-operable time selection surface for common
scheduling slots, support configurable increments, preserve the selected date,
preserve timezone-aware values, preserve controlled/uncontrolled behavior,
preserve form serialization, and add focused tests and stories.

This slice should make DateTimePicker faster for common scheduling flows without
removing manual segment editing.

## Acceptance criteria

- [ ] DateTimePicker uses the shared calendar foundation introduced by the date suite.
- [ ] DateTimePicker exposes selectable time controls for common scheduling slots while preserving manual segmented editing.
- [ ] Time selection supports configurable increments and respects the active granularity where applicable.
- [ ] Selecting a time preserves the selected date, timezone-aware value semantics, validation state, controlled/uncontrolled state, and hidden form value serialization.
- [ ] Time controls are keyboard-operable, labelled, density-aware, RTL-aware, themeable, and covered by stable data slots.
- [ ] Existing DateTimePicker public behavior remains compatible unless the PRD docs explicitly document a migration.
- [ ] Tests cover time selection, increments, controlled values, uncontrolled values, zoned values, manual segment editing, serialization after selection, invalid/disabled/read-only states, keyboard behavior, and className/data-slot behavior.
- [ ] DateTimePicker stories demonstrate selectable time controls, manual editing, timezone-aware values, constraints, presets, density, RTL, dark mode, and theme overrides.

## Blocked by

- #143

## Published Issue #147

## What to build

Finish the date suite as an installable and documented component family. Add or
update registry metadata, Storybook coverage, accessibility automation, SSR
smoke coverage, playground smoke coverage, registry smoke coverage, package
build coverage, and final verification for Calendar, RangeCalendar, DatePicker,
DateRangePicker, and the upgraded DateTimePicker.

The completed slice should make the date suite installable through the registry
and give consumers realistic examples for filters, reports, billing ranges,
scheduling, constraints, unavailable dates, clear actions, dark mode, RTL,
density modes, and theme overrides.

## Acceptance criteria

- [ ] Registry metadata exists for Calendar, DatePicker, and DateRangePicker and includes accurate files, runtime dependencies, dev dependencies, registry dependencies, and CSS variable expectations.
- [ ] DateTimePicker registry metadata is updated when shared date-suite files or time selector files become required.
- [ ] Package exports include all public date-suite components, helper class maps, and public prop/data types.
- [ ] Storybook examples cover embedded Calendar, embedded RangeCalendar, base DatePicker, constrained DatePicker, DateRangePicker report filters, billing ranges, DateTimePicker time selector, timezone-aware DateTimePicker, invalid states, disabled/read-only states, clear actions, dark mode, RTL, density, responsive behavior, and theme overrides.
- [ ] Accessibility tests cover labelled DatePicker, labelled DateRangePicker, embedded Calendar, embedded RangeCalendar, DateTimePicker with time selector, description/error wiring, keyboard interactions, popover focus return, and no axe violations.
- [ ] SSR tests cover server rendering and hydration without warnings for Calendar, RangeCalendar, DatePicker, DateRangePicker, and DateTimePicker.
- [ ] Playground or registry smoke coverage exercises the date suite through the package export path.
- [ ] Registry smoke coverage verifies copied source files, dependency metadata, stable data attributes, tokenized classes, CSS variable reliance, and package exports.
- [ ] Documentation or examples clearly direct users to future TimePicker, IntervalPicker, recurrence, and Scheduler work for out-of-scope workflows.
- [ ] Verification commands pass for the implemented slice: typecheck, tests, a11y tests, package build, Storybook build, registry validation, and registry smoke where available.

## Blocked by

- #144
- #145
- #146
