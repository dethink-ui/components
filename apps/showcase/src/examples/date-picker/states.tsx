"use client";

import { DatePicker } from "@dethink/components";
import { CalendarDate } from "@internationalized/date";

export function DatePickerStates() {
  return (
    <div className="mx-auto grid max-w-md gap-5 sm:grid-cols-2">
      <DatePicker label="Required" required />
      <DatePicker
        label="Disabled"
        disabled
        defaultValue={new CalendarDate(2026, 7, 14)}
      />
      <DatePicker
        label="Read-only"
        readOnly
        defaultValue={new CalendarDate(2026, 7, 14)}
      />
      <DatePicker
        label="Invalid"
        invalid
        errorMessage="Pick a date after today."
        defaultValue={new CalendarDate(2026, 6, 1)}
      />
    </div>
  );
}
