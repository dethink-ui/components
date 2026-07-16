import { describe, expect, it } from "vitest";
import {
  countSlotPlannerPublishedOccurrences,
  defaultSlotPlannerTaxonomy,
  validateSlotPlannerSlot,
  validateSlotPlannerSlots,
  type SlotPlannerConstraints,
  type SlotPlannerSlotData,
  type SlotPlannerValidationContext,
  type SlotPlannerViolation,
  type SlotPlannerViolationCode,
} from ".";

// Instant-anchored "now" (Z suffix): validation derives "today" in the
// candidate slot zone, so tests are deterministic in any runner time zone.
const NOW = "2026-07-06T00:30:00Z";

const roundTrip = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

function makeSlot(
  overrides: Partial<SlotPlannerSlotData> & { id: string },
): SlotPlannerSlotData {
  return {
    date: "2026-07-08",
    startTime: "10:00",
    durationMinutes: 60,
    timeZone: "Europe/London",
    state: "requestable",
    ...overrides,
  };
}

function makeContext(
  overrides: Partial<SlotPlannerValidationContext> = {},
): SlotPlannerValidationContext {
  return { now: NOW, slots: [], ...overrides };
}

const codesOf = (violations: SlotPlannerViolation[]) =>
  violations.map((violation) => violation.code);

const findViolation = (
  violations: SlotPlannerViolation[],
  code: SlotPlannerViolationCode,
) => violations.find((violation) => violation.code === code);

describe("duration constraints", () => {
  it("violates min-duration below the minimum and passes at it", () => {
    const constraints = { minDurationMinutes: 30 };
    const short = validateSlotPlannerSlot(
      makeSlot({ id: "short", durationMinutes: 15 }),
      makeContext({ constraints }),
    );

    expect(codesOf(short)).toEqual(["min-duration"]);
    expect(findViolation(short, "min-duration")?.params).toMatchObject({
      durationMinutes: 15,
      minDurationMinutes: 30,
    });
    expect(
      validateSlotPlannerSlot(
        makeSlot({ id: "exact", durationMinutes: 30 }),
        makeContext({ constraints }),
      ),
    ).toEqual([]);
  });

  it("violates max-duration above the maximum and passes at it", () => {
    const constraints = { maxDurationMinutes: 60 };

    expect(
      codesOf(
        validateSlotPlannerSlot(
          makeSlot({ id: "long", durationMinutes: 90 }),
          makeContext({ constraints }),
        ),
      ),
    ).toEqual(["max-duration"]);
    expect(
      validateSlotPlannerSlot(
        makeSlot({ id: "exact", durationMinutes: 60 }),
        makeContext({ constraints }),
      ),
    ).toEqual([]);
  });

  it("violates duration-increment with the {increment} message token", () => {
    const constraints = { durationIncrementMinutes: 15 };
    const violations = validateSlotPlannerSlot(
      makeSlot({ id: "odd", durationMinutes: 50 }),
      makeContext({ constraints }),
    );

    expect(codesOf(violations)).toEqual(["duration-increment"]);
    expect(
      findViolation(violations, "duration-increment")?.params,
    ).toMatchObject({ durationMinutes: 50, increment: 15 });
    expect(
      validateSlotPlannerSlot(
        makeSlot({ id: "even", durationMinutes: 45 }),
        makeContext({ constraints }),
      ),
    ).toEqual([]);
  });

  it("checks override-resolved durations of recurring occurrences", () => {
    const violations = validateSlotPlannerSlot(
      makeSlot({
        id: "series",
        date: "2026-07-08",
        recurrence: {
          frequency: "weekly",
          until: "2026-07-22",
          overrides: [{ occurrenceDate: "2026-07-15", durationMinutes: 170 }],
        },
      }),
      makeContext({ constraints: { maxDurationMinutes: 90 } }),
    );

    expect(codesOf(violations)).toEqual(["max-duration"]);
  });
});

