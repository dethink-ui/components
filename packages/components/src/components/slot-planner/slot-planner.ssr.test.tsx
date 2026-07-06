import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { SlotPlanner } from ".";
import { slotPlannerSampleSlots } from "./slot-planner-fixtures";

// Deterministic `now` and focused date keep the server and client markup
// identical, so hydration is exercised meaningfully.
const props = {
  slots: slotPlannerSampleSlots,
  defaultFocusedDate: "2026-07-06",
  now: "2026-07-06T00:30:00",
  title: "Availability",
} as const;

describe("SlotPlanner SSR", () => {
  it("renders the week view markup on the server", () => {
    const html = renderToString(<SlotPlanner {...props} />);

    expect(html).toContain('data-slot="slot-planner"');
    expect(html).toContain('role="tablist"');
    expect(html).toContain('aria-current="date"');
    expect(html).toContain("14:15 – 15:15");
  });

  it("hydrates without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const container = document.createElement("div");

    container.innerHTML = renderToString(<SlotPlanner {...props} />);

    await act(async () => {
      hydrateRoot(container, <SlotPlanner {...props} />);
    });

    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
