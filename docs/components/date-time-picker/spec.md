# DateTimePicker Component Spec

Status: Published to GitHub issue tracker.

Tracker issue: https://github.com/parveshh/dethink-components/issues/16

Source: `react_component_library_prd.docx` date/time suite field specification, plus approved DateTimePicker PRD plan.

Package target: `@dethink/components`.

## Purpose

DateTimePicker captures a date and time for scheduling, booking, reporting, audit, operations, and workflow forms. It is a P1 prioritization exception that establishes reusable date/time-suite foundations for later DatePicker, TimePicker, DateRangePicker, and IntervalPicker work.

## Priority

P1, deliberately moved forward.

## Dependencies

- `react-aria-components` for accessible segmented fields, calendar, validation, popover/dialog, and keyboard behavior.
- `@internationalized/date` for `CalendarDateTime`, `ZonedDateTime`, locale-aware values, time zones, and date constraints.
- Foundation tokens, Tailwind CSS v4 utilities, shared `cn`, explicit class maps, and stable `data-*` selectors.
- Existing Storybook, a11y, SSR, registry validation, playground, and registry smoke seams.

Dependencies must be scoped so unrelated components do not pull date/time libraries through registry metadata.

## Public API

```ts
import type {
  CalendarDateTime,
  DateValue,
  ZonedDateTime,
} from "@internationalized/date";

export type DateTimePickerValue = CalendarDateTime | ZonedDateTime;
export type DateTimePickerGranularity = "hour" | "minute" | "second";

export type DateTimePickerPreset = {
  label: React.ReactNode;
  value: DateTimePickerValue;
};

export type DateTimePickerProps = {
  value?: DateTimePickerValue | null;
  defaultValue?: DateTimePickerValue | null;
  onValueChange?: (value: DateTimePickerValue | null) => void;
  name?: string;
  label?: React.ReactNode;
  description?: React.ReactNode;
  errorMessage?: React.ReactNode;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  minValue?: DateValue;
  maxValue?: DateValue;
  isDateUnavailable?: (date: DateValue) => boolean;
  locale?: string;
  timeZone?: string;
  hideTimeZone?: boolean;
  granularity?: DateTimePickerGranularity;
  hourCycle?: 12 | 24;
  weekStartsOn?: "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";
  presets?: DateTimePickerPreset[];
  clearable?: boolean;
  className?: string;
};
```

Defaults:

- `granularity="minute"`
- `clearable={false}`
- `timeSelector={true}`: show editable time and quick picks beside the calendar
- `timeStep={30}`: generate quick picks every 30 minutes
- locale and hour cycle follow React Aria/browser behavior
- timezone is shown when the value is a `ZonedDateTime` or `timeZone` is provided, unless `hideTimeZone` is true

## Behavior

- Render a segmented date/time field with calendar popover.
- Support controlled and uncontrolled values.
- Emit `CalendarDateTime`, `ZonedDateTime`, or `null` through `onValueChange`.
- Preserve time when selecting a new calendar date where possible.
- Use `minValue`, `maxValue`, and `isDateUnavailable` to prevent invalid date selection.
- Render optional presets that call the same value-change path.
- Render an accessible clear action only when `clearable` is true.
- Submit a hidden form value when `name` is provided. Serialization must be documented and stable.
- Show label, description, error message, required, disabled, read-only, and invalid state wiring.
- Return focus predictably when the popover closes.

### Visible date and time selection

The calendar button opens a combined popover. The clock button opens the same
popover with focus in the time field. On small screens the time panel stacks
below the calendar. Choosing a date keeps the popover open so the user can choose
a time, then press Done. Changes are immediate; Done and Escape close the
popover without rolling back edits and return focus to the initiating control.

The time panel uses React Aria TimeField segments for keyboard editing, honoring
`granularity`, `hourCycle`, and locale. Quick picks use `timeStep` or explicit
`timeOptions`; out-of-range and unavailable options are disabled. Date-only
bounds include the whole day, while timestamp bounds include the time. Typed
out-of-range values remain editable and display an error. Time controls are
disabled until a date exists. Zoned values retain their zone when editing time.

Migration: the time panel is now visible by default. Set `timeSelector={false}`
for the previous calendar-only popover with editable time in the main field.
No new dependency or change to value serialization is required.

Manual acceptance: open with each trigger, edit hours/minutes with number and
arrow keys, tab to quick picks and Done, select a different date without losing
the time, and close with Escape. Check focus return, 12-hour AM/PM, seconds,
disabled/read-only fields, an empty date, time bounds, narrow screens, and RTL.

## Accessibility

- Do not hand-roll segmented-field or calendar-grid ARIA behavior when React Aria provides it.
- Inputs need visible labels or equivalent accessible names.
- Description and error message content must be programmatically associated.
- Invalid, required, disabled, read-only, and unavailable-date state must be exposed to assistive technology.
- Calendar grid keyboard navigation, Escape behavior, focus return, and tab order are acceptance criteria.
- Timezone visibility is required for timezone-aware values unless explicitly hidden.

## Theming

- Use Tailwind CSS v4 utilities, semantic tokens, and explicit static class maps.
- Style slots for root, label, field group, date segments, trigger, popover, calendar, day cells, presets, clear action, description, error message, and timezone text.
- Support light, dark, density, RTL, invalid, disabled, read-only, focus-visible, selected day, unavailable day, and reduced-motion states.
- Expose stable slots/data attributes for tests and theme overrides.

## Registry Requirements

- Add `date-time-picker` registry metadata.
- Include only required DateTimePicker files and shared utilities.
- Declare `react-aria-components` and `@internationalized/date` as runtime dependencies.
- Depend on `dethink-base`.
- Update registry validation and smoke coverage.

## Documentation Requirements

- Explain DateTimePicker versus future DatePicker, TimePicker, DateRangePicker, and IntervalPicker.
- Explain `CalendarDateTime` versus `ZonedDateTime`.
- Cover controlled/uncontrolled values, form submission, validation, constraints, presets, timezone, locale, hour cycle, theming, accessibility, SSR, and known limitations.

## Out Of Scope

- Native `datetime-local` as the primary implementation.
- JavaScript `Date` or ISO string as the main controlled API.
- Date ranges, time ranges, recurrence/interval editing, month/year-only picker, clock list, multi-month range preview, and scheduler behavior.

## Verification

- `pnpm typecheck`
- `pnpm test`
- `pnpm test:a11y`
- `pnpm build`
- `pnpm storybook:build`
- `pnpm registry:validate`
- `pnpm registry:smoke`
