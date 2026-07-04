"use client";

import { DateTimePicker } from "@dethink/components";
import { CalendarDateTime } from "@internationalized/date";

export function DateTimePickerBasic() {
  return (
    <div className="mx-auto max-w-sm">
      <DateTimePicker
        label="Kickoff meeting"
        description="Date and time in one field, minute precision by default."
        defaultValue={new CalendarDateTime(2026, 7, 14, 9, 30)}
      />
    </div>
  );
}
