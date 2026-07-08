import {
  fireEvent,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { SlotPlanner, type SlotPlannerProps } from ".";
import { slotPlannerSampleSlots } from "./slot-planner-fixtures";

// Matches slot-planner.test.tsx: keeps "today" at 2026-07-06 in any zone.
const NOW = "2026-07-06T00:30:00";

function renderPlanner(props: Partial<SlotPlannerProps> = {}) {
  return render(
    <SlotPlanner
      defaultSlots={slotPlannerSampleSlots}
      defaultFocusedDate="2026-07-06"
      now={NOW}
      title="Availability"
      {...props}
    />,
  );
}

function getIndicators() {
  return document.querySelectorAll(
    '[data-slot="slot-planner-day-tab-indicator"]',
  );
}

function getWeekPanels() {
  return document.querySelectorAll('[data-slot="slot-planner-week-panel"]');
}

function getEnteringWeekPanel() {
  return document.querySelector(
    '[data-slot="slot-planner-week-panel"]:not([data-exiting])',
  ) as HTMLElement;
}

async function createSlotThroughEditor(
  user: ReturnType<typeof userEvent.setup>,
) {
  await user.click(
    screen.getByRole("button", { name: "Add slot to this day" }),
  );

  const dialog = await screen.findByRole("dialog", { name: "Add slot" });

  await user.click(within(dialog).getByRole("button", { name: "Save" }));
}

describe("SlotPlanner motion layer", () => {
  it("renders the shared-layout selection indicator only on the selected tab", async () => {
    const user = userEvent.setup();

    renderPlanner();

    expect(getIndicators()).toHaveLength(1);
    expect(screen.getAllByRole("tab")[0]!.contains(getIndicators()[0]!)).toBe(
      true,
    );

    await user.click(screen.getAllByRole("tab")[2]!);

    // The indicator travels: it now renders only inside the new selection,
    // while the non-motion selection state stays on the tab itself.
    expect(getIndicators()).toHaveLength(1);
    expect(screen.getAllByRole("tab")[2]!.contains(getIndicators()[0]!)).toBe(
      true,
    );
    expect(screen.getAllByRole("tab")[2]).toHaveAttribute(
      "data-selected",
      "true",
    );
    expect(screen.getAllByRole("tab")[0]).not.toHaveAttribute("data-selected");
  });

  it("pulses a token-colored highlight on a slot created through the editor", async () => {
    const user = userEvent.setup();

    renderPlanner({ defaultSlots: [] });
    await createSlotThroughEditor(user);

    // The default editor values create a 09:00 one-hour slot.
    const card = await screen.findByRole("listitem");

    expect(within(card).getByText("09:00 – 10:00")).toBeInTheDocument();
    await waitFor(() => {
      expect(
        card.querySelector('[data-slot="slot-planner-slot-highlight"]'),
      ).toBeInTheDocument();
    });
  });

  it("pulses a highlight on an edited slot after the mutation succeeds", async () => {
    const user = userEvent.setup();

    renderPlanner();

    const card = within(screen.getByRole("list")).getAllByRole("listitem")[0]!;

    await user.click(within(card).getByRole("button", { name: "Edit slot" }));

    const dialog = await screen.findByRole("dialog", { name: "Edit slot" });

    fireEvent.change(within(dialog).getByLabelText("Start time"), {
      target: { value: "15:00" },
    });
    await user.click(within(dialog).getByRole("button", { name: "Save" }));

    expect(within(card).getByText("15:00 – 16:00")).toBeInTheDocument();
    await waitFor(() => {
      expect(
        card.querySelector('[data-slot="slot-planner-slot-highlight"]'),
      ).toBeInTheDocument();
    });
  });

  it("settles the list into the right state after an animated deletion", async () => {
    const user = userEvent.setup();

    renderPlanner();

    const cards = within(screen.getByRole("list")).getAllByRole("listitem");

    expect(cards).toHaveLength(2);
    await user.click(
      within(cards[0]!).getByRole("button", { name: "Delete slot" }),
    );
    await user.click(
      within(
        await screen.findByRole("alertdialog", { name: "Delete this slot?" }),
      ).getByRole("button", { name: "Delete this occurrence" }),
    );

    await waitForElementToBeRemoved(() => screen.queryByText("14:15 – 15:15"));

    const remaining = within(screen.getByRole("list")).getAllByRole("listitem");

    expect(remaining).toHaveLength(1);
    expect(
      within(remaining[0]!).getByText("18:00 – 19:00"),
    ).toBeInTheDocument();
  });

  it("staggers and highlights slots arriving from a copy-day batch", async () => {
    const user = userEvent.setup();

    renderPlanner();
    await user.click(screen.getByRole("button", { name: "Copy day" }));

    const dialog = await screen.findByRole("dialog", { name: "Copy day" });

    await user.click(
      within(dialog).getByRole("checkbox", { name: "Tue Jul 7" }),
    );
    await user.click(within(dialog).getByRole("button", { name: "Apply" }));

    // The copies land on Tuesday and animate in when they become visible.
    await user.click(screen.getAllByRole("tab")[1]!);

    const cards = within(screen.getByRole("list")).getAllByRole("listitem");

    // Monday's two requestable slots plus Tuesday's existing one.
    expect(cards).toHaveLength(3);

    const staggered = cards.filter((card) =>
      card.getAttribute("data-motion-stagger"),
    );

    // The second copy of the batch enters with a staggered delay.
    expect(staggered).toHaveLength(1);
    await waitFor(() => {
      expect(
        document.querySelectorAll('[data-slot="slot-planner-slot-highlight"]'),
      ).toHaveLength(2);
    });
  });

  it("slides week content in from the navigation direction and inverts in RTL", () => {
    const { unmount } = renderPlanner();

    fireEvent.click(screen.getByRole("button", { name: "Next week" }));

    // LTR next week: the entering content starts offset from the end.
    expect(getEnteringWeekPanel().style.transform).toMatch(/translateX\(\d/);
    expect(
      document.querySelector('[data-slot="slot-planner"]'),
    ).toHaveAttribute("data-week-direction", "forward");

    fireEvent.click(screen.getByRole("button", { name: "Previous week" }));
    expect(
      document.querySelector('[data-slot="slot-planner"]'),
    ).toHaveAttribute("data-week-direction", "backward");

    unmount();

    render(
      <div dir="rtl">
        <SlotPlanner
          defaultSlots={slotPlannerSampleSlots}
          defaultFocusedDate="2026-07-06"
          now={NOW}
          title="Availability"
        />
      </div>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Next week" }));

    // RTL inverts the slide axis for the same logical direction.
    expect(getEnteringWeekPanel().style.transform).toMatch(/translateX\(-/);
  });

  it("lands on the correct week without duplicated panels after rapid double navigation", async () => {
    renderPlanner();

    const nextWeek = screen.getByRole("button", { name: "Next week" });

    fireEvent.click(nextWeek);
    fireEvent.click(nextWeek);

    // Role queries ignore the aria-hidden exiting panels, so the visible
    // heading is the target week's.
    expect(
      screen.getByRole("heading", { level: 3, name: "Monday, July 20, 2026" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("tab")).toHaveLength(7);

    // The in-flight exits settle down to exactly one panel.
    await waitFor(() => {
      expect(getWeekPanels()).toHaveLength(1);
    });
    expect(
      screen.getByRole("heading", { level: 3, name: "Monday, July 20, 2026" }),
    ).toBeInTheDocument();
  });

  it("renders the animated cap-meter fill while the text stays canonical", () => {
    const { container } = renderPlanner({
      constraints: { dailyRequestableCap: 2 },
    });

    const meter = container.querySelector(
      '[data-slot="slot-planner-cap-meter"]',
    ) as HTMLElement;

    expect(meter).toHaveAttribute("data-cap-reached", "true");
    expect(meter).toHaveTextContent("Daily cap: 2 / 2 requestable slots");
    // Reached is still stated in text, never by the fill alone.
    expect(within(meter).getByText("Daily cap reached")).toBeInTheDocument();

    const track = meter.querySelector(
      '[data-slot="slot-planner-cap-meter-track"]',
    );
    const fill = meter.querySelector(
      '[data-slot="slot-planner-cap-meter-fill"]',
    );

    expect(track).toHaveAttribute("aria-hidden", "true");
    expect(fill).toBeInTheDocument();
  });
});

describe("SlotPlanner reduced motion", () => {
  it("collapses week navigation to an instant swap", () => {
    renderPlanner({ reducedMotion: true });

    expect(
      document.querySelector('[data-slot="slot-planner"]'),
    ).toHaveAttribute("data-reduced-motion", "true");

    fireEvent.click(screen.getByRole("button", { name: "Next week" }));
    fireEvent.click(screen.getByRole("button", { name: "Next week" }));

    // No exiting duplicates and no transform: the swap is instant.
    const panels = getWeekPanels();

    expect(panels).toHaveLength(1);
    expect(panels[0]).not.toHaveAttribute("data-exiting");
    expect((panels[0] as HTMLElement).style.transform).toBe("");
    expect(
      screen.getByRole("heading", { level: 3, name: "Monday, July 20, 2026" }),
    ).toBeInTheDocument();
  });

  it("adds and removes slots instantly without highlight pulses", async () => {
    const user = userEvent.setup();

    renderPlanner({ reducedMotion: true });

    const cards = within(screen.getByRole("list")).getAllByRole("listitem");

    await user.click(
      within(cards[0]!).getByRole("button", { name: "Delete slot" }),
    );
    await user.click(
      within(
        await screen.findByRole("alertdialog", { name: "Delete this slot?" }),
      ).getByRole("button", { name: "Delete this occurrence" }),
    );

    // Removal is synchronous: no exit animation delays the unmount.
    expect(screen.queryByText("14:15 – 15:15")).not.toBeInTheDocument();

    await createSlotThroughEditor(user);

    expect(screen.getByText("09:00 – 10:00")).toBeInTheDocument();
    // State is announced and rendered in text; no pulse is mounted.
    expect(
      document.querySelector('[data-slot="slot-planner-slot-highlight"]'),
    ).toBeNull();
  });

  it("keeps the selection indicator as static state communication", async () => {
    const user = userEvent.setup();

    renderPlanner({ reducedMotion: true });

    expect(getIndicators()).toHaveLength(1);
    await user.click(screen.getAllByRole("tab")[3]!);

    expect(getIndicators()).toHaveLength(1);
    expect(screen.getAllByRole("tab")[3]!.contains(getIndicators()[0]!)).toBe(
      true,
    );
    expect(screen.getAllByRole("tab")[3]).toHaveAttribute(
      "data-selected",
      "true",
    );
  });

  it("renders a static cap-meter fill with the reached state still in text", () => {
    const { container } = renderPlanner({
      reducedMotion: true,
      constraints: { dailyRequestableCap: 4 },
    });

    const fill = container.querySelector(
      '[data-slot="slot-planner-cap-meter-fill"]',
    ) as HTMLElement;

    // Monday has 2 of 4 published occurrences.
    expect(fill.style.transform).toBe("scaleX(0.5)");
    expect(
      container.querySelector('[data-slot="slot-planner-cap-meter"]'),
    ).toHaveTextContent("Daily cap: 2 / 4 requestable slots");
  });
});
