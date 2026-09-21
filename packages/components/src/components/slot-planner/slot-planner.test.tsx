import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  SlotPlanner,
  type SlotPlannerProps,
  type SlotPlannerRenderers,
  type SlotPlannerSlotData,
  type SlotPlannerSlotPayload,
  type SlotPlannerUpdatePayload,
} from ".";
import { defaultSlotPlannerTaxonomy } from "./slot-planner-contract";
import { SlotPlannerViolationList } from "./slot-planner-editor";
import { slotPlannerSampleSlots } from "./slot-planner-fixtures";

// Instant-anchored "now" (Z suffix): the planner-zone "today" and every
// derived status resolve from the epoch instant, so the tests are
// deterministic in any test-runner time zone.
const NOW = "2026-07-06T00:30:00Z";

function renderPlanner(props: Partial<SlotPlannerProps> = {}) {
  return render(
    <SlotPlanner
      slots={slotPlannerSampleSlots}
      defaultFocusedDate="2026-07-06"
      now={NOW}
      timeZone="Europe/London"
      title="Availability"
      weekLayout="agenda"
      {...props}
    />,
  );
}

describe("SlotPlanner week view", () => {
  it("renders a Monday-start day rail with roving tabindex and today marked", () => {
    const { container } = renderPlanner();

    const tabs = screen.getAllByRole("tab");
    const weekLayout = container.querySelector(
      '[data-slot="slot-planner-week-layout"]',
    );

    expect(weekLayout).toBeInTheDocument();
    expect(weekLayout).toContainElement(screen.getByRole("tablist"));
    expect(weekLayout).toContainElement(screen.getByRole("tabpanel"));
    expect(tabs).toHaveLength(7);
    expect(tabs[0]).toHaveTextContent("Mon");
    expect(tabs[6]).toHaveTextContent("Sun");
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    expect(tabs[0]).toHaveAttribute("tabindex", "0");
    expect(tabs[0]).toHaveAttribute("aria-current", "date");
    for (const tab of tabs.slice(1)) {
      expect(tab).toHaveAttribute("aria-selected", "false");
      expect(tab).toHaveAttribute("tabindex", "-1");
      expect(tab).not.toHaveAttribute("aria-current");
    }
    // The panel is labelled by the selected day tab.
    expect(screen.getByRole("tabpanel")).toHaveAccessibleName(/Jul 6/);
  });

  it("summarizes each day's occurrences by derived status", () => {
    renderPlanner();

    const tabs = screen.getAllByRole("tab");

    expect(within(tabs[0]!).getByText("2 requestable")).toBeInTheDocument();
    expect(within(tabs[1]!).getByText("1 requested")).toBeInTheDocument();
    expect(within(tabs[3]!).getByText("1 booked")).toBeInTheDocument();
    expect(within(tabs[4]!).getByText("1 blocked")).toBeInTheDocument();
    expect(
      tabs[0]!.querySelector('[data-slot="slot-planner-day-summary"]'),
    ).toHaveAttribute("title", "2 requestable");
    expect(
      tabs[0]!.querySelector('[data-slot="slot-planner-day-summary-text"]'),
    ).toHaveClass("truncate");
    expect(
      within(tabs[6]!).queryByText(/requestable|booked/),
    ).not.toBeInTheDocument();
  });

  it("renders the focused day's slot cards sorted by start time", () => {
    renderPlanner();

    const list = screen.getByRole("list");
    const cards = within(list).getAllByRole("listitem");

    expect(cards).toHaveLength(2);
    // The time range renders as a single text node.
    expect(within(cards[0]!).getByText("14:15 – 15:15")).toBeInTheDocument();
    expect(within(cards[1]!).getByText("18:00 – 19:00")).toBeInTheDocument();
    expect(within(cards[0]!).getByText("60 min")).toBeInTheDocument();
    expect(within(cards[0]!).getByText("Recurring weekly")).toBeInTheDocument();
    expect(within(cards[0]!).getByText("Playwright")).toBeInTheDocument();
    expect(
      within(cards[1]!).getByText("Runs until the autumn cohort ends."),
    ).toBeInTheDocument();
    // Zero-buffer slots show only the zone in the meta line.
    expect(within(cards[0]!).getByText("Europe/London")).toBeInTheDocument();
  });

  it("renders buffers, requested status, and biweekly recurrence on other days", async () => {
    const user = userEvent.setup();

    renderPlanner();

    await user.click(screen.getAllByRole("tab")[1]!);

    const tuesdayCard = screen.getByRole("listitem");

    expect(
      within(tuesdayCard).getByText("10 min buffer · Europe/London"),
    ).toBeInTheDocument();
    expect(within(tuesdayCard).getByText("45 min")).toBeInTheDocument();
    expect(within(tuesdayCard).getByText("requested")).toBeInTheDocument();

    await user.click(screen.getAllByRole("tab")[2]!);

    expect(screen.getByText("Recurring biweekly")).toBeInTheDocument();
    // Unknown `data` keys (priceUsd: 40) are ignored by default renderers.
    expect(screen.queryByText(/priceUsd/)).not.toBeInTheDocument();
    expect(screen.queryByText("40")).not.toBeInTheDocument();
  });

  it("marks booked and blocked occurrences as locked", () => {
    const { container } = renderPlanner({ focusedDate: "2026-07-09" });

    const bookedCard = container.querySelector(
      '[data-slot="slot-planner-slot-card"]',
    );

    expect(bookedCard).toHaveAttribute("data-locked", "true");
    expect(bookedCard).toHaveAttribute("data-status", "booked");
    expect(screen.getByText("booked")).toBeInTheDocument();

    const { container: blockedContainer } = renderPlanner({
      focusedDate: "2026-07-10",
    });

    expect(
      blockedContainer.querySelector('[data-slot="slot-planner-slot-card"]'),
    ).toHaveAttribute("data-locked", "true");
  });

  it("shows the empty-day message when the focused day has no occurrences", () => {
    renderPlanner({ focusedDate: "2026-07-12" });

    expect(screen.getByText("No slots on this day")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("renders external loading and error states without mutation affordances", () => {
    const loadingRender = renderPlanner({ loading: true });

    expect(screen.getByRole("status")).toHaveTextContent("Loading slots");
    expect(
      loadingRender.container.querySelector(
        '[data-slot="slot-planner-day-panel"]',
      ),
    ).toHaveAttribute("data-loading", "true");
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Add slot to this day" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Copy day" }),
    ).not.toBeInTheDocument();
    loadingRender.unmount();

    const errorRender = renderPlanner({ error: "Could not load slots" });

    expect(screen.getByRole("alert")).toHaveTextContent("Could not load slots");
    expect(
      errorRender.container.querySelector(
        '[data-slot="slot-planner-day-panel"]',
      ),
    ).toHaveAttribute("data-error", "true");
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Add slot to this day" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Copy day" }),
    ).not.toBeInTheDocument();
  });

  it("marks past days and renders expired occurrences", () => {
    const { container } = renderPlanner({ focusedDate: "2026-06-29" });

    expect(screen.getByText("This day is in the past")).toBeInTheDocument();
    expect(
      container.querySelector('[data-slot="slot-planner-day-panel"]'),
    ).toHaveAttribute("data-past", "true");
    expect(screen.getByText("expired")).toBeInTheDocument();
    expect(screen.getByText("10:00 – 10:30")).toBeInTheDocument();
  });

  it("moves selection with arrow keys, Home, and End, wrapping at the edges", async () => {
    const user = userEvent.setup();

    renderPlanner();

    const tabs = screen.getAllByRole("tab");

    tabs[0]!.focus();
    await user.keyboard("{ArrowRight}");

    expect(tabs[1]).toHaveFocus();
    expect(tabs[1]).toHaveAttribute("aria-selected", "true");

    await user.keyboard("{End}");
    expect(tabs[6]).toHaveFocus();

    await user.keyboard("{ArrowRight}");
    expect(tabs[0]).toHaveFocus();

    await user.keyboard("{ArrowLeft}");
    expect(tabs[6]).toHaveFocus();

    await user.keyboard("{Home}");
    expect(tabs[0]).toHaveFocus();
  });

  it("moves selection with ArrowDown and ArrowUp for the vertical rail", async () => {
    const user = userEvent.setup();

    renderPlanner();

    const tabs = screen.getAllByRole("tab");

    tabs[0]!.focus();
    await user.keyboard("{ArrowDown}");
    expect(tabs[1]).toHaveFocus();
    expect(tabs[1]).toHaveAttribute("aria-selected", "true");

    await user.keyboard("{ArrowUp}");
    expect(tabs[0]).toHaveFocus();
  });

  it("labels the day rail and advertises its orientation", () => {
    renderPlanner();

    const tablist = screen.getByRole("tablist");

    // The persistent label is a dedicated taxonomy key, not the volatile
    // week-change announcement string.
    expect(tablist).toHaveAttribute("aria-label", "Days of the week");
    expect(tablist).toHaveAttribute("aria-orientation");
  });

  it("inverts arrow-key direction in RTL contexts", async () => {
    const user = userEvent.setup();

    render(
      <div dir="rtl">
        <SlotPlanner
          slots={slotPlannerSampleSlots}
          defaultFocusedDate="2026-07-06"
          now={NOW}
          timeZone="Europe/London"
        />
      </div>,
    );

    const tabs = screen.getAllByRole("tab");

    tabs[0]!.focus();
    await user.keyboard("{ArrowLeft}");

    expect(tabs[1]).toHaveFocus();
    expect(tabs[1]).toHaveAttribute("aria-selected", "true");
  });

  it("navigates weeks with previous, next, and this-week controls", async () => {
    const user = userEvent.setup();

    const { container } = renderPlanner();

    await user.click(screen.getByRole("button", { name: "Next week" }));
    expect(
      screen.getByRole("heading", { level: 3, name: "Monday, July 13, 2026" }),
    ).toBeInTheDocument();
    expect(getLiveRegion(container)).toHaveTextContent(
      "Showing week of 2026-07-13",
    );

    await user.click(screen.getByRole("button", { name: "Previous week" }));
    await user.click(screen.getByRole("button", { name: "Previous week" }));
    expect(
      screen.getByRole("heading", { level: 3, name: "Monday, June 29, 2026" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "This week" }));
    expect(
      screen.getByRole("heading", { level: 3, name: "Monday, July 6, 2026" }),
    ).toBeInTheDocument();
  });

  it("keeps the focused date controlled while reporting changes", async () => {
    const user = userEvent.setup();
    const onFocusedDateChange = vi.fn();

    renderPlanner({ focusedDate: "2026-07-06", onFocusedDateChange });

    await user.click(screen.getAllByRole("tab")[1]!);

    expect(onFocusedDateChange).toHaveBeenCalledWith("2026-07-07");
    // Controlled: the selection does not move without a prop update.
    expect(screen.getAllByRole("tab")[0]).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("updates its own focused date when uncontrolled", async () => {
    const user = userEvent.setup();
    const onFocusedDateChange = vi.fn();

    renderPlanner({ onFocusedDateChange });

    await user.click(screen.getAllByRole("tab")[3]!);

    expect(onFocusedDateChange).toHaveBeenCalledWith("2026-07-09");
    expect(screen.getAllByRole("tab")[3]).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(
      screen.getByRole("heading", { level: 3, name: "Thursday, July 9, 2026" }),
    ).toBeInTheDocument();
  });

  it("phrases every visible string through the taxonomy", () => {
    renderPlanner({
      focusedDate: "2026-07-12",
      taxonomy: {
        statusLabels: { requestable: "open" },
        emptyDay: "Nothing scheduled",
        thisWeek: "Current week",
        previousWeek: "Back one week",
      },
    });

    expect(screen.getByText("Nothing scheduled")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Current week" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Back one week" }),
    ).toBeInTheDocument();
    expect(
      within(screen.getAllByRole("tab")[0]!).getByText("2 open"),
    ).toBeInTheDocument();
  });
});

