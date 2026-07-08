import {
  Button as AriaButton,
  Calendar as AriaCalendar,
  CalendarCell as AriaCalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarMonthPicker,
  CalendarStateContext,
  CalendarYearPicker,
  CalendarHeaderCell,
  I18nProvider,
  RangeCalendar as AriaRangeCalendar,
  RangeCalendarStateContext,
  type CalendarGridProps,
  type CalendarProps as AriaCalendarProps,
  type RangeCalendarProps as AriaRangeCalendarProps,
} from "react-aria-components";
import {
  forwardRef,
  useContext,
  useState,
  type ForwardedRef,
  type ReactElement,
  type RefAttributes,
} from "react";
import {
  endOfMonth,
  endOfYear,
  startOfMonth,
  startOfYear,
  toCalendarDate,
  type CalendarDate,
  type DateValue,
} from "@internationalized/date";
import { cn } from "../../utils/cn";

export type CalendarWeekStartsOn =
  "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";

export interface CalendarProps<T extends DateValue = DateValue> extends Omit<
  AriaCalendarProps<T>,
  | "children"
  | "className"
  | "firstDayOfWeek"
  | "isDisabled"
  | "isInvalid"
  | "onChange"
> {
  className?: string;
  disabled?: boolean;
  invalid?: boolean;
  locale?: string;
  onValueChange?: AriaCalendarProps<T>["onChange"];
  weekdayStyle?: CalendarGridProps["weekdayStyle"];
  weekStartsOn?: CalendarWeekStartsOn;
}

export interface RangeCalendarProps<
  T extends DateValue = DateValue,
> extends Omit<
  AriaRangeCalendarProps<T>,
  | "children"
  | "className"
  | "firstDayOfWeek"
  | "isDisabled"
  | "isInvalid"
  | "onChange"
> {
  className?: string;
  disabled?: boolean;
  invalid?: boolean;
  locale?: string;
  onValueChange?: AriaRangeCalendarProps<T>["onChange"];
  weekdayStyle?: CalendarGridProps["weekdayStyle"];
  weekStartsOn?: CalendarWeekStartsOn;
}

export interface DateCalendarGridProps {
  dataSlotPrefix?: string;
  range?: boolean;
  weekdayStyle?: CalendarGridProps["weekdayStyle"];
}

type CalendarViewMode = "day" | "month" | "year";

const calendarRootBaseClasses =
  "group/calendar grid w-fit min-w-0 gap-[var(--dt-space-3)] rounded-md border border-border bg-background p-[var(--dt-space-3)] text-foreground shadow-sm data-[disabled]:opacity-60 data-[invalid]:border-destructive";

const rangeCalendarRootBaseClasses =
  "group/range-calendar grid w-fit min-w-0 gap-[var(--dt-space-3)] rounded-md border border-border bg-background p-[var(--dt-space-3)] text-foreground shadow-sm data-[disabled]:opacity-60 data-[invalid]:border-destructive";

const calendarHeaderClasses =
  "grid grid-cols-[2rem_minmax(0,1fr)_2rem] items-center gap-[var(--dt-space-1)]";

const calendarHeadingGroupClasses =
  "flex min-w-0 items-center justify-center gap-0";

const calendarHeadingButtonClasses =
  "inline-flex h-8 items-center justify-center rounded-md px-[var(--dt-space-1)] text-center text-sm font-medium text-foreground outline-none motion-safe:transition-[background-color,color,box-shadow] motion-safe:duration-150 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring data-[active=true]:bg-muted";

const calendarButtonClasses =
  "inline-flex size-8 items-center justify-center rounded-md text-muted-foreground outline-none motion-safe:transition-[background-color,color,transform] motion-safe:duration-150 hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring active:translate-y-px disabled:pointer-events-none disabled:opacity-40";

const calendarPickerGridClasses =
  "grid h-full w-full grid-cols-3 grid-rows-4 gap-[var(--dt-space-2)]";

const calendarPanelClasses = "grid min-h-64 w-64 items-stretch";

const calendarPickerOptionClasses =
  "inline-flex h-full min-h-9 min-w-0 items-center justify-center rounded-md px-[var(--dt-space-2)] py-[var(--dt-space-1)] text-sm font-medium text-foreground outline-none motion-safe:transition-[background-color,color,box-shadow,transform] motion-safe:duration-150 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring active:translate-y-px disabled:pointer-events-none disabled:opacity-35 data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground";

const calendarGridClasses =
  "w-full border-separate border-spacing-[var(--dt-space-1)] text-sm";

const calendarHeaderCellClasses =
  "size-8 text-center text-xs font-medium text-muted-foreground";

