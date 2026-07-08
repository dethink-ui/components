import { CalendarDate } from "@internationalized/date";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  DateRangePicker,
  getDateRangePickerFieldNames,
  serializeDateRangePickerValue,
} from ".";

function getCalendarCell(grid: HTMLElement, day: string) {
  return Array.from(
    grid.querySelectorAll<HTMLElement>(
      '[data-slot="date-range-picker-calendar-cell"]',
    ),
  ).find((cell) => cell.textContent === day);
}

describe("DateRangePicker", () => {
  it("serializes date range values and field names", () => {
    expect(serializeDateRangePickerValue(null)).toBe("");
    expect(serializeDateRangePickerValue(new CalendarDate(2026, 7, 3))).toBe(
      "2026-07-03",
    );
    expect(getDateRangePickerFieldNames({ name: "reportRange" })).toEqual({
      endName: "reportRangeEnd",
      startName: "reportRangeStart",
    });
    expect(
      getDateRangePickerFieldNames({
        endName: "to",
        name: "reportRange",
        startName: "from",
      }),
    ).toEqual({ endName: "to", startName: "from" });
  });

  it("renders segmented range fields with label, description, and form values", () => {
    const { container } = render(
      <DateRangePicker
        label="Report range"
        description="Choose the exported report window."
        name="reportRange"
        value={{
          end: new CalendarDate(2026, 7, 10),
          start: new CalendarDate(2026, 7, 3),
        }}
      />,
    );

    expect(screen.getByText("Report range")).toBeInTheDocument();
    expect(
      screen.getByText("Choose the exported report window."),
    ).toBeInTheDocument();
    expect(
      container.querySelector('[data-slot="date-range-picker"]'),
    ).toBeTruthy();
    expect(
      container.querySelectorAll(
        '[data-slot="date-range-picker-start-segment"]',
      ).length,
    ).toBeGreaterThan(2);
    expect(
      container.querySelectorAll('[data-slot="date-range-picker-end-segment"]')
        .length,
    ).toBeGreaterThan(2);
    expect(
      container.querySelector<HTMLInputElement>(
        'input[type="hidden"][name="reportRangeStart"]',
      ),
    ).toHaveValue("2026-07-03");
    expect(
      container.querySelector<HTMLInputElement>(
        'input[type="hidden"][name="reportRangeEnd"]',
      ),
    ).toHaveValue("2026-07-10");
  });

  it("supports controlled clearing through onValueChange", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <DateRangePicker
        clearable
        label="Report range"
        value={{
          end: new CalendarDate(2026, 7, 10),
          start: new CalendarDate(2026, 7, 3),
        }}
        onValueChange={onValueChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Clear date range" }));

    expect(onValueChange).toHaveBeenCalledWith(null);
  });

  it("updates uncontrolled form serialization when cleared", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <DateRangePicker
        clearable
        defaultValue={{
          end: new CalendarDate(2026, 7, 10),
          start: new CalendarDate(2026, 7, 3),
        }}
        label="Report range"
        startName="from"
        endName="to"
      />,
    );

    const startInput = container.querySelector<HTMLInputElement>(
      'input[type="hidden"][name="from"]',
    );
    const endInput = container.querySelector<HTMLInputElement>(
      'input[type="hidden"][name="to"]',
    );
    expect(startInput).toHaveValue("2026-07-03");
    expect(endInput).toHaveValue("2026-07-10");

    await user.click(screen.getByRole("button", { name: "Clear date range" }));

    expect(startInput).toHaveValue("");
    expect(endInput).toHaveValue("");
  });

  it("renders disabled, read only, required, and invalid states", () => {
    const { container } = render(
      <DateRangePicker
        disabled
        errorMessage="Choose a valid range."
        invalid
        label="Report range"
        readOnly
        required
        value={{
          end: new CalendarDate(2026, 7, 10),
          start: new CalendarDate(2026, 7, 3),
        }}
      />,
    );

    const root = container.querySelector('[data-slot="date-range-picker"]');
    const field = container.querySelector(
      '[data-slot="date-range-picker-field"]',
    );

    expect(root).toHaveAttribute("data-disabled", "true");
    expect(root).toHaveAttribute("data-readonly", "true");
    expect(root).toHaveAttribute("data-required", "true");
    expect(root).toHaveAttribute("data-invalid", "true");
    expect(field).toHaveAttribute("data-disabled", "true");
    expect(field).toHaveAttribute("data-invalid", "true");
    expect(screen.getByText("Choose a valid range.")).toBeInTheDocument();
  });

  it("opens the range calendar popover from the trigger", async () => {
    const user = userEvent.setup();

    render(
      <DateRangePicker
        label="Report range"
        value={{
          end: new CalendarDate(2026, 7, 10),
          start: new CalendarDate(2026, 7, 3),
        }}
      />,
    );

    await user.click(screen.getByRole("button", { name: /Open calendar/ }));

    expect(screen.getByRole("grid")).toBeInTheDocument();
    expect(screen.getAllByText(/July 2026/).length).toBeGreaterThan(0);

    const grid = screen.getByRole("grid");
    const day3 = getCalendarCell(grid, "3");
    const day4 = getCalendarCell(grid, "4");
    const day10 = getCalendarCell(grid, "10");

    expect(day3).toHaveClass("data-[selection-start]:bg-primary");
    expect(day4).toHaveClass("data-[selected]:bg-primary/15");
    expect(day10).toHaveClass("data-[selection-end]:bg-primary");
  });

  it("selects date ranges", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <DateRangePicker
        label="Report range"
        defaultValue={{
          end: new CalendarDate(2026, 7, 10),
          start: new CalendarDate(2026, 7, 3),
        }}
        onValueChange={onValueChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: /Open calendar/ }));
    const grid = screen.getByRole("grid");
    const day12 = getCalendarCell(grid, "12");
    const day14 = getCalendarCell(grid, "14");

    expect(day12).toBeTruthy();
    expect(day14).toBeTruthy();

    await user.click(day12!);
    await user.click(day14!);

    expect(onValueChange).toHaveBeenLastCalledWith({
      end: expect.objectContaining({ day: 14, month: 7, year: 2026 }),
      start: expect.objectContaining({ day: 12, month: 7, year: 2026 }),
    });
  });

  it("renders constrained and unavailable range dates", async () => {
    const user = userEvent.setup();

    render(
      <DateRangePicker
        label="Report range"
        minValue={new CalendarDate(2026, 7, 10)}
        maxValue={new CalendarDate(2026, 7, 20)}
        value={{
          end: new CalendarDate(2026, 7, 14),
          start: new CalendarDate(2026, 7, 12),
        }}
        isDateUnavailable={(date) => date.day === 15}
      />,
    );

    await user.click(screen.getByRole("button", { name: /Open calendar/ }));

    const grid = screen.getByRole("grid");
    const day9 = getCalendarCell(grid, "9");
    const day15 = getCalendarCell(grid, "15");

    expect(day9).toHaveAttribute("data-disabled", "true");
    expect(day15).toHaveAttribute("data-unavailable", "true");
  });

  it("closes the popover with Escape and returns focus to the trigger", async () => {
    const user = userEvent.setup();

    render(
      <DateRangePicker
        label="Report range"
        value={{
          end: new CalendarDate(2026, 7, 10),
          start: new CalendarDate(2026, 7, 3),
        }}
      />,
    );

    const trigger = screen.getByRole("button", { name: /Open calendar/ });

    await user.click(trigger);
    expect(screen.getByRole("grid")).toBeInTheDocument();

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("composes className and locale settings", () => {
    const { container } = render(
      <DateRangePicker
        className="custom-date-range-picker"
        label="Report range"
        locale="en-GB"
        value={{
          end: new CalendarDate(2026, 7, 10),
          start: new CalendarDate(2026, 7, 3),
        }}
        weekStartsOn="mon"
      />,
    );

    expect(
      container.querySelector('[data-slot="date-range-picker"]'),
    ).toHaveClass("custom-date-range-picker");
  });
});
