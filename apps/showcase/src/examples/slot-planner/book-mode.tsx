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
      previous.map((slot) => {
        if (slot.id !== payload.slotId) {
          return slot;
        }

        if (!slot.recurrence || payload.occurrenceDate === slot.date) {
          return { ...slot, requestedCount: (slot.requestedCount ?? 0) + 1 };
        }

        const overrides = slot.recurrence.overrides ?? [];
        const existing = overrides.find(
          (override) => override.occurrenceDate === payload.occurrenceDate,
        );
        const nextOverride = {
          ...existing,
          occurrenceDate: payload.occurrenceDate,
          requestedCount: (existing?.requestedCount ?? 0) + 1,
        };

        return {
          ...slot,
          recurrence: {
            ...slot.recurrence,
            overrides: existing
              ? overrides.map((override) =>
                  override.occurrenceDate === payload.occurrenceDate
                    ? nextOverride
                    : override,
                )
              : [...overrides, nextOverride],
          },
        };
      }),
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
