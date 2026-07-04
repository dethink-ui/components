import { CalendarDate } from "@internationalized/date";
import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { DethinkProvider } from "../../foundation/dethink-provider";
import { Calendar, RangeCalendar } from ".";

expect.extend(toHaveNoViolations);

describe("Calendar accessibility", () => {
  it("has no axe violations for a labelled calendar", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <Calendar
          aria-label="Billing date"
          value={new CalendarDate(2026, 7, 3)}
        />
      </DethinkProvider>,
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it("has no axe violations for a labelled range calendar", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <RangeCalendar
          aria-label="Report range"
          value={{
            end: new CalendarDate(2026, 7, 10),
            start: new CalendarDate(2026, 7, 3),
          }}
        />
      </DethinkProvider>,
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });
});
