import {
  Button as AriaButton,
  Calendar as AriaCalendar,
  DateInput,
  DatePicker as AriaDatePicker,
  DateSegment,
  Dialog,
  FieldError,
  Group,
  I18nProvider,
  Label,
  Popover,
  Text,
  type DatePickerRenderProps,
} from "react-aria-components";
import {
  forwardRef,
  type ReactNode,
  useId,
  useRef,
  useState,
} from "react";
import type { DateValue } from "@internationalized/date";
import { DateCalendarGrid } from "../calendar";
import {
  DethinkPortalProvider,
  useProviderPortalRoot,
} from "../../utils/provider-portal";
import { cn } from "../../utils/cn";
import {
  getDateTimePickerPlaceholderValue,
  getDateTimePickerTimeInputStep,
  getDateTimePickerTimeInputValue,
  getDateTimePickerTimeInputValueChange,
  getDateTimePickerTimeOptionValue,
  getDateTimePickerTimeOptions,
  getDateTimePickerTimeZone,
  isDateTimePickerTimeOptionSelected,
  serializeDateTimePickerValue,
  type DateTimePickerGranularity,
  type DateTimePickerTimeOption,
  type DateTimePickerTimeStep,
  type DateTimePickerValue,
  type DateTimePickerWeekStartsOn,
} from "./date-time-picker-utils";

export type {
  DateTimePickerGranularity,
  DateTimePickerTimeOption,
  DateTimePickerTimeStep,
  DateTimePickerValue,
  DateTimePickerWeekStartsOn,
} from "./date-time-picker-utils";

export type DateTimePickerPreset = {
  label: ReactNode;
  value: DateTimePickerValue;
};

export interface DateTimePickerProps {
  value?: DateTimePickerValue | null;
  defaultValue?: DateTimePickerValue | null;
  onValueChange?: (value: DateTimePickerValue | null) => void;
  className?: string;
  id?: string;
  name?: string;
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
  timeZone?: string;
  hideTimeZone?: boolean;
  granularity?: DateTimePickerGranularity;
  hourCycle?: 12 | 24;
  weekStartsOn?: DateTimePickerWeekStartsOn;
  presets?: DateTimePickerPreset[];
  clearable?: boolean;
  timeOptions?: DateTimePickerTimeOption[];
  timeSelector?: boolean;
  timeStep?: DateTimePickerTimeStep;
}

const dateTimePickerRootClasses =
  "group/date-time-picker grid w-full max-w-md gap-[var(--dt-space-2)] text-foreground";

const dateTimePickerLabelClasses =
  "text-sm font-medium leading-none text-foreground data-[disabled=true]:opacity-60";

const dateTimePickerControlClasses =
  "flex min-h-density-control items-center rounded-md border border-input bg-background text-sm text-foreground shadow-sm motion-safe:transition-[border-color,box-shadow,background-color] motion-safe:duration-150 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-60 data-[focus-within=true]:border-ring data-[focus-within=true]:ring-2 data-[focus-within=true]:ring-ring/20 data-[invalid=true]:border-destructive data-[invalid=true]:ring-destructive/15";

const dateTimePickerInputClasses =
  "flex min-w-0 flex-1 items-center gap-[var(--dt-space-0-5)] px-[var(--dt-space-3)] py-[var(--dt-space-2)]";

const dateTimePickerSegmentClasses =
  "rounded-sm px-[var(--dt-space-0-5)] tabular-nums outline-none motion-safe:transition-colors motion-safe:duration-150 data-[focused]:bg-primary data-[focused]:text-primary-foreground data-[placeholder]:text-muted-foreground data-[disabled]:text-muted-foreground data-[readonly]:text-muted-foreground data-[invalid]:text-destructive";

const dateTimePickerClearButtonClasses =
  "me-[var(--dt-space-1)] inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground motion-safe:transition-[background-color,color,transform] motion-safe:duration-150 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:translate-y-px disabled:pointer-events-none disabled:opacity-40";

const dateTimePickerTriggerButtonClasses =
  "me-[var(--dt-space-1)] inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground motion-safe:transition-[background-color,color,transform] motion-safe:duration-150 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:translate-y-px disabled:pointer-events-none disabled:opacity-40 data-[pressed]:bg-muted data-[pressed]:text-foreground";

const dateTimePickerPopoverClasses =
  "z-50 rounded-md border border-border bg-background p-[var(--dt-space-3)] text-foreground shadow-lg outline-none motion-safe:transition-[opacity,transform] motion-safe:duration-150 data-[panel=time]:w-[var(--trigger-width)] data-[entering]:opacity-100 data-[exiting]:translate-y-1 data-[exiting]:opacity-0";

