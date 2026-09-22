import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, afterEach } from "vitest";
import { Timeline } from "./timeline";
import { TimelineFeed } from "./timeline-feed";
import { renderToString } from "react-dom/server";
import {
  getTimelineRevealBatchDuration,
  normalizeTimelineRevealOptions,
} from "./timeline-utils";

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});
const items = [
  {
    id: "one",
    title: "First event",
    details: <a href="#artifact">View artifact</a>,
  },
  { id: "blocked", title: "Disabled event", disabled: true },
  { id: "two", title: "Second event", details: "Second details" },
];

describe("Timeline improvements", () => {
  it("defaults to flow and focuses enabled keyboard destinations", async () => {
    const user = userEvent.setup();
    render(<Timeline items={items} />);
    expect(screen.queryByRole("button", { name: "Zoom in" })).toBeNull();
    screen.getByRole("region", { name: "Timeline viewport" }).focus();
    await user.keyboard("{Home}{ArrowDown}");
    expect(screen.getByRole("button", { name: "Second event" })).toHaveFocus();
    await user.keyboard("{Home}");
    expect(screen.getByRole("button", { name: "First event" })).toHaveFocus();
  });

  it("expands multiple details independently of selection and protects nested actions", async () => {
    const user = userEvent.setup();
    const select = vi.fn();
    render(<Timeline items={items} onSelectedIdChange={select} />);
    await user.click(
      screen.getByRole("button", { name: "Show details for First event" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Show details for Second event" }),
    );
    expect(screen.getByRole("link", { name: "View artifact" })).toBeVisible();
    expect(screen.getByText("Second details")).toBeVisible();
    screen.getByRole("link").focus();
    await user.keyboard("{End}");
    expect(screen.getByRole("link")).toHaveFocus();
    expect(select).not.toHaveBeenCalled();
  });

  it("honours controlled expansion and external selection without stealing focus", async () => {
    const user = userEvent.setup();
    const expand = vi.fn();
    const { rerender } = render(
      <Timeline items={items} expandedIds={[]} onExpandedIdsChange={expand} />,
    );
    const disclosure = screen.getByRole("button", {
      name: "Show details for First event",
    });
    await user.click(disclosure);
    expect(expand).toHaveBeenCalledWith(["one"]);
    expect(disclosure).toHaveAttribute("aria-expanded", "false");
    rerender(
      <Timeline
        items={items}
        expandedIds={["one"]}
        selectedId="two"
        onExpandedIdsChange={expand}
      />,
    );
    expect(disclosure).toHaveFocus();
    screen.getByRole("link").focus();
    rerender(
      <Timeline
        items={items}
        expandedIds={[]}
        selectedId="two"
        onExpandedIdsChange={expand}
      />,
    );
    expect(disclosure).toHaveFocus();
  });

  it("groups contiguous runs without reordering and navigates across boundaries", async () => {
    const user = userEvent.setup();
    render(
      <Timeline
        items={[
          { id: "a", title: "A" },
          { id: "b", title: "B" },
          { id: "c", title: "C" },
        ]}
        getGroup={(item) => ({
          id: item.id === "b" ? "second" : "first",
          label: item.id === "b" ? "Second group" : "First group",
        })}
      />,
    );
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(
      screen.getAllByRole("heading", { name: "First group" }),
    ).toHaveLength(2);
    expect(
      screen
        .getAllByRole("button")
        .map((button) => button.getAttribute("data-timeline-id")),
    ).toEqual(["a", "b", "c"]);
    screen.getByRole("button", { name: "A" }).focus();
    await user.keyboard("{End}");
    expect(screen.getByRole("button", { name: "C" })).toHaveFocus();
  });

  it("reveals manually pending content when it receives keyboard focus", () => {
    render(
      <Timeline
        items={items}
        reveal="stagger"
        revealOptions={{ trigger: "manual" }}
        revealCount={0}
      />,
    );
    const button = screen.getByRole("button", {
      name: "Second event",
    });
    expect(button.closest("li")).toHaveAttribute("data-revealed", "false");
    act(() => button.focus());
    expect(button.closest("li")).toHaveAttribute("data-revealed", "true");
  });

  it("does not activate hidden styling on the server and caps only default stagger", () => {
    const html = renderToString(<Timeline items={items} reveal="stagger" />);
    expect(html).not.toContain('data-reveal-ready="true"');
    expect(
      getTimelineRevealBatchDuration({
        batchSize: 100,
        reveal: "stagger",
        options: normalizeTimelineRevealOptions(undefined),
      }),
    ).toBe(520);
    expect(
      getTimelineRevealBatchDuration({
        batchSize: 10,
        reveal: "stagger",
        options: normalizeTimelineRevealOptions({ interval: 100 }),
      }),
    ).toBe(1120);
  });
});

describe("TimelineFeed", () => {
  it("counts only appended IDs while detached, clears on jump, and announces batches", () => {
    vi.useFakeTimers();
    const initial = [
      { id: "a", title: "A" },
      { id: "b", title: "B" },
    ];
    const { rerender } = render(
      <TimelineFeed followLatest={false} items={initial} />,
    );
    rerender(
      <TimelineFeed
        followLatest={false}
        items={[{ id: "older", title: "Older" }, ...initial]}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Jump to latest" }),
    ).toBeInTheDocument();
    const next = [
      { id: "older", title: "Older" },
      ...initial,
      { id: "c", title: "C" },
    ];
    rerender(<TimelineFeed followLatest={false} items={next} />);
    expect(
      screen.getByRole("button", { name: "1 new event · Jump to latest" }),
    ).toBeInTheDocument();
    rerender(
      <TimelineFeed
        followLatest={false}
        items={next.map((item) => ({
          ...item,
          title: item.title + " updated",
        }))}
      />,
    );
    expect(
      screen.getByRole("button", { name: "1 new event · Jump to latest" }),
    ).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(300));
    expect(screen.getByRole("status")).toHaveTextContent(
      "1 new event added. 1 received this session.",
    );
    fireEvent.click(
      screen.getByRole("button", { name: "1 new event · Jump to latest" }),
    );
    expect(
      screen.getByRole("button", { name: "Jump to latest" }),
    ).toBeInTheDocument();
  });

  it("pauses following when scrolled away and preserves focus when jumping", () => {
    const initial = [{ id: "a", title: "A" }];
    const { rerender } = render(<TimelineFeed items={initial} />);
    const viewport = screen.getByRole("region", {
      name: "Live activity",
    });
    Object.defineProperties(viewport, {
      scrollHeight: { configurable: true, value: 1000 },
      clientHeight: { configurable: true, value: 300 },
    });
    viewport.scrollTop = 200;
    fireEvent.scroll(viewport);
    rerender(<TimelineFeed items={[...initial, { id: "b", title: "B" }]} />);
    const jump = screen.getByRole("button", {
      name: "1 new event · Jump to latest",
    });
    jump.focus();
    fireEvent.click(jump);
    expect(jump).toHaveFocus();
    expect(viewport.scrollTop).toBe(1000);
    expect(
      within(viewport).getByRole("button", { name: "B" }),
    ).toBeInTheDocument();
  });
});

it("counts a replacement tail and announces sustained updates in fixed batches", () => {
  vi.useFakeTimers();
  const row = (id: string) => ({ id, title: id });
  const { rerender } = render(
    <TimelineFeed
      followLatest={false}
      items={[row("a"), row("b"), row("c")]}
    />,
  );
  rerender(
    <TimelineFeed
      followLatest={false}
      items={[row("a"), row("b"), row("d")]}
    />,
  );
  expect(
    screen.getByRole("button", { name: "1 new event · Jump to latest" }),
  ).toBeInTheDocument();
  act(() => vi.advanceTimersByTime(200));
  rerender(
    <TimelineFeed
      followLatest={false}
      items={[row("a"), row("b"), row("d"), row("e")]}
    />,
  );
  act(() => vi.advanceTimersByTime(100));
  expect(screen.getByRole("status")).toHaveTextContent(
    "2 new events added. 2 received this session.",
  );
});

it("does not complete an overlapping reveal before the newest batch finishes", () => {
  vi.useFakeTimers();
  const complete = vi.fn();
  const props = {
    items,
    reveal: "stagger" as const,
    revealOptions: { trigger: "manual" as const, duration: 200, interval: 60 },
    onRevealComplete: complete,
  };
  const { rerender } = render(<Timeline {...props} revealCount={0} />);
  fireEvent.focus(screen.getByRole("button", { name: "Second event" }));
  act(() => vi.advanceTimersByTime(100));
  rerender(<Timeline {...props} revealCount={3} />);
  act(() => vi.advanceTimersByTime(100));
  fireEvent.animationEnd(
    screen.getByRole("button", { name: "Second event" }).closest("li")!,
    { animationName: "timeline-reveal" },
  );
  expect(complete).not.toHaveBeenCalled();
  act(() => vi.advanceTimersByTime(300));
  expect(complete).toHaveBeenCalledTimes(1);
});