describe("notice and horizon constraints", () => {
  it("violates min-notice when the first occurrence starts too soon", () => {
    const constraints = { minNoticeMinutes: 24 * 60 };
    const soon = validateSlotPlannerSlot(
      makeSlot({ id: "soon", date: "2026-07-06" }),
      makeContext({ constraints }),
    );

    expect(codesOf(soon)).toEqual(["min-notice"]);
    expect(findViolation(soon, "min-notice")?.params).toMatchObject({
      date: "2026-07-06",
      minNoticeMinutes: 24 * 60,
    });
    expect(
      validateSlotPlannerSlot(
        makeSlot({ id: "later", date: "2026-07-10" }),
        makeContext({ constraints }),
      ),
    ).toEqual([]);
  });

  it("skips expired occurrences when evaluating min-notice", () => {
    const constraints = { minNoticeMinutes: 60 };
    // The weekly series' first occurrence (2026-07-06 00:00–01:00 London,
    // ending 00:00Z) has already expired at NOW (00:30Z); min-notice must not
    // fire on it, and the next weekly occurrence is far beyond the window.
    const violations = validateSlotPlannerSlot(
      makeSlot({
        id: "expired-first",
        date: "2026-07-06",
        startTime: "00:00",
        durationMinutes: 60,
        recurrence: { frequency: "weekly" },
      }),
      makeContext({ constraints }),
    );

    expect(codesOf(violations)).not.toContain("min-notice");
  });

  it("violates booking-horizon for occurrences beyond the horizon", () => {
    const constraints = { bookingHorizonDays: 2 };
    const beyond = validateSlotPlannerSlot(
      makeSlot({ id: "beyond", date: "2026-07-12" }),
      makeContext({ constraints }),
    );

    expect(codesOf(beyond)).toEqual(["booking-horizon"]);
    expect(findViolation(beyond, "booking-horizon")?.params).toMatchObject({
      bookingHorizonDays: 2,
      date: "2026-07-12",
    });
    expect(
      validateSlotPlannerSlot(
        makeSlot({ id: "inside", date: "2026-07-06" }),
        makeContext({ constraints }),
      ),
    ).toEqual([]);
  });
});

describe("calendar constraints", () => {
  it("violates blackout-date with the offending date", () => {
    const violations = validateSlotPlannerSlot(
      makeSlot({ id: "blackout" }),
      makeContext({ constraints: { blackoutDates: ["2026-07-08"] } }),
    );

    expect(codesOf(violations)).toEqual(["blackout-date"]);
    expect(findViolation(violations, "blackout-date")?.params).toMatchObject({
      date: "2026-07-08",
    });
  });

  it("violates non-working-day using ISO weekday numbers (1 = Monday)", () => {
    // 2026-07-12 is a Sunday (ISO weekday 7).
    const constraints: SlotPlannerConstraints = {
      workingDays: [1, 2, 3, 4, 5],
    };
    const sunday = validateSlotPlannerSlot(
      makeSlot({ id: "sunday", date: "2026-07-12" }),
      makeContext({ constraints }),
    );

    expect(codesOf(sunday)).toEqual(["non-working-day"]);
    expect(findViolation(sunday, "non-working-day")?.params).toMatchObject({
      date: "2026-07-12",
      weekday: 7,
    });
    // 2026-07-06 is a Monday (ISO weekday 1).
    expect(
      validateSlotPlannerSlot(
        makeSlot({ id: "monday", date: "2026-07-06" }),
        makeContext({ constraints: { workingDays: [1] } }),
      ),
    ).toEqual([]);
  });
});

