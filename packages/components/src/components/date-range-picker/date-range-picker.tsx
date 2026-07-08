import {
  Button as AriaButton,
  DateInput,
  DateRangePicker as AriaDateRangePicker,
  DateSegment,
  Dialog,
  FieldError,
  Group,
  I18nProvider,
  Label,
  Popover,
  RangeCalendar as AriaRangeCalendar,
  Text,
  type DateRangePickerRenderProps,
} from "react-aria-components";
import { forwardRef, type ReactNode, useRef } from "react";
import type { CalendarDate, DateValue } from "@internationalized/date";
import { DateCalendarGrid, type CalendarWeekStartsOn } from "../calendar";
import {
  DethinkPortalProvider,
  useProviderPortalRoot,
} from "../../utils/provider-portal";
import { cn } from "../../utils/cn";
import {
  getDateRangePickerFieldNames,
  serializeDateRangePickerValue,
  type DateRangePickerValue,
} from "./date-range-picker-utils";

export type { DateRangePickerValue } from "./date-range-picker-utils";

export interface DateRangePickerProps {
  value?: DateRangePickerValue | null;
  defaultValue?: DateRangePickerValue | null;
  onValueChange?: (value: DateRangePickerValue | null) => void;
  className?: string;
  id?: string;
  name?: string;
  startName?: string;
  endName?: string;
  label?: ReactNode;
  description?: ReactNode;
  errorMessage?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  minValue?: DateValue;
  maxValue?: DateValue;
  isDateUnavailable?: (date: DateValue) => boolean;
  locale?: string;
  weekStartsOn?: CalendarWeekStartsOn;
  clearable?: boolean;
}

const dateRangePickerRootClasses =
  "group/date-range-picker grid w-full max-w-2xl gap-[var(--dt-space-2)] text-foreground";

const dateRangePickerLabelClasses =
  "text-sm font-medium leading-none text-foreground data-[disabled=true]:opacity-60";

const dateRangePickerControlClasses =
  "flex min-h-density-control min-w-0 flex-wrap items-center rounded-md border border-input bg-background text-sm text-foreground shadow-sm motion-safe:transition-[border-color,box-shadow,background-color] motion-safe:duration-150 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-60 data-[focus-within=true]:border-ring data-[focus-within=true]:ring-2 data-[focus-within=true]:ring-ring/20 data-[invalid=true]:border-destructive data-[invalid=true]:ring-destructive/15";

const dateRangePickerInputClasses =
  "flex min-w-[9rem] flex-1 items-center gap-[var(--dt-space-0-5)] px-[var(--dt-space-3)] py-[var(--dt-space-2)]";

const dateRangePickerSeparatorClasses =
  "px-[var(--dt-space-1)] text-muted-foreground";

const dateRangePickerSegmentClasses =
  "rounded-sm px-[var(--dt-space-0-5)] tabular-nums outline-none motion-safe:transition-colors motion-safe:duration-150 data-[focused]:bg-primary data-[focused]:text-primary-foreground data-[placeholder]:text-muted-foreground data-[disabled]:text-muted-foreground data-[readonly]:text-muted-foreground data-[invalid]:text-destructive";

const dateRangePickerClearButtonClasses =
  "me-[var(--dt-space-1)] inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground motion-safe:transition-[background-color,color,transform] motion-safe:duration-150 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:translate-y-px disabled:pointer-events-none disabled:opacity-40";

const dateRangePickerTriggerButtonClasses =
  "me-[var(--dt-space-1)] inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground motion-safe:transition-[background-color,color,transform] motion-safe:duration-150 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:translate-y-px disabled:pointer-events-none disabled:opacity-40 data-[pressed]:bg-muted data-[pressed]:text-foreground";

const dateRangePickerPopoverClasses =
  "z-50 rounded-md border border-border bg-background p-[var(--dt-space-3)] text-foreground shadow-lg outline-none motion-safe:transition-[opacity,transform] motion-safe:duration-150 data-[entering]:opacity-100 data-[exiting]:translate-y-1 data-[exiting]:opacity-0";

const dateRangePickerDialogClasses =
  "grid gap-[var(--dt-space-3)] outline-none";

const dateRangePickerCalendarClasses = "grid gap-[var(--dt-space-3)]";

const dateRangePickerHelpClasses = "text-xs leading-5 text-muted-foreground";

const dateRangePickerErrorClasses = "text-xs leading-5 text-destructive";

function getRootRenderClasses(
  renderProps: DateRangePickerRenderProps,
  className: string | undefined,
) {
  return cn(dateRangePickerRootClasses, className);
}

export function dateRangePickerClassNames({
  className,
}: Pick<DateRangePickerProps, "className"> = {}) {
  return cn(dateRangePickerRootClasses, className);
}

