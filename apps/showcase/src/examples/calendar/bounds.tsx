"use client";

import { Calendar } from "@dethink/components";
import { CalendarDate, getDayOfWeek } from "@internationalized/date";

const minValue = new CalendarDate(2026, 7, 6);
const maxValue = new CalendarDate(2026, 7, 31);

export function CalendarBounds() {
  return (
    <div className="flex justify-center">
      <Calendar
        aria-label="Delivery slot"
        defaultFocusedValue={minValue}
        minValue={minValue}
        maxValue={maxValue}
        // Weekends are unavailable for delivery.
        isDateUnavailable={(date) => {
          const dayOfWeek = getDayOfWeek(date, "en-US");
          return dayOfWeek === 0 || dayOfWeek === 6;
        }}
      />
    </div>
  );
}
