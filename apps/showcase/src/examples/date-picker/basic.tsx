"use client";

import { DatePicker } from "@dethink/components";

export function DatePickerBasic() {
  return (
    <div className="mx-auto max-w-xs">
      <DatePicker
        label="Launch date"
        description="Announcement goes out at 9:00 AM local time."
        name="launchDate"
      />
    </div>
  );
}
