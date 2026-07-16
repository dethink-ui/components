import { describe, expect, it } from "vitest";
import {
  defaultSlotPlannerTaxonomy,
  type SlotPlannerSlotData,
} from "./slot-planner-contract";
import { slotPlannerSampleSlots } from "./slot-planner-fixtures";
import {
  deriveOccurrenceStatus,
  expandSlotOccurrences,
  expandSlotsForRange,
  expandSlotsForViewerZone,
  formatSlotPlannerCountTemplate,
  formatSlotPlannerTemplate,
  getSlotPlannerIsoDateInZone,
  getSlotPlannerWeekDays,
  projectSlotPlannerOccurrenceToZone,
  resolveSlotPlannerTaxonomy,
  summarizeSlotPlannerDay,
} from "./slot-planner-utils";

const NOW = "2026-07-06T00:00:00Z";

function findSampleSlot(id: string): SlotPlannerSlotData {
  const slot = slotPlannerSampleSlots.find((candidate) => candidate.id === id);

  if (!slot) {
    throw new Error(`Missing sample slot ${id}`);
  }

  return slot;
}

describe("resolveSlotPlannerTaxonomy", () => {
  it("returns the defaults when no input is given", () => {
    expect(resolveSlotPlannerTaxonomy()).toBe(defaultSlotPlannerTaxonomy);
  });

  it("merges nested statusLabels and violationMessages over the defaults", () => {
    const resolved = resolveSlotPlannerTaxonomy({
      slot: "appointment",
      statusLabels: { requestable: "open" },
      violationMessages: { "daily-cap": "No more today" },
    });

    expect(resolved.slot).toBe("appointment");
    expect(resolved.slotPlural).toBe(defaultSlotPlannerTaxonomy.slotPlural);
    expect(resolved.statusLabels.requestable).toBe("open");
    expect(resolved.statusLabels.booked).toBe(
      defaultSlotPlannerTaxonomy.statusLabels.booked,
    );
    expect(resolved.violationMessages["daily-cap"]).toBe("No more today");
    expect(resolved.violationMessages.overlap).toBe(
      defaultSlotPlannerTaxonomy.violationMessages.overlap,
    );
  });
});

describe("formatSlotPlannerTemplate", () => {
  it("replaces known tokens and leaves unknown tokens verbatim", () => {
    expect(
      formatSlotPlannerTemplate("{count} {statusLabel} on {weekday}", {
        count: 2,
        statusLabel: "requestable",
      }),
    ).toBe("2 requestable on {weekday}");
  });
});

describe("formatSlotPlannerCountTemplate", () => {
  const template = {
    one: "{count} {statusLabel}",
    other: "{count} {statusLabel}s",
  };

  it("selects the CLDR plural category for the locale", () => {
    expect(
      formatSlotPlannerCountTemplate(template, 1, { statusLabel: "seat" }),
    ).toBe("1 seat");
    expect(
      formatSlotPlannerCountTemplate(template, 3, { statusLabel: "seat" }),
    ).toBe("3 seats");
  });

  it("falls back to `other` when the category has no template", () => {
    expect(formatSlotPlannerCountTemplate({ other: "{count} slots" }, 1)).toBe(
      "1 slots",
    );
  });

  it("honours locale-specific categories such as Arabic zero/few", () => {
    const arabicTemplate = {
      zero: "none",
      few: "a few ({count})",
      other: "{count}",
    };

    expect(formatSlotPlannerCountTemplate(arabicTemplate, 0, {}, "ar")).toBe(
      "none",
    );
    expect(formatSlotPlannerCountTemplate(arabicTemplate, 3, {}, "ar")).toBe(
      "a few (3)",
    );
  });
});

