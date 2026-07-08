import type { CalendarDate, DateValue } from "@internationalized/date";

export type DatePickerValue = CalendarDate;

export function serializeDatePickerValue(value: DateValue | null | undefined) {
  return value?.toString() ?? "";
}
