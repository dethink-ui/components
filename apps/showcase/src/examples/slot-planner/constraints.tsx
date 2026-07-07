"use client";

import { SlotPlanner, type SlotPlannerSlotData } from "@dethink/components";

const sampleSlots: SlotPlannerSlotData[] = [
  {
    id: "mon-early",
    date: "2026-07-06",
    startTime: "09:00",
    durationMinutes: 30,
    timeZone: "America/New_York",
    state: "requestable",
    requestedCount: 1,
  },
  {
    id: "mon-mid",
    date: "2026-07-06",
    startTime: "11:00",
    durationMinutes: 30,
    timeZone: "America/New_York",
    state: "requestable",
    requestedCount: 1,
  },
  {
    id: "mon-late",
    date: "2026-07-06",
    startTime: "15:00",
    durationMinutes: 30,
    timeZone: "America/New_York",
    state: "requestable",
    requestedCount: 1,
  },
];

export function SlotPlannerConstraints() {
  return (
    <SlotPlanner
      title="Advising hours"
      defaultSlots={sampleSlots}
      defaultFocusedDate="2026-07-06"
      now="2026-07-06T08:00:00-04:00"
      constraints={{
        dailyRequestableCap: 3,
        minNoticeMinutes: 120,
        durationIncrementMinutes: 15,
      }}
    />
  );
}
