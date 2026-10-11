import { parseDate, type CalendarDate } from "@internationalized/date";
import { ListBox, ListBoxItem } from "react-aria-components";
import { useRef, useState } from "react";
import {
  Calendar,
  RangeCalendar,
  type CalendarWeekStartsOn,
} from "../calendar";
import { NumberInput } from "../number-input";
import {
  formatFilterDate,
  formatFilterDuration,
  isFilterDate,
  isFilterDuration,
} from "./filter-dates";
import {
  CheckIcon,
  filterEditorStackClasses,
  filterListBoxClasses,
  filterListIndicatorClasses,
  filterListItemClassNames,
  useDeferredFocus,
} from "./filter-editors";
import type {
  FilterDate,
  FilterDateUnit,
  FilterDuration,
  FilterValue,
  FilterWeekday,
} from "./filter-types";

export interface FilterTypedEditorLabels {
  numberValue: (fieldLabel: string) => string;
  rangeFrom: string;
  rangeTo: string;
  presets: string;
  pickDate: string;
  pickRange: string;
  amount: string;
  unit: string;
  units: Record<FilterDateUnit, string>;
}

export const defaultFilterTypedEditorLabels: FilterTypedEditorLabels = {
  numberValue: (fieldLabel) => `${fieldLabel} value`,
  rangeFrom: "From",
  rangeTo: "To",
  presets: "Presets",
  pickDate: "Pick a date",
  pickRange: "Pick a date range",
  amount: "Amount",
  unit: "Unit",
  units: { day: "days", week: "weeks", month: "months", year: "years" },
};

export interface TypedEditorProps {
  fieldLabel: string;
  value: FilterValue | undefined;
  onValueChange: (value: FilterValue | undefined) => void;
  onCommit: () => void;
  labels: FilterTypedEditorLabels;
  locale: string;
  weekStartsOn: FilterWeekday;
}

const weekdays: CalendarWeekStartsOn[] = [
  "sun",
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
];

const rowClasses = "flex min-w-0 items-center gap-[var(--dt-space-2)]";

const selectClasses =
  "h-8 rounded-md border border-input bg-background px-[var(--dt-space-2)] text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring";

function capitalize(text: string) {
  return text.charAt(0).toLocaleUpperCase() + text.slice(1);
}

function parseNumber(text: string) {
  if (text.trim() === "") {
    return undefined;
  }

  const value = Number(text);

  return Number.isFinite(value) ? value : undefined;
}

function sameValue(a: unknown, b: unknown) {
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Local input state that follows the controlled value. The draft keeps
 * incomplete typing ("1.", "-", one end of a range) while it still stands for
 * the current value, and resets when the value changes to something else,
 * such as undo, a preset or a parent update.
 */
function useValueDraft<TDraft>(
  value: FilterValue | undefined,
  toDraft: (value: FilterValue | undefined) => TDraft,
  fromDraft: (draft: TDraft) => FilterValue | undefined,
) {
  const [state, setState] = useState(() => ({ value, draft: toDraft(value) }));
  let { draft } = state;

  if (!Object.is(state.value, value)) {
    if (!sameValue(fromDraft(draft), value)) {
      draft = toDraft(value);
    }

    setState({ value, draft });
  }

  const setDraft = (next: TDraft) => {
    setState((current) => ({ ...current, draft: next }));
  };

  return [draft, setDraft] as const;
}

function numberText(value: unknown) {
  return typeof value === "number" ? String(value) : "";
}

function toRangeDrafts(value: FilterValue | undefined): [string, string] {
  const range = Array.isArray(value) ? value : [];

  return [numberText(range[0]), numberText(range[1])];
}

function fromRangeDrafts([fromText, toText]: [string, string]):
  [number, number] | undefined {
  const from = parseNumber(fromText);
  const to = parseNumber(toText);

  // A range needs both ends; until then the chip stays incomplete.
  return from !== undefined && to !== undefined ? [from, to] : undefined;
}

interface DurationDraft {
  amount: string;
  unit: FilterDateUnit;
}

function toDurationDraft(value: FilterValue | undefined): DurationDraft {
  const duration = isFilterDuration(value) ? value : undefined;

  return {
    amount: duration ? String(duration.amount) : "",
    unit: duration?.unit ?? "day",
  };
}

function fromDurationDraft({ amount, unit }: DurationDraft) {
  const parsed = parseNumber(amount);

  return parsed !== undefined && Number.isInteger(parsed) && parsed >= 1
    ? { amount: parsed, unit }
    : undefined;
}

function commitOnEnter(onCommit: () => void) {
  return (event: { key: string; preventDefault: () => void }) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onCommit();
    }
  };
}