function ClearIcon() {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 16 16">
      <path
        d="m4.5 4.5 7 7m0-7-7 7"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.75"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 16 16">
      <path
        d="M4.5 2.5v2m7-2v2M3 6.5h10M3.5 4h9A1.5 1.5 0 0 1 14 5.5v7A1.5 1.5 0 0 1 12.5 14h-9A1.5 1.5 0 0 1 2 12.5v-7A1.5 1.5 0 0 1 3.5 4Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export const DateRangePicker = forwardRef<HTMLDivElement, DateRangePickerProps>(
  (
    {
      className,
      clearable = false,
      defaultValue,
      description,
      disabled = false,
      endName,
      errorMessage,
      id,
      invalid = false,
      isDateUnavailable,
      label,
      locale,
      maxValue,
      minValue,
      name,
      onValueChange,
      readOnly = false,
      required = false,
      startName,
      value,
      weekStartsOn,
    },
    ref,
  ) => {
    const triggerRef = useRef<HTMLButtonElement>(null);
    const { portalContainer, rootRef } = useProviderPortalRoot<HTMLDivElement>({
      forwardedRef: ref,
      portalSlot: "date-range-picker-portal-container",
    });
    const formNames = getDateRangePickerFieldNames({
      endName,
      name,
      startName,
    });
    const picker = (
      <DethinkPortalProvider container={portalContainer}>
        <AriaDateRangePicker<CalendarDate>
          ref={rootRef}
          id={id}
          value={value}
          defaultValue={defaultValue}
          onChange={onValueChange}
          isDisabled={disabled}
          isReadOnly={readOnly}
          isRequired={required}
          isInvalid={invalid}
          minValue={minValue}
          maxValue={maxValue}
          isDateUnavailable={isDateUnavailable}
          firstDayOfWeek={weekStartsOn}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              queueMicrotask(() => triggerRef.current?.focus());
            }
          }}
          validationBehavior="aria"
          data-slot="date-range-picker"
          className={(renderProps) =>
            getRootRenderClasses(renderProps, className)
          }
        >
          {({ state, isDisabled, isFocusWithin, isInvalid, isReadOnly }) => {
            const canClear = clearable && Boolean(state.value);

            return (
              <>
                {label ? (
                  <Label
                    data-slot="date-range-picker-label"
                    data-disabled={isDisabled ? "true" : undefined}
                    className={dateRangePickerLabelClasses}
                  >
                    {label}
                    {required ? <span aria-hidden="true"> *</span> : null}
                  </Label>
                ) : null}
                <Group
                  data-slot="date-range-picker-field"
                  data-disabled={isDisabled ? "true" : undefined}
                  data-focus-within={isFocusWithin ? "true" : undefined}
                  data-invalid={isInvalid ? "true" : undefined}
                  className={dateRangePickerControlClasses}
                >
                  <DateInput
                    slot="start"
                    data-slot="date-range-picker-start-input"
                    className={dateRangePickerInputClasses}
                  >
                    {(segment) => (
                      <DateSegment
                        data-slot="date-range-picker-start-segment"
                        segment={segment}
                        className={dateRangePickerSegmentClasses}
                      />
                    )}
                  </DateInput>
                  <span
                    aria-hidden="true"
                    data-slot="date-range-picker-separator"
                    className={dateRangePickerSeparatorClasses}
                  >
                    -
                  </span>
                  <DateInput
                    slot="end"
                    data-slot="date-range-picker-end-input"
                    className={dateRangePickerInputClasses}
                  >
                    {(segment) => (
                      <DateSegment
                        data-slot="date-range-picker-end-segment"
                        segment={segment}
                        className={dateRangePickerSegmentClasses}
                      />
                    )}
                  </DateInput>
                  {clearable ? (
                    <button
                      aria-label="Clear date range"
                      className={dateRangePickerClearButtonClasses}
                      data-slot="date-range-picker-clear"
                      disabled={!canClear || isDisabled || isReadOnly}
                      type="button"
                      onClick={() => state.setValue(null)}
                    >
                      <ClearIcon />
                    </button>
                  ) : null}
                  <AriaButton
                    ref={triggerRef}
                    aria-label="Open calendar"
                    className={dateRangePickerTriggerButtonClasses}
                    data-slot="date-range-picker-trigger"
                  >
                    <CalendarIcon />
                  </AriaButton>
                </Group>
                {description ? (
                  <Text
                    slot="description"
                    data-slot="date-range-picker-description"
                    className={dateRangePickerHelpClasses}
                  >
                    {description}
                  </Text>
                ) : null}
                {errorMessage ? (
                  <FieldError
                    data-slot="date-range-picker-error"
                    className={dateRangePickerErrorClasses}
                  >
                    {errorMessage}
                  </FieldError>
                ) : null}
                {formNames.startName ? (
                  <input
                    data-slot="date-range-picker-start-form-value"
                    name={formNames.startName}
                    readOnly
                    type="hidden"
                    value={serializeDateRangePickerValue(state.value?.start)}
                  />
                ) : null}
                {formNames.endName ? (
                  <input
                    data-slot="date-range-picker-end-form-value"
                    name={formNames.endName}
                    readOnly
                    type="hidden"
                    value={serializeDateRangePickerValue(state.value?.end)}
                  />
                ) : null}
                <Popover
                  data-slot="date-range-picker-popover"
                  className={dateRangePickerPopoverClasses}
                >
                  <Dialog
                    data-slot="date-range-picker-dialog"
                    className={dateRangePickerDialogClasses}
                  >
                    <AriaRangeCalendar
                      data-slot="date-range-picker-calendar"
                      className={dateRangePickerCalendarClasses}
                    >
                      <DateCalendarGrid
                        dataSlotPrefix="date-range-picker-calendar"
                        range
                      />
                    </AriaRangeCalendar>
                  </Dialog>
                </Popover>
              </>
            );
          }}
        </AriaDateRangePicker>
      </DethinkPortalProvider>
    );

    if (locale) {
      return <I18nProvider locale={locale}>{picker}</I18nProvider>;
    }

    return picker;
  },
);

DateRangePicker.displayName = "DateRangePicker";