function renderCrudPlanner(props: Partial<SlotPlannerProps> = {}) {
  return render(
    <SlotPlanner
      weekLayout="agenda"
      defaultSlots={slotPlannerSampleSlots}
      defaultFocusedDate="2026-07-06"
      now={NOW}
      timeZone="Europe/London"
      title="Availability"
      {...props}
    />,
  );
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

function getLiveRegion(container: HTMLElement) {
  return container.querySelector('[data-slot="slot-planner-live-region"]');
}

describe("SlotPlanner slot CRUD", () => {
  it("creates a slot through the editor and announces it", async () => {
    const user = userEvent.setup();
    const onCreateSlot = vi.fn();
    const { container } = renderCrudPlanner({
      onCreateSlot,
      generateSlotId: () => "generated-1",
    });

    await user.click(
      screen.getByRole("button", { name: "Add slot to this day" }),
    );

    const dialog = await screen.findByRole("dialog", { name: "Add slot" });

    // Create never asks for an edit scope, and the date is fixed.
    expect(
      within(dialog).queryByRole("radiogroup", { name: "Apply changes to" }),
    ).not.toBeInTheDocument();
    expect(within(dialog).getByLabelText("Date")).toHaveValue("2026-07-06");
    expect(within(dialog).getByLabelText("Date")).toHaveAttribute("readonly");

    fireEvent.change(within(dialog).getByLabelText("Start time"), {
      target: { value: "09:30" },
    });

    const duration = within(dialog).getByLabelText("Duration (minutes)");

    await user.clear(duration);
    await user.type(duration, "45");
    await user.click(within(dialog).getByRole("button", { name: "Save" }));

    // Empty tags/note/buffers/recurrence are omitted from the payload.
    expect(onCreateSlot).toHaveBeenCalledTimes(1);
    expect(onCreateSlot).toHaveBeenCalledWith({
      slot: {
        id: "generated-1",
        date: "2026-07-06",
        startTime: "09:30",
        durationMinutes: 45,
        timeZone: "Europe/London",
        state: "requestable",
      },
    });
    // Uncontrolled: the new occurrence renders after the callback settles.
    expect(screen.getByText("09:30 – 10:15")).toBeInTheDocument();
    expect(getLiveRegion(container)).toHaveTextContent("slot added");
  });

  it("creates a recurring slot with tags, note, buffers, and repeat-until", async () => {
    const user = userEvent.setup();
    const onCreateSlot = vi.fn();

    renderCrudPlanner({ onCreateSlot, generateSlotId: () => "generated-2" });

    await user.click(
      screen.getByRole("button", { name: "Add slot to this day" }),
    );

    const dialog = await screen.findByRole("dialog", { name: "Add slot" });

    // Repeat-until only appears once a recurrence is chosen.
    expect(
      within(dialog).queryByLabelText("Repeat until"),
    ).not.toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: /Repeats/ }));
    await user.click(screen.getByRole("option", { name: "Recurring weekly" }));
    await user.click(within(dialog).getByText("More options"));
    fireEvent.change(within(dialog).getByLabelText("Repeat until"), {
      target: { value: "2026-09-28" },
    });

    const bufferBefore = within(dialog).getByLabelText(
      "Buffer before (minutes)",
    );

    await user.clear(bufferBefore);
    await user.type(bufferBefore, "10");
    // The tag-input labels both its group and its field with "Tags".
    await user.type(
      within(dialog).getByPlaceholderText("Add tag"),
      "Pairing{Enter}",
    );
    await user.type(within(dialog).getByLabelText("Note"), "First cohort");
    await user.click(within(dialog).getByRole("button", { name: "Save" }));

    const payload = onCreateSlot.mock.calls[0]![0];

    expect(payload.slot.recurrence).toEqual({
      frequency: "weekly",
      until: "2026-09-28",
    });
    expect(payload.slot.bufferBeforeMinutes).toBe(10);
    expect("bufferAfterMinutes" in payload.slot).toBe(false);
    expect(payload.slot.data).toEqual({
      tags: ["Pairing"],
      note: "First cohort",
    });
  });

  it("edits an entire series and keeps the previous slot unchanged", async () => {
    const user = userEvent.setup();
    const onUpdateSlot = vi.fn();

    renderCrudPlanner({ onUpdateSlot });

    const firstCard = within(screen.getByRole("list")).getAllByRole(
      "listitem",
    )[0]!;

    await user.click(
      within(firstCard).getByRole("button", { name: "Edit slot" }),
    );

    const dialog = await screen.findByRole("dialog", { name: "Edit slot" });

    await user.click(
      within(dialog).getByRole("radio", { name: "Entire series" }),
    );
    // Series scope exposes the full field set.
    expect(within(dialog).getByLabelText("Time zone")).toBeInTheDocument();
    fireEvent.change(within(dialog).getByLabelText("Start time"), {
      target: { value: "15:00" },
    });
    await user.click(within(dialog).getByRole("button", { name: "Save" }));

    const payload: SlotPlannerUpdatePayload = onUpdateSlot.mock.calls[0]![0];

    expect(payload.slot.id).toBe("mon-morning-architecture");
    expect(payload.slot.startTime).toBe("15:00");
    expect(payload.slot.recurrence).toEqual({ frequency: "weekly" });
    expect(payload.slot.data).toEqual({
      tags: [
        "Frontend Architecture Review",
        "Data structure and algorithms",
        "Staff Full-Stack Engineer Mock Interview",
        "Playwright",
      ],
    });
    // The previous slot rides along unmutated.
    expect(payload.previous.startTime).toBe("14:15");
    // Uncontrolled: this and later occurrences move.
    expect(screen.getByText("15:00 – 16:00")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Next week" }));
    // The outgoing week's panel fades out; wait for it so the edited time
    // matches uniquely in the new week.
    await waitFor(() => {
      expect(screen.getByText("15:00 – 16:00")).toBeInTheDocument();
    });
  });

  it("edits a single occurrence via an override, leaving other occurrences alone", async () => {
    const user = userEvent.setup();
    const onUpdateSlot = vi.fn();

    renderCrudPlanner({ onUpdateSlot });

    const firstCard = within(screen.getByRole("list")).getAllByRole(
      "listitem",
    )[0]!;

    await user.click(
      within(firstCard).getByRole("button", { name: "Edit slot" }),
    );

    const dialog = await screen.findByRole("dialog", { name: "Edit slot" });

    // Occurrence scope is the default and hides the series-level fields.
    expect(
      within(dialog).getByRole("radio", { name: "This occurrence only" }),
    ).toBeChecked();
    expect(
      within(dialog).queryByLabelText("Time zone"),
    ).not.toBeInTheDocument();
    expect(within(dialog).queryByLabelText("Tags")).not.toBeInTheDocument();

    const duration = within(dialog).getByLabelText("Duration (minutes)");

    await user.clear(duration);
    await user.type(duration, "90");
    await user.click(within(dialog).getByRole("button", { name: "Save" }));

    const payload: SlotPlannerUpdatePayload = onUpdateSlot.mock.calls[0]![0];

    // The series definition is unchanged apart from the upserted override.
    expect(payload.slot.startTime).toBe("14:15");
    expect(payload.slot.durationMinutes).toBe(60);
    expect(payload.slot.recurrence?.overrides).toEqual([
      { occurrenceDate: "2026-07-06", startTime: "14:15", durationMinutes: 90 },
    ]);
    expect(payload.previous.recurrence?.overrides).toBeUndefined();
    expect(screen.getByText("14:15 – 15:45")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Next week" }));
    expect(screen.getByText("14:15 – 15:15")).toBeInTheDocument();
  });

  it("preserves per-scope duration drafts when toggling edit scope", async () => {
    const user = userEvent.setup();

    renderCrudPlanner({ onUpdateSlot: vi.fn() });

    const firstCard = within(screen.getByRole("list")).getAllByRole(
      "listitem",
    )[0]!;

    await user.click(
      within(firstCard).getByRole("button", { name: "Edit slot" }),
    );

    const dialog = await screen.findByRole("dialog", { name: "Edit slot" });
    const durationLabel = "Duration (minutes)";

    // Type an occurrence-scope duration.
    const occurrenceDuration = within(dialog).getByLabelText(durationLabel);
    await user.clear(occurrenceDuration);
    await user.type(occurrenceDuration, "90");

    // Switch to series scope and type a different duration.
    await user.click(
      within(dialog).getByRole("radio", { name: "Entire series" }),
    );
    const seriesDuration = within(dialog).getByLabelText(durationLabel);
    await user.clear(seriesDuration);
    await user.type(seriesDuration, "120");

    // Back to occurrence: the earlier 90 draft is restored, not reset.
    await user.click(
      within(dialog).getByRole("radio", { name: "This occurrence only" }),
    );
    expect(within(dialog).getByLabelText(durationLabel)).toHaveValue(90);

    // And the series draft is remembered too.
    await user.click(
      within(dialog).getByRole("radio", { name: "Entire series" }),
    );
    expect(within(dialog).getByLabelText(durationLabel)).toHaveValue(120);
  });

  it("blocks saving when a numeric field is cleared instead of coercing", async () => {
    const user = userEvent.setup();
    const onCreateSlot = vi.fn();

    renderCrudPlanner({ onCreateSlot });

    await user.click(
      screen.getByRole("button", { name: "Add slot to this day" }),
    );

    const dialog = await screen.findByRole("dialog", { name: "Add slot" });
    const duration = within(dialog).getByLabelText("Duration (minutes)");

    await user.clear(duration);
    await user.click(within(dialog).getByRole("button", { name: "Save" }));

    // A cleared required field blocks the submit; nothing is created and the
    // dialog stays open for correction.
    expect(onCreateSlot).not.toHaveBeenCalled();
    expect(
      screen.getByRole("dialog", { name: "Add slot" }),
    ).toBeInTheDocument();
  });

  it("deletes a non-recurring slot after confirmation and moves focus to the next card", async () => {
    const user = userEvent.setup();
    const onDeleteOccurrence = vi.fn();

    renderCrudPlanner({
      defaultFocusedDate: "2026-07-13",
      onDeleteOccurrence,
    });

    const draftCard = within(screen.getByRole("list")).getAllByRole(
      "listitem",
    )[0]!;

    expect(within(draftCard).getByText("08:00 – 08:30")).toBeInTheDocument();
    await user.click(
      within(draftCard).getByRole("button", { name: "Delete slot" }),
    );

    const confirm = await screen.findByRole("alertdialog", {
      name: "Delete this slot?",
    });

    await user.click(within(confirm).getByRole("button", { name: "Delete" }));

    expect(onDeleteOccurrence).toHaveBeenCalledWith({
      slotId: "draft-new-offering",
      occurrenceDate: "2026-07-13",
    });
    // The deleted card animates out before unmounting.
    await waitForElementToBeRemoved(() => screen.queryByText("08:00 – 08:30"));

    const nextCard = within(screen.getByRole("list")).getAllByRole(
      "listitem",
    )[0]!;

    expect(within(nextCard).getByText("14:15 – 15:15")).toBeInTheDocument();
    await waitFor(() => {
      expect(
        within(nextCard).getByRole("button", { name: "Edit slot" }),
      ).toHaveFocus();
    });
  });

  it("falls back to the add-slot button when deleting the day's last slot", async () => {
    const user = userEvent.setup();
    const solo: SlotPlannerSlotData = {
      id: "solo",
      date: "2026-07-08",
      startTime: "10:00",
      durationMinutes: 30,
      timeZone: "Europe/London",
      state: "requestable",
    };

    renderCrudPlanner({
      defaultSlots: [solo],
      defaultFocusedDate: "2026-07-08",
    });

    await user.click(screen.getByRole("button", { name: "Delete slot" }));
    await user.click(
      within(
        await screen.findByRole("alertdialog", { name: "Delete this slot?" }),
      ).getByRole("button", { name: "Delete" }),
    );

    expect(screen.getByText("No slots on this day")).toBeInTheDocument();
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Add slot to this day" }),
      ).toHaveFocus();
    });
  });

  it("deletes one occurrence of a recurring slot, keeping later occurrences", async () => {
    const user = userEvent.setup();
    const onDeleteOccurrence = vi.fn();
    const { container } = renderCrudPlanner({ onDeleteOccurrence });

    const firstCard = within(screen.getByRole("list")).getAllByRole(
      "listitem",
    )[0]!;

    await user.click(
      within(firstCard).getByRole("button", { name: "Delete slot" }),
    );

    const choice = await screen.findByRole("alertdialog", {
      name: "Delete this slot?",
    });

    await user.click(
      within(choice).getByRole("button", { name: "Delete this occurrence" }),
    );

    expect(onDeleteOccurrence).toHaveBeenCalledWith({
      slotId: "mon-morning-architecture",
      occurrenceDate: "2026-07-06",
    });
    // The deleted card animates out before unmounting.
    await waitForElementToBeRemoved(() => screen.queryByText("14:15 – 15:15"));
    expect(getLiveRegion(container)).toHaveTextContent("slot deleted");

    await user.click(screen.getByRole("button", { name: "Next week" }));
    expect(screen.getByText("14:15 – 15:15")).toBeInTheDocument();
  });

  it("deletes a series only after the dedicated confirm step", async () => {
    const user = userEvent.setup();
    const onDeleteOccurrence = vi.fn();
    const onDeleteSeries = vi.fn();
    const { container } = renderCrudPlanner({
      onDeleteOccurrence,
      onDeleteSeries,
    });

    const firstCard = within(screen.getByRole("list")).getAllByRole(
      "listitem",
    )[0]!;

    await user.click(
      within(firstCard).getByRole("button", { name: "Delete slot" }),
    );
    await user.click(
      within(
        await screen.findByRole("alertdialog", { name: "Delete this slot?" }),
      ).getByRole("button", { name: "Delete series" }),
    );

    const confirm = await screen.findByRole("alertdialog", {
      name: "Delete this slot series?",
    });

    expect(
      within(confirm).getByText("This deletes every occurrence of this slot."),
    ).toBeInTheDocument();
    // The step swap unmounts the "Delete series" button that had focus, so
    // focus is moved onto the destructive confirm button rather than dropping
    // to the document body.
    const confirmButton = within(confirm).getByRole("button", {
      name: "Delete",
    });
    await waitFor(() => expect(confirmButton).toHaveFocus());
    expect(onDeleteSeries).not.toHaveBeenCalled();

    await user.click(within(confirm).getByRole("button", { name: "Delete" }));

    expect(onDeleteOccurrence).not.toHaveBeenCalled();
    expect(onDeleteSeries).toHaveBeenCalledWith({
      slotId: "mon-morning-architecture",
    });
    // The deleted card animates out before unmounting.
    await waitForElementToBeRemoved(() => screen.queryByText("14:15 – 15:15"));
    expect(getLiveRegion(container)).toHaveTextContent("slot series deleted");

    await user.click(screen.getByRole("button", { name: "Next week" }));
    expect(screen.queryByText("14:15 – 15:15")).not.toBeInTheDocument();
  });

  it("fires callbacks without self-mutating when the collection is controlled", async () => {
    const user = userEvent.setup();
    const onCreateSlot = vi.fn();
    const onDeleteOccurrence = vi.fn();

    renderCrudPlanner({
      defaultSlots: undefined,
      slots: slotPlannerSampleSlots,
      defaultFocusedDate: "2026-07-13",
      onCreateSlot,
      onDeleteOccurrence,
      generateSlotId: () => "generated-3",
    });

    const draftCard = within(screen.getByRole("list")).getAllByRole(
      "listitem",
    )[0]!;

    await user.click(
      within(draftCard).getByRole("button", { name: "Delete slot" }),
    );
    await user.click(
      within(
        await screen.findByRole("alertdialog", { name: "Delete this slot?" }),
      ).getByRole("button", { name: "Delete" }),
    );

    expect(onDeleteOccurrence).toHaveBeenCalledTimes(1);
    // Controlled: the occurrence stays until the app passes new slots.
    expect(screen.getByText("08:00 – 08:30")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Add slot to this day" }),
    );
    await user.click(
      within(await screen.findByRole("dialog", { name: "Add slot" })).getByRole(
        "button",
        { name: "Save" },
      ),
    );

    expect(onCreateSlot).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("09:00 – 10:00")).not.toBeInTheDocument();
  });

  it("shows a pending affordance on the add-slot button until the promise resolves", async () => {
    const user = userEvent.setup();
    const pending = deferred();
    const onCreateSlot = vi.fn(() => pending.promise);
    const { container } = renderCrudPlanner({
      onCreateSlot,
      generateSlotId: () => "generated-4",
    });

    await user.click(
      screen.getByRole("button", { name: "Add slot to this day" }),
    );
    await user.click(
      within(await screen.findByRole("dialog", { name: "Add slot" })).getByRole(
        "button",
        { name: "Save" },
      ),
    );

    const addButton = screen.getByRole("button", {
      name: "Add slot to this day",
    });

    expect(addButton).toBeDisabled();
    expect(addButton).toHaveAttribute("data-pending", "true");
    expect(screen.getByText("Saving")).toBeInTheDocument();
    expect(screen.queryByText("09:00 – 10:00")).not.toBeInTheDocument();
    expect(getLiveRegion(container)).toHaveTextContent("");

    await act(async () => {
      pending.resolve();
      await pending.promise;
    });

    expect(screen.getByText("09:00 – 10:00")).toBeInTheDocument();
    expect(screen.queryByText("Saving")).not.toBeInTheDocument();
    expect(addButton).toBeEnabled();
    expect(getLiveRegion(container)).toHaveTextContent("slot added");
  });

  it("marks the card pending and disables its actions while an update is in flight", async () => {
    const user = userEvent.setup();
    const pending = deferred();
    const onUpdateSlot = vi.fn(() => pending.promise);

    renderCrudPlanner({ onUpdateSlot });

    const firstCard = within(screen.getByRole("list")).getAllByRole(
      "listitem",
    )[0]!;

    await user.click(
      within(firstCard).getByRole("button", { name: "Edit slot" }),
    );

    const dialog = await screen.findByRole("dialog", { name: "Edit slot" });

    fireEvent.change(within(dialog).getByLabelText("Start time"), {
      target: { value: "16:00" },
    });
    await user.click(within(dialog).getByRole("button", { name: "Save" }));

    expect(firstCard).toHaveAttribute("data-pending", "true");
    expect(within(firstCard).getByText("Saving")).toBeInTheDocument();
    expect(
      within(firstCard).getByRole("button", { name: "Edit slot" }),
    ).toBeDisabled();
    expect(
      within(firstCard).getByRole("button", { name: "Delete slot" }),
    ).toBeDisabled();
    expect(screen.getByText("14:15 – 15:15")).toBeInTheDocument();

    await act(async () => {
      pending.resolve();
      await pending.promise;
    });

    expect(screen.getByText("16:00 – 17:00")).toBeInTheDocument();
    expect(firstCard).not.toHaveAttribute("data-pending");
  });

  it("keeps the slot unchanged on rejection and retries the identical payload", async () => {
    const user = userEvent.setup();
    const onUpdateSlot = vi
      .fn<(payload: SlotPlannerUpdatePayload) => Promise<void>>()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce(undefined);

    renderCrudPlanner({ onUpdateSlot });

    const firstCard = within(screen.getByRole("list")).getAllByRole(
      "listitem",
    )[0]!;

    await user.click(
      within(firstCard).getByRole("button", { name: "Edit slot" }),
    );

    const dialog = await screen.findByRole("dialog", { name: "Edit slot" });

    fireEvent.change(within(dialog).getByLabelText("Start time"), {
      target: { value: "16:30" },
    });
    await user.click(within(dialog).getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(firstCard).toHaveAttribute("data-error", "true");
    });
    expect(within(firstCard).getByText("Save failed")).toBeInTheDocument();
    // The occurrence still renders the previous definition.
    expect(screen.getByText("14:15 – 15:15")).toBeInTheDocument();

    await user.click(within(firstCard).getByRole("button", { name: "Retry" }));

    await waitFor(() => {
      expect(screen.getByText("16:30 – 17:30")).toBeInTheDocument();
    });
    expect(onUpdateSlot).toHaveBeenCalledTimes(2);
    // Retry re-fires the identical payload.
    expect(onUpdateSlot.mock.calls[1]![0]).toEqual(
      onUpdateSlot.mock.calls[0]![0],
    );
    expect(screen.queryByText("Save failed")).not.toBeInTheDocument();
  });

  it("keeps requested occurrences editable but locks booked and blocked occurrences", () => {
    const requestedRender = renderCrudPlanner({
      defaultFocusedDate: "2026-07-07",
    });
    const requestedCard = screen.getByRole("listitem");

    expect(requestedCard).toHaveAttribute("data-status", "requested");
    expect(requestedCard).not.toHaveAttribute("data-locked");
    expect(
      within(requestedCard).getByRole("button", { name: "Edit slot" }),
    ).toBeEnabled();
    expect(
      within(requestedCard).getByRole("button", { name: "Delete slot" }),
    ).toBeEnabled();
    requestedRender.unmount();

    renderCrudPlanner({ defaultFocusedDate: "2026-07-09" });

    // booked
    expect(
      screen.queryByRole("button", { name: "Edit slot" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Delete slot" }),
    ).not.toBeInTheDocument();

    // blocked
    for (const focusedDate of ["2026-07-10"]) {
      const { unmount } = renderCrudPlanner({
        defaultFocusedDate: focusedDate,
      });

      const card = screen
        .getAllByRole("listitem")
        .find((item) => item.getAttribute("data-locked") === "true")!;

      // No focusable action exists inside the card for keyboard users either.
      expect(within(card).queryAllByRole("button")).toHaveLength(0);
      unmount();
    }
  });

  it("hides the add-slot affordance on past days", () => {
    renderCrudPlanner({ defaultFocusedDate: "2026-06-29" });

    expect(
      screen.queryByRole("button", { name: "Add slot to this day" }),
    ).not.toBeInTheDocument();
  });

  it("restores focus to the edit button when the editor closes without saving", async () => {
    const user = userEvent.setup();

    renderCrudPlanner();

    const firstCard = within(screen.getByRole("list")).getAllByRole(
      "listitem",
    )[0]!;
    const editButton = within(firstCard).getByRole("button", {
      name: "Edit slot",
    });

    await user.click(editButton);

    const dialog = await screen.findByRole("dialog", { name: "Edit slot" });

    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));

    await waitFor(() => {
      expect(
        screen.queryByRole("dialog", { name: "Edit slot" }),
      ).not.toBeInTheDocument();
    });
    await waitFor(() => {
      expect(editButton).toHaveFocus();
    });
  });
});

