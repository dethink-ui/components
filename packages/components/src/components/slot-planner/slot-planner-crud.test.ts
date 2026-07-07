import { describe, expect, it } from "vitest";
import type {
  SlotPlannerCreatePayload,
  SlotPlannerDeleteOccurrencePayload,
  SlotPlannerDeleteSeriesPayload,
  SlotPlannerSlotData,
  SlotPlannerUpdatePayload,
} from ".";
import {
  applySlotPlannerBatch,
  applySlotPlannerMutation,
  createSlotFromEditorValues,
  updateSlotFromEditorValues,
  upsertSlotPlannerOccurrenceOverride,
  type SlotPlannerEditorSeriesValues,
} from ".";
import { slotPlannerSampleSlots } from "./slot-planner-fixtures";

const roundTrip = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const findSlot = (id: string): SlotPlannerSlotData => {
  const slot = slotPlannerSampleSlots.find((entry) => entry.id === id);
  if (!slot) throw new Error(`missing fixture slot ${id}`);
  return slot;
};

const snapshot = <T>(value: T) => roundTrip(value);

const baseEditorValues: SlotPlannerEditorSeriesValues = {
  startTime: "10:30",
  durationMinutes: 45,
  capacity: 1,
  bufferBeforeMinutes: 0,
  bufferAfterMinutes: 0,
  timeZone: "Europe/London",
  tags: [],
  note: "",
  recurrence: "none",
  recurrenceUntil: "",
};

describe("upsertSlotPlannerOccurrenceOverride", () => {
  it("appends an override when none exists for the date", () => {
    const slot = findSlot("mon-morning-architecture");
    const before = snapshot(slot);

    const next = upsertSlotPlannerOccurrenceOverride(slot, {
      occurrenceDate: "2026-07-13",
      startTime: "15:00",
    });

    expect(next.recurrence?.overrides).toEqual([
      { occurrenceDate: "2026-07-13", startTime: "15:00" },
    ]);
    // Immutability: the input slot is untouched.
    expect(snapshot(slot)).toEqual(before);
    expect(next).not.toBe(slot);
    expect(next.recurrence).not.toBe(slot.recurrence);
  });

  it("merges over an existing override for the same date", () => {
    const slot = findSlot("wed-group-systems");
    const before = snapshot(slot);

    const next = upsertSlotPlannerOccurrenceOverride(slot, {
      occurrenceDate: "2026-09-02",
      durationMinutes: 120,
    });
    const override = next.recurrence?.overrides?.find(
      (candidate) => candidate.occurrenceDate === "2026-09-02",
    );

    // Existing override fields survive; new fields are replaced/added.
    expect(override).toEqual({
      occurrenceDate: "2026-09-02",
      startTime: "18:00",
      durationMinutes: 120,
    });
    expect(next.recurrence?.overrides).toHaveLength(3);
    expect(snapshot(slot)).toEqual(before);
  });

  it("returns non-recurring slots unchanged", () => {
    const slot = findSlot("tue-pairing");

    expect(
      upsertSlotPlannerOccurrenceOverride(slot, {
        occurrenceDate: slot.date,
        cancelled: true,
      }),
    ).toBe(slot);
  });
});