describe("overlap", () => {
  it("detects overlap across time zones at the same instant", () => {
    // 09:00 America/New_York (EDT, UTC-4) and 14:30 Europe/London (BST,
    // UTC+1) on 2026-07-08 are 13:00Z–14:00Z and 13:30Z–14:30Z.
    const newYork = makeSlot({
      id: "new-york",
      startTime: "09:00",
      timeZone: "America/New_York",
    });
    const violations = validateSlotPlannerSlot(
      makeSlot({ id: "london", startTime: "14:30" }),
      makeContext({ slots: [newYork] }),
    );

    expect(codesOf(violations)).toEqual(["overlap"]);
    expect(findViolation(violations, "overlap")?.params).toMatchObject({
      date: "2026-07-08",
      otherSlotId: "new-york",
    });
  });

  it("detects a same-instant overlap two ISO dates apart across extreme zones", () => {
    // One instant, 2026-07-07T11:00Z, lands on 2026-07-08 in UTC+14 and on
    // 2026-07-06 in UTC-12 — two calendar dates apart. The neighbor window
    // must span ±2 days (the shared cross-zone pad) to catch it.
    const farWest = makeSlot({
      id: "far-west",
      date: "2026-07-06",
      startTime: "23:00",
      timeZone: "Etc/GMT+12",
    });
    const violations = validateSlotPlannerSlot(
      makeSlot({
        id: "far-east",
        date: "2026-07-08",
        startTime: "01:00",
        timeZone: "Pacific/Kiritimati",
      }),
      makeContext({ slots: [farWest] }),
    );

    expect(codesOf(violations)).toEqual(["overlap"]);
    expect(findViolation(violations, "overlap")?.params).toMatchObject({
      otherSlotId: "far-west",
    });
  });

  it("is buffer-aware on both sides", () => {
    const existing = makeSlot({ id: "existing", startTime: "10:00" });

    // 11:30 clears a 10:00–11:00 slot…
    expect(
      validateSlotPlannerSlot(
        makeSlot({ id: "clear", startTime: "11:30" }),
        makeContext({ slots: [existing] }),
      ),
    ).toEqual([]);
    // …but not with a 45-minute buffer before the candidate.
    expect(
      codesOf(
        validateSlotPlannerSlot(
          makeSlot({
            id: "buffered",
            startTime: "11:30",
            bufferBeforeMinutes: 45,
          }),
          makeContext({ slots: [existing] }),
        ),
      ),
    ).toEqual(["overlap"]);
    // The existing slot's trailing buffer counts too.
    expect(
      codesOf(
        validateSlotPlannerSlot(
          makeSlot({ id: "after", startTime: "11:30" }),
          makeContext({
            slots: [makeSlot({ id: "existing", bufferAfterMinutes: 45 })],
          }),
        ),
      ),
    ).toEqual(["overlap"]);
  });

  it("ignores the candidate's own id and cancelled or expired occurrences", () => {
    // Same id: an update validates against the rest of the collection.
    expect(
      validateSlotPlannerSlot(
        makeSlot({ id: "same" }),
        makeContext({ slots: [makeSlot({ id: "same" })] }),
      ),
    ).toEqual([]);
    // Cancelled series occupy no time.
    expect(
      validateSlotPlannerSlot(
        makeSlot({ id: "candidate" }),
        makeContext({ slots: [makeSlot({ id: "gone", state: "cancelled" })] }),
      ),
    ).toEqual([]);
    // Expired occurrences occupy no time either.
    expect(
      validateSlotPlannerSlot(
        makeSlot({ id: "past-candidate", date: "2026-06-29" }),
        makeContext({
          slots: [makeSlot({ id: "expired", date: "2026-06-29" })],
        }),
      ),
    ).toEqual([]);
  });
});

