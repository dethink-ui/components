import { CalendarDate } from "@internationalized/date";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { DethinkProvider } from "../../foundation/dethink-provider";
import { DateRangePicker } from ".";

expect.extend(toHaveNoViolations);

describe("DateRangePicker accessibility", () => {
  it("has no axe violations for labelled field states", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <form aria-label="Report form">
          <DateRangePicker
            clearable
            defaultValue={{
              end: new CalendarDate(2026, 7, 14),
              start: new CalendarDate(2026, 7, 12),
            }}
            description="Weekends are unavailable."
            errorMessage="Choose a valid billing period."
            invalid
            isDateUnavailable={(date) => date.day === 15}
            label="Billing period"
            maxValue={new CalendarDate(2026, 7, 20)}
            minValue={new CalendarDate(2026, 7, 10)}
            name="billingPeriod"
            required
          />
        </form>
      </DethinkProvider>,
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it("has no axe violations when the range calendar popover is open", async () => {
    const user = userEvent.setup();
    render(
      <DethinkProvider theme="light">
        <DateRangePicker
          defaultValue={{
            end: new CalendarDate(2026, 7, 14),
            start: new CalendarDate(2026, 7, 12),
          }}
          label="Billing period"
        />
      </DethinkProvider>,
    );

    await user.click(screen.getByRole("button", { name: /Open calendar/ }));

    await expect(axe(document.body)).resolves.toHaveNoViolations();
  });
});