const calendarCellBaseClasses =
  "flex size-8 items-center justify-center rounded-md text-center text-sm leading-none tabular-nums outline-none motion-safe:transition-[background-color,color,box-shadow,transform] motion-safe:duration-150 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring data-[disabled]:pointer-events-none data-[disabled]:opacity-35 data-[focused]:ring-2 data-[focused]:ring-ring data-[invalid]:text-destructive data-[outside-month]:text-muted-foreground data-[outside-month]:opacity-50 data-[pressed]:scale-95 data-[selected]:bg-primary data-[selected]:text-primary-foreground data-[today]:font-semibold data-[unavailable]:text-destructive data-[unavailable]:line-through";

const rangeCalendarCellBaseClasses =
  "flex size-8 items-center justify-center rounded-md text-center text-sm leading-none tabular-nums outline-none motion-safe:transition-[background-color,color,box-shadow,transform] motion-safe:duration-150 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring data-[disabled]:pointer-events-none data-[disabled]:opacity-35 data-[focused]:ring-2 data-[focused]:ring-ring data-[invalid]:text-destructive data-[outside-month]:text-muted-foreground data-[outside-month]:opacity-50 data-[pressed]:scale-95 data-[selected]:bg-primary/15 data-[selection-end]:bg-primary data-[selection-end]:text-primary-foreground data-[selection-start]:bg-primary data-[selection-start]:text-primary-foreground data-[today]:font-semibold data-[unavailable]:text-destructive data-[unavailable]:line-through";

type CalendarComponent = (<T extends DateValue = DateValue>(
  props: CalendarProps<T> & RefAttributes<HTMLDivElement>,
) => ReactElement | null) & { displayName?: string };

type RangeCalendarComponent = (<T extends DateValue = DateValue>(
  props: RangeCalendarProps<T> & RefAttributes<HTMLDivElement>,
) => ReactElement | null) & { displayName?: string };

export function calendarClassNames({
  className,
}: Pick<CalendarProps, "className"> = {}) {
  return cn(calendarRootBaseClasses, className);
}

export function rangeCalendarClassNames({
  className,
}: Pick<RangeCalendarProps, "className"> = {}) {
  return cn(rangeCalendarRootBaseClasses, className);
}

export function calendarCellClassNames({
  className,
}: {
  className?: string;
} = {}) {
  return cn(calendarCellBaseClasses, className);
}

export function rangeCalendarCellClassNames({
  className,
}: {
  className?: string;
} = {}) {
  return cn(rangeCalendarCellBaseClasses, className);
}

function ChevronLeftIcon() {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 16 16">
      <path
        d="m9.5 4-4 4 4 4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 16 16">
      <path
        d="m6.5 4 4 4-4 4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
    </svg>
  );
}

function useCalendarState() {
  const calendarState = useContext(CalendarStateContext);
  const rangeCalendarState = useContext(RangeCalendarStateContext);

  return calendarState ?? rangeCalendarState;
}

function isCalendarDateRangeOutsideBounds({
  endDate,
  startDate,
  state,
}: {
  endDate: CalendarDate;
  startDate: CalendarDate;
  state: ReturnType<typeof useCalendarState>;
}) {
  if (!state) {
    return true;
  }

  const minValue = state.minValue ? toCalendarDate(state.minValue) : null;
  const maxValue = state.maxValue ? toCalendarDate(state.maxValue) : null;

  return Boolean(
    (minValue && endDate.compare(minValue) < 0) ||
    (maxValue && startDate.compare(maxValue) > 0),
  );
}

function CalendarNavigationButton({
  dataSlotPrefix,
  direction,
  viewMode,
}: {
  dataSlotPrefix: string;
  direction: "next" | "previous";
  viewMode: CalendarViewMode;
}) {
  const state = useCalendarState();
  const isPrevious = direction === "previous";

  if (viewMode === "day") {
    return (
      <AriaButton
        slot={isPrevious ? "previous" : "next"}
        aria-label={isPrevious ? "Previous month" : "Next month"}
        className={calendarButtonClasses}
        data-slot={`${dataSlotPrefix}-${direction}`}
      >
        {isPrevious ? <ChevronLeftIcon /> : <ChevronRightIcon />}
      </AriaButton>
    );
  }

  const years = viewMode === "year" ? 12 : 1;
  const targetDate = state?.focusedDate.add({
    years: isPrevious ? -years : years,
  });
  const isTargetOutsideBounds = targetDate
    ? isCalendarDateRangeOutsideBounds({
        endDate:
          viewMode === "year" ? endOfYear(targetDate) : endOfMonth(targetDate),
        startDate:
          viewMode === "year"
            ? startOfYear(targetDate)
            : startOfMonth(targetDate),
        state,
      })
    : true;
  const label =
    viewMode === "year"
      ? isPrevious
        ? "Previous 12 years"
        : "Next 12 years"
      : isPrevious
        ? "Previous year"
        : "Next year";

  return (
    <button
      aria-label={label}
      className={calendarButtonClasses}
      data-slot={`${dataSlotPrefix}-${direction}`}
      disabled={!state || state.isDisabled || isTargetOutsideBounds}
      type="button"
      onClick={() => {
        if (targetDate) {
          state?.setFocusedDate(targetDate);
        }
      }}
    >
      {isPrevious ? <ChevronLeftIcon /> : <ChevronRightIcon />}
    </button>
  );
}