describe("deriveOccurrenceStatus", () => {
  const baseSlot: SlotPlannerSlotData = {
    id: "base",
    date: "2026-07-06",
    startTime: "10:00",
    durationMinutes: 60,
    timeZone: "Europe/London",
    state: "requestable",
  };
  const baseResolved = {
    occurrenceDate: "2026-07-06",
    startTime: "10:00",
    durationMinutes: 60,
    bookedCount: 0,
    requestedCount: 0,
    capacity: 1,
  };
  const beforeStart = "2026-07-06T05:00:00Z";

  it("applies the contract precedence order", () => {
    // cancelled outranks everything, including full booking and expiry.
    expect(
      deriveOccurrenceStatus(
        { ...baseSlot, state: "cancelled" },
        { ...baseResolved, bookedCount: 1 },
        "2027-01-01T00:00:00Z",
      ),
    ).toBe("cancelled");
    expect(
      deriveOccurrenceStatus(
        { ...baseSlot, state: "blocked" },
        baseResolved,
        "2027-01-01T00:00:00Z",
      ),
    ).toBe("blocked");
    expect(
      deriveOccurrenceStatus(
        { ...baseSlot, state: "draft" },
        baseResolved,
        "2027-01-01T00:00:00Z",
      ),
    ).toBe("draft");
    // expired outranks booked/requested for a requestable definition.
    expect(
      deriveOccurrenceStatus(
        baseSlot,
        { ...baseResolved, bookedCount: 1 },
        "2027-01-01T00:00:00Z",
      ),
    ).toBe("expired");
    expect(
      deriveOccurrenceStatus(
        baseSlot,
        { ...baseResolved, bookedCount: 1, requestedCount: 2 },
        beforeStart,
      ),
    ).toBe("booked");
    expect(
      deriveOccurrenceStatus(
        baseSlot,
        { ...baseResolved, requestedCount: 2 },
        beforeStart,
      ),
    ).toBe("requested");
    expect(deriveOccurrenceStatus(baseSlot, baseResolved, beforeStart)).toBe(
      "requestable",
    );
  });

  it("treats booked as reached only when bookedCount meets capacity", () => {
    expect(
      deriveOccurrenceStatus(
        { ...baseSlot, capacity: 4 },
        { ...baseResolved, capacity: 4, bookedCount: 2 },
        beforeStart,
      ),
    ).toBe("requestable");
    expect(
      deriveOccurrenceStatus(
        { ...baseSlot, capacity: 4 },
        { ...baseResolved, capacity: 4, bookedCount: 4 },
        beforeStart,
      ),
    ).toBe("booked");
  });

  it("resolves wall-clock expiry in the slot's zone across the DST end", () => {
    // Europe/London leaves BST on 2026-10-25. The same wall-clock slot
    // (09:00–10:00) ends at 09:00 UTC before the transition and 10:00 UTC
    // after it, so an identical UTC "now" flips the derived status.
    const dstSlot: SlotPlannerSlotData = {
      ...baseSlot,
      date: "2026-10-18",
      startTime: "09:00",
    };
    const beforeTransition = {
      ...baseResolved,
      occurrenceDate: "2026-10-18",
      startTime: "09:00",
    };
    const afterTransition = {
      ...beforeTransition,
      occurrenceDate: "2026-10-25",
    };

    expect(
      deriveOccurrenceStatus(dstSlot, beforeTransition, "2026-10-18T09:30:00Z"),
    ).toBe("expired");
    expect(
      deriveOccurrenceStatus(dstSlot, afterTransition, "2026-10-25T09:30:00Z"),
    ).toBe("requestable");
  });
});

