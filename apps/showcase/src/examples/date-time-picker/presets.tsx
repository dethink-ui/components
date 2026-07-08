"use client";

import { DateTimePicker } from "@dethink/components";
import { CalendarDateTime } from "@internationalized/date";

export function DateTimePickerPresets() {
  return (
    <div className="mx-auto max-w-sm">
      <DateTimePicker
        label="Publish at"
        presets={[
          {
            label: "Launch day 9:00",
            value: new CalendarDateTime(2026, 7, 14, 9, 0),
          },
          {
            label: "Launch day 17:00",
            value: new CalendarDateTime(2026, 7, 14, 17, 0),
          },
          {
            label: "Friday wrap-up",
            value: new CalendarDateTime(2026, 7, 17, 16, 0),
          },
        ]}
      />
    </div>
  );
}