function CalendarPickerHeader({
  dataSlotPrefix,
  setViewMode,
  viewMode,
}: {
  dataSlotPrefix: string;
  setViewMode: (viewMode: CalendarViewMode) => void;
  viewMode: CalendarViewMode;
}) {
  return (
    <div
      data-slot={`${dataSlotPrefix}-header`}
      className={calendarHeaderClasses}
    >
      <CalendarNavigationButton
        dataSlotPrefix={dataSlotPrefix}
        direction="previous"
        viewMode={viewMode}
      />
      <div
        data-slot={`${dataSlotPrefix}-heading`}
        className={calendarHeadingGroupClasses}
      >
        <CalendarMonthPicker format="long">
          {(monthPicker) => {
            const month = monthPicker.items.find(
              (item) => item.id === monthPicker.value,
            );

            return (
              <button
                aria-label={`Choose month, current ${month?.formatted ?? "month"}`}
                className={calendarHeadingButtonClasses}
                data-active={viewMode === "month" ? "true" : undefined}
                data-slot={`${dataSlotPrefix}-month-trigger`}
                type="button"
                onClick={() =>
                  setViewMode(viewMode === "month" ? "day" : "month")
                }
              >
                {month?.formatted}
              </button>
            );
          }}
        </CalendarMonthPicker>
        <CalendarYearPicker visibleYears={12}>
          {(yearPicker) => {
            const year = yearPicker.items.find(
              (item) => item.id === yearPicker.value,
            );

            return (
              <button
                aria-label={`Choose year, current ${year?.formatted ?? "year"}`}
                className={calendarHeadingButtonClasses}
                data-active={viewMode === "year" ? "true" : undefined}
                data-slot={`${dataSlotPrefix}-year-trigger`}
                type="button"
                onClick={() =>
                  setViewMode(viewMode === "year" ? "day" : "year")
                }
              >
                {year?.formatted}
              </button>
            );
          }}
        </CalendarYearPicker>
      </div>
      <CalendarNavigationButton
        dataSlotPrefix={dataSlotPrefix}
        direction="next"
        viewMode={viewMode}
      />
    </div>
  );
}

function CalendarMonthSelection({
  dataSlotPrefix,
  onSelect,
}: {
  dataSlotPrefix: string;
  onSelect: () => void;
}) {
  const state = useCalendarState();

  return (
    <CalendarMonthPicker format="short">
      {(monthPicker) => (
        <div
          aria-label={monthPicker["aria-label"]}
          className={calendarPickerGridClasses}
          data-slot={`${dataSlotPrefix}-month-picker`}
          role="group"
        >
          {monthPicker.items.map((item) => {
            const isSelected = item.id === monthPicker.value;
            const isDisabled =
              Boolean(state?.isDisabled) ||
              isCalendarDateRangeOutsideBounds({
                endDate: endOfMonth(item.date),
                startDate: startOfMonth(item.date),
                state,
              });

            return (
              <button
                aria-label={item.formatted}
                className={calendarPickerOptionClasses}
                data-selected={isSelected ? "true" : undefined}
                data-slot={`${dataSlotPrefix}-month-option`}
                disabled={isDisabled}
                key={item.id}
                type="button"
                onClick={() => {
                  monthPicker.onChange(item.id);
                  onSelect();
                }}
              >
                {item.formatted}
              </button>
            );
          })}
        </div>
      )}
    </CalendarMonthPicker>
  );
}