function sequentialIds() {
  let next = 0;

  return () => `gen-${++next}`;
}

// Deliberately non-overlapping times so only the intended constraint trips.
const copySource: SlotPlannerSlotData = {
  id: "copy-source",
  date: "2026-07-06",
  startTime: "09:00",
  durationMinutes: 60,
  timeZone: "Europe/London",
  state: "requestable",
  recurrence: { frequency: "weekly", until: "2026-07-20" },
  capacity: 4,
  bookedCount: 2,
  bufferBeforeMinutes: 10,
  bufferAfterMinutes: 5,
  data: { tags: ["Pairing"] },
};

// requestedCount > 0 derives "requested"; copying drops requested counts.
const requestedSource: SlotPlannerSlotData = {
  id: "requested-source",
  date: "2026-07-06",
  startTime: "12:00",
  durationMinutes: 60,
  timeZone: "Europe/London",
  state: "requestable",
  requestedCount: 1,
};

// Occupies Wednesday morning so a copy targeting Wednesday overlaps it.
const wedExisting: SlotPlannerSlotData = {
  id: "wed-existing",
  date: "2026-07-08",
  startTime: "09:30",
  durationMinutes: 60,
  timeZone: "Europe/London",
  state: "requestable",
};

describe("SlotPlanner constraints", () => {
  it("renders the daily cap meter through the dailyCapSummary template", () => {
    const { container } = renderPlanner({
      constraints: { dailyRequestableCap: 3 },
    });

    const meter = container.querySelector(
      '[data-slot="slot-planner-cap-meter"]',
    );

    // Monday has 2 published (requestable) occurrences.
    expect(meter).toHaveTextContent("Daily cap: 2 / 3 requestable slots");
    expect(meter).not.toHaveAttribute("data-cap-reached");
    expect(screen.queryByText("Daily cap reached")).not.toBeInTheDocument();
  });

  it("marks the cap meter reached in text, not color alone", () => {
    const { container } = renderPlanner({
      constraints: { dailyRequestableCap: 2 },
    });

    const meter = container.querySelector(
      '[data-slot="slot-planner-cap-meter"]',
    );

    expect(meter).toHaveAttribute("data-cap-reached", "true");
    expect(meter).toHaveTextContent("Daily cap: 2 / 2 requestable slots");
    // The daily-cap violation message renders alongside the summary.
    expect(
      within(meter as HTMLElement).getByText("Daily cap reached"),
    ).toBeInTheDocument();
  });

  it("renders the weekly cap meter through the weeklyCapSummary template", () => {
    const { container } = renderPlanner({
      constraints: { weeklyRequestableCap: 5 },
    });

    const meter = container.querySelector(
      '[data-slot="slot-planner-cap-meter"]',
    );

    expect(meter).toHaveAttribute("data-cap-reached", "true");
    expect(
      container.querySelector('[data-slot="slot-planner-weekly-cap"]'),
    ).toHaveTextContent("Weekly cap: 5 / 5 requestable slots");
    expect(
      within(meter as HTMLElement).getByText("Weekly cap reached"),
    ).toBeInTheDocument();
  });

  it("announces the daily cap when a mutation makes it reached", async () => {
    const user = userEvent.setup();
    const { container } = renderCrudPlanner({
      defaultSlots: [],
      constraints: { dailyRequestableCap: 1 },
    });

    await user.click(
      screen.getByRole("button", { name: "Add slot to this day" }),
    );
    await user.click(
      within(await screen.findByRole("dialog", { name: "Add slot" })).getByRole(
        "button",
        { name: "Save" },
      ),
    );

    // Reaching the cap exactly is allowed; exceeding it is what violates.
    expect(screen.getByText("09:00 – 10:00")).toBeInTheDocument();
    expect(getLiveRegion(container)).toHaveTextContent("slot added");
    expect(getLiveRegion(container)).toHaveTextContent("Daily cap reached");
  });

  it("announces the weekly cap when a mutation makes it reached", async () => {
    const user = userEvent.setup();
    const { container } = renderCrudPlanner({
      defaultSlots: [],
      constraints: { weeklyRequestableCap: 1 },
    });

    await user.click(
      screen.getByRole("button", { name: "Add slot to this day" }),
    );
    await user.click(
      within(await screen.findByRole("dialog", { name: "Add slot" })).getByRole(
        "button",
        { name: "Save" },
      ),
    );

    expect(screen.getByText("09:00 – 10:00")).toBeInTheDocument();
    expect(getLiveRegion(container)).toHaveTextContent("slot added");
    expect(getLiveRegion(container)).toHaveTextContent("Weekly cap reached");
  });

  it("blocks a violating editor save and phrases violations via taxonomy", async () => {
    const user = userEvent.setup();
    const onCreateSlot = vi.fn();

    renderCrudPlanner({
      onCreateSlot,
      constraints: { durationIncrementMinutes: 15, minDurationMinutes: 60 },
    });

    await user.click(
      screen.getByRole("button", { name: "Add slot to this day" }),
    );

    const dialog = await screen.findByRole("dialog", { name: "Add slot" });
    const duration = within(dialog).getByLabelText("Duration (minutes)");

    await user.clear(duration);
    await user.type(duration, "50");
    await user.click(within(dialog).getByRole("button", { name: "Save" }));

    // The callback did not fire and the editor stays open with the list.
    expect(onCreateSlot).not.toHaveBeenCalled();

    const alert = within(dialog).getByRole("alert");

    expect(within(alert).getByText("Fix before saving")).toBeInTheDocument();
    expect(
      within(alert).getByText("Shorter than the minimum duration"),
    ).toBeInTheDocument();
    expect(
      within(alert).getByText("Duration must be a multiple of 15 minutes"),
    ).toBeInTheDocument();

    // Saving again revalidates: a fixed duration goes through.
    await user.clear(duration);
    await user.type(duration, "60");
    await user.click(within(dialog).getByRole("button", { name: "Save" }));

    expect(onCreateSlot).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByRole("dialog", { name: "Add slot" }),
    ).not.toBeInTheDocument();
  });
});

