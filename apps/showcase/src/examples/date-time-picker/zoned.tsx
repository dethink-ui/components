"use client";

import { useState } from "react";
import {
  DateTimePicker,
  type DateTimePickerValue,
} from "@dethink/components";
import { parseZonedDateTime } from "@internationalized/date";

export function DateTimePickerZoned() {
  const [value, setValue] = useState<DateTimePickerValue | null>(
    parseZonedDateTime("2026-07-14T09:30[America/New_York]"),
  );

  return (
    <div className="mx-auto max-w-sm space-y-3">
      <DateTimePicker
        label="Webinar (New York)"
        value={value}
        onValueChange={setValue}
        clearable
      />
      <p className="text-sm text-muted-foreground">
        Value: {value ? value.toString() : "none"}
      </p>
    </div>
  );
}