describe("expandSlotOccurrences", () => {
  it("returns a single occurrence for a non-recurring slot inside the range", () => {
    const slot = findSampleSlot("tue-pairing");
    const occurrences = expandSlotOccurrences(
      slot,
      "2026-07-06",
      "2026-07-12",
      NOW,
    );

    expect(occurrences).toHaveLength(1);
    expect(occurrences[0]).toMatchObject({
      slotId: "tue-pairing",
      occurrenceDate: "2026-07-07",
      startTime: "09:30",
      status: "requested",
      isRecurring: false,
    });
    expect(
      expandSlotOccurrences(slot, "2026-07-13", "2026-07-19", NOW),
    ).toHaveLength(0);
  });

  it("expands a weekly series across weeks within the range", () => {
    const slot = findSampleSlot("mon-morning-architecture");
    const occurrences = expandSlotOccurrences(
      slot,
      "2026-07-06",
      "2026-07-19",
      NOW,
    );

    expect(occurrences.map((occurrence) => occurrence.occurrenceDate)).toEqual([
      "2026-07-06",
      "2026-07-13",
    ]);
    expect(occurrences.every((occurrence) => occurrence.isRecurring)).toBe(
      true,
    );
  });

  it("steps biweekly, applies overrides, and drops cancelled occurrences", () => {
    const slot = findSampleSlot("wed-group-systems");
    const occurrences = expandSlotOccurrences(
      slot,
      "2026-07-06",
      "2026-09-06",
      NOW,
    );

    // 2026-08-05 is override-cancelled and must be absent entirely.
    expect(occurrences.map((occurrence) => occurrence.occurrenceDate)).toEqual([
      "2026-07-08",
      "2026-07-22",
      "2026-08-19",
      "2026-09-02",
    ]);

    const [onSlotDate, fullyBooked, later, retimed] = occurrences;

    // Slot-level counts apply only on the slot's own date.
    expect(onSlotDate).toMatchObject({
      bookedCount: 2,
      capacity: 4,
      status: "requestable",
    });
    // Override counts win and can fill the occurrence.
    expect(fullyBooked).toMatchObject({ bookedCount: 4, status: "booked" });
    // Every other occurrence defaults to 0.
    expect(later).toMatchObject({ bookedCount: 0, status: "requestable" });
    // Override startTime replaces the series wall-clock time.
    expect(retimed).toMatchObject({ startTime: "18:00" });
    expect(retimed?.durationMinutes).toBe(90);
  });

  it("clips a series at its until date and at the range start", () => {
    const slot = findSampleSlot("autumn-dst-spanning-clinic");

    expect(
      expandSlotOccurrences(slot, "2026-10-01", "2026-12-31", NOW).map(
        (occurrence) => occurrence.occurrenceDate,
      ),
    ).toEqual(["2026-10-18", "2026-10-25", "2026-11-01", "2026-11-08"]);
    expect(
      expandSlotOccurrences(slot, "2026-11-01", "2026-12-31", NOW).map(
        (occurrence) => occurrence.occurrenceDate,
      ),
    ).toEqual(["2026-11-01", "2026-11-08"]);
  });

  it("fast-forwards to the correct occurrence phase for a distant series start", () => {
    const biweekly: SlotPlannerSlotData = {
      id: "distant-biweekly",
      date: "2026-01-05",
      startTime: "09:00",
      durationMinutes: 60,
      timeZone: "Europe/London",
      state: "requestable",
      recurrence: { frequency: "biweekly" },
    };

    // 2026-01-05 + 13×14d = 2026-07-06 is an "on" week; the prior week
    // (2026-06-29 … 2026-07-05) has no occurrence, proving the fast-forward
    // lands on the right phase rather than stepping onto a wrong week.
    expect(
      expandSlotOccurrences(biweekly, "2026-06-29", "2026-07-05", NOW).map(
        (occurrence) => occurrence.occurrenceDate,
      ),
    ).toEqual([]);
    expect(
      expandSlotOccurrences(biweekly, "2026-07-06", "2026-07-19", NOW).map(
        (occurrence) => occurrence.occurrenceDate,
      ),
    ).toEqual(["2026-07-06"]);
    // The off-week occurrence sits at 2026-06-22, two weeks before.
    expect(
      expandSlotOccurrences(biweekly, "2026-06-22", "2026-07-05", NOW).map(
        (occurrence) => occurrence.occurrenceDate,
      ),
    ).toEqual(["2026-06-22"]);
  });

  it("keeps wall-clock time stable across the Europe/London DST end", () => {
    const slot = findSampleSlot("autumn-dst-spanning-clinic");
    const occurrences = expandSlotOccurrences(
      slot,
      "2026-10-18",
      "2026-11-01",
      NOW,
    );

    expect(occurrences.map((occurrence) => occurrence.startTime)).toEqual([
      "09:00",
      "09:00",
      "09:00",
    ]);

    // A "now" of 09:30 UTC on each occurrence date sits after the 10:00 BST
    // end (09:00 UTC) before the transition, but before the 10:00 GMT end
    // (10:00 UTC) after it — the statuses prove the UTC offset changed while
    // the wall clock did not.
    const statuses = occurrences.map((occurrence) =>
      deriveOccurrenceStatus(
        slot,
        occurrence,
        `${occurrence.occurrenceDate}T09:30:00Z`,
      ),
    );

    expect(statuses).toEqual(["expired", "requestable", "requestable"]);
  });
});

