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
import { forwardRef, type ReactNode, useRef } from "react";
import type { DateValue } from "@internationalized/date";
import { DateCalendarGrid, type CalendarWeekStartsOn } from "../calendar";
import {
  DethinkPortalProvider,
  useProviderPortalRoot,
} from "../../utils/provider-portal";
import { cn } from "../../utils/cn";
import {
  serializeDatePickerValue,
  type DatePickerValue,
} from "./date-picker-utils";

export type { DatePickerValue } from "./date-picker-utils";

export interface DatePickerProps {
  value?: DatePickerValue | null;
  defaultValue?: DatePickerValue | null;
  onValueChange?: (value: DatePickerValue | null) => void;
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
  weekStartsOn?: CalendarWeekStartsOn;
  clearable?: boolean;
}

const datePickerRootClasses =
  "group/date-picker grid w-full max-w-md gap-[var(--dt-space-2)] text-foreground";

const datePickerLabelClasses =
  "text-sm font-medium leading-none text-foreground data-[disabled=true]:opacity-60";

const datePickerControlClasses =
  "flex min-h-density-control items-center rounded-md border border-input bg-background text-sm text-foreground shadow-sm motion-safe:transition-[border-color,box-shadow,background-color] motion-safe:duration-150 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-60 data-[focus-within=true]:border-ring data-[focus-within=true]:ring-2 data-[focus-within=true]:ring-ring/20 data-[invalid=true]:border-destructive data-[invalid=true]:ring-destructive/15";

const datePickerInputClasses =
  "flex min-w-0 flex-1 items-center gap-[var(--dt-space-0-5)] px-[var(--dt-space-3)] py-[var(--dt-space-2)]";

const datePickerSegmentClasses =
  "rounded-sm px-[var(--dt-space-0-5)] tabular-nums outline-none motion-safe:transition-colors motion-safe:duration-150 data-[focused]:bg-primary data-[focused]:text-primary-foreground data-[placeholder]:text-muted-foreground data-[disabled]:text-muted-foreground data-[readonly]:text-muted-foreground data-[invalid]:text-destructive";

const datePickerClearButtonClasses =
  "me-[var(--dt-space-1)] inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground motion-safe:transition-[background-color,color,transform] motion-safe:duration-150 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:translate-y-px disabled:pointer-events-none disabled:opacity-40";

const datePickerTriggerButtonClasses =
  "me-[var(--dt-space-1)] inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground motion-safe:transition-[background-color,color,transform] motion-safe:duration-150 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:translate-y-px disabled:pointer-events-none disabled:opacity-40 data-[pressed]:bg-muted data-[pressed]:text-foreground";

const datePickerPopoverClasses =
  "z-50 rounded-md border border-border bg-background p-[var(--dt-space-3)] text-foreground shadow-lg outline-none motion-safe:transition-[opacity,transform] motion-safe:duration-150 data-[entering]:opacity-100 data-[exiting]:translate-y-1 data-[exiting]:opacity-0";

const datePickerDialogClasses = "grid gap-[var(--dt-space-3)] outline-none";

const datePickerCalendarClasses = "grid gap-[var(--dt-space-3)]";

const datePickerHelpClasses = "text-xs leading-5 text-muted-foreground";

const datePickerErrorClasses = "text-xs leading-5 text-destructive";

function getRootRenderClasses(
  renderProps: DatePickerRenderProps,
  className: string | undefined,
) {
  return cn(datePickerRootClasses, className);
}

export function datePickerClassNames({
  className,
}: Pick<DatePickerProps, "className"> = {}) {
  return cn(datePickerRootClasses, className);
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

export const DatePicker = forwardRef<HTMLDivElement, DatePickerProps>(
  (
    {
      className,
      clearable = false,
      defaultValue,
      description,
      disabled = false,
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
      value,
      weekStartsOn,
    },
    ref,
  ) => {
    const triggerRef = useRef<HTMLButtonElement>(null);
    const { portalContainer, rootRef } = useProviderPortalRoot<HTMLDivElement>({
      forwardedRef: ref,
      portalSlot: "date-picker-portal-container",
    });
    const picker = (
      <DethinkPortalProvider container={portalContainer}>
        <AriaDatePicker<DatePickerValue>
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
          data-slot="date-picker"
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
                    data-slot="date-picker-label"
                    data-disabled={isDisabled ? "true" : undefined}
                    className={datePickerLabelClasses}
                  >
                    {label}
                    {required ? <span aria-hidden="true"> *</span> : null}
                  </Label>
                ) : null}
                <Group
                  data-slot="date-picker-field"
                  data-disabled={isDisabled ? "true" : undefined}
                  data-focus-within={isFocusWithin ? "true" : undefined}
                  data-invalid={isInvalid ? "true" : undefined}
                  className={datePickerControlClasses}
                >
                  <DateInput
                    data-slot="date-picker-input"
                    className={datePickerInputClasses}
                  >
                    {(segment) => (
                      <DateSegment
                        data-slot="date-picker-segment"
                        segment={segment}
                        className={datePickerSegmentClasses}
                      />
                    )}
                  </DateInput>
                  {clearable ? (
                    <button
                      aria-label="Clear date"
                      className={datePickerClearButtonClasses}
                      data-slot="date-picker-clear"
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
                    className={datePickerTriggerButtonClasses}
                    data-slot="date-picker-trigger"
                  >
                    <CalendarIcon />
                  </AriaButton>
                </Group>
                {description ? (
                  <Text
                    slot="description"
                    data-slot="date-picker-description"
                    className={datePickerHelpClasses}
                  >
                    {description}
                  </Text>
                ) : null}
                {errorMessage ? (
                  <FieldError
                    data-slot="date-picker-error"
                    className={datePickerErrorClasses}
                  >
                    {errorMessage}
                  </FieldError>
                ) : null}
                {name ? (
                  <input
                    data-slot="date-picker-form-value"
                    name={name}
                    readOnly
                    type="hidden"
                    value={serializeDatePickerValue(state.value)}
                  />
                ) : null}
                <Popover
                  data-slot="date-picker-popover"
                  className={datePickerPopoverClasses}
                >
                  <Dialog
                    data-slot="date-picker-dialog"
                    className={datePickerDialogClasses}
                  >
                    <AriaCalendar
                      data-slot="date-picker-calendar"
                      className={datePickerCalendarClasses}
                    >
                      <DateCalendarGrid dataSlotPrefix="date-picker-calendar" />
                    </AriaCalendar>
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

DatePicker.displayName = "DatePicker";
