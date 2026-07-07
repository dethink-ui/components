"use client";

import { SlotPlanner, type SlotPlannerSlotData } from "@dethink/components";

const sampleSlots: SlotPlannerSlotData[] = [
  {
    id: "mon-morning",
    date: "2026-07-06",
    startTime: "09:00",
    durationMinutes: 45,
    timeZone: "America/New_York",
    state: "requestable",
    recurrence: { frequency: "weekly" },
    data: { tags: ["Onboarding"] },
  },
  {
    id: "mon-afternoon",
    date: "2026-07-06",
    startTime: "14:00",
    durationMinutes: 30,
    timeZone: "America/New_York",
    state: "requestable",
    capacity: 3,
    requestedCount: 1,
    data: { note: "Group session — drop-in welcome." },
  },
  {
    id: "tue-standup",
    date: "2026-07-07",
    startTime: "10:00",
    durationMinutes: 15,
    timeZone: "America/New_York",
    state: "blocked",
    data: { tags: ["Internal"] },
  },
  {
    id: "wed-review",
    date: "2026-07-08",
    startTime: "11:30",
    durationMinutes: 60,
    timeZone: "America/New_York",
    state: "requestable",
    bookedCount: 1,
    capacity: 1,
  },
];

export function SlotPlannerBasic() {
  return (
    <SlotPlanner
      title="Mentoring availability"
      defaultSlots={sampleSlots}
      defaultFocusedDate="2026-07-06"
      now="2026-07-06T08:00:00-04:00"
    />
  );
}
