import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { Timeline, type TimelineItemData } from ".";

const items: TimelineItemData[] = [
  {
    id: "kickoff",
    title: "Kickoff",
    datetime: "2026-01-01T09:00:00Z",
    dateLabel: "Jan 1, 2026",
  },
  {
    id: "launch",
    title: "Launch",
    datetime: "2026-03-01T09:00:00Z",
    dateLabel: "Mar 1, 2026",
  },
];

describe("Timeline SSR", () => {
  it("renders semantic timeline markup on the server", () => {
    const html = renderToString(<Timeline items={items} />);

    expect(html).toContain('data-slot="timeline"');
    expect(html).toContain("<ol");
    expect(html).toContain("<time");
  });

  it("hydrates without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const container = document.createElement("div");
    container.innerHTML = renderToString(<Timeline items={items} />);

    await act(async () => {
      hydrateRoot(container, <Timeline items={items} />);
    });

    expect(
      consoleError.mock.calls.some(([message]) =>
        String(message).toLowerCase().includes("hydration"),
      ),
    ).toBe(false);

    consoleError.mockRestore();
  });

  it("server-renders the flow presentation with reveal in the hidden state", () => {
    const html = renderToString(
      <Timeline
        mode="events"
        presentation="flow"
        reveal="stagger"
        items={items}
      />,
    );

    expect(html).toContain('data-presentation="flow"');
    expect(html).toContain('data-slot="timeline-list"');
    // Items ship in their pre-reveal state so the server and first client
    // render match; the animation only runs after hydration.
    expect(html).toContain('data-reveal="stagger"');
    expect(html).toContain('data-revealed="false"');
    expect(html).not.toContain('data-slot="timeline-viewport-content"');
  });

  it("hydrates the flow reveal timeline without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const container = document.createElement("div");
    const element = (
      <Timeline
        mode="events"
        presentation="flow"
        reveal="stagger"
        items={items}
      />
    );
    container.innerHTML = renderToString(element);

    await act(async () => {
      hydrateRoot(container, element);
    });

    expect(
      consoleError.mock.calls.some(([message]) =>
        String(message).toLowerCase().includes("hydration"),
      ),
    ).toBe(false);

    consoleError.mockRestore();
  });
});