describe("SlotPlanner batch operations", () => {
  it("hides copy and clear actions on past days", () => {
    renderCrudPlanner({ defaultFocusedDate: "2026-06-29" });

    for (const name of ["Copy day", "Copy week", "Clear day"]) {
      expect(screen.queryByRole("button", { name })).not.toBeInTheDocument();
    }
  });

  it("copies a day to checked targets, reporting rejected slots", async () => {
    const user = userEvent.setup();
    const onBatchChange = vi.fn();
    const { container } = renderCrudPlanner({
      defaultSlots: [copySource, requestedSource, wedExisting],
      onBatchChange,
      generateSlotId: sequentialIds(),
    });

    await user.click(screen.getByRole("button", { name: "Copy day" }));

    const dialog = await screen.findByRole("dialog", { name: "Copy day" });

    // The focused week's other 6 days render as rail-style checkboxes.
    expect(within(dialog).getAllByRole("checkbox")).toHaveLength(6);
    await user.click(
      within(dialog).getByRole("checkbox", { name: "Tue Jul 7" }),
    );
    await user.click(
      within(dialog).getByRole("checkbox", { name: "Wed Jul 8" }),
    );
    await user.click(within(dialog).getByRole("button", { name: "Apply" }));

    // One payload: Tuesday copies are accepted, the Wednesday 09:00 copy
    // overlaps wed-existing and is rejected — reported, never silently
    // dropped. Copies preserve capacity and drop recurrence/booked/requested
    // counts.
    expect(onBatchChange).toHaveBeenCalledTimes(1);
    expect(onBatchChange.mock.calls[0]![0]).toEqual({
      createdSlots: [
        {
          id: "gen-1",
          date: "2026-07-07",
          startTime: "09:00",
          durationMinutes: 60,
          timeZone: "Europe/London",
          state: "requestable",
          capacity: 4,
          bufferBeforeMinutes: 10,
          bufferAfterMinutes: 5,
          data: { tags: ["Pairing"] },
        },
        {
          id: "gen-2",
          date: "2026-07-07",
          startTime: "12:00",
          durationMinutes: 60,
          timeZone: "Europe/London",
          state: "requestable",
        },
        {
          id: "gen-4",
          date: "2026-07-08",
          startTime: "12:00",
          durationMinutes: 60,
          timeZone: "Europe/London",
          state: "requestable",
        },
      ],
      deletedSlotIds: [],
      violations: {
        "gen-3": [
          {
            code: "overlap",
            params: { date: "2026-07-08", otherSlotId: "wed-existing" },
          },
        ],
      },
    });
    expect(getLiveRegion(container)).toHaveTextContent(
      "3 slots added. 1 slot rejected",
    );

    // Uncontrolled: the accepted copy renders on Tuesday.
    await user.click(screen.getAllByRole("tab")[1]!);
    expect(screen.getByText("09:00 – 10:00")).toBeInTheDocument();
  });

  it("disables copy-day Apply until at least one target is selected", async () => {
    const user = userEvent.setup();
    const onBatchChange = vi.fn();

    renderCrudPlanner({
      defaultSlots: [copySource],
      onBatchChange,
      generateSlotId: sequentialIds(),
    });

    await user.click(screen.getByRole("button", { name: "Copy day" }));

    const dialog = await screen.findByRole("dialog", { name: "Copy day" });
    const apply = within(dialog).getByRole("button", { name: "Apply" });

    // No targets: Apply is disabled and clicking it never fires a batch.
    expect(apply).toBeDisabled();
    await user.click(apply);
    expect(onBatchChange).not.toHaveBeenCalled();

    await user.click(
      within(dialog).getByRole("checkbox", { name: "Tue Jul 7" }),
    );
    expect(apply).toBeEnabled();

    await user.click(apply);
    expect(onBatchChange).toHaveBeenCalledTimes(1);
  });

  it("copies the week forward after its confirm step", async () => {
    const user = userEvent.setup();
    const onBatchChange = vi.fn();
    const { container } = renderCrudPlanner({
      defaultSlots: [wedExisting],
      onBatchChange,
      generateSlotId: sequentialIds(),
    });

    await user.click(screen.getByRole("button", { name: "Copy week" }));

    const confirm = await screen.findByRole("alertdialog", {
      name: "Copy this week forward?",
    });

    expect(
      within(confirm).getByText(
        "Copies every slot from this week to next week.",
      ),
    ).toBeInTheDocument();
    expect(onBatchChange).not.toHaveBeenCalled();

    await user.click(within(confirm).getByRole("button", { name: "Apply" }));

    expect(onBatchChange.mock.calls[0]![0]).toEqual({
      createdSlots: [
        {
          id: "gen-1",
          date: "2026-07-15",
          startTime: "09:30",
          durationMinutes: 60,
          timeZone: "Europe/London",
          state: "requestable",
        },
      ],
      deletedSlotIds: [],
      violations: {},
    });
    expect(getLiveRegion(container)).toHaveTextContent("1 slot added");

    // The copy lands on the same weekday one week later.
    await user.click(screen.getByRole("button", { name: "Next week" }));
    await user.click(screen.getAllByRole("tab")[2]!);
    expect(screen.getByText("09:30 – 10:30")).toBeInTheDocument();
  });

  it("clears a day into deletions and cancelled overrides, keeping locked slots", async () => {
    const user = userEvent.setup();
    const onBatchChange = vi.fn();
    const single: SlotPlannerSlotData = {
      id: "single-1",
      date: "2026-07-06",
      startTime: "08:00",
      durationMinutes: 30,
      timeZone: "Europe/London",
      state: "requestable",
    };
    const recurring: SlotPlannerSlotData = {
      id: "rec-1",
      date: "2026-07-06",
      startTime: "10:00",
      durationMinutes: 60,
      timeZone: "Europe/London",
      state: "requestable",
      recurrence: { frequency: "weekly" },
    };
    const booked: SlotPlannerSlotData = {
      id: "booked-1",
      date: "2026-07-06",
      startTime: "14:00",
      durationMinutes: 60,
      timeZone: "Europe/London",
      state: "requestable",
      bookedCount: 1,
    };
    const { container } = renderCrudPlanner({
      defaultSlots: [single, recurring, booked],
      onBatchChange,
    });

    await user.click(screen.getByRole("button", { name: "Clear day" }));

    const confirm = await screen.findByRole("alertdialog", {
      name: "Clear this day?",
    });

    expect(
      within(confirm).getByText(
        "This removes every slot on this day. Locked slots are kept.",
      ),
    ).toBeInTheDocument();
    await user.click(
      within(confirm).getByRole("button", { name: "Clear day" }),
    );

    // Non-recurring slots are deleted; the recurring occurrence becomes a
    // cancelled override in updatedSlots; the booked slot is untouched.
    expect(onBatchChange.mock.calls[0]![0]).toEqual({
      createdSlots: [],
      deletedSlotIds: ["single-1"],
      updatedSlots: [
        {
          ...recurring,
          recurrence: {
            frequency: "weekly",
            overrides: [{ occurrenceDate: "2026-07-06", cancelled: true }],
          },
        },
      ],
      violations: {},
    });
    expect(getLiveRegion(container)).toHaveTextContent("Day cleared");

    // Only the locked (booked) card remains today; the cleared cards
    // animate out before unmounting.
    await waitForElementToBeRemoved(() => screen.queryByText("08:00 – 08:30"));
    await waitFor(() => {
      expect(screen.queryByText("10:00 – 11:00")).not.toBeInTheDocument();
    });
    expect(screen.getByText("14:00 – 15:00")).toBeInTheDocument();

    // …and the series keeps its later occurrences.
    await user.click(screen.getByRole("button", { name: "Next week" }));
    expect(screen.getByText("10:00 – 11:00")).toBeInTheDocument();
  });

  it("fires onBatchChange without self-mutating when controlled", async () => {
    const user = userEvent.setup();
    const onBatchChange = vi.fn();

    renderCrudPlanner({
      defaultSlots: undefined,
      slots: [copySource],
      onBatchChange,
      generateSlotId: sequentialIds(),
    });

    await user.click(screen.getByRole("button", { name: "Copy day" }));

    const dialog = await screen.findByRole("dialog", { name: "Copy day" });

    await user.click(
      within(dialog).getByRole("checkbox", { name: "Tue Jul 7" }),
    );
    await user.click(within(dialog).getByRole("button", { name: "Apply" }));

    expect(onBatchChange).toHaveBeenCalledTimes(1);
    expect(onBatchChange.mock.calls[0]![0].createdSlots).toHaveLength(1);

    // Controlled: Tuesday stays empty until the app passes new slots.
    await user.click(screen.getAllByRole("tab")[1]!);
    expect(screen.getByText("No slots on this day")).toBeInTheDocument();
  });
});

