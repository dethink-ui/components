import { act, render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SlotPlanner, type SlotPlannerSlotData } from ".";

expect.extend(toHaveNoViolations);
const slot: SlotPlannerSlotData = {
  id: "mentoring",
  date: "2026-09-22",
  startTime: "09:00",
  durationMinutes: 45,
  timeZone: "America/New_York",
  state: "requestable",
  capacity: 2,
};
const resizeCallbacks = new Set<(entries: unknown[]) => void>();
let width = 800;
beforeEach(() => {
  width = 800;
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(private callback: (entries: unknown[]) => void) {}
      observe() {
        resizeCallbacks.add(this.callback);
        this.callback([{ contentRect: { width } }]);
      }
      unobserve() {}
      disconnect() {
        resizeCallbacks.delete(this.callback);
      }
    },
  );
});
afterEach(() => {
  vi.unstubAllGlobals();
  resizeCallbacks.clear();
});
function renderCalendar() {
  return render(
    <SlotPlanner
      defaultSlots={[slot]}
      defaultFocusedDate={slot.date}
      now="2026-09-21T12:00:00Z"
      timeZone="America/New_York"
      title="Mentoring"
      reducedMotion
    />,
  );
}
describe("responsive weekly planner", () => {
  it("opens an appointment's day from the calendar and returns to Week", async () => {
    const user = userEvent.setup();
    renderCalendar();
    await user.click(
      screen.getByRole("button", { name: /Tue, Sep 22, 09:00/ }),
    );
    expect(
      screen.getByRole("heading", { name: "Tuesday, September 22, 2026" }),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Slot actions · 09:00" }),
    );
    await user.click(screen.getByRole("menuitem", { name: "Edit slot" }));
    expect(
      await screen.findByRole("dialog", { name: "Edit slot" }),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen
          .getByRole("dialog", { name: "Edit slot" })
          .contains(document.activeElement),
      ).toBe(true),
    );
    await expect(axe(document.body)).resolves.toHaveNoViolations();
    await user.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    await user.click(screen.getByRole("button", { name: "Week" }));
    expect(
      screen.getByRole("region", { name: "Week · America/New_York" }),
    ).toBeInTheDocument();
  });
  it("keeps selection when changing to a compact agenda with keyboard navigation", async () => {
    const user = userEvent.setup();
    renderCalendar();
    act(() => {
      width = 360;
      resizeCallbacks.forEach((callback) =>
        callback([{ contentRect: { width } }]),
      );
    });
    expect(
      screen.queryByRole("region", { name: "Week · America/New_York" }),
    ).not.toBeInTheDocument();
    const tabs = screen.getAllByRole("tab");
    expect(tabs[1]).toHaveAttribute("aria-selected", "true");
    await user.click(tabs[1]!);
    await user.keyboard("{ArrowRight}");
    expect(tabs[2]).toHaveFocus();
    expect(
      screen.getByRole("heading", { name: "Wednesday, September 23, 2026" }),
    ).toBeInTheDocument();
  });
  it("shows weekend dates and provides an add action on an empty day", async () => {
    const user = userEvent.setup();
    renderCalendar();
    await user.click(
      screen.getByRole("button", { name: "Sat, Sep 26 · 0 slots" }),
    );
    await user.click(
      screen.getByRole("button", {
        name: "Add slot to this day · Sat, Sep 26",
      }),
    );
    const dialog = screen.getByRole("dialog", { name: "Add slot" });
    expect(within(dialog).getByLabelText("Date")).toHaveValue("2026-09-26");
    await user.click(within(dialog).getByRole("button", { name: "45 min" }));
    expect(within(dialog).getByLabelText("Duration (minutes)")).toHaveValue(45);
    expect(
      within(dialog).getByText("Ends at 09:45 · America/New_York"),
    ).toBeInTheDocument();
    expect(within(dialog).queryByLabelText("Capacity")).not.toBeVisible();
    await user.click(within(dialog).getByText("More options"));
    expect(within(dialog).getByLabelText("Capacity")).toBeVisible();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
  it("has no axe violations in the calendar", async () => {
    const { container } = renderCalendar();
    await expect(axe(container)).resolves.toHaveNoViolations();
  });
});
