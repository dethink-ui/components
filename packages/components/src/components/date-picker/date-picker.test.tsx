import { CalendarDate } from "@internationalized/date";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DatePicker, serializeDatePickerValue } from ".";

function getCalendarCell(grid: HTMLElement, day: string) {
  return Array.from(
    grid.querySelectorAll<HTMLElement>(
      '[data-slot="date-picker-calendar-cell"]',
    ),
  ).find((cell) => cell.textContent === day);
}

describe("DatePicker", () => {
  it("serializes date values", () => {
    expect(serializeDatePickerValue(null)).toBe("");
    expect(serializeDatePickerValue(new CalendarDate(2026, 7, 3))).toBe(
      "2026-07-03",
    );
  });

  it("renders a segmented date field with label, description, and form value", () => {
    const { container } = render(
      <DatePicker
        label="Invoice date"
        description="Choose the date shown on the invoice."
        name="invoiceDate"
        value={new CalendarDate(2026, 7, 3)}
      />,
    );

    expect(screen.getByText("Invoice date")).toBeInTheDocument();
    expect(
      screen.getByText("Choose the date shown on the invoice."),
    ).toBeInTheDocument();
    expect(container.querySelector('[data-slot="date-picker"]')).toBeTruthy();
    expect(
      container.querySelectorAll('[data-slot="date-picker-segment"]').length,
    ).toBeGreaterThan(2);
    expect(
      container.querySelector<HTMLInputElement>(
        'input[type="hidden"][name="invoiceDate"]',
      ),
    ).toHaveValue("2026-07-03");
  });

  it("supports controlled clearing through onValueChange", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <DatePicker
        clearable
        label="Invoice date"
        value={new CalendarDate(2026, 7, 3)}
        onValueChange={onValueChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Clear date" }));

    expect(onValueChange).toHaveBeenCalledWith(null);
  });

  it("updates uncontrolled form serialization when cleared", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <DatePicker
        clearable
        defaultValue={new CalendarDate(2026, 7, 3)}
        label="Invoice date"
        name="invoiceDate"
      />,
    );

    const input = container.querySelector<HTMLInputElement>(
      'input[type="hidden"][name="invoiceDate"]',
    );
    expect(input).toHaveValue("2026-07-03");

    await user.click(screen.getByRole("button", { name: "Clear date" }));

    expect(input).toHaveValue("");
  });

  it("renders disabled, read only, required, and invalid states", () => {
    const { container } = render(
      <DatePicker
        disabled
        errorMessage="Choose a valid date."
        invalid
        label="Review date"
        readOnly
        required
        value={new CalendarDate(2026, 7, 3)}
      />,
    );

    const root = container.querySelector('[data-slot="date-picker"]');
    const field = container.querySelector('[data-slot="date-picker-field"]');

    expect(root).toHaveAttribute("data-disabled", "true");
    expect(root).toHaveAttribute("data-readonly", "true");
    expect(root).toHaveAttribute("data-required", "true");
    expect(root).toHaveAttribute("data-invalid", "true");
    expect(field).toHaveAttribute("data-disabled", "true");
    expect(field).toHaveAttribute("data-invalid", "true");
    expect(screen.getByText("Choose a valid date.")).toBeInTheDocument();
  });

  it("opens the calendar popover from the trigger", async () => {
    const user = userEvent.setup();

    render(
      <DatePicker
        label="Invoice date"
        value={new CalendarDate(2026, 7, 3)}
      />,
    );

    await user.click(screen.getByRole("button", { name: /Open calendar/ }));

    expect(screen.getByRole("grid")).toBeInTheDocument();
    expect(screen.getAllByText(/July 2026/).length).toBeGreaterThan(0);
  });

  it("selects calendar dates", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <DatePicker
        label="Invoice date"
        value={new CalendarDate(2026, 7, 3)}
        onValueChange={onValueChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: /Open calendar/ }));
    const grid = screen.getByRole("grid");
    const day4 = getCalendarCell(grid, "4");

    expect(day4).toBeTruthy();

    await user.click(day4!);

    expect(onValueChange).toHaveBeenCalledWith(
      expect.objectContaining({
        day: 4,
        month: 7,
        year: 2026,
      }),
    );
  });

  it("selects a date after using month and year picker navigation", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <DatePicker
        label="Invoice date"
        value={new CalendarDate(2026, 7, 3)}
        onValueChange={onValueChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: /Open calendar/ }));
    await user.click(
      screen.getByRole("button", { name: /Choose year, current 2026/ }),
    );
    await user.click(screen.getByRole("button", { name: "2028" }));
    await user.click(screen.getByRole("button", { name: "Sep" }));

    const grid = screen.getByRole("grid");
    const day12 = getCalendarCell(grid, "12");

    expect(day12).toBeTruthy();

    await user.click(day12!);

    expect(onValueChange).toHaveBeenCalledWith(
      expect.objectContaining({
        day: 12,
        month: 9,
        year: 2028,
      }),
    );
  });

  it("renders constrained and unavailable calendar dates", async () => {
    const user = userEvent.setup();

    render(
      <DatePicker
        label="Invoice date"
        minValue={new CalendarDate(2026, 7, 10)}
        maxValue={new CalendarDate(2026, 7, 20)}
        value={new CalendarDate(2026, 7, 12)}
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
      <DatePicker
        label="Invoice date"
        value={new CalendarDate(2026, 7, 3)}
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
      <DatePicker
        className="custom-date-picker"
        label="Invoice date"
        locale="en-GB"
        value={new CalendarDate(2026, 7, 3)}
        weekStartsOn="mon"
      />,
    );

    expect(container.querySelector('[data-slot="date-picker"]')).toHaveClass(
      "custom-date-picker",
    );
  });
});
