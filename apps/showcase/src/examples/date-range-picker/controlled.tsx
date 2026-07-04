"use client";

import { useState } from "react";
import {
  DateRangePicker,
  type DateRangePickerValue,
} from "@dethink/components";
import { CalendarDate } from "@internationalized/date";

export function DateRangePickerControlled() {
  const [value, setValue] = useState<DateRangePickerValue | null>({
    start: new CalendarDate(2026, 7, 6),
    end: new CalendarDate(2026, 7, 17),
  });

  return (
    <div className="mx-auto max-w-sm space-y-3">
      <DateRangePicker
        label="Sprint window"
        value={value}
        onValueChange={setValue}
        clearable
      />
      <p className="text-sm text-muted-foreground">
        {value
          ? `${value.start.toString()} → ${value.end.toString()}`
          : "No range selected"}
      </p>
    </div>
  );
}
