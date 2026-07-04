"use client";

import { useState } from "react";
import { Button, DatePicker, type DatePickerValue } from "@dethink/components";
import { CalendarDate } from "@internationalized/date";

export function DatePickerControlled() {
  const [value, setValue] = useState<DatePickerValue | null>(
    new CalendarDate(2026, 7, 14),
  );

  return (
    <div className="mx-auto max-w-xs space-y-3">
      <DatePicker
        label="Review deadline"
        value={value}
        onValueChange={setValue}
        clearable
      />
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Value: {value ? value.toString() : "none"}
        </p>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setValue(new CalendarDate(2026, 7, 14))}
        >
          Reset
        </Button>
      </div>
    </div>
  );
}