describe("daily and weekly caps", () => {
  it("passes at the daily cap and violates when exceeding it", () => {
    const constraints = { dailyRequestableCap: 2 };
    const existingOne = [makeSlot({ id: "a", startTime: "08:00" })];
    const existingTwo = [
      makeSlot({ id: "a", startTime: "08:00" }),
      makeSlot({ id: "b", startTime: "12:00" }),
    ];

    // 1 existing + candidate = 2 = cap: allowed.
    expect(
      validateSlotPlannerSlot(
        makeSlot({ id: "candidate", startTime: "15:00" }),
        makeContext({ constraints, slots: existingOne }),
      ),
    ).toEqual([]);

    // 2 existing + candidate = 3 > cap: violates with {cap, date}.
    const violations = validateSlotPlannerSlot(
      makeSlot({ id: "candidate", startTime: "15:00" }),
      makeContext({ constraints, slots: existingTwo }),
    );

    expect(codesOf(violations)).toEqual(["daily-cap"]);
    expect(findViolation(violations, "daily-cap")?.params).toEqual({
      cap: 2,
      date: "2026-07-08",
    });
  });

  it("counts only published occurrences against the caps", () => {
    const constraints = { dailyRequestableCap: 2 };
    const drafts = [
      makeSlot({ id: "a", startTime: "08:00", state: "draft" }),
      makeSlot({ id: "b", startTime: "12:00", state: "draft" }),
    ];

    // Draft existing slots do not count…
    expect(
      validateSlotPlannerSlot(
        makeSlot({ id: "candidate", startTime: "15:00" }),
        makeContext({ constraints, slots: drafts }),
      ),
    ).toEqual([]);
    // …and a draft candidate does not count either.
    expect(
      validateSlotPlannerSlot(
        makeSlot({ id: "candidate", startTime: "15:00", state: "draft" }),
        makeContext({
          constraints,
          slots: [
            makeSlot({ id: "a", startTime: "08:00" }),
            makeSlot({ id: "b", startTime: "12:00" }),
          ],
        }),
      ),
    ).toEqual([]);
  });

  it("passes at the weekly cap and violates when exceeding it", () => {
    const constraints = { weeklyRequestableCap: 2 };
    const monday = makeSlot({ id: "mon", date: "2026-07-06" });
    const tuesday = makeSlot({ id: "tue", date: "2026-07-07" });

    expect(
      validateSlotPlannerSlot(
        makeSlot({ id: "candidate", date: "2026-07-08" }),
        makeContext({ constraints, slots: [monday] }),
      ),
    ).toEqual([]);

    const violations = validateSlotPlannerSlot(
      makeSlot({ id: "candidate", date: "2026-07-08" }),
      makeContext({ constraints, slots: [monday, tuesday] }),
    );

    expect(codesOf(violations)).toEqual(["weekly-cap"]);
    // Monday-start week.
    expect(findViolation(violations, "weekly-cap")?.params).toEqual({
      cap: 2,
      weekStart: "2026-07-06",
    });
  });
});

describe("DST wall-clock times", () => {
  it("violates invalid-wall-clock-time for a spring-forward gap", () => {
    // Europe/London jumps 01:00 → 02:00 on 2026-03-29; 01:30 never exists.
    const violations = validateSlotPlannerSlot(
      makeSlot({ id: "gap", date: "2026-03-29", startTime: "01:30" }),
      makeContext(),
    );

    expect(codesOf(violations)).toEqual(["invalid-wall-clock-time"]);
    expect(
      findViolation(violations, "invalid-wall-clock-time")?.params,
    ).toMatchObject({
      date: "2026-03-29",
      startTime: "01:30",
      timeZone: "Europe/London",
    });
  });

  it("violates invalid-wall-clock-time for an ambiguous fall-back time", () => {
    // Europe/London leaves DST on 2026-10-25; 01:30 occurs twice.
    const violations = validateSlotPlannerSlot(
      makeSlot({ id: "ambiguous", date: "2026-10-25", startTime: "01:30" }),
      makeContext(),
    );

    expect(codesOf(violations)).toEqual(["invalid-wall-clock-time"]);
    expect(
      findViolation(violations, "invalid-wall-clock-time")?.params,
    ).toMatchObject({
      date: "2026-10-25",
      startTime: "01:30",
      timeZone: "Europe/London",
    });
  });
});

