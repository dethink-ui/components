"use client";

import { useState } from "react";
import {
  SlotPicker,
  type SlotPlannerBookRequestPayload,
  type SlotPlannerSlotData,
} from "@dethink/components";

const initialSlots: SlotPlannerSlotData[] = [
  {
    id: "mon-consult",
    date: "2026-07-06",
    startTime: "14:00",
    durationMinutes: 30,
    timeZone: "Europe/London",
    state: "requestable",
    recurrence: { frequency: "weekly" },
    capacity: 2,
  },
  {
    id: "tue-consult",
    date: "2026-07-07",
    startTime: "17:30",
    durationMinutes: 30,
    timeZone: "Europe/London",
    state: "requestable",
    capacity: 1,
  },
];

export function SlotPlannerBookMode() {
  const [slots, setSlots] = useState(initialSlots);

  const handleBookRequest = (payload: SlotPlannerBookRequestPayload) => {
    setSlots((previous) =>
      previous.map((slot) =>
        slot.id === payload.slotId
          ? { ...slot, requestedCount: (slot.requestedCount ?? 0) + 1 }
          : slot,
      ),
    );
  };

  return (
    <SlotPicker
      title="Book a consultation"
      slots={slots}
      viewerTimeZone="America/New_York"
      defaultFocusedDate="2026-07-06"
      now="2026-07-06T08:00:00-04:00"
      onBookRequest={handleBookRequest}
    />
  );
}
