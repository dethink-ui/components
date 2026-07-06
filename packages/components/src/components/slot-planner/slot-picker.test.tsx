import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  SlotPicker,
  type SlotPickerProps,
  type SlotPlannerBookRequestPayload,
  type SlotPlannerSlotData,
} from ".";
import { slotPlannerSampleSlots } from "./slot-planner-fixtures";

// Instant-anchored "now" (Z suffix): the viewer-zone "today" and every
// derived status resolve from the epoch instant, so the tests are
// deterministic in any test-runner time zone.
const NOW = "2026-07-06T00:30:00Z";

function renderPicker(props: Partial<SlotPickerProps> = {}) {
  return render(
    <SlotPicker
      slots={slotPlannerSampleSlots}
      viewerTimeZone="Europe/London"
      defaultFocusedDate="2026-07-06"
      now={NOW}
      title="Book a session"
      {...props}
    />,
  );
}

function getLiveRegion(container: HTMLElement) {
  return container.querySelector('[data-slot="slot-picker-live-region"]');
}

function deferred() {
  let resolve!: () => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, reject, resolve };
}

/** A single evening New York slot that date-shifts for eastern viewers. */
const eveningNewYorkSlot: SlotPlannerSlotData = {
  id: "ny-evening",
  date: "2026-07-08",
  startTime: "18:00",
  durationMinutes: 60,
  timeZone: "America/New_York",
  state: "requestable",
};