describe("applySlotPlannerMutation", () => {
  const created: SlotPlannerSlotData = {
    id: "new-slot",
    date: "2026-07-06",
    startTime: "09:00",
    durationMinutes: 30,
    timeZone: "Europe/London",
    state: "requestable",
  };

  it("appends on create", () => {
    const before = snapshot(slotPlannerSampleSlots);
    const next = applySlotPlannerMutation(slotPlannerSampleSlots, {
      type: "create",
      slot: created,
    });

    expect(next).toHaveLength(slotPlannerSampleSlots.length + 1);
    expect(next.at(-1)).toBe(created);
    expect(snapshot(slotPlannerSampleSlots)).toEqual(before);
  });

  it("replaces by id on update", () => {
    const previous = findSlot("tue-pairing");
    const updated = { ...previous, startTime: "11:00" };
    const next = applySlotPlannerMutation(slotPlannerSampleSlots, {
      type: "update",
      slot: updated,
    });

    expect(next).toHaveLength(slotPlannerSampleSlots.length);
    expect(next.find((slot) => slot.id === "tue-pairing")).toBe(updated);
    expect(previous.startTime).toBe("09:30");
  });

  it("cancels the occurrence of a recurring slot on delete-occurrence", () => {
    const before = snapshot(slotPlannerSampleSlots);
    const next = applySlotPlannerMutation(slotPlannerSampleSlots, {
      type: "delete-occurrence",
      slotId: "mon-morning-architecture",
      occurrenceDate: "2026-07-06",
    });
    const slot = next.find((entry) => entry.id === "mon-morning-architecture");

    expect(next).toHaveLength(slotPlannerSampleSlots.length);
    expect(slot?.recurrence?.overrides).toEqual([
      { occurrenceDate: "2026-07-06", cancelled: true },
    ]);
    expect(snapshot(slotPlannerSampleSlots)).toEqual(before);
  });

  it("removes a non-recurring slot on delete-occurrence", () => {
    const next = applySlotPlannerMutation(slotPlannerSampleSlots, {
      type: "delete-occurrence",
      slotId: "tue-pairing",
      occurrenceDate: "2026-07-07",
    });

    expect(next).toHaveLength(slotPlannerSampleSlots.length - 1);
    expect(next.some((slot) => slot.id === "tue-pairing")).toBe(false);
  });

  it("removes the slot on delete-series", () => {
    const next = applySlotPlannerMutation(slotPlannerSampleSlots, {
      type: "delete-series",
      slotId: "wed-group-systems",
    });

    expect(next).toHaveLength(slotPlannerSampleSlots.length - 1);
    expect(next.some((slot) => slot.id === "wed-group-systems")).toBe(false);
  });
});

describe("applySlotPlannerBatch", () => {
  const created: SlotPlannerSlotData = {
    id: "batch-created",
    date: "2026-07-07",
    startTime: "09:00",
    durationMinutes: 60,
    timeZone: "Europe/London",
    state: "requestable",
  };

  it("appends created, removes deleted, and replaces updated slots", () => {
    const before = snapshot(slotPlannerSampleSlots);
    const updated = {
      ...findSlot("mon-morning-architecture"),
      startTime: "15:00",
    };

    const next = applySlotPlannerBatch(slotPlannerSampleSlots, {
      createdSlots: [created],
      deletedSlotIds: ["tue-pairing"],
      updatedSlots: [updated],
    });

    expect(next).toHaveLength(slotPlannerSampleSlots.length);
    expect(next.at(-1)).toBe(created);
    expect(next.some((slot) => slot.id === "tue-pairing")).toBe(false);
    expect(next.find((slot) => slot.id === "mon-morning-architecture")).toBe(
      updated,
    );
    // Immutability: the input collection is untouched.
    expect(snapshot(slotPlannerSampleSlots)).toEqual(before);
  });

  it("treats a missing updatedSlots as no updates", () => {
    const next = applySlotPlannerBatch(slotPlannerSampleSlots, {
      createdSlots: [],
      deletedSlotIds: [],
    });

    expect(next).toEqual(slotPlannerSampleSlots);
    expect(next).not.toBe(slotPlannerSampleSlots);
  });
});

