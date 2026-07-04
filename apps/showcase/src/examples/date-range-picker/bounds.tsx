"use client";

import { DateRangePicker } from "@dethink/components";
import { CalendarDate } from "@internationalized/date";

export function DateRangePickerBounds() {
  return (
    <div className="mx-auto max-w-sm">
      <DateRangePicker
        label="Q3 review period"
        description="Must fall inside the third quarter."
        minValue={new CalendarDate(2026, 7, 1)}
        maxValue={new CalendarDate(2026, 9, 30)}
        defaultValue={{
          start: new CalendarDate(2026, 7, 6),
          end: new CalendarDate(2026, 7, 17),
        }}
      />
    </div>
  );
}
