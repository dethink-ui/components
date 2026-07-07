"use client";

import { SlotPlanner, type SlotPlannerSlotData } from "@dethink/components";

const sampleSlots: SlotPlannerSlotData<{ priceUsd: number }>[] = [
  {
    id: "mon-consult",
    date: "2026-07-06",
    startTime: "10:00",
    durationMinutes: 45,
    timeZone: "America/New_York",
    state: "requestable",
    recurrence: { frequency: "weekly" },
    data: { priceUsd: 120 },
  },
  {
    id: "mon-workshop",
    date: "2026-07-06",
    startTime: "15:00",
    durationMinutes: 90,
    timeZone: "America/New_York",
    state: "requestable",
    capacity: 6,
    data: { priceUsd: 45 },
  },
];

export function SlotPlannerCustomRenderer() {
  return (
    <SlotPlanner
      title="Paid consultations"
      defaultSlots={sampleSlots}
      defaultFocusedDate="2026-07-06"
      now="2026-07-06T08:00:00-04:00"
      renderers={{
        slotCard: ({ occurrence, renderDefault }) => (
          <div className="grid gap-2">
            {renderDefault()}
            {typeof occurrence.slot.data?.priceUsd === "number" ? (
              <p className="text-sm font-medium text-foreground">
                ${occurrence.slot.data.priceUsd} per seat
              </p>
            ) : null}
          </div>
        ),
      }}
    />
  );
}