describe("SlotPlanner custom renderers", () => {
  it("replaces the slot card while keeping the structural <li> wrapper", () => {
    const { container } = renderPlanner({
      renderers: {
        slotCard: ({ occurrence, locked, pending }) => (
          <div data-testid="custom-card">
            {`custom ${occurrence.startTime}${locked ? " locked" : ""}${
              pending ? " pending" : ""
            }`}
          </div>
        ),
      },
    });

    expect(
      screen.getAllByTestId("custom-card").map((n) => n.textContent),
    ).toEqual(["custom 14:15", "custom 18:00"]);
    // The default card content is fully replaced.
    expect(
      screen.queryByRole("button", { name: "Edit slot" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("60 min")).not.toBeInTheDocument();

    // The <li> wrapper and its data attributes stay structural.
    const card = container.querySelector(
      '[data-slot="slot-planner-slot-card"]',
    );

    expect(card?.tagName).toBe("LI");
    expect(card).toHaveAttribute("data-status", "requestable");
  });

  it("replaces the day card content while keeping tab semantics", () => {
    renderPlanner({
      renderers: {
        dayCard: ({ date, isToday, selected, summary }) => (
          <span>
            {`day ${date}${isToday ? " today" : ""}${
              selected ? " selected" : ""
            } r${summary.requestable}`}
          </span>
        ),
      },
    });

    const tabs = screen.getAllByRole("tab");

    expect(tabs).toHaveLength(7);
    expect(tabs[0]).toHaveTextContent("day 2026-07-06 today selected r2");
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    expect(tabs[0]).toHaveAttribute("tabindex", "0");
    expect(tabs[1]).toHaveAttribute("tabindex", "-1");
    // The default weekday label is gone.
    expect(within(tabs[0]!).queryByText("Mon")).not.toBeInTheDocument();
  });

  it("replaces the cap meter with used, cap, reached, and formatted text", () => {
    const { container, rerender } = renderPlanner({
      constraints: { dailyRequestableCap: 3 },
      renderers: {
        capMeter: ({ cap, reached, text, used }) => (
          <p data-testid="custom-cap">
            {`${used} of ${cap}${reached ? " FULL" : ""} (${text})`}
          </p>
        ),
      },
    });

    expect(screen.getByTestId("custom-cap")).toHaveTextContent(
      "2 of 3 (Daily cap: 2 / 3 requestable slots)",
    );
    expect(
      container.querySelector('[data-slot="slot-planner-cap-meter"]'),
    ).not.toBeInTheDocument();

    rerender(
      <SlotPlanner
        slots={slotPlannerSampleSlots}
        defaultFocusedDate="2026-07-06"
        now={NOW}
        timeZone="Europe/London"
        title="Availability"
        constraints={{ dailyRequestableCap: 2 }}
        renderers={{
          capMeter: ({ reached, reachedMessage }) => (
            <p data-testid="custom-cap">
              {`${reached ? "FULL" : "open"} ${reachedMessage ?? ""}`}
            </p>
          ),
        }}
      />,
    );

    expect(screen.getByTestId("custom-cap")).toHaveTextContent(
      "FULL Daily cap reached",
    );
  });

  it("renders the defaults for every omitted surface", () => {
    // Only the tag surface is overridden; everything else stays default.
    const { container } = renderPlanner({
      constraints: { dailyRequestableCap: 3 },
      renderers: {
        tag: ({ tag }) => <em>{`#${tag}`}</em>,
      },
    });

    // Default slot card, day card, cap meter, toolbar, and day header.
    expect(
      within(screen.getAllByRole("tab")[0]!).getByText("Mon"),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: "Edit slot" }).length,
    ).toBeGreaterThan(0);
    expect(
      container.querySelector('[data-slot="slot-planner-cap-meter"]'),
    ).toHaveTextContent("Daily cap: 2 / 3 requestable slots");
    expect(
      screen.getByRole("button", { name: "Next week" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 3, name: "Monday, July 6, 2026" }),
    ).toBeInTheDocument();
    // The custom tag chip renders inside the default card.
    expect(screen.getAllByText("#Playwright").length).toBeGreaterThan(0);
    expect(
      container.querySelector('[data-slot="slot-planner-tag-chip"]'),
    ).not.toBeInTheDocument();
  });

  it("replaces the toolbar and exposes navigation plus batch dispatchers", async () => {
    const user = userEvent.setup();

    renderCrudPlanner({
      renderers: {
        toolbar: ({ copyDay, goToNextWeek, title }) => (
          <>
            <span>{`custom toolbar for ${String(title)}`}</span>
            <button type="button" onClick={goToNextWeek}>
              jump forward
            </button>
            <button type="button" onClick={copyDay}>
              open copy day
            </button>
          </>
        ),
      },
    });

    expect(
      screen.queryByRole("button", { name: "Next week" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText("custom toolbar for Availability"),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "jump forward" }));

    expect(
      screen.getByRole("heading", { level: 3, name: "Monday, July 13, 2026" }),
    ).toBeInTheDocument();

    // The batch dispatcher opens the structural copy-day dialog.
    await user.click(screen.getByRole("button", { name: "open copy day" }));

    expect(
      await screen.findByRole("dialog", { name: "Copy day" }),
    ).toBeInTheDocument();
  });

  it("replaces the day header and empty-day message", () => {
    renderPlanner({
      focusedDate: "2026-07-12",
      renderers: {
        dayHeader: ({ date, formattedDate, isToday }) => (
          <div>{`custom header ${date}${isToday ? " today" : ""} — ${formattedDate}`}</div>
        ),
        emptyDay: ({ date }) => <p>{`nothing on ${date}`}</p>,
      },
    });

    expect(
      screen.getByText("custom header 2026-07-12 — Sunday, July 12, 2026"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 3 })).not.toBeInTheDocument();
    expect(screen.getByText("nothing on 2026-07-12")).toBeInTheDocument();
    expect(screen.queryByText("No slots on this day")).not.toBeInTheDocument();
  });

  it("decorates the default slot card via renderDefault with an unknown data key", () => {
    renderPlanner({
      focusedDate: "2026-07-08",
      renderers: {
        slotCard: ({ occurrence, renderDefault }) => {
          const priceUsd = occurrence.slot.data?.priceUsd;

          return (
            <>
              {renderDefault()}
              {typeof priceUsd === "number" ? (
                <span data-testid="price-badge">{`$${priceUsd}`}</span>
              ) : null}
            </>
          );
        },
      },
    });

    const card = screen.getByRole("listitem");

    // The decorated card keeps the full default content…
    expect(within(card).getByText("17:00 – 18:30")).toBeInTheDocument();
    expect(within(card).getByText("Recurring biweekly")).toBeInTheDocument();
    expect(within(card).getByText("System Design")).toBeInTheDocument();
    expect(
      within(card).getByRole("button", { name: "Edit slot" }),
    ).toBeInTheDocument();
    // …plus the badge sourced from the unknown `data` key.
    expect(within(card).getByTestId("price-badge")).toHaveTextContent("$40");
  });

  it("passes unknown data keys to the custom renderer untouched", () => {
    const receivedBysSlotId = new Map<
      string,
      SlotPlannerSlotPayload | undefined
    >();

    renderPlanner({
      focusedDate: "2026-07-08",
      renderers: {
        slotCard: ({ occurrence }) => {
          receivedBysSlotId.set(occurrence.slotId, occurrence.slot.data);

          return <span>custom</span>;
        },
      },
    });

    const fixture = slotPlannerSampleSlots.find(
      (slot) => slot.id === "wed-group-systems",
    )!;

    // Exact object identity: the payload bag is never cloned or filtered.
    expect(receivedBysSlotId.get("wed-group-systems")).toBe(fixture.data);
    expect(receivedBysSlotId.get("wed-group-systems")).toEqual({
      tags: ["System Design", "Group Session"],
      priceUsd: 40,
    });
  });

  it("submits custom editor content through submit() with labelling intact", async () => {
    const user = userEvent.setup();
    const onCreateSlot = vi.fn();

    renderCrudPlanner({
      onCreateSlot,
      generateSlotId: () => "custom-editor-1",
      renderers: {
        slotEditor: ({ date, dismiss, mode, submit }) => (
          <div>
            <p>{`custom editor ${mode} ${date}`}</p>
            <button
              type="button"
              onClick={() =>
                submit({
                  scope: "series",
                  values: {
                    startTime: "10:00",
                    durationMinutes: 45,
                    capacity: 1,
                    bufferBeforeMinutes: 0,
                    bufferAfterMinutes: 0,
                    timeZone: "Europe/London",
                    tags: [],
                    note: "",
                    recurrence: "none",
                    recurrenceUntil: "",
                  },
                })
              }
            >
              save custom
            </button>
            <button type="button" onClick={dismiss}>
              close custom
            </button>
          </div>
        ),
      },
    });

    await user.click(
      screen.getByRole("button", { name: "Add slot to this day" }),
    );

    // The Dialog shell and its labelling stay structural.
    const dialog = await screen.findByRole("dialog", { name: "Add slot" });

    expect(
      within(dialog).getByText("custom editor create 2026-07-06"),
    ).toBeInTheDocument();
    // The default form is fully replaced.
    expect(
      within(dialog).queryByLabelText("Start time"),
    ).not.toBeInTheDocument();

    // Dismiss closes without firing the callback…
    await user.click(
      within(dialog).getByRole("button", { name: "close custom" }),
    );

    expect(onCreateSlot).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(
        screen.queryByRole("dialog", { name: "Add slot" }),
      ).not.toBeInTheDocument();
    });

    // …and submit runs the same validate → callback → apply pipeline.
    await user.click(
      screen.getByRole("button", { name: "Add slot to this day" }),
    );
    await user.click(
      within(await screen.findByRole("dialog", { name: "Add slot" })).getByRole(
        "button",
        { name: "save custom" },
      ),
    );

    expect(onCreateSlot).toHaveBeenCalledWith({
      slot: {
        id: "custom-editor-1",
        date: "2026-07-06",
        startTime: "10:00",
        durationMinutes: 45,
        timeZone: "Europe/London",
        state: "requestable",
      },
    });
    expect(
      screen.queryByRole("dialog", { name: "Add slot" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("10:00 – 10:45")).toBeInTheDocument();
  });

  it("keeps a blocked custom-editor submit open and surfaces violations", async () => {
    const user = userEvent.setup();
    const onCreateSlot = vi.fn();

    renderCrudPlanner({
      onCreateSlot,
      constraints: { minDurationMinutes: 120 },
      renderers: {
        slotEditor: ({ submit, violations }) => (
          <div>
            <ul aria-label="custom violations">
              {violations.map((violation) => (
                <li key={violation.code}>{violation.code}</li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() =>
                submit({
                  scope: "series",
                  values: {
                    startTime: "10:00",
                    durationMinutes: 45,
                    capacity: 1,
                    bufferBeforeMinutes: 0,
                    bufferAfterMinutes: 0,
                    timeZone: "Europe/London",
                    tags: [],
                    note: "",
                    recurrence: "none",
                    recurrenceUntil: "",
                  },
                })
              }
            >
              save custom
            </button>
          </div>
        ),
      },
    });

    await user.click(
      screen.getByRole("button", { name: "Add slot to this day" }),
    );

    const dialog = await screen.findByRole("dialog", { name: "Add slot" });

    await user.click(
      within(dialog).getByRole("button", { name: "save custom" }),
    );

    // The dialog stays open with the structured violations in context.
    expect(onCreateSlot).not.toHaveBeenCalled();
    expect(
      screen.getByRole("dialog", { name: "Add slot" }),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole("list", { name: "custom violations" })).getByText(
        "min-duration",
      ),
    ).toBeInTheDocument();
  });

  it("keeps structural invariants with every renderer overridden", async () => {
    const user = userEvent.setup();
    const allRenderers: SlotPlannerRenderers = {
      capMeter: ({ cap, used }) => <p>{`cap ${used}/${cap}`}</p>,
      dayCard: ({ date }) => <span>{`d ${date.slice(8)}`}</span>,
      dayHeader: ({ date }) => <div>{`heading ${date}`}</div>,
      emptyDay: () => <p>nothing here</p>,
      slotCard: ({ occurrence, remove }) => (
        <div>
          <span>{`slot ${occurrence.startTime}`}</span>
          {remove ? (
            <button type="button" onClick={remove}>
              {`remove ${occurrence.startTime}`}
            </button>
          ) : null}
        </div>
      ),
      slotEditor: ({ dismiss }) => (
        <button type="button" onClick={dismiss}>
          custom editor
        </button>
      ),
      tag: ({ tag }) => <i>{tag}</i>,
      toolbar: ({ goToNextWeek }) => (
        <button type="button" onClick={goToNextWeek}>
          advance
        </button>
      ),
    };
    const { container } = renderCrudPlanner({
      constraints: { dailyRequestableCap: 3 },
      renderers: allRenderers,
    });

    // Day-rail arrow-key navigation still works on the structural tabs.
    const tabs = screen.getAllByRole("tab");

    expect(tabs).toHaveLength(7);
    tabs[0]!.focus();
    await user.keyboard("{ArrowRight}");

    expect(tabs[1]).toHaveFocus();
    expect(tabs[1]).toHaveAttribute("aria-selected", "true");

    await user.keyboard("{ArrowLeft}");
    expect(tabs[0]).toHaveFocus();
    expect(screen.getByText("heading 2026-07-06")).toBeInTheDocument();

    // Deleting through the custom card action still announces on the
    // structural live region…
    await user.click(screen.getByRole("button", { name: "remove 14:15" }));
    await user.click(
      within(
        await screen.findByRole("alertdialog", { name: "Delete this slot?" }),
      ).getByRole("button", { name: "Delete this occurrence" }),
    );

    // The deleted card animates out before unmounting.
    await waitForElementToBeRemoved(() => screen.queryByText("slot 14:15"));
    expect(getLiveRegion(container)).toHaveTextContent("slot deleted");

    // …and focus recovery falls back to the neighboring card's <li>
    // wrapper, since the custom card renders no edit button.
    const remainingCard = container.querySelector(
      '[data-slot="slot-planner-slot-card"]',
    ) as HTMLElement;

    expect(within(remainingCard).getByText("slot 18:00")).toBeInTheDocument();
    await waitFor(() => {
      expect(remainingCard).toHaveFocus();
    });
  });
});

