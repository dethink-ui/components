import { parseDateTime, parseZonedDateTime } from "@internationalized/date";
import { describe, expect, it } from "vitest";
import {
  getDateTimePickerPlaceholderValue,
  getDateTimePickerTimeInputStep,
  getDateTimePickerTimeInputValue,
  getDateTimePickerTimeInputValueChange,
  getDateTimePickerTimeOptionValue,
  getDateTimePickerTimeOptions,
  getDateTimePickerTimeZone,
  hasTimeZone,
  isDateTimePickerTimeOptionSelected,
  serializeDateTimePickerValue,
} from ".";

describe("DateTimePicker utilities", () => {
  it("serializes empty, local, and zoned values", () => {
    expect(serializeDateTimePickerValue(null)).toBe("");
    expect(serializeDateTimePickerValue(undefined)).toBe("");
    expect(
      serializeDateTimePickerValue(parseDateTime("2026-01-12T09:30")),
    ).toBe("2026-01-12T09:30:00");
    expect(
      serializeDateTimePickerValue(
        parseZonedDateTime("2026-01-12T09:30[America/New_York]"),
      ),
    ).toBe("2026-01-12T09:30:00-05:00[America/New_York]");
  });

  it("detects and resolves timezone labels", () => {
    const localValue = parseDateTime("2026-01-12T09:30");
    const zonedValue = parseZonedDateTime("2026-01-12T09:30[Europe/London]");

    expect(hasTimeZone(localValue)).toBe(false);
    expect(hasTimeZone(zonedValue)).toBe(true);
    expect(getDateTimePickerTimeZone(localValue, undefined)).toBeNull();
    expect(getDateTimePickerTimeZone(zonedValue, undefined)).toBe(
      "Europe/London",
    );
    expect(getDateTimePickerTimeZone(localValue, "UTC")).toBe("UTC");
  });

  it("uses a zoned placeholder only when a timezone is configured without a value", () => {
    expect(
      getDateTimePickerPlaceholderValue({
        timeZone: "UTC",
        value: parseDateTime("2026-01-12T09:30"),
      }),
    ).toBeUndefined();
    expect(
      getDateTimePickerPlaceholderValue({
        defaultValue: parseDateTime("2026-01-12T09:30"),
        timeZone: "UTC",
      }),
    ).toBeUndefined();
    expect(
      getDateTimePickerPlaceholderValue({
        timeZone: "UTC",
      })?.timeZone,
    ).toBe("UTC");
  });

  it("generates labelled time options from granularity and step settings", () => {
    expect(getDateTimePickerTimeOptions({ granularity: "hour" })).toHaveLength(
      24,
    );
    expect(getDateTimePickerTimeOptions({ step: 30 })).toHaveLength(48);
    expect(
      getDateTimePickerTimeOptions({ hourCycle: 12, step: 60 }).slice(0, 3),
    ).toEqual([
      { hour: 0, label: "12:00 AM", minute: 0, second: 0 },
      { hour: 1, label: "1:00 AM", minute: 0, second: 0 },
      { hour: 2, label: "2:00 AM", minute: 0, second: 0 },
    ]);
  });

  it("applies time options without changing the date value type", () => {
    const localValue = parseDateTime("2026-01-12T09:30");
    const zonedValue = parseZonedDateTime("2026-01-12T09:30[Europe/London]");

    expect(
      getDateTimePickerTimeOptionValue(localValue, {
        hour: 14,
        minute: 45,
      }).toString(),
    ).toBe("2026-01-12T14:45:00");
    expect(
      getDateTimePickerTimeOptionValue(zonedValue, {
        hour: 14,
        minute: 45,
      }).toString(),
    ).toBe("2026-01-12T14:45:00+00:00[Europe/London]");
  });

  it("formats exact time input values by granularity", () => {
    const value = parseDateTime("2026-01-12T09:30:15");

    expect(getDateTimePickerTimeInputStep("hour")).toBe(3600);
    expect(getDateTimePickerTimeInputStep("minute")).toBe(60);
    expect(getDateTimePickerTimeInputStep("second")).toBe(1);
    expect(
      getDateTimePickerTimeInputValue({ granularity: "hour", value }),
    ).toBe("09:00");
    expect(
      getDateTimePickerTimeInputValue({ granularity: "minute", value }),
    ).toBe("09:30");
    expect(
      getDateTimePickerTimeInputValue({ granularity: "second", value }),
    ).toBe("09:30:15");
  });

  it("applies exact time input values without changing the date value type", () => {
    const localValue = parseDateTime("2026-01-12T09:30");
    const zonedValue = parseZonedDateTime("2026-01-12T09:30[Europe/London]");

    expect(
      getDateTimePickerTimeInputValueChange({
        inputValue: "05:10",
        value: localValue,
      })?.toString(),
    ).toBe("2026-01-12T05:10:00");
    expect(
      getDateTimePickerTimeInputValueChange({
        granularity: "second",
        inputValue: "05:10:45",
        value: zonedValue,
      })?.toString(),
    ).toBe("2026-01-12T05:10:45+00:00[Europe/London]");
    expect(
      getDateTimePickerTimeInputValueChange({
        inputValue: "25:10",
        value: localValue,
      }),
    ).toBeNull();
  });

  it("detects selected time options by granularity", () => {
    const value = parseDateTime("2026-01-12T09:30:15");

    expect(
      isDateTimePickerTimeOptionSelected({
        granularity: "hour",
        option: { hour: 9, minute: 0 },
        value,
      }),
    ).toBe(true);
    expect(
      isDateTimePickerTimeOptionSelected({
        granularity: "minute",
        option: { hour: 9, minute: 30 },
        value,
      }),
    ).toBe(true);
    expect(
      isDateTimePickerTimeOptionSelected({
        granularity: "second",
        option: { hour: 9, minute: 30, second: 15 },
        value,
      }),
    ).toBe(true);
  });
});
