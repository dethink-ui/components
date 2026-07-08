import {
  now,
  type CalendarDateTime,
  type DateValue,
  type ZonedDateTime,
} from "@internationalized/date";

export type DateTimePickerValue = CalendarDateTime | ZonedDateTime;

export type DateTimePickerGranularity = "hour" | "minute" | "second";

export type DateTimePickerTimeStep = 5 | 10 | 15 | 30 | 60;

export type DateTimePickerTimeOption = {
  hour: number;
  label?: string;
  minute?: number;
  second?: number;
};

export type DateTimePickerWeekStartsOn =
  "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";

export function serializeDateTimePickerValue(
  value: DateTimePickerValue | null | undefined,
) {
  return value?.toString() ?? "";
}

export function hasTimeZone(
  value: DateValue | null | undefined,
): value is ZonedDateTime {
  return Boolean(value && "timeZone" in value);
}

export function getDateTimePickerTimeZone(
  value: DateValue | null | undefined,
  timeZone: string | undefined,
) {
  if (timeZone) {
    return timeZone;
  }

  if (hasTimeZone(value)) {
    return value.timeZone;
  }

  return null;
}

export function getDateTimePickerPlaceholderValue({
  defaultValue,
  timeZone,
  value,
}: {
  defaultValue?: DateTimePickerValue | null;
  timeZone?: string;
  value?: DateTimePickerValue | null;
}) {
  if (!timeZone || value || defaultValue) {
    return undefined;
  }

  return now(timeZone);
}

function formatTimeOptionLabel({
  hour,
  hourCycle,
  minute,
}: {
  hour: number;
  hourCycle: 12 | 24;
  minute: number;
}) {
  const paddedMinute = String(minute).padStart(2, "0");

  if (hourCycle === 12) {
    const period = hour < 12 ? "AM" : "PM";
    const displayHour = hour % 12 || 12;

    return `${displayHour}:${paddedMinute} ${period}`;
  }

  return `${String(hour).padStart(2, "0")}:${paddedMinute}`;
}

export function getDateTimePickerTimeOptions({
  granularity = "minute",
  hourCycle = 24,
  step = 30,
}: {
  granularity?: DateTimePickerGranularity;
  hourCycle?: 12 | 24;
  step?: DateTimePickerTimeStep;
} = {}): DateTimePickerTimeOption[] {
  const minuteStep = granularity === "hour" ? 60 : step;
  const options: DateTimePickerTimeOption[] = [];

  for (let hour = 0; hour < 24; hour += 1) {
    for (let minute = 0; minute < 60; minute += minuteStep) {
      options.push({
        hour,
        label: formatTimeOptionLabel({ hour, hourCycle, minute }),
        minute,
        second: 0,
      });
    }
  }

  return options;
}

export function getDateTimePickerTimeOptionValue(
  value: DateTimePickerValue,
  option: DateTimePickerTimeOption,
) {
  return value.set({
    hour: option.hour,
    millisecond: 0,
    minute: option.minute ?? 0,
    second: option.second ?? 0,
  });
}

export function getDateTimePickerTimeInputStep(
  granularity: DateTimePickerGranularity = "minute",
) {
  if (granularity === "second") {
    return 1;
  }

  if (granularity === "hour") {
    return 3600;
  }

  return 60;
}

export function getDateTimePickerTimeInputValue({
  granularity = "minute",
  value,
}: {
  granularity?: DateTimePickerGranularity;
  value: DateTimePickerValue | null | undefined;
}) {
  if (!value) {
    return "";
  }

  const hour = String(value.hour).padStart(2, "0");
  const minute =
    granularity === "hour" ? "00" : String(value.minute).padStart(2, "0");

  if (granularity === "second") {
    return `${hour}:${minute}:${String(value.second).padStart(2, "0")}`;
  }

  return `${hour}:${minute}`;
}

export function getDateTimePickerTimeInputValueChange({
  granularity = "minute",
  inputValue,
  value,
}: {
  granularity?: DateTimePickerGranularity;
  inputValue: string;
  value: DateTimePickerValue | null | undefined;
}) {
  if (!value || !inputValue) {
    return null;
  }

  const [hourPart, minutePart = "0", secondPart = "0"] = inputValue.split(":");
  const hour = Number(hourPart);
  const minute = granularity === "hour" ? 0 : Number(minutePart);
  const second = granularity === "second" ? Number(secondPart) : 0;
  const isValidTime =
    Number.isInteger(hour) &&
    Number.isInteger(minute) &&
    Number.isInteger(second) &&
    hour >= 0 &&
    hour <= 23 &&
    minute >= 0 &&
    minute <= 59 &&
    second >= 0 &&
    second <= 59;

  if (!isValidTime) {
    return null;
  }

  return value.set({
    hour,
    millisecond: 0,
    minute,
    second,
  });
}

export function isDateTimePickerTimeOptionSelected({
  granularity = "minute",
  option,
  value,
}: {
  granularity?: DateTimePickerGranularity;
  option: DateTimePickerTimeOption;
  value: DateTimePickerValue | null | undefined;
}) {
  if (!value) {
    return false;
  }

  if (value.hour !== option.hour) {
    return false;
  }

  if (granularity === "hour") {
    return true;
  }

  if (value.minute !== (option.minute ?? 0)) {
    return false;
  }

  if (granularity === "second") {
    return value.second === (option.second ?? 0);
  }

  return true;
}
