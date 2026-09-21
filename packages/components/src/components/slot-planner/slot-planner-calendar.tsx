import { useMemo } from "react";
import { cn } from "../../utils/cn";
import { Button } from "../button";
import type {
  SlotPlannerSlotData,
  SlotPlannerSlotPayload,
  SlotPlannerTaxonomy,
} from "./slot-planner-contract";
import {
  CalendarIcon,
  getConventionalSlotData,
  PlusIcon,
  slotPlannerStatusDotClasses,
  toUtcDate,
} from "./slot-planner-dom-shared";
import {
  formatSlotPlannerCountTemplate,
  type SlotPlannerOccurrence,
} from "./slot-planner-utils";
import {
  calendarMinimumMinutes,
  getSlotPlannerCalendarEntries,
} from "./slot-planner-calendar-layout";

const statusStyles = {
  requestable: "border-s-success bg-success/5",
  requested: "border-s-warning bg-warning/5",
  booked: "border-s-info bg-info/5",
  blocked: "border-s-destructive bg-destructive/5",
  draft: "border-s-muted-foreground bg-muted/40",
  expired: "border-s-muted-foreground bg-muted/40",
  cancelled: "border-s-muted-foreground bg-muted/40",
};

export function SlotPlannerCalendar<TData extends SlotPlannerSlotPayload>({
  slots,
  dates,
  focusedDate,
  today,
  now,
  timeZone,
  locale,
  taxonomy,
  onSelectDay,
  onOpenSlot,
  onAdd,
}: {
  slots: SlotPlannerSlotData<TData>[];
  dates: string[];
  focusedDate: string;
  today: string;
  now: string;
  timeZone: string;
  locale: string;
  taxonomy: SlotPlannerTaxonomy;
  onSelectDay: (date: string) => void;
  onOpenSlot: (occurrence: SlotPlannerOccurrence<TData>) => void;
  onAdd: (date: string) => void;
}) {
  const entries = useMemo(
    () => getSlotPlannerCalendarEntries(slots, dates, now, timeZone),
    [slots, dates, now, timeZone],
  );
  const weekend = dates.indexOf(focusedDate) > 4;
  const visibleDates = weekend ? dates.slice(5) : dates.slice(0, 5);
  const visibleEntries = entries.filter((entry) =>
    visibleDates.includes(entry.date),
  );
  const startHour = Math.floor(
    Math.min(480, ...visibleEntries.map((entry) => entry.start)) / 60,
  );
  const endHour = Math.min(
    24,
    Math.ceil(
      Math.max(
        1080,
        ...visibleEntries.map((entry) =>
          Math.max(entry.end, entry.start + calendarMinimumMinutes),
        ),
      ) / 60,
    ),
  );
  const hours = Array.from(
    { length: endHour - startHour + 1 },
    (_, i) => startHour + i,
  );
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
  const pixelsPerMinute = 1.2;
  // Late short slots need room for their labels below midnight, without
  // adding misleading next-day hours to the selected day's time axis.
  const bottomPadding = visibleEntries.some(
    (entry) => entry.start + calendarMinimumMinutes > 1440,
  )
    ? calendarMinimumMinutes * pixelsPerMinute
    : 0;
  const height = (endHour - startHour) * 60 * pixelsPerMinute + bottomPadding;
  return (
    <div data-slot="slot-planner-calendar" className="min-w-0">
      <div className="mb-4 flex flex-wrap items-center justify-end gap-3">
        <div className="flex flex-wrap gap-2">
          {weekend ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onSelectDay(dates[0]!)}
            >
              {taxonomy.weekView}
            </Button>
          ) : null}
          {dates.slice(5).map((date) => (
            <Button
              key={date}
              size="sm"
              variant={date === focusedDate ? "soft" : "ghost"}
              onClick={() => onSelectDay(date)}
            >
              {`${dateFormatter.format(toUtcDate(date))} · ${formatSlotPlannerCountTemplate(taxonomy.calendarSlotCount, entries.filter((e) => e.date === date).length, {}, locale)}`}
            </Button>
          ))}
        </div>
      </div>
      <div
        role="region"
        aria-label={`${taxonomy.weekView} · ${timeZone}`}
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- Scrollable regions need keyboard focus for scrolling.
        tabIndex={0}
        className="border-border bg-background focus-visible:outline-ring max-h-[56rem] overflow-auto rounded-lg border focus-visible:outline-2"
      >
        <div
          className="relative grid min-w-[36rem]"
          style={{
            gridTemplateColumns: `3.25rem repeat(${visibleDates.length}, minmax(0, 1fr))`,
          }}
        >
          <div className="bg-background border-border sticky top-0 z-20 border-b" />
          {visibleDates.map((date) => (
            <button
              key={date}
              type="button"
              aria-pressed={date === focusedDate}
              aria-current={date === today ? "date" : undefined}
              onClick={() => onSelectDay(date)}
              className={cn(
                "border-border bg-background focus-visible:outline-ring sticky top-0 z-20 min-h-20 border-s border-b p-3 text-start text-sm font-medium focus-visible:z-30 focus-visible:outline-2",
                date === focusedDate &&
                  "bg-muted text-primary shadow-[inset_0_-2px_var(--dt-color-primary)]",
              )}
            >
              {dateFormatter.format(toUtcDate(date))}
              <span className="text-muted-foreground mt-1 block text-xs">
                {formatSlotPlannerCountTemplate(
                  taxonomy.calendarSlotCount,
                  entries.filter((e) => e.date === date).length,
                  {},
                  locale,
                )}
              </span>
            </button>
          ))}
          <div
            aria-hidden="true"
            className="text-muted-foreground relative text-[11px]"
            style={{ height }}
          >
            {hours.slice(0, -1).map((hour) => (
              <span
                key={hour}
                className="absolute end-2 top-0"
                style={{ top: (hour - startHour) * 60 * pixelsPerMinute + 4 }}
              >
                {String(hour % 24).padStart(2, "0")}:00
              </span>
            ))}
          </div>
          {visibleDates.map((date) => {
            const dayEntries = visibleEntries.filter(
              (entry) => entry.date === date,
            );
            return (
              <div
                key={date}
                role="group"
                aria-label={dateFormatter.format(toUtcDate(date))}
                className={cn(
                  "border-border relative border-s",
                  date === focusedDate && "bg-primary/5",
                )}
                style={{ height }}
              >
                {hours.slice(0, -1).map((hour) => (
                  <div
                    key={hour}
                    aria-hidden="true"
                    className="border-border/60 pointer-events-none absolute inset-x-0 border-t border-dashed"
                    style={{ top: (hour - startHour) * 60 * pixelsPerMinute }}
                  />
                ))}
                {dayEntries.map((entry) => {
                  const remaining = Math.max(
                    0,
                    entry.occurrence.capacity -
                      entry.occurrence.bookedCount -
                      entry.occurrence.requestedCount,
                  );
                  const { tags } = getConventionalSlotData(
                    entry.occurrence.slot.data,
                  );
                  const blockHeight = Math.max(
                    calendarMinimumMinutes * pixelsPerMinute - 4,
                    (entry.end - entry.start) * pixelsPerMinute - 4,
                  );
                  return (
                    <button
                      key={`${entry.occurrence.slotId}:${entry.occurrence.occurrenceDate}:${entry.date}`}
                      type="button"
                      data-slot="slot-planner-calendar-event"
                      data-status={entry.occurrence.status}
                      title={`${entry.timeLabel} · ${taxonomy.statusLabels[entry.occurrence.status]}`}
                      aria-label={`${dateFormatter.format(toUtcDate(date))}, ${entry.timeLabel}, ${taxonomy.statusLabels[entry.occurrence.status]}, ${formatSlotPlannerCountTemplate(taxonomy.remainingSeats, remaining, { remaining }, locale)}`}
                      onClick={() => onOpenSlot(entry.occurrence)}
                      className={cn(
                        "border-border focus-visible:outline-ring absolute flex min-w-0 flex-col gap-1 overflow-hidden rounded-md border border-s-[3px] p-2 text-start text-xs shadow-sm hover:brightness-95 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2",
                        statusStyles[entry.occurrence.status],
                      )}
                      style={{
                        top:
                          (entry.start - startHour * 60) * pixelsPerMinute + 2,
                        height: blockHeight,
                        insetInlineStart: `calc(${(entry.lane * 100) / entry.lanes}% + 4px)`,
                        width: `calc(${100 / entry.lanes}% - 8px)`,
                      }}
                    >
                      <span className="w-full truncate text-sm font-semibold tabular-nums">
                        {entry.timeLabel}
                      </span>
                      <span className="flex min-w-0 items-center gap-1.5">
                        <span
                          aria-hidden="true"
                          className={cn(
                            "size-1.5 shrink-0 rounded-full",
                            slotPlannerStatusDotClasses[
                              entry.occurrence.status
                            ],
                          )}
                        />
                        <span className="truncate">
                          {taxonomy.statusLabels[entry.occurrence.status]}
                        </span>
                      </span>
                      {blockHeight >= 86 ? (
                        <span className="text-muted-foreground truncate">
                          {formatSlotPlannerCountTemplate(
                            taxonomy.remainingSeats,
                            remaining,
                            { remaining },
                            locale,
                          )}
                        </span>
                      ) : null}
                      {tags.length ? (
                        <span className="text-muted-foreground truncate">
                          {tags.join(" · ")}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
                {dayEntries.length === 0 ? (
                  <div className="border-border bg-background text-muted-foreground absolute inset-x-2 top-40 flex flex-col items-center gap-3 rounded-md border border-dashed p-3 text-center text-sm">
                    <CalendarIcon />
                    <span>{taxonomy.emptyDay}</span>
                    {date >= today ? (
                      <Button
                        size="sm"
                        variant="outline"
                        leftIcon={<PlusIcon />}
                        onClick={() => onAdd(date)}
                        aria-label={`${taxonomy.addSlot} · ${dateFormatter.format(toUtcDate(date))}`}
                      >
                        {taxonomy.calendarAdd}
                      </Button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
      <p className="text-muted-foreground mt-3 text-xs">
        {taxonomy.calendarHint}
      </p>
    </div>
  );
}
