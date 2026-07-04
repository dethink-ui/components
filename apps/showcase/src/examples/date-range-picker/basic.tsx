"use client";

import { DateRangePicker } from "@dethink/components";

export function DateRangePickerBasic() {
  return (
    <div className="mx-auto max-w-sm">
      <DateRangePicker
        label="Trip dates"
        description="Both nights are included in the rate."
      />
    </div>
  );
}