interface Choice {
  id: string;
  label: string;
  value: FilterValue;
}

/** Single-choice list that commits on pick. */
function ChoiceList({
  choices,
  columns = false,
  label,
  onPick,
  value,
}: {
  choices: Choice[];
  /** Two columns, to keep editors with a calendar short. */
  columns?: boolean;
  label: string;
  onPick: (value: FilterValue) => void;
  value: FilterValue | undefined;
}) {
  return (
    <ListBox
      aria-label={label}
      // eslint-disable-next-line jsx-a11y/no-autofocus -- Opened on demand.
      autoFocus="first"
      items={choices}
      className={
        columns
          ? `${filterListBoxClasses} grid grid-cols-2 gap-x-[var(--dt-space-1)]`
          : filterListBoxClasses
      }
      onAction={(key) => {
        const choice = choices.find((item) => item.id === key);

        if (choice) {
          onPick(choice.value);
        }
      }}
    >
      {(choice) => (
        <ListBoxItem
          id={choice.id}
          textValue={choice.label}
          className={filterListItemClassNames()}
        >
          <span aria-hidden="true" className={filterListIndicatorClasses}>
            {sameValue(choice.value, value) ? <CheckIcon /> : null}
          </span>
          <span className="min-w-0 truncate">{choice.label}</span>
        </ListBoxItem>
      )}
    </ListBox>
  );
}

export function FilterNumberEditor({
  fieldLabel,
  labels,
  onCommit,
  onValueChange,
  value,
}: TypedEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useValueDraft(value, numberText, parseNumber);

  useDeferredFocus(inputRef);

  return (
    <div data-slot="filter-value-editor" className={filterEditorStackClasses}>
      <NumberInput
        ref={inputRef}
        aria-label={labels.numberValue(fieldLabel)}
        controlSize="sm"
        value={draft}
        onChange={(event) => {
          const text = event.currentTarget.value;

          setDraft(text);
          onValueChange(parseNumber(text));
        }}
        onKeyDown={commitOnEnter(onCommit)}
      />
    </div>
  );
}

export function FilterNumberRangeEditor({
  fieldLabel,
  labels,
  onCommit,
  onValueChange,
  value,
}: TypedEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drafts, setDrafts] = useValueDraft(
    value,
    toRangeDrafts,
    fromRangeDrafts,
  );

  useDeferredFocus(inputRef);

  const update = (index: 0 | 1, text: string) => {
    const next: [string, string] = [...drafts];

    next[index] = text;
    setDrafts(next);
    onValueChange(fromRangeDrafts(next));
  };

  return (
    <div data-slot="filter-value-editor" className={rowClasses}>
      {([0, 1] as const).map((index) => (
        <NumberInput
          key={index}
          ref={index === 0 ? inputRef : undefined}
          aria-label={`${labels.numberValue(fieldLabel)}, ${index === 0 ? labels.rangeFrom : labels.rangeTo}`}
          placeholder={index === 0 ? labels.rangeFrom : labels.rangeTo}
          controlSize="sm"
          value={drafts[index]}
          onChange={(event) => {
            update(index, event.currentTarget.value);
          }}
          onKeyDown={commitOnEnter(onCommit)}
        />
      ))}
    </div>
  );
}

function toCalendarDate(date: FilterDate | undefined): CalendarDate | null {
  return date?.kind === "absolute" ? parseDate(date.date) : null;
}

const dayPresets = [0, -1, 1, -7, -30];