describe("getSlotPlannerWeekDays", () => {
  it("returns the Monday-start week containing the focused date", () => {
    const expectedWeek = [
      "2026-07-06",
      "2026-07-07",
      "2026-07-08",
      "2026-07-09",
      "2026-07-10",
      "2026-07-11",
      "2026-07-12",
    ];

    expect(getSlotPlannerWeekDays("2026-07-08")).toEqual(expectedWeek);
    expect(getSlotPlannerWeekDays("2026-07-06")).toEqual(expectedWeek);
    // Sunday belongs to the week that started the previous Monday.
    expect(getSlotPlannerWeekDays("2026-07-12")).toEqual(expectedWeek);
  });
});

describe("expandSlotsForRange", () => {
  it("groups occurrences by date and sorts each day by start time", () => {
    const byDate = expandSlotsForRange(
      slotPlannerSampleSlots,
      "2026-07-06",
      "2026-07-12",
      NOW,
    );

    expect(
      byDate["2026-07-06"]?.map((occurrence) => occurrence.slotId),
    ).toEqual(["mon-morning-architecture", "mon-evening-architecture"]);
    expect(
      byDate["2026-07-08"]?.map((occurrence) => occurrence.slotId),
    ).toEqual(["wed-group-systems"]);
    // The past and next-week fixtures fall outside this range entirely.
    expect(Object.keys(byDate).every((date) => date >= "2026-07-06")).toBe(
      true,
    );
    expect(Object.keys(byDate).every((date) => date <= "2026-07-12")).toBe(
      true,
    );
  });
});

describe("summarizeSlotPlannerDay", () => {
  it("counts occurrences per derived status with zeroed defaults", () => {
    const byDate = expandSlotsForRange(
      slotPlannerSampleSlots,
      "2026-07-06",
      "2026-07-12",
      NOW,
    );
    const monday = summarizeSlotPlannerDay(byDate["2026-07-06"] ?? []);
    const thursday = summarizeSlotPlannerDay(byDate["2026-07-09"] ?? []);

    expect(monday.requestable).toBe(2);
    expect(monday.booked).toBe(0);
    expect(thursday.booked).toBe(1);
    expect(summarizeSlotPlannerDay([]).requestable).toBe(0);
  });
});

describe("getSlotPlannerIsoDateInZone", () => {
  it("resolves the calendar date of one instant per zone", () => {
    // 22:00 UTC on Jul 8 is Jul 8 in New York and Jul 9 in Kolkata.
    const epochMs = Date.parse("2026-07-08T22:00:00Z");

    expect(getSlotPlannerIsoDateInZone(epochMs, "America/New_York")).toBe(
      "2026-07-08",
    );
    expect(getSlotPlannerIsoDateInZone(epochMs, "Asia/Kolkata")).toBe(
      "2026-07-09",
    );
  });
});

