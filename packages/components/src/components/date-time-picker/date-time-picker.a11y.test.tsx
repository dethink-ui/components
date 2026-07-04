import { CalendarDate, parseDateTime } from "@internationalized/date";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { DethinkProvider } from "../../foundation/dethink-provider";
import { DateTimePicker } from ".";

expect.extend(toHaveNoViolations);

function getDateTimeSegment(container: HTMLElement, type: string) {
  const segment = container.querySelector<HTMLElement>(
    `[data-slot="date-time-picker-segment"][data-segment="${type}"]`,
  );

  expect(segment).toBeTruthy();

  return segment!;
}

describe("DateTimePicker accessibility", () => {
  it("has no axe violations for labeled field states", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <form aria-label="Schedule event">
          <DateTimePicker
            clearable
            defaultValue={parseDateTime("2026-07-02T11:00")}
            description="Weekends are unavailable."
            errorMessage="Choose a weekday."
            invalid
            isDateUnavailable={(date) => date.day === 4}
            label="Deployment slot"
            maxValue={new CalendarDate(2026, 7, 10)}
            minValue={new CalendarDate(2026, 7, 1)}
            name="deploymentAt"
            required
          />
        </form>
      </DethinkProvider>,
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it("has no axe violations when the calendar popover is open", async () => {
    const user = userEvent.setup();
    render(
      <DethinkProvider theme="light">
        <DateTimePicker
          defaultValue={parseDateTime("2026-07-02T11:00")}
          label="Deployment slot"
        />
      </DethinkProvider>,
    );

    await user.click(screen.getByRole("button", { name: /Open calendar/ }));

    await expect(axe(document.body)).resolves.toHaveNoViolations();
  });

  it("labels the time selector group when selectable time controls are enabled", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <DethinkProvider theme="light">
        <DateTimePicker
          defaultValue={parseDateTime("2026-07-02T11:00")}
          label="Deployment slot"
          timeOptions={[{ hour: 12, label: "12:00", minute: 0 }]}
          timeSelector
        />
      </DethinkProvider>,
    );

    await user.click(getDateTimeSegment(container, "hour"));

    expect(screen.getByRole("group", { name: "Time" })).toBeInTheDocument();
    await expect(axe(document.body)).resolves.toHaveNoViolations();
  });
});