describe("recurring windows and dedup", () => {
  it("bounds the validated window to 366 days for open-ended series", () => {
    const candidate = makeSlot({
      id: "open-ended",
      date: "2026-07-06",
      recurrence: { frequency: "weekly" },
    });

    // 2027-07-12 is beyond today + 366 days (2027-07-07): out of window.
    expect(
      validateSlotPlannerSlot(
        candidate,
        makeContext({ constraints: { blackoutDates: ["2027-07-12"] } }),
      ),
    ).toEqual([]);
    // 2026-08-03 is inside the window.
    expect(
      codesOf(
        validateSlotPlannerSlot(
          candidate,
          makeContext({ constraints: { blackoutDates: ["2026-08-03"] } }),
        ),
      ),
    ).toEqual(["blackout-date"]);
  });

  it("bounds the window to the booking horizon and recurrence end", () => {
    const candidate = makeSlot({
      id: "series",
      date: "2026-07-06",
      recurrence: { frequency: "weekly" },
    });

    // 2026-08-03 is beyond a 14-day horizon ending 2026-07-20, so the
    // blackout is never reached (the boundary occurrence may legitimately
    // trip booking-horizon itself, so only the blackout absence is asserted).
    expect(
      codesOf(
        validateSlotPlannerSlot(
          candidate,
          makeContext({
            constraints: {
              blackoutDates: ["2026-08-03"],
              bookingHorizonDays: 14,
            },
          }),
        ),
      ),
    ).not.toContain("blackout-date");
    // A series ending 2026-07-13 never reaches a 2026-07-20 blackout.
    expect(
      validateSlotPlannerSlot(
        makeSlot({
          id: "ends-early",
          date: "2026-07-06",
          recurrence: { frequency: "weekly", until: "2026-07-13" },
        }),
        makeContext({ constraints: { blackoutDates: ["2026-07-20"] } }),
      ),
    ).toEqual([]);
  });

  it("reports each code once per candidate, keeping the first params", () => {
    const violations = validateSlotPlannerSlot(
      makeSlot({
        id: "series",
        date: "2026-07-06",
        recurrence: { frequency: "weekly", until: "2026-07-27" },
      }),
      makeContext({
        constraints: { blackoutDates: ["2026-07-13", "2026-07-20"] },
      }),
    );

    expect(codesOf(violations)).toEqual(["blackout-date"]);
    expect(findViolation(violations, "blackout-date")?.params).toMatchObject({
      date: "2026-07-13",
    });
  });

  it("reports every failed check, not only the first", () => {
    const violations = validateSlotPlannerSlot(
      makeSlot({ id: "many", durationMinutes: 20 }),
      makeContext({
        constraints: {
          blackoutDates: ["2026-07-08"],
          durationIncrementMinutes: 15,
          minDurationMinutes: 30,
        },
      }),
    );

    expect(codesOf(violations).sort()).toEqual([
      "blackout-date",
      "duration-increment",
      "min-duration",
    ]);
  });
});

describe("validateSlotPlannerSlots (batch)", () => {
  it("lets accepted candidates join the context for later candidates", () => {
    const first = makeSlot({ id: "first", startTime: "10:00" });
    const second = makeSlot({ id: "second", startTime: "10:30" });
    const third = makeSlot({ id: "third", startTime: "14:00" });

    const result = validateSlotPlannerSlots(
      [first, second, third],
      makeContext(),
    );

    // Only rejected ids appear; the second overlaps the accepted first.
    expect(Object.keys(result)).toEqual(["second"]);
    expect(codesOf(result["second"]!)).toEqual(["overlap"]);
    expect(result["second"]![0]!.params).toMatchObject({
      otherSlotId: "first",
    });
  });

  it("counts accepted candidates against later cap checks", () => {
    const constraints = { dailyRequestableCap: 1 };
    const result = validateSlotPlannerSlots(
      [
        makeSlot({ id: "first", startTime: "08:00" }),
        makeSlot({ id: "second", startTime: "12:00" }),
      ],
      makeContext({ constraints }),
    );

    expect(Object.keys(result)).toEqual(["second"]);
    expect(codesOf(result["second"]!)).toEqual(["daily-cap"]);
  });

  it("round-trips a violations map through JSON losslessly", () => {
    const result = validateSlotPlannerSlots(
      [
        makeSlot({ id: "gap", date: "2026-03-29", startTime: "01:30" }),
        makeSlot({ id: "short", durationMinutes: 5 }),
      ],
      makeContext({ constraints: { minDurationMinutes: 30 } }),
    );

    expect(Object.keys(result).sort()).toEqual(["gap", "short"]);
    expect(roundTrip(result)).toEqual(result);
  });
});

