"use client";

import { DateTimePicker } from "@dethink/components";
import { CalendarDateTime } from "@internationalized/date";

export function DateTimePickerGranularity() {
  return (
    <div className="mx-auto grid max-w-2xl gap-5 lg:grid-cols-2">
      <DateTimePicker
        label="Hour precision"
        granularity="hour"
        defaultValue={new CalendarDateTime(2026, 7, 14, 9)}
      />
      <DateTimePicker
        label="12-hour time"
        hourCycle={12}
        defaultValue={new CalendarDateTime(2026, 7, 14, 14, 30)}
      />
      <DateTimePicker
        label="Second precision, 24h"
        granularity="second"
        hourCycle={24}
        defaultValue={new CalendarDateTime(2026, 7, 14, 21, 30, 15)}
      />
    </div>
  );
}
