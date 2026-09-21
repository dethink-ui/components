import { describe, expect, it } from "vitest";
import type { SlotPlannerSlotData } from "./slot-planner-contract";
import { getSlotPlannerCalendarEntries } from "./slot-planner-calendar-layout";

const slot: SlotPlannerSlotData = {
  id: "one",
  date: "2026-09-22",
  startTime: "09:00",
  durationMinutes: 45,
  timeZone: "America/New_York",
  state: "requestable",
};
const now = "2026-09-21T00:00:00Z";
describe("weekly calendar projection", () => {
  it("positions provider slots in the display zone without changing callback identity", () => {
    const [entry] = getSlotPlannerCalendarEntries(
      [slot],
      [slot.date],
      now,
      "Europe/London",
    );
    expect(entry).toMatchObject({
      start: 840,
      end: 885,
      timeLabel: "14:00 – 14:45",
      occurrence: {
        occurrenceDate: slot.date,
        startTime: "09:00",
        timeZone: "America/New_York",
      },
    });
  });
  it("keeps short adjacent slots and overlaps in reachable lanes", () => {
    const entries = getSlotPlannerCalendarEntries(
      [
        { ...slot, durationMinutes: 15 },
        { ...slot, id: "two", startTime: "09:15", durationMinutes: 15 },
        { ...slot, id: "three", startTime: "09:20" },
      ],
      [slot.date],
      now,
      slot.timeZone,
    );
    expect(entries.map((entry) => entry.lane)).toEqual([0, 1, 2]);
    expect(entries.every((entry) => entry.lanes === 3)).toBe(true);
  });
  it("splits overnight slots across display dates and preserves provider identity", () => {
    const entries = getSlotPlannerCalendarEntries(
      [{ ...slot, startTime: "23:30", durationMinutes: 120 }],
      [slot.date, "2026-09-23"],
      now,
      slot.timeZone,
    );
    expect(
      entries.map(({ date, start, end }) => ({ date, start, end })),
    ).toEqual([
      { date: slot.date, start: 1410, end: 1440 },
      { date: "2026-09-23", start: 0, end: 90 },
    ]);
    expect(
      entries.every((entry) => entry.occurrence.occurrenceDate === slot.date),
    ).toBe(true);
  });
  it("finds occurrences from the neighboring provider date", () => {
    const entries = getSlotPlannerCalendarEntries(
      [{ ...slot, startTime: "23:30" }],
      ["2026-09-23"],
      now,
      "Europe/London",
    );
    expect(entries[0]).toMatchObject({
      date: "2026-09-23",
      start: 270,
      occurrence: { occurrenceDate: "2026-09-22" },
    });
  });
  it("uses zoned instants across daylight-saving transitions", () => {
    const entries = getSlotPlannerCalendarEntries(
      [
        {
          ...slot,
          date: "2026-03-08",
          startTime: "01:30",
          durationMinutes: 120,
        },
      ],
      ["2026-03-08"],
      "2026-03-01T00:00:00Z",
      "Europe/London",
    );
    expect(entries[0]).toMatchObject({
      start: 390,
      end: 510,
      timeLabel: "06:30 – 08:30",
    });
  });
});