describe("params completeness", () => {
  it("provides every token the default violation messages interpolate", () => {
    // One scenario per violation code.
    const collected = new Map<SlotPlannerViolationCode, SlotPlannerViolation>();
    const scenarios: Array<
      [SlotPlannerSlotData, SlotPlannerValidationContext]
    > = [
      [
        makeSlot({ id: "duration", durationMinutes: 20 }),
        makeContext({
          constraints: {
            durationIncrementMinutes: 15,
            maxDurationMinutes: 15,
            minDurationMinutes: 30,
          },
        }),
      ],
      [
        makeSlot({ id: "when", date: "2026-07-06" }),
        makeContext({
          constraints: {
            blackoutDates: ["2026-07-06"],
            bookingHorizonDays: 0,
            minNoticeMinutes: 24 * 60,
            workingDays: [2],
          },
        }),
      ],
      [
        makeSlot({ id: "overlap-candidate" }),
        makeContext({ slots: [makeSlot({ id: "existing" })] }),
      ],
      [
        makeSlot({ id: "caps", startTime: "15:00" }),
        makeContext({
          constraints: { dailyRequestableCap: 0, weeklyRequestableCap: 0 },
        }),
      ],
      [
        makeSlot({ id: "gap", date: "2026-03-29", startTime: "01:30" }),
        makeContext(),
      ],
    ];

    for (const [candidate, context] of scenarios) {
      for (const violation of validateSlotPlannerSlot(candidate, context)) {
        if (!collected.has(violation.code)) {
          collected.set(violation.code, violation);
        }
      }
    }

    // Every code is produced, and every {token} its default message
    // interpolates is present in params — except the taxonomy nouns
    // {slot}/{slotPlural}, which the renderer supplies.
    for (const [code, message] of Object.entries(
      defaultSlotPlannerTaxonomy.violationMessages,
    )) {
      const violation = collected.get(code as SlotPlannerViolationCode);

      expect(violation, code).toBeDefined();

      for (const [, token] of message.matchAll(/\{(\w+)\}/g)) {
        if (token === "slot" || token === "slotPlural") {
          continue;
        }

        expect(violation!.params, `${code} -> {${token}}`).toHaveProperty(
          token!,
        );
      }
    }
  });
});

describe("countSlotPlannerPublishedOccurrences", () => {
  it("counts requestable, requested, and booked occurrences only", () => {
    const slots: SlotPlannerSlotData[] = [
      makeSlot({ id: "requestable", startTime: "08:00" }),
      makeSlot({ id: "requested", startTime: "10:00", requestedCount: 1 }),
      makeSlot({ id: "booked", startTime: "12:00", bookedCount: 1 }),
      makeSlot({ id: "draft", startTime: "14:00", state: "draft" }),
      makeSlot({ id: "blocked", startTime: "16:00", state: "blocked" }),
      makeSlot({ id: "cancelled", startTime: "18:00", state: "cancelled" }),
      makeSlot({ id: "other-day", date: "2026-07-09" }),
    ];

    expect(countSlotPlannerPublishedOccurrences(slots, "2026-07-08", NOW)).toBe(
      3,
    );
    // A recurring series counts on each occurrence date.
    expect(
      countSlotPlannerPublishedOccurrences(
        [
          makeSlot({
            id: "series",
            date: "2026-07-06",
            recurrence: { frequency: "weekly" },
          }),
        ],
        "2026-07-13",
        NOW,
      ),
    ).toBe(1);
  });
});
