"use client";

import { RangeCalendar } from "@dethink/components";
import { CalendarDate } from "@internationalized/date";

export function CalendarRange() {
  return (
    <div className="flex justify-center">
      <RangeCalendar
        aria-label="Sprint dates"
        defaultValue={{
          start: new CalendarDate(2026, 7, 6),
          end: new CalendarDate(2026, 7, 17),
        }}
      />
    </div>
  );
}
