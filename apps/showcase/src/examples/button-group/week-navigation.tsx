"use client";

import { useState } from "react";
import { Button, ButtonGroup, IconButton } from "@dethink/components";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

// A fixed demo week keeps server and client output identical in every time zone.
const referenceMonday = Date.UTC(2026, 8, 21);
const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function ButtonGroupWeekNavigation() {
  const [offset, setOffset] = useState(0);
  const start = referenceMonday + offset * 7 * 86400000;
  const formatter = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
  return (
    <div className="border-border bg-background mx-auto w-full max-w-lg overflow-hidden rounded-2xl border shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <p className="text-muted-foreground mb-1 flex items-center gap-2 text-xs">
            <CalendarDays className="size-3.5" aria-hidden="true" /> Team
            calendar
          </p>
          <h3 aria-live="polite" className="text-sm font-semibold">
            {formatter.format(start)} – {formatter.format(start + 6 * 86400000)}
          </h3>
        </div>
        <ButtonGroup aria-label="Week navigation">
          <IconButton
            size="sm"
            variant="outline"
            aria-label="Previous week"
            onClick={() => setOffset((value) => value - 1)}
          >
            <ChevronLeft />
          </IconButton>
          <Button size="sm" variant="outline" onClick={() => setOffset(0)}>
            Reset
          </Button>
          <IconButton
            size="sm"
            variant="outline"
            aria-label="Next week"
            onClick={() => setOffset((value) => value + 1)}
          >
            <ChevronRight />
          </IconButton>
        </ButtonGroup>
      </div>
      <div className="border-border grid grid-cols-7 border-t">
        {dayNames.map((day, index) => (
          <div
            key={day}
            className="border-border min-w-0 border-e px-1 py-5 text-center last:border-e-0"
          >
            <span className="text-muted-foreground text-[10px]">{day}</span>
            <div
              className={`mx-auto mt-2 flex size-7 items-center justify-center rounded-full text-xs font-medium tabular-nums ${offset === 0 && index === 2 ? "bg-primary text-primary-foreground" : "text-foreground"}`}
            >
              {new Date(start + index * 86400000).getUTCDate()}
            </div>
            <div
              aria-hidden="true"
              className={`mx-auto mt-3 size-1 rounded-full ${index === 1 || index === 3 ? "bg-primary" : "bg-transparent"}`}
            />
          </div>
        ))}
      </div>
      <p className="text-muted-foreground border-border border-t px-5 py-3 text-xs">
        Demo schedule · Reset returns to 21 September.
      </p>
    </div>
  );
}