export function FilterDateEditor({
  labels,
  locale,
  onCommit,
  onValueChange,
  value,
  weekStartsOn,
}: TypedEditorProps) {
  const date = isFilterDate(value) ? value : undefined;
  const choices: Choice[] = dayPresets.map((amount) => {
    const preset: FilterDate = { kind: "relative", amount, unit: "day" };

    return {
      id: String(amount),
      label: capitalize(formatFilterDate(preset, locale)),
      value: preset,
    };
  });

  return (
    <div data-slot="filter-value-editor" className={filterEditorStackClasses}>
      <ChoiceList
        columns
        choices={choices}
        label={labels.presets}
        value={date}
        onPick={(preset) => {
          onValueChange(preset);
          onCommit();
        }}
      />
      <Calendar
        aria-label={labels.pickDate}
        locale={locale}
        weekStartsOn={weekdays[weekStartsOn]}
        value={toCalendarDate(date)}
        onValueChange={(next) => {
          if (next) {
            onValueChange({ kind: "absolute", date: next.toString() });
            onCommit();
          }
        }}
      />
    </div>
  );
}

export function FilterDateRangeEditor({
  labels,
  locale,
  onCommit,
  onValueChange,
  value,
  weekStartsOn,
}: TypedEditorProps) {
  const [from, to] = Array.isArray(value) ? value : [];
  const start = isFilterDate(from) ? toCalendarDate(from) : null;
  const end = isFilterDate(to) ? toCalendarDate(to) : null;

  return (
    <div data-slot="filter-value-editor" className={filterEditorStackClasses}>
      <RangeCalendar
        aria-label={labels.pickRange}
        locale={locale}
        weekStartsOn={weekdays[weekStartsOn]}
        value={start && end ? { start, end } : null}
        onValueChange={(range) => {
          if (range) {
            onValueChange([
              { kind: "absolute", date: range.start.toString() },
              { kind: "absolute", date: range.end.toString() },
            ]);
            onCommit();
          }
        }}
      />
    </div>
  );
}

const durationPresets: FilterDuration[] = [
  { amount: 7, unit: "day" },
  { amount: 14, unit: "day" },
  { amount: 30, unit: "day" },
  { amount: 3, unit: "month" },
  { amount: 1, unit: "year" },
];

const units: FilterDateUnit[] = ["day", "week", "month", "year"];

export function FilterDurationEditor({
  labels,
  locale,
  onCommit,
  onValueChange,
  value,
}: TypedEditorProps) {
  const duration = isFilterDuration(value) ? value : undefined;
  const [{ amount, unit }, setDraft] = useValueDraft(
    value,
    toDurationDraft,
    fromDurationDraft,
  );

  const emit = (nextAmount: string, nextUnit: FilterDateUnit) => {
    const next = { amount: nextAmount, unit: nextUnit };

    setDraft(next);
    onValueChange(fromDurationDraft(next));
  };

  return (
    <div data-slot="filter-value-editor" className={filterEditorStackClasses}>
      <ChoiceList
        choices={durationPresets.map((preset) => ({
          id: `${preset.amount}-${preset.unit}`,
          label: capitalize(formatFilterDuration(preset, locale)),
          value: preset,
        }))}
        label={labels.presets}
        value={duration}
        onPick={(preset) => {
          onValueChange(preset);
          onCommit();
        }}
      />
      <div className={rowClasses}>
        <NumberInput
          aria-label={labels.amount}
          controlSize="sm"
          numberMode="numeric"
          className="w-20"
          value={amount}
          onChange={(event) => {
            emit(event.currentTarget.value, unit);
          }}
          onKeyDown={commitOnEnter(onCommit)}
        />
        <select
          aria-label={labels.unit}
          value={unit}
          className={selectClasses}
          onChange={(event) => {
            emit(amount, event.currentTarget.value as FilterDateUnit);
          }}
        >
          {units.map((item) => (
            <option key={item} value={item}>
              {labels.units[item]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

const periods: FilterDate[] = (["week", "month", "year"] as const).flatMap(
  (unit) =>
    [0, -1, 1].map((amount): FilterDate => ({
      kind: "relative",
      amount,
      unit,
    })),
);

export function FilterPeriodEditor({
  labels,
  locale,
  onCommit,
  onValueChange,
  value,
}: TypedEditorProps) {
  const format = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  return (
    <div data-slot="filter-value-editor" className={filterEditorStackClasses}>
      <ChoiceList
        choices={periods.map((period) => ({
          id:
            period.kind === "relative" ? `${period.amount}-${period.unit}` : "",
          label:
            period.kind === "relative"
              ? capitalize(format.format(period.amount, period.unit))
              : "",
          value: period,
        }))}
        label={labels.presets}
        value={value}
        onPick={(period) => {
          onValueChange(period);
          onCommit();
        }}
      />
    </div>
  );
}