describe("SlotPlanner day view", () => {
  it("renders the day panel standalone without tab semantics", async () => {
    const user = userEvent.setup();

    renderPlanner({ view: "day" });

    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
    expect(screen.queryByRole("tab")).not.toBeInTheDocument();
    expect(screen.queryByRole("tabpanel")).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 3, name: "Monday, July 6, 2026" }),
    ).toBeInTheDocument();
    expect(screen.getByText("14:15 – 15:15")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Next week" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Previous day" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Next day" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "This week" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Today" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Week" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Day" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await user.click(screen.getByRole("button", { name: "Previous day" }));

    expect(
      screen.getByRole("heading", { level: 3, name: "Sunday, July 5, 2026" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Today" })).toBeEnabled();

    await user.click(screen.getByRole("button", { name: "Today" }));

    expect(
      screen.getByRole("heading", { level: 3, name: "Monday, July 6, 2026" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Today" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Next day" }));

    expect(
      screen.getByRole("heading", { level: 3, name: "Tuesday, July 7, 2026" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Today" })).toBeEnabled();
  });
});

describe("SlotPlannerViolationList", () => {
  it("renders every violation, even when two share a code", () => {
    render(
      <SlotPlannerViolationList
        taxonomy={defaultSlotPlannerTaxonomy}
        violations={[
          { code: "overlap", params: { otherSlotId: "a" } },
          { code: "overlap", params: { otherSlotId: "b" } },
        ]}
      />,
    );

    // Keyed by code+index, so a duplicate code never collapses the two
    // entries into one list item.
    const items = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(items).toHaveLength(2);
  });
});
