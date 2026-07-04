# Date Suite Component Spec

Status: Published to GitHub issue tracker.

Tracker issue: https://github.com/parveshh/dethink-components/issues/141

Package target: `@dethink/components`.

## Purpose

The date suite provides reusable date selection workflows for SaaS dashboards,
internal tools, reporting filters, scheduling forms, billing ranges, and audit
workflows. The next high-impact component group after DataTable is
DatePicker + DateRangePicker. The existing DateTimePicker already provides an
accessible segmented date/time field and calendar popover, but its calendar
implementation is embedded in that component and time selection is manual
through date/time segments.

This suite should extract shared date and calendar foundations, ship public
DatePicker and DateRangePicker components, and improve DateTimePicker with a
selectable time control while preserving manual segment editing.

## Component Family

- `Calendar`: tokenized single-date calendar surface for embedded and popover
  usage.
- `RangeCalendar`: tokenized range calendar surface for range picking usage.
- `DatePicker`: labelled date input with calendar popover and form wiring.
- `DateRangePicker`: labelled start/end date input with range calendar popover
  and form wiring.
- `DateTimePicker`: existing component upgraded to use the shared calendar
  foundation and optional selectable time controls.

## Dependencies

- `react-aria-components` for date field, date picker, date range picker,
  calendar, range calendar, popover/dialog, validation, and keyboard behavior.
- `@internationalized/date` for `CalendarDate`, `DateValue`, zoned values,
  locale-aware conversion, constraints, and serialization.
- Existing Dethink provider tokens, density modes, RTL support, Tailwind CSS v4
  utilities, shared class-name merging, Storybook, a11y, SSR, registry
  validation, and smoke test seams.

## Public API Direction

- DatePicker values should use `CalendarDate` or the React Aria compatible
  `DateValue` shape where the underlying React Aria component requires it.
- DateRangePicker values should use a start/end range of date values and expose
  controlled and uncontrolled state.
- DateTimePicker values should continue to support the existing
  `CalendarDateTime | ZonedDateTime` model.
- All picker components should expose label, description, error message,
  required, disabled, read-only, invalid, min/max date constraints,
  unavailable-date callbacks, locale, week start, clearability, form name, and
  className hooks where applicable.
- DateTimePicker should add a selectable time control for common scheduling
  flows. Manual date/time segment editing remains supported.
- Time selection should support useful increments such as 5, 10, 15, 30, and 60
  minutes, with a default suitable for business scheduling. It should preserve
  the selected date and timezone semantics.
- Presets remain a DateTimePicker feature and may be considered for DatePicker
  only if the PRD issues justify them.

## Behavior

- Calendar and RangeCalendar should support keyboard navigation, month
  navigation, selected state, today state, disabled/unavailable dates, min/max
  constraints, locale, week start, density, RTL, light/dark, and theme override
  behavior.
- DatePicker should support manual segmented date entry, popover calendar
  selection, controlled/uncontrolled values, clearable values, hidden form
  values, validation state, and focus return after popover close.
- DateRangePicker should support manual start/end entry, range calendar
  selection, controlled/uncontrolled values, clearable values, hidden form
  values for start/end, validation state, and focus return after popover close.
- DateTimePicker should keep manual segmented editing and add a selectable time
  list or equivalent popover control that updates the time portion without
  corrupting the date, timezone, granularity, or validation state.

## Accessibility

- Do not hand-roll date grid ARIA behavior when React Aria Components provides
  the component behavior.
- Every picker needs a visible label or equivalent accessible name.
- Description and error content must be programmatically associated with the
  owning control.
- Calendar grid keyboard behavior, month navigation, Escape close behavior,
  focus return, tab order, unavailable-date announcement, and invalid state are
  acceptance criteria.
- Range selection should make the start, end, and in-range state clear through
  React Aria semantics and visible styling.
- Time selector controls must be keyboard operable and not make manual segment
  editing inaccessible.

## Theming

- Use semantic tokens, provider density, dark mode, RTL-safe spacing, static
  Tailwind utility maps, and stable `data-slot` attributes.
- Shared calendar styling should be reused by Calendar, RangeCalendar,
  DatePicker, DateRangePicker, and DateTimePicker.
- Theme override stories should demonstrate calendar cell colors, selected
  range styling, focus rings, disabled/unavailable states, and time selector
  styling.

## Registry Requirements

- Add registry metadata for Calendar, DatePicker, and DateRangePicker.
- Update DateTimePicker registry metadata when shared date-suite files or time
  selector files become dependencies.
- Registry metadata must include required date dependencies and Dethink registry
  dependencies.
- Registry-installed components must not depend on hidden global styles beyond
  the documented base setup.

## Documentation Requirements

- Explain DatePicker versus DateTimePicker.
- Explain DateRangePicker versus two independent DatePicker controls.
- Explain Calendar and RangeCalendar as embedded primitives versus picker
  popover controls.
- Explain `CalendarDate`, `CalendarDateTime`, `ZonedDateTime`, and serialization
  expectations at a practical consumer level.
- Cover constraints, unavailable dates, form submission, controlled state,
  uncontrolled state, clear actions, locale, week start, timezone behavior,
  accessibility, SSR, registry install, theming, density, dark mode, RTL, and
  known limitations.

## Out Of Scope

- Standalone TimePicker as a public component.
- IntervalPicker, recurrence rules, scheduler/event calendar behavior, multi-month
  enterprise range planners, timezone conversion UI, natural-language date
  parsing, data fetching, URL syncing, and analytics/report builder presets.
- Replacing the existing DateTimePicker value model with JavaScript `Date` or
  ISO strings.
- CSS-in-JS, arbitrary style props, runtime-generated Tailwind class strings,
  and app-specific date formatting policies.

## Verification

- `pnpm typecheck`
- `pnpm test`
- `pnpm test:a11y`
- `pnpm build`
- `pnpm storybook:build`
- `pnpm registry:validate`
- `pnpm registry:smoke`
