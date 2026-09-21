"use client";

import { SlotPlanner, type SlotPlannerSlotData } from "@dethink/components";

const sampleSlots: SlotPlannerSlotData[] = [
  {
    id: "mon-session",
    date: "2026-07-06",
    startTime: "13:00",
    durationMinutes: 50,
    timeZone: "America/Los_Angeles",
    state: "requestable",
    recurrence: { frequency: "weekly" },
    data: { tags: ["CBT"] },
  },
  {
    id: "wed-session",
    date: "2026-07-08",
    startTime: "16:00",
    durationMinutes: 50,
    timeZone: "America/Los_Angeles",
    state: "requestable",
    data: { note: "Intake session for new clients." },
  },
];

export function SlotPlannerTaxonomy() {
  return (
    <SlotPlanner
      title="Therapy sessions"
      timeZone="America/Los_Angeles"
      defaultSlots={sampleSlots}
      defaultFocusedDate="2026-07-06"
      now="2026-07-06T09:00:00-07:00"
      taxonomy={{
        slot: "session",
        slotPlural: "sessions",
        addSlot: "Add session to this day",
        requestSlot: "Request {slot}",
      }}
    />
  );
}
