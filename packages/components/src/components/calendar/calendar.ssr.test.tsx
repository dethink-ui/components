import { CalendarDate } from "@internationalized/date";
import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { Calendar, RangeCalendar } from ".";

describe("Calendar SSR", () => {
  it("renders calendar markup on the server", () => {
    const html = renderToString(
      <Calendar
        aria-label="Billing date"
        value={new CalendarDate(2026, 7, 3)}
      />,
    );

    expect(html).toContain('data-slot="calendar"');
    expect(html).toContain('data-slot="calendar-grid"');
  });

  it("renders range calendar markup on the server", () => {
    const html = renderToString(
      <RangeCalendar
        aria-label="Report range"
        value={{
          end: new CalendarDate(2026, 7, 10),
          start: new CalendarDate(2026, 7, 3),
        }}
      />,
    );

    expect(html).toContain('data-slot="range-calendar"');
    expect(html).toContain('data-slot="range-calendar-grid"');
  });

  it("hydrates without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const props = {
      "aria-label": "Billing date",
      value: new CalendarDate(2026, 7, 3),
    };
    const container = document.createElement("div");
    container.innerHTML = renderToString(<Calendar {...props} />);

    await act(async () => {
      hydrateRoot(container, <Calendar {...props} />);
    });

    expect(
      consoleError.mock.calls.some(([message]) =>
        String(message).toLowerCase().includes("hydration"),
      ),
    ).toBe(false);

    consoleError.mockRestore();
  });
});