const dateTimePickerDialogClasses = "grid gap-[var(--dt-space-3)] outline-none";

const dateTimePickerCalendarClasses = "grid gap-[var(--dt-space-3)]";

const dateTimePickerPresetsClasses =
  "grid gap-[var(--dt-space-1)] border-b border-border pb-[var(--dt-space-3)] sm:grid-cols-2";

const dateTimePickerPresetButtonClasses =
  "rounded-md border border-border bg-background px-[var(--dt-space-3)] py-[var(--dt-space-2)] text-left text-sm text-foreground shadow-sm motion-safe:transition-[background-color,border-color,box-shadow,transform] motion-safe:duration-150 hover:border-ring/50 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:translate-y-px disabled:pointer-events-none disabled:opacity-50";

const dateTimePickerHelpClasses = "text-xs leading-5 text-muted-foreground";

const dateTimePickerErrorClasses = "text-xs leading-5 text-destructive";

const dateTimePickerTimezoneClasses =
  "text-xs font-medium leading-5 text-muted-foreground";

const dateTimePickerTimeSelectorClasses =
  "grid min-w-0 gap-[var(--dt-space-3)] border-t border-border pt-[var(--dt-space-3)]";

const dateTimePickerTimeSelectorLabelClasses =
  "text-xs font-medium uppercase tracking-wide text-muted-foreground";

const dateTimePickerTimeInputClasses =
  "h-10 w-full min-w-0 rounded-md border border-input bg-background px-[var(--dt-space-3)] text-sm tabular-nums text-foreground shadow-sm outline-none motion-safe:transition-[border-color,box-shadow,background-color] motion-safe:duration-150 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50";

const dateTimePickerTimeOptionsLabelClasses =
  "text-xs font-medium uppercase tracking-wide text-muted-foreground";

const dateTimePickerTimeOptionsClasses =
  "grid max-h-36 grid-cols-[repeat(3,minmax(0,1fr))] gap-[var(--dt-space-1)] overflow-y-auto pr-[var(--dt-space-1)]";

const dateTimePickerTimeOptionClasses =
  "min-w-0 rounded-md border border-border bg-background px-[var(--dt-space-2)] py-[var(--dt-space-1-5)] text-center text-xs font-medium tabular-nums text-foreground shadow-sm outline-none motion-safe:transition-[background-color,border-color,box-shadow,color,transform] motion-safe:duration-150 hover:border-ring/50 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring active:translate-y-px disabled:pointer-events-none disabled:opacity-45 data-[selected=true]:border-primary data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground";

type DateTimePickerPanel = "calendar" | "time";

const dateTimePickerTimeSegmentTypes = new Set([
  "hour",
  "minute",
  "second",
  "dayPeriod",
]);

function getRootRenderClasses(
  renderProps: DatePickerRenderProps,
  className: string | undefined,
) {
  return cn(dateTimePickerRootClasses, className);
}

function isDateTimePickerTimeSegment(segmentType: string) {
  return dateTimePickerTimeSegmentTypes.has(segmentType);
}

function setDateTimePickerTimeInputValue({
  granularity,
  inputValue,
  setValue,
  value,
}: {
  granularity: DateTimePickerGranularity;
  inputValue: string;
  setValue: (value: DateTimePickerValue) => void;
  value: DateTimePickerValue | null;
}) {
  if (!value) {
    return;
  }

  const nextValue = getDateTimePickerTimeInputValueChange({
    granularity,
    inputValue,
    value,
  });

  if (nextValue) {
    if (nextValue.toString() !== value.toString()) {
      setValue(nextValue);
    }
  }
}

function ClearIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="none"
      viewBox="0 0 16 16"
    >
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
    <svg
      aria-hidden="true"
      className="size-4"
      fill="none"
      viewBox="0 0 16 16"
    >
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

