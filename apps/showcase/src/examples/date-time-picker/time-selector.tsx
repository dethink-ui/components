"use client";

import { DateTimePicker } from "@dethink/components";
import { CalendarDateTime } from "@internationalized/date";

export function DateTimePickerTimeSelector() {
  return (
    <div className="mx-auto max-w-sm">
      <DateTimePicker
        label="Interview slot"
        description="Pick times from a 15-minute grid instead of typing them."
        timeSelector
        timeStep={15}
        minValue={new CalendarDateTime(2026, 7, 14, 8, 0)}
        maxValue={new CalendarDateTime(2026, 7, 14, 18, 0)}
        defaultValue={new CalendarDateTime(2026, 7, 14, 10, 15)}
      />
    </div>
  );
}
