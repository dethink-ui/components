import { CalendarDate } from "@internationalized/date";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { DethinkProvider } from "../../foundation/dethink-provider";
import { DatePicker } from ".";

expect.extend(toHaveNoViolations);

describe("DatePicker accessibility", () => {
  it("has no axe violations for labelled field states", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <form aria-label="Invoice form">
          <DatePicker
            clearable
            defaultValue={new CalendarDate(2026, 7, 12)}
            description="Weekends are unavailable."
            errorMessage="Choose a weekday."
            invalid
            isDateUnavailable={(date) => date.day === 15}
            label="Invoice date"
            maxValue={new CalendarDate(2026, 7, 20)}
            minValue={new CalendarDate(2026, 7, 10)}
            name="invoiceDate"
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
        <DatePicker
          defaultValue={new CalendarDate(2026, 7, 12)}
          label="Invoice date"
        />
      </DethinkProvider>,
    );

    await user.click(screen.getByRole("button", { name: /Open calendar/ }));

    await expect(axe(document.body)).resolves.toHaveNoViolations();
  });

  it("has no axe violations when the calendar month picker is open", async () => {
    const user = userEvent.setup();
    render(
      <DethinkProvider theme="light">
        <DatePicker
          defaultValue={new CalendarDate(2026, 7, 12)}
          label="Invoice date"
        />
      </DethinkProvider>,
    );

    await user.click(screen.getByRole("button", { name: /Open calendar/ }));
    await user.click(
      screen.getByRole("button", { name: /Choose month, current July/ }),
    );

    await expect(axe(document.body)).resolves.toHaveNoViolations();
  });
});
