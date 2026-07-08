import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it, vi } from "vitest";
import { DethinkProvider } from "../../foundation/dethink-provider";
import { SlotPlanner } from ".";
import {
  slotPlannerClinicTaxonomy,
  slotPlannerSampleSlots,
} from "./slot-planner-fixtures";

expect.extend(toHaveNoViolations);

const NOW = "2026-07-06T00:30:00";

describe("SlotPlanner accessibility", () => {
  it("has no axe violations in week view", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <main aria-label="SlotPlanner accessibility smoke">
          <SlotPlanner
            slots={slotPlannerSampleSlots}
            defaultFocusedDate="2026-07-06"
            now={NOW}
            title="Availability"
          />
        </main>
      </DethinkProvider>,
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it("has no axe violations in day view with a custom taxonomy", async () => {
    const { container } = render(
      <DethinkProvider theme="dark">
        <main aria-label="SlotPlanner day view accessibility smoke">
          <SlotPlanner
            view="day"
            slots={slotPlannerSampleSlots}
            defaultFocusedDate="2026-07-07"
            now={NOW}
            taxonomy={slotPlannerClinicTaxonomy}
            title="Clinic appointments"
          />
        </main>
      </DethinkProvider>,
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it("has no axe violations with the editor dialog open", async () => {
    const user = userEvent.setup();

    render(
      <DethinkProvider theme="light">
        <main aria-label="SlotPlanner editor accessibility smoke">
          <SlotPlanner
            defaultSlots={slotPlannerSampleSlots}
            defaultFocusedDate="2026-07-06"
            now={NOW}
            title="Availability"
          />
        </main>
      </DethinkProvider>,
    );

    await user.click(
      within(screen.getAllByRole("listitem")[0]!).getByRole("button", {
        name: "Edit slot",
      }),
    );
    await screen.findByRole("dialog", { name: "Edit slot" });

    await expect(axe(document.body)).resolves.toHaveNoViolations();
  });

  it("has no axe violations with the copy-day dialog open", async () => {
    const user = userEvent.setup();

    render(
      <DethinkProvider theme="light">
        <main aria-label="SlotPlanner copy-day accessibility smoke">
          <SlotPlanner
            defaultSlots={slotPlannerSampleSlots}
            defaultFocusedDate="2026-07-06"
            now={NOW}
            title="Availability"
          />
        </main>
      </DethinkProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Copy day" }));
    await screen.findByRole("dialog", { name: "Copy day" });

    await expect(axe(document.body)).resolves.toHaveNoViolations();
  });

  it("has no axe violations with a violation list shown in the editor", async () => {
    const user = userEvent.setup();

    render(
      <DethinkProvider theme="light">
        <main aria-label="SlotPlanner violations accessibility smoke">
          <SlotPlanner
            defaultSlots={slotPlannerSampleSlots}
            defaultFocusedDate="2026-07-06"
            now={NOW}
            title="Availability"
            constraints={{ minDurationMinutes: 120 }}
          />
        </main>
      </DethinkProvider>,
    );

    await user.click(
      screen.getByRole("button", { name: "Add slot to this day" }),
    );

    const dialog = await screen.findByRole("dialog", { name: "Add slot" });

    // The default 60-minute duration violates the 120-minute minimum.
    await user.click(within(dialog).getByRole("button", { name: "Save" }));
    within(dialog).getByRole("alert");

    await expect(axe(document.body)).resolves.toHaveNoViolations();
  });

  it("has no axe violations with every renderer overridden", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <main aria-label="SlotPlanner custom renderers accessibility smoke">
          <SlotPlanner
            slots={slotPlannerSampleSlots}
            defaultFocusedDate="2026-07-06"
            now={NOW}
            title="Availability"
            constraints={{ dailyRequestableCap: 3 }}
            renderers={{
              capMeter: ({ text }) => <p>{text}</p>,
              dayCard: ({ date, summary }) => (
                <span>{`${date} (${summary.requestable} open)`}</span>
              ),
              dayHeader: ({ formattedDate }) => (
                <h3>{`Custom ${formattedDate}`}</h3>
              ),
              emptyDay: () => <p>Nothing scheduled</p>,
              slotCard: ({ occurrence, remove }) => (
                <div>
                  <p>{`Session at ${occurrence.startTime}`}</p>
                  {remove ? (
                    <button type="button" onClick={remove}>
                      {`Remove session at ${occurrence.startTime}`}
                    </button>
                  ) : null}
                </div>
              ),
              slotEditor: ({ dismiss }) => (
                <button type="button" onClick={dismiss}>
                  Close custom editor
                </button>
              ),
              tag: ({ tag }) => <em>{tag}</em>,
              toolbar: ({ goToNextWeek, taxonomy }) => (
                <button type="button" onClick={goToNextWeek}>
                  {taxonomy.nextWeek}
                </button>
              ),
            }}
          />
        </main>
      </DethinkProvider>,
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it("keeps dialog labelling and containment with a custom slot editor", async () => {
    const user = userEvent.setup();

    render(
      <DethinkProvider theme="light">
        <main aria-label="SlotPlanner custom editor accessibility smoke">
          <SlotPlanner
            defaultSlots={slotPlannerSampleSlots}
            defaultFocusedDate="2026-07-06"
            now={NOW}
            title="Availability"
            renderers={{
              slotEditor: ({ date, dismiss }) => (
                <div>
                  <p>{`Custom editor for ${date}`}</p>
                  <button type="button" onClick={dismiss}>
                    Close custom editor
                  </button>
                </div>
              ),
            }}
          />
        </main>
      </DethinkProvider>,
    );

    await user.click(
      screen.getByRole("button", { name: "Add slot to this day" }),
    );

    // The structural Dialog shell still labels the dialog…
    const dialog = await screen.findByRole("dialog", { name: "Add slot" });

    expect(
      within(dialog).getByText("Custom editor for 2026-07-06"),
    ).toBeInTheDocument();
    // …and focus containment keeps focus inside it.
    await user.tab();
    expect(dialog.contains(document.activeElement)).toBe(true);
    await user.tab();
    expect(dialog.contains(document.activeElement)).toBe(true);

    await expect(axe(document.body)).resolves.toHaveNoViolations();
  });

  it("has no axe violations with an error-state slot card", async () => {
    const user = userEvent.setup();
    const onUpdateSlot = vi.fn().mockRejectedValue(new Error("offline"));
    const { container } = render(
      <DethinkProvider theme="light">
        <main aria-label="SlotPlanner error accessibility smoke">
          <SlotPlanner
            defaultSlots={slotPlannerSampleSlots}
            defaultFocusedDate="2026-07-06"
            now={NOW}
            title="Availability"
            onUpdateSlot={onUpdateSlot}
          />
        </main>
      </DethinkProvider>,
    );
    const card = screen.getAllByRole("listitem")[0]!;

    await user.click(within(card).getByRole("button", { name: "Edit slot" }));

    const dialog = await screen.findByRole("dialog", { name: "Edit slot" });

    await user.click(within(dialog).getByRole("button", { name: "Save" }));
    await waitFor(() => {
      expect(card).toHaveAttribute("data-error", "true");
    });

    await expect(axe(container)).resolves.toHaveNoViolations();
  });
});
