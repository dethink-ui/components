import { describe, expect, it } from "vitest";
import {
  calendarDayInZone,
  createFilterEvaluationContext,
  endOfCalendarPeriod,
  formatFilterDate,
  formatFilterDuration,
  isFilterDate,
  isFilterDuration,
  resolveFilterDate,
  shiftCalendarDay,
  startOfCalendarPeriod,
  toCalendarDay,
} from ".";

describe("calendar days", () => {
  it("places instants in the requested time zone", () => {
    // 23:30 UTC on Sep 28 is already Sep 29 in Tokyo and still Sep 28 in LA.
    const late = Date.UTC(2026, 8, 28, 23, 30);

    expect(calendarDayInZone(late)).toBe("2026-09-28");
    expect(calendarDayInZone(late, "Asia/Tokyo")).toBe("2026-09-29");
    expect(calendarDayInZone(late, "America/Los_Angeles")).toBe("2026-09-28");
  });

  it("keeps the calendar day across daylight-saving changes", () => {
    // US clocks spring forward at 02:00 on Mar 8, 2026 and fall back at 02:00
    // on Nov 1, 2026. Instants either side stay on their local day.
    const zone = "America/New_York";

    expect(calendarDayInZone(Date.UTC(2026, 2, 8, 4, 59), zone)).toBe(
      "2026-03-07",
    );
    expect(calendarDayInZone(Date.UTC(2026, 2, 8, 6, 30), zone)).toBe(
      "2026-03-08",
    );
    expect(calendarDayInZone(Date.UTC(2026, 10, 2, 4, 30), zone)).toBe(
      "2026-11-01",
    );
    expect(calendarDayInZone(Date.UTC(2026, 10, 2, 5, 30), zone)).toBe(
      "2026-11-02",
    );
    // Day arithmetic ignores DST: the day after spring-forward is one step.
    expect(shiftCalendarDay("2026-03-07", 1, "day")).toBe("2026-03-08");
    expect(shiftCalendarDay("2026-11-01", 1, "day")).toBe("2026-11-02");
  });

  it("reads rows as calendar days", () => {
    expect(toCalendarDay("2026-09-28", "Asia/Tokyo")).toBe("2026-09-28");
    expect(toCalendarDay("2026-09-28T23:30:00Z", "Asia/Tokyo")).toBe(
      "2026-09-29",
    );
    expect(toCalendarDay(new Date(Date.UTC(2026, 0, 1)))).toBe("2026-01-01");
    expect(toCalendarDay(Date.UTC(2026, 0, 1))).toBe("2026-01-01");
    expect(toCalendarDay("not a date")).toBeUndefined();
    expect(toCalendarDay("2026-02-31")).toBeUndefined();
    expect(toCalendarDay(new Date(Number.NaN))).toBeUndefined();
    expect(toCalendarDay(null)).toBeUndefined();
  });

  it("shifts by calendar units and clamps to the end of the month", () => {
    expect(shiftCalendarDay("2026-09-28", -7, "day")).toBe("2026-09-21");
    expect(shiftCalendarDay("2026-09-28", 2, "week")).toBe("2026-10-12");
    expect(shiftCalendarDay("2026-01-31", 1, "month")).toBe("2026-02-28");
    expect(shiftCalendarDay("2028-01-31", 1, "month")).toBe("2028-02-29");
    expect(shiftCalendarDay("2028-02-29", 1, "year")).toBe("2029-02-28");
    expect(shiftCalendarDay("2026-03-15", -3, "month")).toBe("2025-12-15");
  });

  it("finds period bounds with a configurable week start", () => {
    // Sep 30, 2026 is a Wednesday.
    expect(startOfCalendarPeriod("2026-09-30", "week", 1)).toBe("2026-09-28");
    expect(startOfCalendarPeriod("2026-09-30", "week", 0)).toBe("2026-09-27");
    expect(endOfCalendarPeriod("2026-09-30", "week", 1)).toBe("2026-10-04");
    expect(endOfCalendarPeriod("2026-02-10", "month")).toBe("2026-02-28");
    expect(startOfCalendarPeriod("2026-09-30", "year")).toBe("2026-01-01");
    expect(endOfCalendarPeriod("2026-09-30", "year")).toBe("2026-12-31");
  });

  it("resolves relative dates against today", () => {
    expect(
      resolveFilterDate(
        { kind: "relative", amount: -7, unit: "day" },
        "2026-09-28",
      ),
    ).toBe("2026-09-21");
    expect(
      resolveFilterDate({ kind: "absolute", date: "2026-01-02" }, "2026-09-28"),
    ).toBe("2026-01-02");
  });

  it("builds an evaluation context from an injected now", () => {
    const now = Date.UTC(2026, 8, 28, 23, 30);

    expect(
      createFilterEvaluationContext({ now, timeZone: "Asia/Tokyo" }),
    ).toEqual({
      now,
      today: "2026-09-29",
      timeZone: "Asia/Tokyo",
      weekStartsOn: 1,
    });
  });

  it("recognizes and formats dates and durations", () => {
    expect(isFilterDate({ kind: "absolute", date: "2026-09-28" })).toBe(true);
    expect(isFilterDate({ kind: "absolute", date: "28/09/2026" })).toBe(false);
    expect(isFilterDate({ kind: "absolute", date: "2026-02-31" })).toBe(false);
    expect(isFilterDate({ kind: "absolute", date: "2026-13-01" })).toBe(false);
    expect(isFilterDate({ kind: "absolute", date: "2028-02-29" })).toBe(true);
    expect(isFilterDate({ kind: "absolute", date: "0099-12-31" })).toBe(true);
    expect(isFilterDate({ kind: "relative", amount: 1, unit: "hour" })).toBe(
      false,
    );
    expect(isFilterDuration({ amount: 7, unit: "day" })).toBe(true);
    expect(isFilterDuration({ amount: -1, unit: "day" })).toBe(false);
    expect(formatFilterDate({ kind: "relative", amount: 0, unit: "day" })).toBe(
      "today",
    );
    expect(
      formatFilterDate({ kind: "relative", amount: -7, unit: "day" }),
    ).toBe("7 days ago");
    expect(
      formatFilterDate({ kind: "relative", amount: -1, unit: "week" }),
    ).toBe("1 week ago");
    expect(formatFilterDate({ kind: "absolute", date: "2026-09-28" })).toBe(
      "Sep 28, 2026",
    );
    expect(formatFilterDuration({ amount: 3, unit: "month" })).toBe("3 months");
  });
});
