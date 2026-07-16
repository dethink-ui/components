import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DethinkProvider } from "../../foundation/dethink-provider";
import { Timeline, type TimelineItemData } from ".";

const eventItems: TimelineItemData[] = [
  {
    id: "release",
    title: "Launch",
    description: "Production release is complete.",
    datetime: "2026-03-01T09:00:00Z",
    dateLabel: "Mar 1, 2026",
    status: "complete",
  },
  {
    id: "kickoff",
    title: "Kickoff",
    description: "Project work starts.",
    datetime: "2026-01-01T09:00:00Z",
    dateLabel: "Jan 1, 2026",
    status: "current",
    image: {
      src: "https://example.com/kickoff.jpg",
      alt: "Team kickoff board",
      width: 640,
      height: 360,
    },
  },
  {
    id: "beta",
    title: "Beta",
    description: "Invite design partners.",
    datetime: "2026-02-01T09:00:00Z",
    dateLabel: "Feb 1, 2026",
    status: "warning",
  },
];

describe("Timeline", () => {
  it("renders semantic event content in chronological order", () => {
    render(<Timeline items={eventItems} viewport={{ controls: false }} />);

    const list = screen.getByRole("list");
    const items = within(list).getAllByRole("listitem");

    expect(items).toHaveLength(3);
    expect(
      screen
        .getAllByRole("heading", { level: 3 })
        .map((item) => item.textContent),
    ).toEqual(["Kickoff", "Beta", "Launch"]);
    expect(screen.getByText("Project work starts.")).toBeInTheDocument();
    expect(screen.getByAltText("Team kickoff board")).toHaveAttribute(
      "loading",
      "lazy",
    );
    expect(screen.getByText("Jan 1, 2026").closest("time")).toHaveAttribute(
      "datetime",
      "2026-01-01T09:00:00Z",
    );
    expect(screen.getByRole("button", { name: "Kickoff" })).toHaveAttribute(
      "aria-current",
      "step",
    );
  });

  it("supports progress timelines without dates", () => {
    render(
      <Timeline
        data-testid="timeline-root"
        mode="progress"
        scale="auto"
        viewport={{ controls: false }}
        items={[
          { id: "todo", title: "Queued", status: "upcoming" },
          { id: "active", title: "Building", status: "current" },
          { id: "done", title: "Verified", status: "complete" },
        ]}
      />,
    );

    expect(screen.getByText("Queued")).toBeInTheDocument();
    expect(screen.queryByText("Queued")?.closest("time")).toBeNull();
    expect(screen.getByTestId("timeline-root")).toHaveAttribute(
      "data-scale",
      "sequence",
    );
  });

  it("supports story mode as a static vertical editorial timeline", () => {
    render(
      <Timeline
        data-testid="timeline-root"
        mode="story"
        items={[
          {
            id: "founded",
            title: "Two people, one repo",
            description: "Started as a side project.",
            datetime: "2018-01-01T00:00:00Z",
            dateLabel: "2018",
            status: "complete",
            marker: <span data-testid="story-marker">AI</span>,
          },
          {
            id: "platform",
            title: "A platform, not a package",
            description: "Teams ship with blocks and templates.",
            datetime: "2026-01-01T00:00:00Z",
            dateLabel: "2026",
            status: "current",
          },
        ]}
      />,
    );

    const root = screen.getByTestId("timeline-root");
    const viewport = screen.getByRole("region", {
      name: "Timeline viewport",
    });
    const list = screen.getByRole("list");
    const storyCard = document.querySelector('[data-slot="timeline-card"]');
    const controls = document.querySelector('[data-slot="timeline-controls"]');

    expect(root).toHaveAttribute("data-mode", "story");
    expect(root).toHaveAttribute("data-orientation", "vertical");
    expect(root).toHaveAttribute("data-layout", "story");
    expect(root).toHaveAttribute("data-scale", "sequence");
    expect(root).toHaveAttribute("data-interactive", "false");
    expect(viewport).not.toHaveAttribute("tabindex");
    expect(list).toHaveClass("before:bg-timeline-rail");
    expect(storyCard).toHaveClass("border-0", "bg-transparent", "shadow-none");
    expect(controls).toBeNull();
    expect(screen.getByTestId("story-marker")).toHaveTextContent("AI");
    expect(screen.getByText("2018").closest("time")).toHaveAttribute(
      "datetime",
      "2018-01-01T00:00:00Z",
    );
    expect(
      screen.getByRole("heading", { level: 3, name: "Two people, one repo" }),
    ).toHaveClass("font-heading");
  });

  it("supports alternating layout in story mode without switching to the pan viewport", () => {
    render(
      <Timeline
        data-testid="timeline-root"
        mode="story"
        layout="alternating"
        items={[
          {
            id: "first",
            title: "First story point",
            description: "The first point sits on the end side.",
          },
          {
            id: "second",
            title: "Second story point",
            description: "The second point sits on the start side.",
          },
        ]}
      />,
    );

    const root = screen.getByTestId("timeline-root");
    const list = screen.getByRole("list");
    const items = document.querySelectorAll('[data-slot="timeline-item"]');
    const cards = document.querySelectorAll('[data-slot="timeline-card"]');
    const markers = document.querySelectorAll('[data-slot="timeline-marker"]');

    expect(root).toHaveAttribute("data-mode", "story");
    expect(root).toHaveAttribute("data-layout", "alternating");
    expect(root).toHaveAttribute("data-interactive", "false");
    expect(list).toHaveClass("sm:before:left-1/2");
    expect(items[0]).toHaveClass(
      "sm:grid-cols-[minmax(0,1fr)_4.5rem_minmax(0,1fr)]",
    );
    expect(cards[0]).toHaveClass("sm:col-start-3");
    expect(cards[1]).toHaveClass("sm:col-start-1", "sm:text-right");
    expect(markers[0]).toHaveClass("sm:col-start-2");
    expect(
      document.querySelector('[data-slot="timeline-viewport-content"]'),
    ).toBeNull();
  });

  it("supports layout, orientation, custom markers, and custom item rendering", () => {
    render(
      <Timeline
        data-testid="timeline-root"
        items={eventItems}
        orientation="vertical"
        layout="alternating"
        viewport={{ controls: false }}
        renderItem={(item) => (
          <div>
            <strong>{item.title}</strong>
            <span> custom content</span>
          </div>
        )}
      />,
    );

    expect(screen.getByTestId("timeline-root")).toHaveAttribute(
      "data-orientation",
      "vertical",
    );
    expect(screen.getByTestId("timeline-root")).toHaveAttribute(
      "data-layout",
      "alternating",
    );
    expect(screen.getByText("Kickoff")).toBeInTheDocument();
    expect(screen.getAllByText("custom content")).toHaveLength(3);
  });

  it("passes typed payload data to custom renderers", () => {
    type DeploymentPayload = {
      service: string;
      environment: "staging" | "production";
      version: string;
    };

    const deploymentItems: TimelineItemData<DeploymentPayload>[] = [
      {
        id: "api-deploy",
        datetime: "2026-04-01T12:00:00Z",
        dateLabel: "Apr 1, 2026",
        status: "current",
        data: {
          service: "Billing API",
          environment: "production",
          version: "v2.4.0",
        },
      },
    ];

    render(
      <Timeline<DeploymentPayload>
        items={deploymentItems}
        viewport={{ controls: false }}
        renderItem={(item) => (
          <div>
            <h3>{item.data?.service}</h3>
            <p>
              {item.data?.environment} - {item.data?.version}
            </p>
          </div>
        )}
      />,
    );

    expect(screen.getByText("Billing API")).toBeInTheDocument();
    expect(screen.getByText("production - v2.4.0")).toBeInTheDocument();
  });

  it("falls back to the item id when default rendering has no title", () => {
    render(
      <Timeline
        items={[{ id: "payload-only", data: { kind: "deployment" } }]}
        viewport={{ controls: false }}
      />,
    );

    expect(
      screen.getByRole("heading", { level: 3, name: "payload-only" }),
    ).toBeInTheDocument();
  });

  it("supports optional viewport chrome and controls visibility", () => {
    render(
      <Timeline
        items={eventItems}
        viewport={{ chrome: "panel", controlsVisibility: "always" }}
      />,
    );

    expect(
      screen.getByRole("region", { name: "Timeline viewport" }),
    ).toHaveAttribute("data-chrome", "panel");
    expect(
      document.querySelector('[data-slot="timeline-controls"]'),
    ).toHaveAttribute("data-visibility", "always");
  });

  it("uses timeline contrast tokens for rail and card borders", () => {
    render(
      <DethinkProvider theme="dark">
        <Timeline items={eventItems} viewport={{ controls: false }} />
      </DethinkProvider>,
    );

    expect(document.querySelector('[data-slot="timeline-rail"]')).toHaveClass(
      "bg-timeline-rail",
    );
    expect(document.querySelector('[data-slot="timeline-card"]')).toHaveClass(
      "border-timeline-border",
    );
  });

  it("reveals viewport controls on hover", () => {
    render(<Timeline items={eventItems} />);

    const viewport = screen.getByRole("region", { name: "Timeline viewport" });
    const controls = document.querySelector('[data-slot="timeline-controls"]');

    expect(controls).toHaveAttribute("data-visible", "false");

    fireEvent.mouseEnter(viewport);

    expect(controls).toHaveAttribute("data-visible", "true");

    fireEvent.mouseLeave(viewport);

    expect(controls).toHaveAttribute("data-visible", "false");
  });

  it("handles uncontrolled pointer and keyboard selection", async () => {
    const user = userEvent.setup();

    render(<Timeline items={eventItems} viewport={{ controls: false }} />);

    await user.click(screen.getByRole("button", { name: "Beta" }));

    expect(screen.getByRole("button", { name: "Beta" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    const viewport = screen.getByRole("region", { name: "Timeline viewport" });
    viewport.focus();

    await user.keyboard("{ArrowRight}");

    expect(screen.getByRole("button", { name: "Launch" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await user.keyboard("{Home}");

    expect(screen.getByRole("button", { name: "Kickoff" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("handles controlled selection and skips disabled items", async () => {
    const user = userEvent.setup();
    const onSelectedIdChange = vi.fn();

    render(
      <Timeline
        selectedId="kickoff"
        onSelectedIdChange={onSelectedIdChange}
        viewport={{ controls: false }}
        items={[
          { id: "kickoff", title: "Kickoff" },
          { id: "blocked", title: "Blocked", disabled: true },
          { id: "launch", title: "Launch" },
        ]}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Launch" }));

    expect(onSelectedIdChange).toHaveBeenCalledWith("launch");
    expect(screen.queryByRole("button", { name: "Blocked" })).toBeNull();

    const viewport = screen.getByRole("region", { name: "Timeline viewport" });
    viewport.focus();
    await user.keyboard("{ArrowRight}");

    expect(onSelectedIdChange).toHaveBeenLastCalledWith("launch");
  });

  it("zooms, resets, fits, and pans the viewport", async () => {
    const user = userEvent.setup();

    render(<Timeline items={eventItems} />);

    const viewport = screen.getByRole("region", { name: "Timeline viewport" });
    const content = document.querySelector(
      '[data-slot="timeline-viewport-content"]',
    ) as HTMLElement;

    await user.click(screen.getByRole("button", { name: "Zoom in" }));
    expect(content.getAttribute("style")).toContain(
      "--timeline-transform: translate3d(0px, 0px, 0) scale(1.2)",
    );

    await user.click(
      screen.getByRole("button", { name: "Reset timeline view" }),
    );
    expect(content.getAttribute("style")).toContain(
      "--timeline-transform: translate3d(0px, 0px, 0) scale(1)",
    );

    await user.click(screen.getByRole("button", { name: "Fit timeline" }));
    expect(content).toHaveAttribute("data-slot", "timeline-viewport-content");

    fireEvent.pointerDown(viewport, {
      button: 0,
      clientX: 10,
      clientY: 20,
      pointerId: 1,
    });
    fireEvent.pointerMove(viewport, {
      clientX: 30,
      clientY: 45,
      pointerId: 1,
    });
    fireEvent.pointerUp(viewport, { pointerId: 1 });

    expect(content.getAttribute("style")).toContain(
      "translate3d(20px, 25px, 0)",
    );
  });

  it("requires the configured modifier for wheel zoom by default", () => {
    render(<Timeline items={eventItems} viewport={{ controls: false }} />);

    const viewport = screen.getByRole("region", { name: "Timeline viewport" });
    const content = document.querySelector(
      '[data-slot="timeline-viewport-content"]',
    ) as HTMLElement;

    fireEvent.wheel(viewport, { deltaY: -100, clientX: 10, clientY: 10 });

    expect(content.getAttribute("style")).toContain(
      "--timeline-transform: translate3d(0px, 0px, 0) scale(1)",
    );

    fireEvent.wheel(viewport, {
      deltaY: -100,
      clientX: 10,
      clientY: 10,
      ctrlKey: true,
    });

    expect(content.getAttribute("style")).toContain("scale(1.15)");
  });
});

const flowItems: TimelineItemData[] = [
  { id: "one", title: "One", status: "complete" },
  { id: "two", title: "Two", status: "current" },
  { id: "three", title: "Three", status: "upcoming" },
];

describe("Timeline flow presentation", () => {
  it("renders events as a static flow list without a pan/zoom viewport", () => {
    render(
      <Timeline
        data-testid="timeline-root"
        mode="events"
        presentation="flow"
        items={flowItems}
      />,
    );

    const root = screen.getByTestId("timeline-root");
    const list = screen.getByRole("list");
    const items = within(list).getAllByRole("listitem");

    expect(root).toHaveAttribute("data-presentation", "flow");
    expect(root).toHaveAttribute("data-mode", "events");
    expect(items).toHaveLength(3);
    // No canvas viewport content, no zoom controls, and no drag surface.
    expect(
      document.querySelector('[data-slot="timeline-viewport-content"]'),
    ).toBeNull();
    expect(
      document.querySelector('[data-slot="timeline-controls"]'),
    ).toBeNull();
    expect(
      screen.getByRole("region", { name: "Timeline viewport" }),
    ).toHaveAttribute("data-presentation", "flow");
    // Compact card styling (not story typography).
    expect(list).toHaveClass("before:bg-timeline-rail");
    expect(document.querySelector('[data-slot="timeline-card"]')).toHaveClass(
      "border-timeline-border",
    );
    expect(
      screen.getByRole("heading", { level: 3, name: "One" }),
    ).not.toHaveClass("font-heading");
  });

  it("keeps keyboard navigation working in the flow presentation", async () => {
    const user = userEvent.setup();

    render(<Timeline mode="events" presentation="flow" items={flowItems} />);

    const viewport = screen.getByRole("region", { name: "Timeline viewport" });
    viewport.focus();

    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("button", { name: "One" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await user.keyboard("{End}");
    expect(screen.getByRole("button", { name: "Three" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});

describe("Timeline reveal", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not add reveal attributes when reveal is unset (default)", () => {
    render(<Timeline mode="events" presentation="flow" items={flowItems} />);

    expect(
      document.querySelector('[data-slot="timeline-item"][data-reveal]'),
    ).toBeNull();
    expect(screen.getByRole("list")).not.toHaveAttribute("data-reveal");
  });

  it("ignores reveal for the canvas presentation", () => {
    render(
      <Timeline
        mode="events"
        reveal="stagger"
        items={flowItems}
        viewport={{ controls: false }}
      />,
    );

    expect(
      document.querySelector('[data-slot="timeline-item"][data-reveal]'),
    ).toBeNull();
  });

  it("reveals staggered items on mount and sets per-item CSS variables", () => {
    render(
      <Timeline
        mode="events"
        presentation="flow"
        reveal="stagger"
        revealOptions={{ interval: 120, duration: 300, initialDelay: 40 }}
        items={flowItems}
      />,
    );

    const list = screen.getByRole("list");
    const items = document.querySelectorAll('[data-slot="timeline-item"]');

    expect(list).toHaveAttribute("data-reveal", "stagger");
    expect(list).toHaveAttribute("data-reveal-rail", "true");
    items.forEach((item, index) => {
      expect(item).toHaveAttribute("data-reveal", "stagger");
      expect(item).toHaveAttribute("data-revealed", "true");
      expect(
        (item as HTMLElement).style.getPropertyValue("--timeline-reveal-index"),
      ).toBe(String(index));
      expect(
        (item as HTMLElement).style.getPropertyValue(
          "--timeline-reveal-interval",
        ),
      ).toBe("120ms");
    });
    expect(items[2]).toHaveAttribute("data-reveal-last", "true");
  });

  it("drives visibility from revealCount for the manual trigger", () => {
    const { rerender } = render(
      <Timeline
        mode="events"
        presentation="flow"
        reveal="stagger"
        revealOptions={{ trigger: "manual" }}
        revealCount={2}
        items={flowItems}
      />,
    );

    const getItems = () =>
      document.querySelectorAll('[data-slot="timeline-item"]');

    expect(getItems()[0]).toHaveAttribute("data-revealed", "true");
    expect(getItems()[1]).toHaveAttribute("data-revealed", "true");
    expect(getItems()[2]).toHaveAttribute("data-revealed", "false");

    rerender(
      <Timeline
        mode="events"
        presentation="flow"
        reveal="stagger"
        revealOptions={{ trigger: "manual" }}
        revealCount={3}
        items={flowItems}
      />,
    );

    expect(getItems()[2]).toHaveAttribute("data-revealed", "true");
    // The newly revealed item starts a fresh batch (order 0).
    expect(
      (getItems()[2] as HTMLElement).style.getPropertyValue(
        "--timeline-reveal-index",
      ),
    ).toBe("0");
  });

  it("only animates newly appended items and fires onItemReveal per item", () => {
    const onItemReveal = vi.fn();

    const { rerender } = render(
      <Timeline
        mode="events"
        presentation="flow"
        reveal="stagger"
        onItemReveal={onItemReveal}
        items={flowItems.slice(0, 2)}
      />,
    );

    expect(onItemReveal.mock.calls.map((call) => call[0])).toEqual([
      "one",
      "two",
    ]);

    onItemReveal.mockClear();

    rerender(
      <Timeline
        mode="events"
        presentation="flow"
        reveal="stagger"
        onItemReveal={onItemReveal}
        items={flowItems}
      />,
    );

    // Only the appended item reveals; existing items are not re-announced.
    expect(onItemReveal.mock.calls.map((call) => call[0])).toEqual(["three"]);
    expect(onItemReveal).toHaveBeenLastCalledWith("three", 2);
  });

  it("fires onRevealComplete after the last item finishes", () => {
    vi.useFakeTimers();
    const onRevealComplete = vi.fn();

    try {
      render(
        <Timeline
          mode="events"
          presentation="flow"
          reveal="stagger"
          revealOptions={{ interval: 100, duration: 200, initialDelay: 0 }}
          onRevealComplete={onRevealComplete}
          items={flowItems}
        />,
      );

      expect(onRevealComplete).not.toHaveBeenCalled();

      // 3 items: 0 + 2 * 100 + 200 = 400ms, plus completion buffer.
      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(onRevealComplete).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it("keeps unrevealed items mounted for assistive technology", () => {
    render(
      <Timeline
        mode="events"
        presentation="flow"
        reveal="stagger"
        revealOptions={{ trigger: "manual" }}
        revealCount={0}
        items={flowItems}
      />,
    );

    // Pre-reveal items remain listitems (kept in the accessibility tree).
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    document.querySelectorAll('[data-slot="timeline-item"]').forEach((item) => {
      expect(item).toHaveAttribute("data-revealed", "false");
    });
  });
});
