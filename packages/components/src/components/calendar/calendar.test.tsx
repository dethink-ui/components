import { CalendarDate } from "@internationalized/date";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Calendar, RangeCalendar } from ".";

function getCalendarCell(container: HTMLElement, slot: string, day: string) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(`[data-slot="${slot}"]`),
  ).find((cell) => cell.textContent === day);
}

describe("Calendar", () => {
  it("renders a selected date with Dethink calendar slots", () => {
    const { container } = render(
      <Calendar
        aria-label="Billing date"
        value={new CalendarDate(2026, 7, 3)}
      />,
    );

    expect(container.querySelector('[data-slot="calendar"]')).toBeTruthy();
    expect(container.querySelector('[data-slot="calendar-grid"]')).toBeTruthy();
    expect(container.querySelector('[data-slot="calendar-panel"]')).toHaveClass(
      "min-h-64",
      "w-64",
    );
    expect(screen.getAllByText(/July 2026/).length).toBeGreaterThan(0);

    const day3 = getCalendarCell(container, "calendar-cell", "3");

    expect(day3).toHaveAttribute("data-selected", "true");
    expect(day3).toHaveClass("flex", "items-center", "justify-center");
  });

  it("emits value changes for date selection", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(
      <Calendar
        aria-label="Billing date"
        value={new CalendarDate(2026, 7, 3)}
        onValueChange={onValueChange}
      />,
    );

    const day4 = getCalendarCell(container, "calendar-cell", "4");

    expect(day4).toBeTruthy();

    await user.click(day4!);

    expect(onValueChange).toHaveBeenCalledWith(
      expect.objectContaining({ day: 4, month: 7, year: 2026 }),
    );
  });

  it("switches between month and year picker modes from the heading", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Calendar
        aria-label="Billing date"
        value={new CalendarDate(2026, 7, 3)}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: /Choose month, current July/ }),
    );

    expect(
      container.querySelector('[data-slot="calendar-month-picker"]'),
    ).toHaveClass("h-full", "grid-rows-4");
    expect(container.querySelector('[data-slot="calendar-panel"]')).toHaveClass(
      "min-h-64",
      "w-64",
      "items-stretch",
    );
    expect(screen.getByRole("button", { name: "Sep" })).toHaveClass("h-full");
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Sep" }));

    expect(
      screen.getByRole("button", { name: /Choose month, current September/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole("grid")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /Choose year, current 2026/ }),
    );

    expect(
      container.querySelector('[data-slot="calendar-year-picker"]'),
    ).toHaveClass("h-full", "grid-rows-4");
    expect(container.querySelector('[data-slot="calendar-panel"]')).toHaveClass(
      "min-h-64",
      "w-64",
      "items-stretch",
    );
    expect(screen.getByRole("button", { name: "2028" })).toHaveClass(
      "h-full",
    );

    await user.click(screen.getByRole("button", { name: "2028" }));

    expect(
      container.querySelector('[data-slot="calendar-month-picker"]'),
    ).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Oct" }));

    expect(
      screen.getByRole("button", { name: /Choose month, current October/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Choose year, current 2028/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole("grid")).toBeInTheDocument();
  });

  it("marks constrained and unavailable dates", () => {
    const { container } = render(
      <Calendar
        aria-label="Deployment date"
        minValue={new CalendarDate(2026, 7, 10)}
        maxValue={new CalendarDate(2026, 7, 20)}
        value={new CalendarDate(2026, 7, 12)}
        isDateUnavailable={(date) => date.day === 15}
      />,
    );

    const day9 = getCalendarCell(container, "calendar-cell", "9");
    const day15 = getCalendarCell(container, "calendar-cell", "15");

    expect(day9).toHaveAttribute("data-disabled", "true");
    expect(day15).toHaveAttribute("data-unavailable", "true");
  });

  it("composes className and locale direction settings", () => {
    const { container } = render(
      <Calendar
        aria-label="Support date"
        className="custom-calendar"
        dir="rtl"
        locale="ar-AE"
        value={new CalendarDate(2026, 7, 3)}
        weekStartsOn="sat"
      />,
    );

    const root = container.querySelector('[data-slot="calendar"]');

    expect(root).toHaveClass("custom-calendar");
    expect(root).toHaveAttribute("dir", "rtl");
  });
});

describe("RangeCalendar", () => {
  it("renders selected range boundaries with Dethink range slots", () => {
    const { container } = render(
      <RangeCalendar
        aria-label="Report range"
        value={{
          end: new CalendarDate(2026, 7, 10),
          start: new CalendarDate(2026, 7, 3),
        }}
      />,
    );

    expect(container.querySelector('[data-slot="range-calendar"]')).toBeTruthy();
    expect(
      container.querySelector('[data-slot="range-calendar-grid"]'),
    ).toBeTruthy();

    const day3 = getCalendarCell(container, "range-calendar-cell", "3");
    const day10 = getCalendarCell(container, "range-calendar-cell", "10");

    expect(day3).toHaveAttribute("data-selection-start", "true");
    expect(day10).toHaveAttribute("data-selection-end", "true");
    expect(day3).toHaveClass("flex", "items-center", "justify-center");
    expect(day10).toHaveClass("flex", "items-center", "justify-center");
  });

  it("emits value changes for range selection", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(
      <RangeCalendar
        aria-label="Report range"
        defaultFocusedValue={new CalendarDate(2026, 7, 1)}
        onValueChange={onValueChange}
      />,
    );

    const day3 = getCalendarCell(container, "range-calendar-cell", "3");
    const day10 = getCalendarCell(container, "range-calendar-cell", "10");

    expect(day3).toBeTruthy();
    expect(day10).toBeTruthy();

    await user.click(day3!);
    await user.click(day10!);

    expect(onValueChange).toHaveBeenLastCalledWith({
      end: expect.objectContaining({ day: 10, month: 7, year: 2026 }),
      start: expect.objectContaining({ day: 3, month: 7, year: 2026 }),
    });
  });

  it("marks invalid, disabled, constrained, and unavailable range dates", () => {
    const { container } = render(
      <RangeCalendar
        aria-label="Report range"
        disabled
        invalid
        minValue={new CalendarDate(2026, 7, 10)}
        maxValue={new CalendarDate(2026, 7, 20)}
        value={{
          end: new CalendarDate(2026, 7, 14),
          start: new CalendarDate(2026, 7, 12),
        }}
        isDateUnavailable={(date) => date.day === 15}
      />,
    );

    const root = container.querySelector('[data-slot="range-calendar"]');
    const day9 = getCalendarCell(container, "range-calendar-cell", "9");
    const day15 = getCalendarCell(container, "range-calendar-cell", "15");

    expect(root).toHaveAttribute("data-disabled", "true");
    expect(root).toHaveAttribute("data-invalid", "true");
    expect(day9).toHaveAttribute("data-disabled", "true");
    expect(day15).toHaveAttribute("data-unavailable", "true");
  });
});