describe("projectSlotPlannerOccurrenceToZone", () => {
  const eveningNewYorkSlot: SlotPlannerSlotData = {
    id: "ny-evening",
    date: "2026-07-08",
    startTime: "18:00",
    durationMinutes: 60,
    timeZone: "America/New_York",
    state: "requestable",
  };

  function expandSingle(slot: SlotPlannerSlotData) {
    const occurrences = expandSlotOccurrences(
      slot,
      slot.date,
      slot.date,
      "2026-07-06T00:00:00Z",
    );

    expect(occurrences).toHaveLength(1);

    return occurrences[0]!;
  }

  it("shifts an evening occurrence onto the next viewer date across zones", () => {
    const occurrence = expandSingle(eveningNewYorkSlot);
    // 18:00 EDT = 22:00 UTC = 03:30 IST the next day.
    const kolkata = projectSlotPlannerOccurrenceToZone(
      occurrence,
      "Asia/Kolkata",
    );

    expect(kolkata.viewerDate).toBe("2026-07-09");
    expect(kolkata.viewerStartTime).toBe("03:30");
    expect(kolkata.viewerEndTime).toBe("04:30");
    // The provider-zone identity fields stay untouched.
    expect(kolkata.occurrenceDate).toBe("2026-07-08");
    expect(kolkata.startTime).toBe("18:00");
    expect(kolkata.timeZone).toBe("America/New_York");
    expect(kolkata.viewerTimeZone).toBe("Asia/Kolkata");

    // Late-evening London projection stays on the same viewer date.
    const london = projectSlotPlannerOccurrenceToZone(
      occurrence,
      "Europe/London",
    );

    expect(london.viewerDate).toBe("2026-07-08");
    expect(london.viewerStartTime).toBe("23:00");
    // 23:00 + 60 min crosses viewer midnight.
    expect(london.viewerEndTime).toBe("00:00");
  });

  it("projects on instants across the provider-zone DST boundary", () => {
    // 09:00 Europe/London weekly over the 2026-10-25 DST end, viewed from
    // America/New_York (whose own DST ends a week later, on 2026-11-01).
    const dstSeries = findSampleSlot("autumn-dst-spanning-clinic");
    const occurrences = expandSlotOccurrences(
      dstSeries,
      "2026-10-18",
      "2026-11-08",
      "2026-10-01T00:00:00Z",
    );
    const projected = occurrences.map((occurrence) =>
      projectSlotPlannerOccurrenceToZone(occurrence, "America/New_York"),
    );

    expect(
      projected.map((occurrence) => [
        occurrence.viewerDate,
        occurrence.viewerStartTime,
      ]),
    ).toEqual([
      ["2026-10-18", "04:00"], // London BST (+1), New York EDT (-4)
      ["2026-10-25", "05:00"], // London GMT (+0), New York still EDT (-4)
      ["2026-11-01", "04:00"], // both zones off DST
      ["2026-11-08", "04:00"],
    ]);
    // The provider wall clock never moves.
    for (const occurrence of projected) {
      expect(occurrence.startTime).toBe("09:00");
    }
  });
});

describe("expandSlotsForViewerZone", () => {
  it("buckets occurrences by viewer-zone date, catching cross-date shifts", () => {
    const byViewerDate = expandSlotsForViewerZone(
      slotPlannerSampleSlots,
      "2026-07-06",
      "2026-07-12",
      NOW,
      "Asia/Kolkata",
    );

    // wed-group-systems starts 17:00 America/New_York on Jul 8, which is
    // 02:30 IST on Jul 9 — it must land on the viewer's Thursday.
    expect(
      byViewerDate["2026-07-09"]?.map((occurrence) => occurrence.slotId),
    ).toContain("wed-group-systems");
    expect(
      byViewerDate["2026-07-08"]?.map((occurrence) => occurrence.slotId) ?? [],
    ).not.toContain("wed-group-systems");
  });

  it("excludes draft and cancelled occurrences entirely", () => {
    const byViewerDate = expandSlotsForViewerZone(
      slotPlannerSampleSlots,
      "2026-07-13",
      "2026-07-19",
      NOW,
      "Europe/London",
    );
    const slotIds = Object.values(byViewerDate)
      .flat()
      .map((occurrence) => occurrence.slotId);

    expect(slotIds).not.toContain("draft-new-offering");
    expect(slotIds).not.toContain("cancelled-office-hours");
  });

  it("sorts each viewer day by instant, not provider wall clock", () => {
    const slots: SlotPlannerSlotData[] = [
      {
        id: "late-london",
        date: "2026-07-08",
        startTime: "20:00",
        durationMinutes: 30,
        timeZone: "Europe/London",
        state: "requestable",
      },
      {
        id: "afternoon-new-york",
        date: "2026-07-08",
        startTime: "13:00",
        durationMinutes: 30,
        timeZone: "America/New_York",
        state: "requestable",
      },
    ];
    // In UTC: London 20:00 is 19:00Z; New York 13:00 is 17:00Z — the lower
    // provider wall-clock time is the later instant's neighbour flipped.
    const byViewerDate = expandSlotsForViewerZone(
      slots,
      "2026-07-06",
      "2026-07-12",
      NOW,
      "UTC",
    );

    expect(
      byViewerDate["2026-07-08"]?.map((occurrence) => occurrence.slotId),
    ).toEqual(["afternoon-new-york", "late-london"]);
  });
});
