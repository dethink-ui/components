import { act } from "react";
import { hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
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
  afterEach(() => vi.unstubAllGlobals());
  it("renders the week view markup on the server", () => {
    const html = renderToString(<SlotPlanner {...props} />);

    expect(html).toContain('data-slot="slot-planner"');
    expect(html).toContain('role="tablist"');
    expect(html).toContain('aria-current="date"');
    expect(html).toContain("14:15 – 15:15");
  });

  it("hydrates without mismatch warnings", async () => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const container = document.createElement("div");
    // Node and browsers can ship different ICU spacing for the same locale.
    const range = vi.spyOn(Intl.DateTimeFormat.prototype, "formatRange");
    range.mockReturnValue("Jul 6\u2009–\u200912");
    container.innerHTML = renderToString(<SlotPlanner {...props} />);
    range.mockReturnValue("Jul 6 – 12");

    let root: Root | undefined;
    await act(async () => {
      root = hydrateRoot(container, <SlotPlanner {...props} />);
    });
    await act(async () => root?.unmount());

    expect(consoleError).not.toHaveBeenCalled();
    range.mockRestore();
    consoleError.mockRestore();
  });
});
