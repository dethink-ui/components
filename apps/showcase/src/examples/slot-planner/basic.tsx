"use client";

import { SlotPlanner, type SlotPlannerSlotData } from "@dethink/components";

const sampleSlots: SlotPlannerSlotData[] = [
  {
    id: "mon-morning",
    date: "2026-09-22",
    startTime: "09:00",
    durationMinutes: 45,
    timeZone: "America/New_York",
    state: "requestable",
    capacity: 2,
    recurrence: { frequency: "weekly" },
    data: { tags: ["Mentoring"] },
  },
  {
    id: "mon-afternoon",
    date: "2026-09-22",
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
    date: "2026-09-21",
    startTime: "10:00",
    durationMinutes: 45,
    timeZone: "America/New_York",
    state: "requestable",
    data: { tags: ["Mentoring"] },
  },
  {
    id: "wed-review",
    date: "2026-09-23",
    startTime: "11:00",
    durationMinutes: 60,
    timeZone: "America/New_York",
    state: "requestable",
    bookedCount: 1,
    capacity: 1,
  },
  {
    id: "tue-booked",
    date: "2026-09-22",
    startTime: "16:00",
    durationMinutes: 60,
    timeZone: "America/New_York",
    state: "requestable",
    capacity: 1,
    bookedCount: 1,
    data: { tags: ["Mentoring"] },
  },
  {
    id: "thu-available",
    date: "2026-09-24",
    startTime: "13:00",
    durationMinutes: 30,
    timeZone: "America/New_York",
    state: "requestable",
    capacity: 2,
  },
];

export function SlotPlannerBasic() {
  return (
    <SlotPlanner
      title="Mentoring availability"
      defaultSlots={sampleSlots}
      defaultFocusedDate="2026-09-22"
      now="2026-09-21T08:00:00-04:00"
      timeZone="America/New_York"
      taxonomy={{
        statusLabels: {
          requestable: "Available",
          requested: "Request pending",
          booked: "Booked",
        },
        emptyDay: "No slots",
        addSlot: "Add slot",
      }}
    />
  );
}
