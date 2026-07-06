import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it, vi } from "vitest";
import { DethinkProvider } from "../../foundation/dethink-provider";
import { SlotPicker } from ".";
import {
  slotPlannerClinicTaxonomy,
  slotPlannerSampleSlots,
} from "./slot-planner-fixtures";

expect.extend(toHaveNoViolations);

const NOW = "2026-07-06T00:30:00Z";

describe("SlotPicker accessibility", () => {
  it("has no axe violations on a populated week", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <main aria-label="SlotPicker accessibility smoke">
          <SlotPicker
            slots={slotPlannerSampleSlots}
            viewerTimeZone="Europe/London"
            defaultFocusedDate="2026-07-06"
            now={NOW}
            title="Book a session"
          />
        </main>
      </DethinkProvider>,
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it("has no axe violations on an empty day in the day view", async () => {
    const { container } = render(
      <DethinkProvider theme="dark">
        <main aria-label="SlotPicker empty day accessibility smoke">
          <SlotPicker
            view="day"
            slots={slotPlannerSampleSlots}
            viewerTimeZone="Europe/London"
            defaultFocusedDate="2026-07-12"
            now={NOW}
            taxonomy={slotPlannerClinicTaxonomy}
            title="Book an appointment"
          />
        </main>
      </DethinkProvider>,
    );

    expect(screen.getByText("No slots on this day")).toBeInTheDocument();
    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it("has no axe violations on an all-unavailable day", async () => {
    // 2026-07-07 has a single requested (non-interactive) occurrence.
    const { container } = render(
      <DethinkProvider theme="light">
        <main aria-label="SlotPicker all-unavailable accessibility smoke">
          <SlotPicker
            slots={slotPlannerSampleSlots}
            viewerTimeZone="Europe/London"
            defaultFocusedDate="2026-07-07"
            now={NOW}
            title="Book a session"
          />
        </main>
      </DethinkProvider>,
    );

    expect(
      screen.getByText("No slots available on this day"),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole("listitem")).queryByRole("button"),
    ).not.toBeInTheDocument();
    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it("has no axe violations with an error-state slot card", async () => {
    const user = userEvent.setup();
    const onBookRequest = vi.fn().mockRejectedValue(new Error("offline"));
    const { container } = render(
      <DethinkProvider theme="light">
        <main aria-label="SlotPicker error accessibility smoke">
          <SlotPicker
            slots={slotPlannerSampleSlots}
            viewerTimeZone="Europe/London"
            defaultFocusedDate="2026-07-06"
            now={NOW}
            title="Book a session"
            onBookRequest={onBookRequest}
          />
        </main>
      </DethinkProvider>,
    );
    const card = within(screen.getByRole("list")).getAllByRole("listitem")[0]!;

    await user.click(
      within(card).getByRole("button", { name: "Request slot" }),
    );
    await waitFor(() => {
      expect(card).toHaveAttribute("data-error", "true");
    });

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it("has no axe violations with custom slot-card and empty-day renderers", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <main aria-label="SlotPicker custom renderers accessibility smoke">
          <SlotPicker
            slots={slotPlannerSampleSlots}
            viewerTimeZone="Europe/London"
            defaultFocusedDate="2026-07-06"
            now={NOW}
            title="Book a session"
            renderers={{
              emptyDay: () => <p>Nothing bookable</p>,
              slotCard: ({ occurrence, request }) =>
                request ? (
                  <button type="button" onClick={request}>
                    {`Grab the ${occurrence.viewerStartTime} session`}
                  </button>
                ) : (
                  <p>{`Unavailable at ${occurrence.viewerStartTime}`}</p>
                ),
            }}
          />
        </main>
      </DethinkProvider>,
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });
});