describe("createSlotFromEditorValues", () => {
  it("builds a minimal requestable slot, omitting empty keys", () => {
    const slot = createSlotFromEditorValues(baseEditorValues, {
      id: "generated-1",
      date: "2026-07-08",
    });

    expect(slot).toEqual({
      id: "generated-1",
      date: "2026-07-08",
      startTime: "10:30",
      durationMinutes: 45,
      timeZone: "Europe/London",
      state: "requestable",
    });
    expect("data" in slot).toBe(false);
    expect("recurrence" in slot).toBe(false);
  });

  it("includes buffers, recurrence with until, tags, and note when set", () => {
    const slot = createSlotFromEditorValues(
      {
        ...baseEditorValues,
        bufferBeforeMinutes: 10,
        bufferAfterMinutes: 5,
        tags: ["Pairing"],
        note: "First cohort",
        recurrence: "biweekly",
        recurrenceUntil: "2026-12-16",
      },
      { id: "generated-2", date: "2026-07-08" },
    );

    expect(slot.recurrence).toEqual({
      frequency: "biweekly",
      until: "2026-12-16",
    });
    expect(slot.bufferBeforeMinutes).toBe(10);
    expect(slot.bufferAfterMinutes).toBe(5);
    expect(slot.data).toEqual({ tags: ["Pairing"], note: "First cohort" });
  });
});

describe("updateSlotFromEditorValues", () => {
  it("preserves unknown data keys and existing overrides", () => {
    const previous = findSlot("wed-group-systems");
    const before = snapshot(previous);

    const next = updateSlotFromEditorValues(previous, {
      ...baseEditorValues,
      startTime: "16:00",
      durationMinutes: 60,
      timeZone: "America/New_York",
      tags: ["System Design"],
      note: "Updated",
      recurrence: "weekly",
      recurrenceUntil: "2026-11-01",
    });

    expect(next.startTime).toBe("16:00");
    expect(next.recurrence?.frequency).toBe("weekly");
    expect(next.recurrence?.until).toBe("2026-11-01");
    expect(next.recurrence?.overrides).toEqual(
      previous.recurrence?.overrides,
    );
    // Unknown payload keys (priceUsd) survive; conventional keys are replaced.
    expect(next.data).toEqual({
      tags: ["System Design"],
      note: "Updated",
      priceUsd: 40,
    });
    expect(snapshot(previous)).toEqual(before);
  });

  it("drops cleared buffers, tags, note, and recurrence", () => {
    const previous = findSlot("mon-evening-architecture");

    const next = updateSlotFromEditorValues(previous, baseEditorValues);

    expect("recurrence" in next).toBe(false);
    expect("bufferBeforeMinutes" in next).toBe(false);
    expect("data" in next).toBe(false);
    // The input still has its series and data.
    expect(previous.recurrence?.frequency).toBe("weekly");
    expect(previous.data?.note).toBe("Runs until the autumn cohort ends.");
  });
});

describe("CRUD payload JSON round-trips", () => {
  it("round-trips create, update, and delete payloads losslessly", () => {
    const created = createSlotFromEditorValues(
      { ...baseEditorValues, tags: ["Pairing"], recurrence: "weekly" },
      { id: "generated-3", date: "2026-07-08" },
    );
    const createPayload: SlotPlannerCreatePayload = { slot: created };
    const previous = findSlot("mon-morning-architecture");
    const updatePayload: SlotPlannerUpdatePayload = {
      slot: upsertSlotPlannerOccurrenceOverride(previous, {
        occurrenceDate: "2026-07-13",
        durationMinutes: 90,
      }),
      previous,
    };
    const deleteOccurrencePayload: SlotPlannerDeleteOccurrencePayload = {
      slotId: previous.id,
      occurrenceDate: "2026-07-13",
    };
    const deleteSeriesPayload: SlotPlannerDeleteSeriesPayload = {
      slotId: previous.id,
    };

    expect(roundTrip(createPayload)).toEqual(createPayload);
    expect(roundTrip(updatePayload)).toEqual(updatePayload);
    expect(roundTrip(deleteOccurrencePayload)).toEqual(
      deleteOccurrencePayload,
    );
    expect(roundTrip(deleteSeriesPayload)).toEqual(deleteSeriesPayload);
  });
});
