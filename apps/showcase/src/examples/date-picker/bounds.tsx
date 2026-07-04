"use client";

import { DatePicker } from "@dethink/components";
import { CalendarDate, getDayOfWeek } from "@internationalized/date";

export function DatePickerBounds() {
  return (
    <div className="mx-auto max-w-xs">
      <DatePicker
        label="Delivery date"
        description="Weekday deliveries in July only."
        minValue={new CalendarDate(2026, 7, 6)}
        maxValue={new CalendarDate(2026, 7, 31)}
        isDateUnavailable={(date) => {
          const dayOfWeek = getDayOfWeek(date, "en-US");
          return dayOfWeek === 0 || dayOfWeek === 6;
        }}
      />
    </div>
  );
}
