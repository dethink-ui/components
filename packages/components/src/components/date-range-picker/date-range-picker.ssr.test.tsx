import { CalendarDate } from "@internationalized/date";
import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { DateRangePicker } from ".";

describe("DateRangePicker SSR", () => {
  it("renders field markup on the server", () => {
    const html = renderToString(
      <DateRangePicker
        defaultValue={{
          end: new CalendarDate(2026, 7, 10),
          start: new CalendarDate(2026, 7, 3),
        }}
        label="Report range"
        name="reportRange"
      />,
    );

    expect(html).toContain('data-slot="date-range-picker"');
    expect(html).toContain('data-slot="date-range-picker-field"');
    expect(html).toContain('name="reportRangeStart"');
    expect(html).toContain('name="reportRangeEnd"');
    expect(html).toContain("2026-07-03");
    expect(html).toContain("2026-07-10");
  });

  it("hydrates without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const props = {
      defaultValue: {
        end: new CalendarDate(2026, 7, 10),
        start: new CalendarDate(2026, 7, 3),
      },
      label: "Report range",
      name: "reportRange",
    };
    const container = document.createElement("div");
    container.innerHTML = renderToString(<DateRangePicker {...props} />);

    await act(async () => {
      hydrateRoot(container, <DateRangePicker {...props} />);
    });

    expect(
      consoleError.mock.calls.some(([message]) =>
        String(message).toLowerCase().includes("hydration"),
      ),
    ).toBe(false);

    consoleError.mockRestore();
  });
});
