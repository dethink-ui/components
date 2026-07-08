"use client";

import { useState } from "react";
import { Calendar } from "@dethink/components";
import { CalendarDate, type DateValue } from "@internationalized/date";

export function CalendarBasic() {
  const [value, setValue] = useState<DateValue | null>(
    new CalendarDate(2026, 7, 14),
  );

  return (
    <div className="flex flex-col items-center gap-3">
      <Calendar
        aria-label="Launch date"
        value={value}
        onValueChange={setValue}
      />
      <p className="text-muted-foreground text-sm">
        Selected: {value ? value.toString() : "none"}
      </p>
    </div>
  );
}