describe("SlotPicker week view", () => {
  it("renders a Monday-start day rail and requestable cards with request buttons", () => {
    renderPicker();

    const tabs = screen.getAllByRole("tab");

    expect(tabs).toHaveLength(7);
    expect(tabs[0]).toHaveTextContent("Mon");
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    expect(tabs[0]).toHaveAttribute("aria-current", "date");
    expect(within(tabs[0]!).getByText("2 requestable")).toBeInTheDocument();

    const cards = within(screen.getByRole("list")).getAllByRole("listitem");

    expect(cards).toHaveLength(2);
    // Same viewer and provider zone: viewer wall clock equals the stored
    // wall clock and no secondary provider context renders.
    expect(within(cards[0]!).getByText("14:15 – 15:15")).toBeInTheDocument();
    expect(within(cards[1]!).getByText("18:00 – 19:00")).toBeInTheDocument();
    expect(
      cards[0]!.querySelector('[data-slot="slot-picker-provider-time"]'),
    ).toBeNull();
    expect(cards[0]).toHaveAttribute("data-available", "true");
    expect(
      within(cards[0]!).getByRole("button", { name: "Request slot" }),
    ).toBeEnabled();
    // Conventional data renders; unknown keys are ignored.
    expect(within(cards[0]!).getByText("Playwright")).toBeInTheDocument();
    expect(
      within(cards[1]!).getByText("Runs until the autumn cohort ends."),
    ).toBeInTheDocument();
  });

  it("never shows draft or cancelled occurrences to consumers", async () => {
    const user = userEvent.setup();
    const hiddenSlots = slotPlannerSampleSlots.filter(
      (slot) => slot.state === "draft" || slot.state === "cancelled",
    );

    expect(hiddenSlots.length).toBeGreaterThanOrEqual(2);
    renderPicker({ slots: hiddenSlots, defaultFocusedDate: "2026-07-13" });

    // 2026-07-13 has the draft fixture; 2026-07-15 has the cancelled one.
    expect(screen.getByText("No slots on this day")).toBeInTheDocument();

    await user.click(screen.getAllByRole("tab")[2]!);

    expect(screen.getByText("No slots on this day")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("renders requested, booked, blocked, and expired occurrences non-interactively", () => {
    // Tuesday: the only occurrence is requested.
    renderPicker({ focusedDate: "2026-07-07" });

    const requestedCard = screen.getByRole("listitem");

    expect(requestedCard).toHaveAttribute("data-status", "requested");
    expect(requestedCard).not.toHaveAttribute("data-available");
    expect(within(requestedCard).queryByRole("button")).not.toBeInTheDocument();
    expect(within(requestedCard).getByText("requested")).toBeInTheDocument();
    // A day with occurrences but nothing requestable states it in text.
    expect(
      screen.getByText("No slots available on this day"),
    ).toBeInTheDocument();

    // Thursday: fully booked (capacity 1) renders the full label.
    const { container: bookedContainer } = renderPicker({
      focusedDate: "2026-07-09",
    });
    const bookedCard = within(
      bookedContainer.querySelector('[data-slot="slot-picker-slot-list"]') as HTMLElement,
    ).getByRole("listitem");

    expect(bookedCard).toHaveAttribute("data-status", "booked");
    expect(within(bookedCard).queryByRole("button")).not.toBeInTheDocument();
    expect(within(bookedCard).getByText("Full")).toBeInTheDocument();

    // Friday: blocked. Past Monday: expired.
    const { container: blockedContainer } = renderPicker({
      focusedDate: "2026-07-10",
    });

    expect(
      blockedContainer.querySelector('[data-slot="slot-picker-slot-card"]'),
    ).toHaveAttribute("data-status", "blocked");

    const { container: pastContainer } = renderPicker({
      focusedDate: "2026-06-29",
    });
    const expiredCard = pastContainer.querySelector(
      '[data-slot="slot-picker-slot-card"]',
    );

    expect(expiredCard).toHaveAttribute("data-status", "expired");
    expect(expiredCard?.querySelector("button")).toBeNull();
    expect(
      within(pastContainer).getByText("This day is in the past"),
    ).toBeInTheDocument();
  });

  it("shows remaining seats for multi-seat occurrences and Full at zero", () => {
    // wed-group-systems: 17:00 America/New_York = 22:00 Europe/London,
    // capacity 4 with 2 booked.
    renderPicker({ focusedDate: "2026-07-08" });

    const card = screen.getByRole("listitem");

    expect(within(card).getByText("22:00 – 23:30")).toBeInTheDocument();
    expect(within(card).getByText("2 seats left")).toBeInTheDocument();
    expect(
      within(card).getByText("17:00 America/New_York"),
    ).toBeInTheDocument();
    expect(
      within(card).getByRole("button", { name: "Request slot" }),
    ).toBeEnabled();

    // The 2026-07-22 override books all 4 seats: Full, no seats line.
    const { container } = renderPicker({
      focusedDate: "2026-07-22",
      now: "2026-07-20T00:30:00Z",
    });
    const fullCard = within(container as HTMLElement).getByRole("listitem");

    expect(fullCard).toHaveAttribute("data-status", "booked");
    expect(within(fullCard).getByText("Full")).toBeInTheDocument();
    expect(within(fullCard).queryByText(/seats left/)).not.toBeInTheDocument();
    expect(within(fullCard).queryByRole("button")).not.toBeInTheDocument();
  });

  it("navigates weeks with the toolbar and reports focus changes", async () => {
    const user = userEvent.setup();
    const onFocusedDateChange = vi.fn();

    renderPicker({ onFocusedDateChange });

    await user.click(screen.getByRole("button", { name: "Next week" }));

    expect(onFocusedDateChange).toHaveBeenLastCalledWith("2026-07-13");
    expect(screen.getAllByRole("tab")[0]).toHaveTextContent("13");

    await user.click(screen.getByRole("button", { name: "This week" }));

    expect(onFocusedDateChange).toHaveBeenLastCalledWith("2026-07-06");
  });

  it("renders the day view without a tablist", () => {
    renderPicker({ view: "day" });

    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
    expect(screen.queryByRole("tabpanel")).not.toBeInTheDocument();
    expect(screen.getByText("14:15 – 15:15")).toBeInTheDocument();
  });
});

describe("SlotPicker viewer-zone projection", () => {
  it("projects the DST-spanning series correctly for a New York viewer", () => {
    // 09:00 Europe/London weekly across the 2026-10-25 London DST end.
    // Before the transition London is BST (+1) and New York EDT (-4):
    // 09:00 → 04:00. On 2026-10-25 London is already GMT (+0) while New
    // York stays EDT until 2026-11-01: 09:00 → 05:00.
    renderPicker({
      viewerTimeZone: "America/New_York",
      defaultFocusedDate: "2026-10-18",
      now: "2026-10-12T12:00:00Z",
    });

    const beforeCard = screen.getByRole("listitem");

    expect(within(beforeCard).getByText("04:00 – 05:00")).toBeInTheDocument();
    expect(
      within(beforeCard).getByText("09:00 Europe/London"),
    ).toBeInTheDocument();

    const { container } = renderPicker({
      viewerTimeZone: "America/New_York",
      defaultFocusedDate: "2026-10-25",
      now: "2026-10-19T12:00:00Z",
    });
    const afterCard = within(container as HTMLElement).getByRole("listitem");

    expect(within(afterCard).getByText("05:00 – 06:00")).toBeInTheDocument();
    // The provider-zone secondary context never moves.
    expect(
      within(afterCard).getByText("09:00 Europe/London"),
    ).toBeInTheDocument();
  });

  it("lands an evening occurrence on the next viewer date across zones", async () => {
    const user = userEvent.setup();

    // 18:00 America/New_York on Wed 2026-07-08 is 03:30 IST on Thu
    // 2026-07-09 for an Asia/Kolkata viewer.
    renderPicker({
      slots: [eveningNewYorkSlot],
      viewerTimeZone: "Asia/Kolkata",
      defaultFocusedDate: "2026-07-09",
    });

    const card = screen.getByRole("listitem");

    expect(within(card).getByText("03:30 – 04:30")).toBeInTheDocument();
    expect(
      within(card).getByText("18:00 America/New_York"),
    ).toBeInTheDocument();
    // The day rail summarizes it on the viewer's Thursday…
    expect(
      within(screen.getAllByRole("tab")[3]!).getByText("1 requestable"),
    ).toBeInTheDocument();
    // …and the provider's Wednesday is empty for this viewer.
    await user.click(screen.getAllByRole("tab")[2]!);

    expect(screen.getByText("No slots on this day")).toBeInTheDocument();
  });

  it("keeps a late-evening occurrence on the same viewer date when it fits", () => {
    // The same instant is 23:00 – 00:00 on Wed for a London viewer.
    renderPicker({
      slots: [eveningNewYorkSlot],
      viewerTimeZone: "Europe/London",
      defaultFocusedDate: "2026-07-08",
    });

    const card = screen.getByRole("listitem");

    expect(within(card).getByText("23:00 – 00:00")).toBeInTheDocument();
    expect(
      within(card).getByText("18:00 America/New_York"),
    ).toBeInTheDocument();
  });
});

describe("SlotPicker book requests", () => {
  it("fires a JSON-round-trippable payload with the provider-zone date", async () => {
    const user = userEvent.setup();
    const onBookRequest = vi.fn();
    const { container } = renderPicker({
      slots: [eveningNewYorkSlot],
      viewerTimeZone: "Asia/Kolkata",
      defaultFocusedDate: "2026-07-09",
      onBookRequest,
    });

    await user.click(screen.getByRole("button", { name: "Request slot" }));

    const expected: SlotPlannerBookRequestPayload = {
      slotId: "ny-evening",
      // The provider-zone occurrence date, not the viewer's 2026-07-09.
      occurrenceDate: "2026-07-08",
      seats: 1,
      viewerTimeZone: "Asia/Kolkata",
    };

    expect(onBookRequest).toHaveBeenCalledTimes(1);
    expect(onBookRequest).toHaveBeenCalledWith(expected);

    const payload = onBookRequest.mock.calls[0]![0];

    expect(JSON.parse(JSON.stringify(payload))).toEqual(expected);
    expect(getLiveRegion(container)).toHaveTextContent("slot requested");
  });

  it("drives per-occurrence pending from a deferred promise and announces", async () => {
    const user = userEvent.setup();
    const pending = deferred();
    const onBookRequest = vi.fn(() => pending.promise);
    const { container } = renderPicker({ onBookRequest });

    const cards = within(screen.getByRole("list")).getAllByRole("listitem");

    await user.click(
      within(cards[0]!).getByRole("button", { name: "Request slot" }),
    );

    expect(cards[0]).toHaveAttribute("data-pending", "true");
    expect(within(cards[0]!).getByText("Requesting")).toBeInTheDocument();
    expect(
      within(cards[0]!).getByRole("button", { name: "Request slot" }),
    ).toBeDisabled();
    // Pending is per occurrence: the sibling card stays untouched.
    expect(cards[1]).not.toHaveAttribute("data-pending");
    expect(
      within(cards[1]!).getByRole("button", { name: "Request slot" }),
    ).toBeEnabled();
    expect(getLiveRegion(container)).toHaveTextContent("Requesting");

    await act(async () => {
      pending.resolve();
      await pending.promise;
    });

    expect(cards[0]).not.toHaveAttribute("data-pending");
    expect(within(cards[0]!).queryByText("Requesting")).not.toBeInTheDocument();
    expect(getLiveRegion(container)).toHaveTextContent("slot requested");
  });

  it("shows error and retry on rejection, re-firing the identical payload", async () => {
    const user = userEvent.setup();
    const onBookRequest = vi
      .fn<(payload: SlotPlannerBookRequestPayload) => Promise<void>>()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce(undefined);
    const { container } = renderPicker({ onBookRequest });

    const card = within(screen.getByRole("list")).getAllByRole("listitem")[0]!;

    await user.click(
      within(card).getByRole("button", { name: "Request slot" }),
    );
    await waitFor(() => {
      expect(card).toHaveAttribute("data-error", "true");
    });

    expect(within(card).getByText("Request failed")).toBeInTheDocument();
    expect(getLiveRegion(container)).toHaveTextContent("Request failed");

    await user.click(within(card).getByRole("button", { name: "Retry" }));
    await waitFor(() => {
      expect(card).not.toHaveAttribute("data-error");
    });

    expect(onBookRequest).toHaveBeenCalledTimes(2);
    expect(onBookRequest.mock.calls[1]![0]).toEqual(
      onBookRequest.mock.calls[0]![0],
    );
    expect(getLiveRegion(container)).toHaveTextContent("slot requested");
  });
});

describe("SlotPicker keyboard support", () => {
  it("browses days via the rail and requests a slot with Enter and Space", async () => {
    const user = userEvent.setup();
    const onBookRequest = vi.fn();

    renderPicker({ onBookRequest });

    const tabs = screen.getAllByRole("tab");

    tabs[0]!.focus();
    await user.keyboard("{ArrowRight}");

    expect(tabs[1]).toHaveFocus();
    expect(tabs[1]).toHaveAttribute("aria-selected", "true");

    await user.keyboard("{Home}");
    expect(tabs[0]).toHaveFocus();

    // Tab into the panel, then onto the first requestable slot's button.
    await user.tab();
    expect(screen.getByRole("tabpanel")).toHaveFocus();
    await user.tab();

    const requestButton = within(
      within(screen.getByRole("list")).getAllByRole("listitem")[0]!,
    ).getByRole("button", { name: "Request slot" });

    expect(requestButton).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(onBookRequest).toHaveBeenCalledTimes(1);

    await user.keyboard(" ");
    expect(onBookRequest).toHaveBeenCalledTimes(2);
    expect(onBookRequest.mock.calls[0]![0]).toEqual({
      slotId: "mon-morning-architecture",
      occurrenceDate: "2026-07-06",
      seats: 1,
      viewerTimeZone: "Europe/London",
    });
  });
});

describe("SlotPicker taxonomy and renderers", () => {
  it("applies taxonomy overrides to book-mode strings", async () => {
    const user = userEvent.setup();
    const onBookRequest = vi.fn();
    const { container } = renderPicker({
      onBookRequest,
      taxonomy: {
        slot: "session",
        slotPlural: "sessions",
        requestSlot: "Book {slot}",
        announceBookRequested: "{slot} requested — we will confirm shortly",
        statusLabels: { requestable: "open" },
        noAvailableSlots: "Fully committed — no {slotPlural} left",
      },
    });

    expect(
      within(screen.getAllByRole("tab")[0]!).getByText("2 open"),
    ).toBeInTheDocument();

    await user.click(
      within(
        within(screen.getByRole("list")).getAllByRole("listitem")[0]!,
      ).getByRole("button", { name: "Book session" }),
    );

    expect(onBookRequest).toHaveBeenCalledTimes(1);
    expect(getLiveRegion(container)).toHaveTextContent(
      "session requested — we will confirm shortly",
    );

    // The all-unavailable message honours the override on Tuesday.
    await user.click(screen.getAllByRole("tab")[1]!);

    expect(
      screen.getByText("Fully committed — no sessions left"),
    ).toBeInTheDocument();
  });

  it("supports a custom slot card that decorates renderDefault", () => {
    renderPicker({
      renderers: {
        slotCard: ({ occurrence, available, renderDefault }) => (
          <div>
            <p>{`Custom ${occurrence.viewerStartTime} (${
              available ? "open" : "unavailable"
            })`}</p>
            {renderDefault()}
          </div>
        ),
      },
    });

    // The custom banner and the decorated default content both render.
    expect(screen.getByText("Custom 14:15 (open)")).toBeInTheDocument();
    expect(screen.getByText("14:15 – 15:15")).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: "Request slot" }),
    ).toHaveLength(2);
  });

  it("supports a fully custom slot card with a working request dispatcher", async () => {
    const user = userEvent.setup();
    const onBookRequest = vi.fn();

    renderPicker({
      onBookRequest,
      renderers: {
        slotCard: ({ occurrence, request }) =>
          request ? (
            <button type="button" onClick={request}>
              {`Grab ${occurrence.viewerStartTime}`}
            </button>
          ) : (
            <p>{`Unavailable at ${occurrence.viewerStartTime}`}</p>
          ),
      },
    });

    await user.click(screen.getByRole("button", { name: "Grab 14:15" }));

    expect(onBookRequest).toHaveBeenCalledWith({
      slotId: "mon-morning-architecture",
      occurrenceDate: "2026-07-06",
      seats: 1,
      viewerTimeZone: "Europe/London",
    });
  });

  it("supports a custom empty-day renderer", () => {
    renderPicker({
      defaultFocusedDate: "2026-07-12",
      renderers: {
        emptyDay: ({ date, renderDefault }) => (
          <div>
            <p>{`Nothing bookable on ${date}`}</p>
            {renderDefault()}
          </div>
        ),
      },
    });

    expect(
      screen.getByText("Nothing bookable on 2026-07-12"),
    ).toBeInTheDocument();
    expect(screen.getByText("No slots on this day")).toBeInTheDocument();
  });
});
