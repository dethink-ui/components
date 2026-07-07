import { describe, expect, it } from "vitest";

import {
  defaultSlotPlannerTaxonomy,
  slotPlannerOccurrenceStatuses,
  slotPlannerSlotStates,
  slotPlannerViolationCodes,
  type SlotPlannerBatchChangePayload,
  type SlotPlannerBookRequestPayload,
  type SlotPlannerSlotData,
  type SlotPlannerUpdatePayload,
} from ".";
import {
  slotPlannerClinicTaxonomy,
  slotPlannerMentoringTaxonomy,
  slotPlannerSampleConstraints,
  slotPlannerSampleSlots,
} from "./slot-planner-fixtures";

const roundTrip = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const findSlot = (id: string): SlotPlannerSlotData => {
  const slot = slotPlannerSampleSlots.find((entry) => entry.id === id);
  if (!slot) throw new Error(`missing fixture slot ${id}`);
  return slot;
};

describe("slot planner contract JSON round-trip", () => {
  it("round-trips the canonical sample slots losslessly", () => {
    expect(roundTrip(slotPlannerSampleSlots)).toEqual(slotPlannerSampleSlots);
  });

  it("round-trips constraints and taxonomies losslessly", () => {
    expect(roundTrip(slotPlannerSampleConstraints)).toEqual(
      slotPlannerSampleConstraints,
    );
    expect(roundTrip(defaultSlotPlannerTaxonomy)).toEqual(
      defaultSlotPlannerTaxonomy,
    );
    expect(roundTrip(slotPlannerMentoringTaxonomy)).toEqual(
      slotPlannerMentoringTaxonomy,
    );
    expect(roundTrip(slotPlannerClinicTaxonomy)).toEqual(
      slotPlannerClinicTaxonomy,
    );
  });

  it("round-trips callback payload shapes losslessly", () => {
    const slot = findSlot("mon-morning-architecture");
    const groupSlot = findSlot("wed-group-systems");
    const update: SlotPlannerUpdatePayload = { slot: groupSlot, previous: slot };
    const bookRequest: SlotPlannerBookRequestPayload = {
      slotId: groupSlot.id,
      occurrenceDate: groupSlot.date,
      seats: 2,
      viewerTimeZone: "Asia/Tokyo",
    };
    // Created and rejected sets are disjoint: the rejected slot appears only
    // under violations, with structured codes.
    const batch: SlotPlannerBatchChangePayload = {
      createdSlots: [groupSlot],
      deletedSlotIds: [slot.id],
      violations: {
        "rejected-fri-overflow": [
          { code: "daily-cap", params: { cap: 3 } },
          { code: "overlap" },
        ],
      },
    };

    expect(roundTrip(update)).toEqual(update);
    expect(roundTrip(bookRequest)).toEqual(bookRequest);
    expect(roundTrip(batch)).toEqual(batch);
    expect(
      batch.createdSlots.some((created) => created.id in batch.violations),
    ).toBe(false);
  });
});

describe("slot planner slot payload generic", () => {
  it("binds a domain payload type while keeping the core shape", () => {
    type InterviewPayload = {
      tags?: string[];
      candidateId: string;
      round: number;
    };

    const slot: SlotPlannerSlotData<InterviewPayload> = {
      id: "interview-1",
      date: "2026-07-20",
      startTime: "10:00",
      durationMinutes: 60,
      timeZone: "Europe/London",
      state: "requestable",
      data: { candidateId: "cand-42", round: 2, tags: ["Screening"] },
    };

    const invalid: SlotPlannerSlotData<InterviewPayload> = {
      ...slot,
      // @ts-expect-error -- payload keys are typed once a generic is bound
      data: { round: "two" },
    };

    expect(roundTrip(slot)).toEqual(slot);
    expect(invalid.id).toBe("interview-1");
  });
});

