import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { SlotPicker } from ".";
import { slotPlannerSampleSlots } from "./slot-planner-fixtures";

// Deterministic `now` (instant-anchored), `viewerTimeZone`, and focused date
// keep the server and client markup identical, so hydration is exercised
// meaningfully.
const props = {
  slots: slotPlannerSampleSlots,
  viewerTimeZone: "Europe/London",
  defaultFocusedDate: "2026-07-06",
  now: "2026-07-06T00:30:00Z",
  title: "Book a session",
} as const;

describe("SlotPicker SSR", () => {
  it("renders the week view markup on the server", () => {
    const html = renderToString(<SlotPicker {...props} />);

    expect(html).toContain('data-slot="slot-picker"');
    expect(html).toContain('role="tablist"');
    expect(html).toContain('aria-current="date"');
    // Viewer-zone times render on the server too.
    expect(html).toContain("14:15 – 15:15");
    expect(html).toContain('data-viewer-time-zone="Europe/London"');
  });

  it("projects into a different viewer zone on the server", () => {
    const html = renderToString(
      <SlotPicker {...props} viewerTimeZone="Asia/Kolkata" />,
    );

    // 14:15 Europe/London (BST) is 18:45 Asia/Kolkata.
    expect(html).toContain("18:45 – 19:45");
    expect(html).toContain("14:15 Europe/London");
  });

  it("hydrates without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const container = document.createElement("div");

    container.innerHTML = renderToString(<SlotPicker {...props} />);

    await act(async () => {
      hydrateRoot(container, <SlotPicker {...props} />);
    });

    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