export const DateTimePicker = forwardRef<HTMLDivElement, DateTimePickerProps>(
  (
    {
      className,
      clearable = false,
      defaultValue,
      description,
      disabled = false,
      errorMessage,
      granularity = "minute",
      hideTimeZone = false,
      hourCycle,
      id,
      invalid = false,
      isDateUnavailable,
      label,
      locale,
      maxValue,
      minValue,
      name,
      onValueChange,
      presets = [],
      readOnly = false,
      required = false,
      timeZone,
      timeOptions,
      timeSelector = false,
      timeStep = 30,
      value,
      weekStartsOn,
    },
    ref,
  ) => {
    const triggerRef = useRef<HTMLButtonElement>(null);
    const timeSelectorLabelId = useId();
    const timeOptionsLabelId = useId();
    const [activePanel, setActivePanel] =
      useState<DateTimePickerPanel>("calendar");
    const { portalContainer, rootRef } =
      useProviderPortalRoot<HTMLDivElement>({
        forwardedRef: ref,
        portalSlot: "date-time-picker-portal-container",
      });
    const picker = (
      <DethinkPortalProvider container={portalContainer}>
        <AriaDatePicker<DateTimePickerValue>
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
          granularity={granularity}
          hourCycle={hourCycle}
          hideTimeZone={hideTimeZone}
          firstDayOfWeek={weekStartsOn}
          placeholderValue={getDateTimePickerPlaceholderValue({
            defaultValue,
            timeZone,
            value,
          })}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setActivePanel("calendar");
              queueMicrotask(() => triggerRef.current?.focus());
            }
          }}
          validationBehavior="aria"
          data-slot="date-time-picker"
          data-granularity={granularity}
          className={(renderProps) =>
            getRootRenderClasses(renderProps, className)
          }
        >
          {({ state, isDisabled, isFocusWithin, isInvalid, isReadOnly }) => {
            const currentValue = state.value as DateTimePickerValue | null;
            const timeZoneLabel = hideTimeZone
              ? null
              : getDateTimePickerTimeZone(currentValue, timeZone);
            const canClear = clearable && Boolean(currentValue);
            const resolvedTimeOptions =
              timeOptions ??
              getDateTimePickerTimeOptions({
                granularity,
                hourCycle: hourCycle ?? 24,
                step: timeStep,
              });
            const timeControlsDisabled =
              !currentValue || isDisabled || isReadOnly;
            const timeInputValue = getDateTimePickerTimeInputValue({
              granularity,
              value: currentValue,
            });
            const showCalendarPanel = activePanel === "calendar";
            const showTimeSelector = timeSelector && activePanel === "time";

            return (
              <>
                {label ? (
                  <Label
                    data-slot="date-time-picker-label"
                    data-disabled={isDisabled ? "true" : undefined}
                    className={dateTimePickerLabelClasses}
                  >
                    {label}
                    {required ? <span aria-hidden="true"> *</span> : null}
                  </Label>
                ) : null}
                <Group
                  data-slot="date-time-picker-field"
                  data-disabled={isDisabled ? "true" : undefined}
                  data-focus-within={isFocusWithin ? "true" : undefined}
                  data-invalid={isInvalid ? "true" : undefined}
                  className={dateTimePickerControlClasses}
                >
                  <DateInput
                    data-slot="date-time-picker-input"
                    className={dateTimePickerInputClasses}
                  >
                    {(segment) => (
                      (() => {
                        const isTimeSegment = isDateTimePickerTimeSegment(
                          segment.type,
                        );
                        const openTimeSelector = () => {
                          if (!timeSelector || !isTimeSegment) {
                            return;
                          }

                          setActivePanel("time");
                          state.open();
                        };

                        return (
                          <DateSegment
                            data-segment={segment.type}
                            data-slot="date-time-picker-segment"
                            segment={segment}
                            className={dateTimePickerSegmentClasses}
                            onPointerDownCapture={() => {
                              setActivePanel(
                                isTimeSegment ? "time" : "calendar",
                              );
                            }}
                            onClick={openTimeSelector}
                          />
                        );
                      })()
                    )}
                  </DateInput>
                  {clearable ? (
                    <button
                      aria-label="Clear date and time"
                      className={dateTimePickerClearButtonClasses}
                      data-slot="date-time-picker-clear"
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
                    className={dateTimePickerTriggerButtonClasses}
                    data-slot="date-time-picker-trigger"
                    onClickCapture={() => setActivePanel("calendar")}
                  >
                    <CalendarIcon />
                  </AriaButton>
                </Group>
                {timeZoneLabel ? (
                  <div
                    data-slot="date-time-picker-timezone"
                    className={dateTimePickerTimezoneClasses}
                  >
                    {timeZoneLabel}
                  </div>
                ) : null}
                {description ? (
                  <Text
                    slot="description"
                    data-slot="date-time-picker-description"
                    className={dateTimePickerHelpClasses}
                  >
                    {description}
                  </Text>
                ) : null}
                {errorMessage ? (
                  <FieldError
                    data-slot="date-time-picker-error"
                    className={dateTimePickerErrorClasses}
                  >
                    {errorMessage}
                  </FieldError>
                ) : null}
                {name ? (
                  <input
                    data-slot="date-time-picker-form-value"
                    name={name}
                    readOnly
                    type="hidden"
                    value={serializeDateTimePickerValue(
                      state.value as DateTimePickerValue | null,
                    )}
                  />
                ) : null}
                <Popover
                  data-panel={activePanel}
                  data-slot="date-time-picker-popover"
                  className={dateTimePickerPopoverClasses}
                >
                  <Dialog
                    data-slot="date-time-picker-dialog"
                    className={dateTimePickerDialogClasses}
                  >
                    {showCalendarPanel && presets.length > 0 ? (
                      <div
                        data-slot="date-time-picker-presets"
                        className={dateTimePickerPresetsClasses}
                      >
                        {presets.map((preset, index) => (
                          <button
                            className={dateTimePickerPresetButtonClasses}
                            data-slot="date-time-picker-preset"
                            disabled={isDisabled || isReadOnly}
                            key={index}
                            type="button"
                            onClick={() => {
                              state.setValue(preset.value);
                              state.close();
                            }}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    ) : null}
                    {showCalendarPanel ? (
                      <AriaCalendar
                        data-slot="date-time-picker-calendar"
                        className={dateTimePickerCalendarClasses}
                      >
                        <DateCalendarGrid dataSlotPrefix="date-time-picker-calendar" />
                      </AriaCalendar>
                    ) : null}
                    {showTimeSelector ? (
                      <div
                        aria-labelledby={timeSelectorLabelId}
                        data-slot="date-time-picker-time-selector"
                        role="group"
                        className={dateTimePickerTimeSelectorClasses}
                      >
                        <div
                          id={timeSelectorLabelId}
                          data-slot="date-time-picker-time-selector-label"
                          className={dateTimePickerTimeSelectorLabelClasses}
                        >
                          Time
                        </div>
                        <input
                          aria-label="Exact time"
                          className={dateTimePickerTimeInputClasses}
                          data-slot="date-time-picker-time-input"
                          disabled={timeControlsDisabled}
                          step={getDateTimePickerTimeInputStep(granularity)}
                          type="time"
                          value={timeInputValue}
                          onChange={(event) => {
                            setDateTimePickerTimeInputValue({
                              granularity,
                              inputValue: event.currentTarget.value,
                              setValue: state.setValue,
                              value: currentValue,
                            });
                          }}
                          onInput={(event) => {
                            setDateTimePickerTimeInputValue({
                              granularity,
                              inputValue: event.currentTarget.value,
                              setValue: state.setValue,
                              value: currentValue,
                            });
                          }}
                        />
                        {resolvedTimeOptions.length > 0 ? (
                          <>
                            <div
                              id={timeOptionsLabelId}
                              data-slot="date-time-picker-time-options-label"
                              className={dateTimePickerTimeOptionsLabelClasses}
                            >
                              Quick picks
                            </div>
                            <div
                              aria-labelledby={timeOptionsLabelId}
                              data-slot="date-time-picker-time-options"
                              role="group"
                              className={dateTimePickerTimeOptionsClasses}
                            >
                              {resolvedTimeOptions.map((option) => {
                                const selected =
                                  isDateTimePickerTimeOptionSelected({
                                    granularity,
                                    option,
                                    value: currentValue,
                                  });
                                const label =
                                  option.label ??
                                  `${String(option.hour).padStart(
                                    2,
                                    "0",
                                  )}:${String(option.minute ?? 0).padStart(
                                    2,
                                    "0",
                                  )}`;

                                return (
                                  <button
                                    aria-pressed={selected}
                                    className={dateTimePickerTimeOptionClasses}
                                    data-selected={
                                      selected ? "true" : undefined
                                    }
                                    data-slot="date-time-picker-time-option"
                                    disabled={timeControlsDisabled}
                                    key={`${option.hour}:${
                                      option.minute ?? 0
                                    }:${option.second ?? 0}`}
                                    type="button"
                                    onClick={() => {
                                      if (!currentValue) {
                                        return;
                                      }

                                      state.setValue(
                                        getDateTimePickerTimeOptionValue(
                                          currentValue,
                                          option,
                                        ),
                                      );
                                    }}
                                  >
                                    {label}
                                  </button>
                                );
                              })}
                            </div>
                          </>
                        ) : null}
                      </div>
                    ) : null}
                  </Dialog>
                </Popover>
              </>
            );
          }}
        </AriaDatePicker>
      </DethinkPortalProvider>
    );

    if (locale) {
      return <I18nProvider locale={locale}>{picker}</I18nProvider>;
    }

    return picker;
  },
);

DateTimePicker.displayName = "DateTimePicker";