function CalendarYearSelection({
  dataSlotPrefix,
  onSelect,
}: {
  dataSlotPrefix: string;
  onSelect: () => void;
}) {
  const state = useCalendarState();

  return (
    <CalendarYearPicker visibleYears={12}>
      {(yearPicker) => (
        <div
          aria-label={yearPicker["aria-label"]}
          className={calendarPickerGridClasses}
          data-slot={`${dataSlotPrefix}-year-picker`}
          role="group"
        >
          {yearPicker.items.map((item) => {
            const isSelected = item.id === yearPicker.value;
            const isDisabled =
              Boolean(state?.isDisabled) ||
              isCalendarDateRangeOutsideBounds({
                endDate: endOfYear(item.date),
                startDate: startOfYear(item.date),
                state,
              });

            return (
              <button
                aria-label={item.formatted}
                className={calendarPickerOptionClasses}
                data-selected={isSelected ? "true" : undefined}
                data-slot={`${dataSlotPrefix}-year-option`}
                disabled={isDisabled}
                key={item.id}
                type="button"
                onClick={() => {
                  yearPicker.onChange(item.id);
                  onSelect();
                }}
              >
                {item.formatted}
              </button>
            );
          })}
        </div>
      )}
    </CalendarYearPicker>
  );
}

export function DateCalendarGrid({
  dataSlotPrefix = "calendar",
  range = false,
  weekdayStyle = "short",
}: DateCalendarGridProps) {
  const isRangeCalendar = range || dataSlotPrefix === "range-calendar";
  const [viewMode, setViewMode] = useState<CalendarViewMode>("day");

  return (
    <>
      <CalendarPickerHeader
        dataSlotPrefix={dataSlotPrefix}
        setViewMode={setViewMode}
        viewMode={viewMode}
      />
      <div
        data-slot={`${dataSlotPrefix}-panel`}
        className={calendarPanelClasses}
      >
        {viewMode === "month" ? (
          <CalendarMonthSelection
            dataSlotPrefix={dataSlotPrefix}
            onSelect={() => setViewMode("day")}
          />
        ) : null}
        {viewMode === "year" ? (
          <CalendarYearSelection
            dataSlotPrefix={dataSlotPrefix}
            onSelect={() => setViewMode("month")}
          />
        ) : null}
        {viewMode === "day" ? (
          <CalendarGrid
            data-slot={`${dataSlotPrefix}-grid`}
            className={calendarGridClasses}
            weekdayStyle={weekdayStyle}
          >
            <CalendarGridHeader>
              {(day) => (
                <CalendarHeaderCell
                  data-slot={`${dataSlotPrefix}-header-cell`}
                  className={calendarHeaderCellClasses}
                >
                  {day}
                </CalendarHeaderCell>
              )}
            </CalendarGridHeader>
            <CalendarGridBody>
              {(date) => (
                <AriaCalendarCell
                  date={date}
                  data-slot={`${dataSlotPrefix}-cell`}
                  className={
                    isRangeCalendar
                      ? rangeCalendarCellBaseClasses
                      : calendarCellBaseClasses
                  }
                />
              )}
            </CalendarGridBody>
          </CalendarGrid>
        ) : null}
      </div>
    </>
  );
}

function CalendarRoot<T extends DateValue = DateValue>(
  {
    className,
    disabled = false,
    invalid = false,
    locale,
    onValueChange,
    weekdayStyle = "short",
    weekStartsOn,
    ...props
  }: CalendarProps<T>,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const calendar = (
    <AriaCalendar<T>
      {...props}
      ref={ref}
      firstDayOfWeek={weekStartsOn}
      isDisabled={disabled}
      isInvalid={invalid}
      onChange={onValueChange}
      data-slot="calendar"
      className={calendarClassNames({ className })}
    >
      <DateCalendarGrid dataSlotPrefix="calendar" weekdayStyle={weekdayStyle} />
    </AriaCalendar>
  );

  if (locale) {
    return <I18nProvider locale={locale}>{calendar}</I18nProvider>;
  }

  return calendar;
}

function RangeCalendarRoot<T extends DateValue = DateValue>(
  {
    className,
    disabled = false,
    invalid = false,
    locale,
    onValueChange,
    weekdayStyle = "short",
    weekStartsOn,
    ...props
  }: RangeCalendarProps<T>,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const calendar = (
    <AriaRangeCalendar<T>
      {...props}
      ref={ref}
      firstDayOfWeek={weekStartsOn}
      isDisabled={disabled}
      isInvalid={invalid}
      onChange={onValueChange}
      data-slot="range-calendar"
      className={rangeCalendarClassNames({ className })}
    >
      <DateCalendarGrid
        dataSlotPrefix="range-calendar"
        weekdayStyle={weekdayStyle}
      />
    </AriaRangeCalendar>
  );

  if (locale) {
    return <I18nProvider locale={locale}>{calendar}</I18nProvider>;
  }

  return calendar;
}

export const Calendar = forwardRef(CalendarRoot) as CalendarComponent;
Calendar.displayName = "Calendar";

export const RangeCalendar = forwardRef(
  RangeCalendarRoot,
) as RangeCalendarComponent;
RangeCalendar.displayName = "RangeCalendar";
