import { fromAbsolute, parseDate } from "@internationalized/date";
import type {
  SlotPlannerSlotData,
  SlotPlannerSlotPayload,
} from "./slot-planner-contract";
import {
  expandSlotOccurrences,
  projectSlotPlannerOccurrenceToZone,
  type SlotPlannerOccurrence,
} from "./slot-planner-utils";

export interface CalendarEntry<
  TData extends SlotPlannerSlotPayload = SlotPlannerSlotPayload,
> {
  occurrence: SlotPlannerOccurrence<TData>;
  date: string;
  start: number;
  end: number;
  timeLabel: string;
  lane: number;
  lanes: number;
}

export const calendarMinimumMinutes = 80;

/** Calendar geometry is in display-zone wall-clock minutes; payload identities stay in the provider zone. */
export function getSlotPlannerCalendarEntries<
  TData extends SlotPlannerSlotPayload,
>(
  slots: SlotPlannerSlotData<TData>[],
  dates: string[],
  now: string,
  timeZone: string,
): CalendarEntry<TData>[] {
  if (!dates.length) return [];
  const first = dates[0]!;
  const last = dates[dates.length - 1]!;
  const padding =
    Math.ceil(
      Math.max(0, ...slots.map((slot) => slot.durationMinutes)) / 1440,
    ) + 2;
  const entries: CalendarEntry<TData>[] = [];
  for (const slot of slots) {
    for (const occurrence of expandSlotOccurrences(
      slot,
      parseDate(first).subtract({ days: padding }).toString(),
      parseDate(last).add({ days: 2 }).toString(),
      now,
    )) {
      const projected = projectSlotPlannerOccurrenceToZone(
        occurrence,
        timeZone,
      );
      const finish = fromAbsolute(
        projected.startEpochMs + occurrence.durationMinutes * 60_000,
        timeZone,
      );
      const endDate = finish.toString().slice(0, 10);
      for (const date of dates) {
        if (date < projected.viewerDate || date > endDate) continue;
        const [hour = 0, minute = 0] = projected.viewerStartTime
          .split(":")
          .map(Number);
        const start = date === projected.viewerDate ? hour * 60 + minute : 0;
        const end = date === endDate ? finish.hour * 60 + finish.minute : 1440;
        if (date === endDate && end === 0 && date !== projected.viewerDate)
          continue;
        entries.push({
          occurrence,
          date,
          start,
          end: Math.max(start + 1, end),
          timeLabel: `${projected.viewerStartTime} – ${projected.viewerEndTime}${endDate !== projected.viewerDate ? ` (${endDate})` : ""}`,
          lane: 0,
          lanes: 1,
        });
      }
    }
  }
  // Reserve enough room for time, status and capacity. Assign overlap lanes
  // using that visual footprint, so short adjacent events cannot cover one another.
  for (const date of dates) {
    const day = entries
      .filter((entry) => entry.date === date)
      .sort(
        (a, b) =>
          a.start - b.start ||
          a.occurrence.slotId.localeCompare(b.occurrence.slotId),
      );
    let cluster: CalendarEntry<TData>[] = [];
    let laneEnds: number[] = [];
    let clusterEnd = -1;
    const finishCluster = () => {
      for (const entry of cluster) entry.lanes = laneEnds.length;
    };
    for (const entry of day) {
      if (entry.start >= clusterEnd) {
        finishCluster();
        cluster = [];
        laneEnds = [];
      }
      const end = Math.max(entry.end, entry.start + calendarMinimumMinutes);
      let lane = laneEnds.findIndex((value) => value <= entry.start);
      if (lane < 0) lane = laneEnds.length;
      laneEnds[lane] = end;
      entry.lane = lane;
      cluster.push(entry);
      clusterEnd = Math.max(...laneEnds);
    }
    finishCluster();
  }
  return entries.sort(
    (a, b) =>
      a.date.localeCompare(b.date) ||
      a.start - b.start ||
      a.occurrence.slotId.localeCompare(b.occurrence.slotId),
  );
}
