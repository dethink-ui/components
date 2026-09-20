import {
  CalendarDate,
  parseDateTime,
  parseZonedDateTime,
} from "@internationalized/date";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DateTimePicker } from ".";

function getCalendarCell(grid: HTMLElement, day: string) {
  return Array.from(
    grid.querySelectorAll<HTMLElement>(
      '[data-slot="date-time-picker-calendar-cell"]',
    ),
  ).find((cell) => cell.textContent === day);
}

function getDateTimeSegment(container: HTMLElement, type: string) {
  const segment = container.querySelector<HTMLElement>(
    `[data-slot="date-time-picker-segment"][data-segment="${type}"]`,
  );

  expect(segment).toBeTruthy();

  return segment!;
}

describe("DateTimePicker", () => {
  it("renders a segmented field with label, description, and form value", () => {
    const { container } = render(
      <DateTimePicker
        label="Starts at"
        description="Choose the launch window."
        name="startsAt"
        value={parseDateTime("2026-01-12T09:30")}
      />,
    );

    expect(screen.getByText("Starts at")).toBeInTheDocument();
    expect(screen.getByText("Choose the launch window.")).toBeInTheDocument();
    expect(
      container.querySelector('[data-slot="date-time-picker"]'),
    ).toBeTruthy();
    expect(
      container.querySelectorAll('[data-slot="date-time-picker-segment"]')
        .length,
    ).toBeGreaterThan(4);
    expect(
      container.querySelector<HTMLInputElement>(
        'input[type="hidden"][name="startsAt"]',
      ),
    ).toHaveValue("2026-01-12T09:30:00");
  });

  it("supports controlled clearing through onValueChange", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <DateTimePicker
        clearable
        label="Deploy at"
        value={parseDateTime("2026-02-03T14:45")}
        onValueChange={onValueChange}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Clear date and time" }),
    );

    expect(onValueChange).toHaveBeenCalledWith(null);
  });

  it("updates uncontrolled form serialization when cleared", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <DateTimePicker
        clearable
        defaultValue={parseDateTime("2026-03-18T10:15")}
        label="Release at"
        name="releaseAt"
      />,
    );

    const input = container.querySelector<HTMLInputElement>(
      'input[type="hidden"][name="releaseAt"]',
    );
    expect(input).toHaveValue("2026-03-18T10:15:00");

    await user.click(
      screen.getByRole("button", { name: "Clear date and time" }),
    );

    expect(input).toHaveValue("");
  });

  it("renders disabled, read only, required, and invalid states", () => {
    const { container } = render(
      <DateTimePicker
        disabled
        errorMessage="Choose a valid time."
        invalid
        label="Review at"
        readOnly
        required
        value={parseDateTime("2026-04-04T11:00")}
      />,
    );

    const root = container.querySelector('[data-slot="date-time-picker"]');
    const field = container.querySelector(
      '[data-slot="date-time-picker-field"]',
    );

    expect(root).toHaveAttribute("data-disabled", "true");
    expect(root).toHaveAttribute("data-readonly", "true");
    expect(root).toHaveAttribute("data-required", "true");
    expect(root).toHaveAttribute("data-invalid", "true");
    expect(field).toHaveAttribute("data-disabled", "true");
    expect(field).toHaveAttribute("data-invalid", "true");
    expect(screen.getByText("Choose a valid time.")).toBeInTheDocument();
  });

  it("shows a timezone label for zoned values and configured timezones", () => {
    const { rerender } = render(
      <DateTimePicker
        label="Event time"
        value={parseZonedDateTime("2026-01-12T09:30[America/New_York]")}
      />,
    );

    expect(screen.getByText("America/New_York")).toBeInTheDocument();

    rerender(
      <DateTimePicker
        label="Event time"
        timeZone="UTC"
        value={parseDateTime("2026-01-12T09:30")}
      />,
    );

    expect(screen.getByText("UTC")).toBeInTheDocument();

    rerender(
      <DateTimePicker
        hideTimeZone
        label="Event time"
        value={parseZonedDateTime("2026-01-12T09:30[America/New_York]")}
      />,
    );

    expect(screen.queryByText("America/New_York")).not.toBeInTheDocument();
  });

  it("opens calendar and time controls together by default", async () => {
    const user = userEvent.setup();

    render(
      <DateTimePicker
        label="Starts at"
        value={parseDateTime("2026-01-12T09:30")}
      />,
    );

    await user.click(screen.getByRole("button", { name: /Open calendar/ }));

    expect(screen.getByRole("grid")).toBeInTheDocument();
    expect(screen.getAllByText(/January 2026/).length).toBeGreaterThan(0);
    expect(screen.getByRole("group", { name: "Time" })).toBeInTheDocument();
  });

  it("supports opting out of the visible time selector", async () => {
    const user = userEvent.setup();

    render(
      <DateTimePicker
        label="Starts at"
        timeSelector={false}
        value={parseDateTime("2026-01-12T09:30")}
      />,
    );

    await user.click(screen.getByRole("button", { name: /Open calendar/ }));

    expect(screen.getByRole("grid")).toBeInTheDocument();
    expect(
      screen.queryByRole("group", { name: "Time" }),
    ).not.toBeInTheDocument();
  });

  it("opens and focuses time controls from the clock trigger and restores focus on Done", async () => {
    const user = userEvent.setup();
    render(
      <DateTimePicker
        label="Starts at"
        defaultValue={parseDateTime("2026-01-12T09:30")}
      />,
    );
    const trigger = screen.getByRole("button", { name: "Open time picker" });
    await user.click(trigger);
    expect(screen.getByRole("grid")).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Exact time" })).toContainElement(
      document.activeElement as HTMLElement,
    );
    await user.click(screen.getByRole("button", { name: "Done" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("selects calendar dates while preserving the time portion", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <DateTimePicker
        label="Starts at"
        value={parseDateTime("2026-01-12T09:30")}
        onValueChange={onValueChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: /Open calendar/ }));
    const grid = screen.getByRole("grid");
    const day13 = getCalendarCell(grid, "13");

    expect(day13).toBeTruthy();

    await user.click(day13!);
    expect(screen.getByRole("group", { name: "Time" })).toBeInTheDocument();

    expect(onValueChange).toHaveBeenCalledWith(
      expect.objectContaining({
        day: 13,
        hour: 9,
        minute: 30,
      }),
    );
  });

  it("accepts arbitrary minutes through keyboard editing in the time panel", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <DateTimePicker
        label="Starts at"
        hourCycle={24}
        defaultValue={parseDateTime("2026-01-12T09:30")}
        onValueChange={onValueChange}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Open time picker" }));
    const field = within(screen.getByRole("group", { name: "Exact time" }));
    await user.click(field.getByRole("spinbutton", { name: /hour/ }));
    await user.keyboard("05");
    await user.click(field.getByRole("spinbutton", { name: /minute/ }));
    await user.keyboard("17");
    expect(onValueChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        year: 2026,
        month: 1,
        day: 12,
        hour: 5,
        minute: 17,
      }),
    );
  });

  it("renders constrained and unavailable calendar dates", async () => {
    const user = userEvent.setup();

    render(
      <DateTimePicker
        label="Starts at"
        minValue={new CalendarDate(2026, 1, 10)}
        maxValue={new CalendarDate(2026, 1, 20)}
        value={parseDateTime("2026-01-12T09:30")}
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

  it("applies presets through the same value change path", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const presetValue = parseDateTime("2026-01-15T08:00");

    render(
      <DateTimePicker
        label="Starts at"
        value={parseDateTime("2026-01-12T09:30")}
        onValueChange={onValueChange}
        presets={[
          {
            label: "Tomorrow morning",
            value: presetValue,
          },
        ]}
      />,
    );

    await user.click(screen.getByRole("button", { name: /Open calendar/ }));
    await user.click(screen.getByRole("button", { name: "Tomorrow morning" }));

    expect(onValueChange).toHaveBeenCalledWith(presetValue);
  });

  it("selects time options while preserving the selected date", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <DateTimePicker
        label="Starts at"
        timeSelector
        value={parseDateTime("2026-01-12T09:30")}
        timeOptions={[{ hour: 14, label: "2:00 PM", minute: 0 }]}
        onValueChange={onValueChange}
      />,
    );

    await user.click(getDateTimeSegment(document.body, "hour"));
    await user.click(screen.getByRole("button", { name: "2:00 PM" }));

    expect(onValueChange).toHaveBeenCalledWith(
      expect.objectContaining({
        day: 12,
        hour: 14,
        minute: 0,
        month: 1,
        year: 2026,
      }),
    );
  });

  it("updates uncontrolled form serialization when a time option is selected", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <DateTimePicker
        defaultValue={parseDateTime("2026-01-12T09:30")}
        label="Starts at"
        name="startsAt"
        timeSelector
        timeOptions={[{ hour: 16, label: "4:15 PM", minute: 15 }]}
      />,
    );

    const input = container.querySelector<HTMLInputElement>(
      'input[type="hidden"][name="startsAt"]',
    );

    await user.click(getDateTimeSegment(container, "hour"));
    await user.click(screen.getByRole("button", { name: "4:15 PM" }));

    expect(input).toHaveValue("2026-01-12T16:15:00");
  });

  it("updates uncontrolled form serialization from exact time input changes", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <DateTimePicker
        defaultValue={parseDateTime("2026-01-12T09:30")}
        label="Starts at"
        name="startsAt"
        timeSelector
      />,
    );

    const input = container.querySelector<HTMLInputElement>(
      'input[type="hidden"][name="startsAt"]',
    );

    await user.click(getDateTimeSegment(container, "hour"));
    const field = within(screen.getByRole("group", { name: "Exact time" }));
    await user.click(field.getByRole("spinbutton", { name: /hour/ }));
    await user.keyboard("05");
    await user.click(field.getByRole("spinbutton", { name: /minute/ }));
    await user.keyboard("15");

    expect(input).toHaveValue("2026-01-12T05:15:00");
  });

  it("preserves zoned values when a time option is selected", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <DateTimePicker
        label="Starts at"
        timeSelector
        value={parseZonedDateTime("2026-01-12T09:30[Europe/London]")}
        timeOptions={[{ hour: 18, label: "6:45 PM", minute: 45 }]}
        onValueChange={onValueChange}
      />,
    );

    await user.click(getDateTimeSegment(document.body, "hour"));
    await user.click(screen.getByRole("button", { name: "6:45 PM" }));

    expect(onValueChange).toHaveBeenCalledWith(
      expect.objectContaining({
        hour: 18,
        minute: 45,
        timeZone: "Europe/London",
      }),
    );
  });

  it("disables time options until a date value exists", async () => {
    const user = userEvent.setup();

    render(
      <DateTimePicker
        label="Starts at"
        timeSelector
        timeOptions={[{ hour: 9, label: "9:00 AM", minute: 0 }]}
      />,
    );

    await user.click(getDateTimeSegment(document.body, "hour"));

    expect(screen.getByRole("group", { name: "Exact time" })).toHaveAttribute(
      "data-disabled",
    );
    expect(screen.getByRole("button", { name: "9:00 AM" })).toBeDisabled();
  });

  it("disables out-of-range time picks and presets while including boundary times", async () => {
    const user = userEvent.setup();
    render(
      <DateTimePicker
        label="Starts at"
        hourCycle={24}
        defaultValue={parseDateTime("2026-01-12T09:30")}
        minValue={parseDateTime("2026-01-12T09:00")}
        maxValue={parseDateTime("2026-01-12T17:00")}
        presets={[
          { label: "Too early", value: parseDateTime("2026-01-12T08:00") },
        ]}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Open time picker" }));
    expect(screen.getByRole("button", { name: "08:30" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "09:00" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "17:00" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "17:30" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Too early" })).toBeDisabled();
  });

  it.each(["disabled", "readOnly"] as const)(
    "does not open time controls when %s",
    async (flag) => {
      const user = userEvent.setup();
      const { container } = render(
        <DateTimePicker
          label="Starts at"
          {...{ [flag]: true }}
          defaultValue={parseDateTime("2026-01-12T09:30")}
        />,
      );
      expect(
        screen.getByRole("button", { name: "Open time picker" }),
      ).toBeDisabled();
      await user.click(getDateTimeSegment(container, "hour"));
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    },
  );

  it("closes the popover with Escape and returns focus to the trigger", async () => {
    const user = userEvent.setup();

    render(
      <DateTimePicker
        label="Starts at"
        value={parseDateTime("2026-01-12T09:30")}
      />,
    );

    const trigger = screen.getByRole("button", { name: /Open calendar/ });

    await user.click(trigger);
    expect(screen.getByRole("grid")).toBeInTheDocument();

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});
