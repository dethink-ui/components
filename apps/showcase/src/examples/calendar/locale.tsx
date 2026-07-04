"use client";

import { Calendar } from "@dethink/components";
import { CalendarDate } from "@internationalized/date";

export function CalendarLocale() {
  return (
    <div className="flex flex-wrap items-start justify-center gap-6">
      <Calendar
        aria-label="Date (German)"
        locale="de-DE"
        weekStartsOn="mon"
        defaultValue={new CalendarDate(2026, 7, 14)}
      />
      <Calendar
        aria-label="Date (Japanese)"
        locale="ja-JP"
        weekdayStyle="narrow"
        defaultValue={new CalendarDate(2026, 7, 14)}
      />
    </div>
  );
}
