import type { CalendarDate, DateValue } from "@internationalized/date";
import type { RangeValue } from "react-aria-components";

export type DateRangePickerValue = RangeValue<CalendarDate>;

export function serializeDateRangePickerValue(
  value: DateValue | null | undefined,
) {
  return value?.toString() ?? "";
}

export function getDateRangePickerFieldNames({
  endName,
  name,
  startName,
}: {
  endName?: string;
  name?: string;
  startName?: string;
}) {
  return {
    endName: endName ?? (name ? `${name}End` : undefined),
    startName: startName ?? (name ? `${name}Start` : undefined),
  };
}