describe("default taxonomy", () => {
  it("provides a non-empty string for every label, status, and violation code", () => {
    const {
      statusLabels,
      violationMessages,
      statusCountSummary,
      dailyCapSummary,
      weeklyCapSummary,
      remainingSeats,
      durationSummary,
      bufferSummary,
      announceBatchApplied,
      announceBatchRejected,
      ...labels
    } = defaultSlotPlannerTaxonomy;
    for (const value of Object.values(labels)) {
      expect(typeof value).toBe("string");
      expect(value.length).toBeGreaterThan(0);
    }
    for (const status of slotPlannerOccurrenceStatuses) {
      expect(statusLabels[status].length).toBeGreaterThan(0);
    }
    for (const code of slotPlannerViolationCodes) {
      expect(violationMessages[code].length).toBeGreaterThan(0);
    }
    for (const template of [
      statusCountSummary,
      dailyCapSummary,
      weeklyCapSummary,
      remainingSeats,
      durationSummary,
      bufferSummary,
      announceBatchApplied,
      announceBatchRejected,
    ]) {
      expect(template.other.length).toBeGreaterThan(0);
    }
  });
});

describe("canonical fixture coverage", () => {
  it("covers every stored slot state", () => {
    const covered = new Set(slotPlannerSampleSlots.map((slot) => slot.state));
    for (const state of slotPlannerSlotStates) {
      expect(covered.has(state)).toBe(true);
    }
  });

  it("carries the data every derived occurrence status needs", () => {
    // requested: pending seats on an otherwise requestable slot
    const requested = findSlot("tue-pairing");
    expect(requested.state).toBe("requestable");
    expect(requested.requestedCount).toBeGreaterThan(0);

    // booked: seats at capacity (default 1)
    const booked = findSlot("thu-booked-review");
    expect(booked.state).toBe("requestable");
    expect(booked.bookedCount).toBe(booked.capacity ?? 1);

    // booked via a series override at full capacity
    const group = findSlot("wed-group-systems");
    const fullOverride = group.recurrence?.overrides?.find(
      (override) => override.bookedCount === group.capacity,
    );
    expect(fullOverride).toBeDefined();

    // expired: a slot dated before the fixture's anchor week
    const past = findSlot("past-intro-call");
    expect(past.date < "2026-07-06").toBe(true);
  });

  it("covers recurrence, multiple zones, capacity, and a DST-adjacent series", () => {
    const zones = new Set(slotPlannerSampleSlots.map((slot) => slot.timeZone));
    expect(zones.size).toBeGreaterThanOrEqual(3);

    const frequencies = new Set(
      slotPlannerSampleSlots
        .map((slot) => slot.recurrence?.frequency)
        .filter(Boolean),
    );
    expect(frequencies.has("weekly")).toBe(true);
    expect(frequencies.has("biweekly")).toBe(true);

    const withCancelledOverride = slotPlannerSampleSlots.find((slot) =>
      slot.recurrence?.overrides?.some((override) => override.cancelled),
    );
    expect(withCancelledOverride).toBeDefined();

    const groupSlot = findSlot("wed-group-systems");
    expect(groupSlot.capacity).toBeGreaterThan(1);
    expect(groupSlot.bookedCount).toBeGreaterThan(0);

    // Europe/London leaves DST on 2026-10-25; the fixture series must
    // produce occurrences on both sides of that date.
    const dstSeries = findSlot("autumn-dst-spanning-clinic");
    expect(dstSeries.date < "2026-10-25").toBe(true);
    expect((dstSeries.recurrence?.until ?? "") > "2026-10-25").toBe(true);
  });

  it("keeps ISO-shaped dates, wall-clock times, and resolvable IANA zones", () => {
    for (const slot of slotPlannerSampleSlots) {
      expect(slot.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(slot.startTime).toMatch(/^\d{2}:\d{2}$/);
      // A zone is valid iff the platform's time-zone database resolves it.
      expect(
        () => new Intl.DateTimeFormat("en", { timeZone: slot.timeZone }),
      ).not.toThrow();
    }
  });
});
