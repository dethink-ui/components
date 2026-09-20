"use client";

import { DateTimePicker } from "@dethink/components";
import { CalendarDateTime } from "@internationalized/date";

export function DateTimePickerBasic() {
  return (
    <div className="mx-auto max-w-sm">
      <DateTimePicker
        label="Kickoff meeting"
        description="Choose a date, set a time, then select Done."
        name="kickoffAt"
        defaultValue={new CalendarDateTime(2026, 7, 14, 9, 30)}
      />
    </div>
  );
}
