import { CalendarDate } from "@internationalized/date";
import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { DatePicker } from ".";

describe("DatePicker SSR", () => {
  it("renders field markup on the server", () => {
    const html = renderToString(
      <DatePicker
        defaultValue={new CalendarDate(2026, 7, 12)}
        label="Invoice date"
        name="invoiceDate"
      />,
    );

    expect(html).toContain('data-slot="date-picker"');
    expect(html).toContain('data-slot="date-picker-field"');
    expect(html).toContain('name="invoiceDate"');
    expect(html).toContain("2026-07-12");
  });

  it("hydrates without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const props = {
      defaultValue: new CalendarDate(2026, 7, 12),
      label: "Invoice date",
      name: "invoiceDate",
    };
    const container = document.createElement("div");
    container.innerHTML = renderToString(<DatePicker {...props} />);

    await act(async () => {
      hydrateRoot(container, <DatePicker {...props} />);
    });

    expect(
      consoleError.mock.calls.some(([message]) =>
        String(message).toLowerCase().includes("hydration"),
      ),
    ).toBe(false);

    consoleError.mockRestore();
  });
});
