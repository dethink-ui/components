import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import {
  KanbanBoard,
  type KanbanBoardProps,
  type KanbanCardRenderState,
  type KanbanColumn,
  type KanbanLane,
  type KanbanMove,
} from ".";

interface Task {
  id: string;
  columnId: string;
  laneId?: string;
  title: string;
}

const columns: KanbanColumn[] = [
  { id: "todo", title: "To do" },
  { id: "doing", title: "Doing" },
  { id: "done", title: "Done" },
];

const tasks: Task[] = [
  { id: "t1", columnId: "todo", title: "Write brief" },
  { id: "t2", columnId: "todo", title: "Sketch flows" },
  { id: "t3", columnId: "doing", title: "Build board" },
];

function renderBoard(props: Partial<KanbanBoardProps<Task>> = {}) {
  const onItemsChange = vi.fn();
  const utils = render(
    <KanbanBoard<Task>
      columns={columns}
      defaultItems={tasks}
      onItemsChange={onItemsChange}
      renderCard={(task) => <span>{task.title}</span>}
      {...props}
    />,
  );

  return { ...utils, onItemsChange };
}

const card = (title: string) =>
  screen.getByText(title).closest<HTMLElement>("[data-kanban-card]")!;

const column = (title: string) =>
  screen
    .getByRole("heading", { name: title })
    .closest<HTMLElement>('[data-slot="kanban-column"]')!;

const titlesIn = (title: string) =>
  within(column(title))
    .queryAllByRole("listitem")
    .filter((item) => item.hasAttribute("data-kanban-card"))
    .map((item) => item.querySelector("span")?.textContent);

const status = () =>
  document.querySelector('[aria-live="polite"]')?.textContent ?? "";

describe("KanbanBoard", () => {
  it("renders columns, counts and cards with one tab stop", () => {
    renderBoard();

    expect(
      screen.getByRole("region", { name: "Kanban board" }),
    ).toBeInTheDocument();
    expect(titlesIn("To do")).toEqual(["Write brief", "Sketch flows"]);
    expect(within(column("To do")).getByText("2 cards")).toBeInTheDocument();
    expect(card("Write brief")).toHaveAttribute("tabindex", "0");
    expect(card("Sketch flows")).toHaveAttribute("tabindex", "-1");
    expect(card("Write brief")).toHaveAttribute(
      "aria-roledescription",
      "movable card",
    );
    expect(within(column("Done")).getByText("No cards")).toBeInTheDocument();
  });

  it("moves focus with the arrow keys", async () => {
    const user = userEvent.setup();

    renderBoard();
    await user.tab();
    expect(
      screen.getByRole("button", { name: "Collapse To do" }),
    ).toHaveFocus();
    await user.tab();
    expect(card("Write brief")).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(card("Sketch flows")).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(card("Build board")).toHaveFocus();
    await user.keyboard("{ArrowLeft}{Home}");
    expect(card("Write brief")).toHaveFocus();
  });

  it("picks up, moves across columns and drops with the keyboard", async () => {
    const user = userEvent.setup();
    const { onItemsChange } = renderBoard();

    card("Write brief").focus();
    await user.keyboard(" ");
    expect(status()).toContain(
      "Picked up Write brief, position 1 of 2 in To do",
    );
    expect(card("Write brief")).toHaveAttribute("data-lifted", "true");

    await user.keyboard("{ArrowRight}");
    expect(status()).toContain("position 1 of 2 in Doing");
    expect(titlesIn("Doing")).toEqual(["Write brief", "Build board"]);
    expect(card("Write brief")).toHaveFocus();

    await user.keyboard("{ArrowDown}{Enter}");

    const [next, move] = onItemsChange.mock.calls[0] as [Task[], KanbanMove];

    expect(move).toEqual({
      itemId: "t1",
      from: { columnId: "todo", laneId: undefined, index: 0 },
      to: { columnId: "doing", laneId: undefined, index: 1 },
    });
    expect(next.find((task) => task.id === "t1")?.columnId).toBe("doing");
    expect(titlesIn("Doing")).toEqual(["Build board", "Write brief"]);
    expect(status()).toContain("Dropped Write brief, position 2 of 2 in Doing");
  });

  it("cancels a keyboard move with Escape", async () => {
    const user = userEvent.setup();
    const { onItemsChange } = renderBoard();

    card("Write brief").focus();
    await user.keyboard(" {ArrowRight}{Escape}");

    expect(onItemsChange).not.toHaveBeenCalled();
    expect(titlesIn("To do")).toEqual(["Write brief", "Sketch flows"]);
    expect(status()).toContain(
      "Move cancelled. Write brief returned to position 1",
    );
    expect(card("Write brief")).toHaveFocus();
  });

  it("moves through the Move menu", async () => {
    const user = userEvent.setup();
    const { onItemsChange } = renderBoard();

    await user.click(screen.getByRole("button", { name: "Move Sketch flows" }));
    await user.click(await screen.findByRole("menuitem", { name: /Done/ }));

    expect(onItemsChange).toHaveBeenCalledTimes(1);
    expect(titlesIn("Done")).toEqual(["Sketch flows"]);

    await user.click(screen.getByRole("button", { name: "Move Write brief" }));
    expect(
      await screen.findByRole("menuitem", { name: /Move up/ }),
    ).toHaveAttribute("aria-disabled", "true");
  });

  it("enforces hard WIP limits and warns on soft ones", async () => {
    const user = userEvent.setup();
    const { onItemsChange } = renderBoard({
      columns: [
        { id: "todo", title: "To do", wipLimit: 1 },
        { id: "doing", title: "Doing", wipLimit: { max: 1, mode: "hard" } },
        { id: "done", title: "Done" },
      ],
    });

    const todoMeter = within(column("To do")).getByRole("meter", {
      name: "Work in progress",
    });

    expect(todoMeter).toHaveAttribute("aria-valuetext", "2 of 1, Over limit");
    expect(column("To do")).toHaveAttribute("data-wip", "over");

    await user.click(screen.getByRole("button", { name: "Move Write brief" }));

    const doing = await screen.findByRole("menuitem", { name: /Doing/ });

    expect(doing).toHaveAttribute("aria-disabled", "true");
    expect(doing).toHaveTextContent("Doing is at its limit, 1 of 1.");
    await user.keyboard("{Escape}");

    // The keyboard move skips the full column and lands in Done.
    card("Write brief").focus();
    await user.keyboard(" {ArrowRight}");
    expect(titlesIn("Done")).toEqual(["Write brief"]);
    await user.keyboard(" ");
    expect(onItemsChange.mock.calls[0]?.[1].to.columnId).toBe("done");
  });

  it("honours canMove vetoes with a reason", async () => {
    const user = userEvent.setup();
    const { onItemsChange } = renderBoard({
      canMove: (move) =>
        move.to.columnId === "done" ? "Only reviewers can close tasks." : true,
    });

    await user.click(screen.getByRole("button", { name: "Move Build board" }));
    expect(
      await screen.findByRole("menuitem", { name: /Done/ }),
    ).toHaveAttribute("aria-disabled", "true");
    await user.keyboard("{Escape}");

    card("Build board").focus();
    await user.keyboard(" {ArrowRight}");
    expect(status()).toBe("Only reviewers can close tasks.");
    await user.keyboard("{Escape}");
    expect(onItemsChange).not.toHaveBeenCalled();
  });

  it("works as a controlled board", async () => {
    const user = userEvent.setup();

    function Controlled() {
      const [items, setItems] = useState(tasks);

      return (
        <KanbanBoard<Task>
          columns={columns}
          items={items}
          onItemsChange={setItems}
          renderCard={(task) => <span>{task.title}</span>}
        />
      );
    }

    render(<Controlled />);
    card("Sketch flows").focus();
    await user.keyboard(" {ArrowUp} ");
    expect(titlesIn("To do")).toEqual(["Sketch flows", "Write brief"]);
  });

  it("applies async moves optimistically and rolls back on failure", async () => {
    const user = userEvent.setup();
    let reject: (error: Error) => void = () => undefined;
    const onMove = vi.fn(
      () =>
        new Promise<void>((_, fail) => {
          reject = fail;
        }),
    );
    const { onItemsChange } = renderBoard({
      onMove,
      getErrorMessage: () => "Server said no.",
    });

    card("Write brief").focus();
    await user.keyboard(" {ArrowRight} ");

    expect(onMove).toHaveBeenCalledTimes(1);
    expect(titlesIn("Doing")).toEqual(["Write brief", "Build board"]);
    expect(card("Write brief")).toHaveAttribute("data-pending", "true");
    expect(card("Write brief")).toHaveAttribute("aria-busy", "true");
    expect(onItemsChange).not.toHaveBeenCalled();

    await act(async () => {
      reject(new Error("nope"));
    });

    await waitFor(() =>
      expect(titlesIn("To do")).toEqual(["Write brief", "Sketch flows"]),
    );
    expect(card("Write brief")).toHaveAttribute("data-error", "true");
    expect(screen.getByText("Server said no.")).toBeInTheDocument();
    expect(status()).toContain(
      "Couldn't move Write brief. It went back to position 1 of 2 in To do",
    );

    onMove.mockImplementationOnce(() => Promise.resolve());
    await user.click(screen.getByRole("button", { name: "Retry" }));

    await waitFor(() => expect(onItemsChange).toHaveBeenCalledTimes(1));
    expect(titlesIn("Doing")).toEqual(["Write brief", "Build board"]);
    expect(card("Write brief")).not.toHaveAttribute("data-error");
  });

  it("keeps keyboard focus on a card when its save is rolled back", async () => {
    const user = userEvent.setup();
    let reject: (error: Error) => void = () => undefined;

    renderBoard({
      onMove: () =>
        new Promise<void>((_, fail) => {
          reject = fail;
        }),
    });

    card("Write brief").focus();
    await user.keyboard(" {ArrowRight} ");
    expect(titlesIn("Doing")).toContain("Write brief");
    expect(card("Write brief")).toHaveFocus();

    await act(async () => {
      reject(new Error("nope"));
    });

    await waitFor(() =>
      expect(titlesIn("To do")).toEqual(["Write brief", "Sketch flows"]),
    );
    expect(card("Write brief")).toHaveFocus();
  });

  it("commits a resolved async move", async () => {
    const user = userEvent.setup();
    const { onItemsChange } = renderBoard({
      onMove: () => Promise.resolve(),
    });

    card("Build board").focus();
    await user.keyboard(" {ArrowRight} ");
    await waitFor(() => expect(onItemsChange).toHaveBeenCalledTimes(1));
    expect(card("Build board")).not.toHaveAttribute("data-pending");
    expect(titlesIn("Done")).toEqual(["Build board"]);
  });

  it("keeps the newest move when async saves resolve out of order", async () => {
    const user = userEvent.setup();
    const saves: (() => void)[] = [];
    const { onItemsChange } = renderBoard({
      onMove: () =>
        new Promise<void>((resolve) => {
          saves.push(resolve);
        }),
    });

    card("Write brief").focus();
    await user.keyboard(" {ArrowRight} ");
    await user.keyboard(" {ArrowRight} ");
    expect(titlesIn("Done")).toEqual(["Write brief"]);

    // The newer save waits for the older one so they commit in order.
    await act(async () => {
      saves[1]?.();
    });
    expect(onItemsChange).not.toHaveBeenCalled();
    expect(titlesIn("Done")).toEqual(["Write brief"]);

    await act(async () => {
      saves[0]?.();
    });
    await waitFor(() => expect(onItemsChange).toHaveBeenCalledTimes(2));
    expect(titlesIn("Done")).toEqual(["Write brief"]);
    expect(card("Write brief")).not.toHaveAttribute("data-pending");
  });

  it("reconciles positional moves across cards in submission order", async () => {
    const user = userEvent.setup();
    const saves: (() => void)[] = [];
    const { onItemsChange } = renderBoard({
      defaultItems: [
        { id: "a", columnId: "todo", title: "Alpha" },
        { id: "b", columnId: "todo", title: "Bravo" },
        { id: "c", columnId: "todo", title: "Charlie" },
      ],
      onMove: () =>
        new Promise<void>((resolve) => {
          saves.push(resolve);
        }),
    });

    card("Alpha").focus();
    await user.keyboard(" {ArrowDown}{ArrowDown} ");
    card("Bravo").focus();
    await user.keyboard(" {ArrowDown}{ArrowDown} ");
    expect(titlesIn("To do")).toEqual(["Charlie", "Alpha", "Bravo"]);

    await act(async () => {
      saves[1]?.();
    });
    await act(async () => {
      saves[0]?.();
    });

    await waitFor(() => expect(onItemsChange).toHaveBeenCalledTimes(2));
    expect(titlesIn("To do")).toEqual(["Charlie", "Alpha", "Bravo"]);
    expect(
      onItemsChange.mock.lastCall?.[0].map((task: Task) => task.id),
    ).toEqual(["c", "a", "b"]);
  });

  it("does not let an older async save undo a newer synchronous move", async () => {
    const user = userEvent.setup();
    let save: () => void = () => undefined;
    const onMove = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<void>((resolve) => {
            save = resolve;
          }),
      )
      .mockImplementation(() => undefined);
    const { onItemsChange } = renderBoard({ onMove });

    card("Write brief").focus();
    await user.keyboard(" {ArrowRight} ");
    await user.keyboard(" {ArrowRight} ");
    expect(titlesIn("Done")).toEqual(["Write brief"]);
    expect(onItemsChange).not.toHaveBeenCalled();

    await act(async () => {
      save();
    });

    await waitFor(() => expect(onItemsChange).toHaveBeenCalledTimes(2));
    expect(titlesIn("Done")).toEqual(["Write brief"]);
    expect(card("Write brief")).not.toHaveAttribute("data-pending");
  });

  it("drops an older failure once a newer move for the card succeeds", async () => {
    const user = userEvent.setup();
    const settle: { resolve: () => void; reject: (error: Error) => void }[] =
      [];
    renderBoard({
      onMove: () =>
        new Promise<void>((resolve, reject) => {
          settle.push({ resolve, reject });
        }),
    });

    card("Write brief").focus();
    await user.keyboard(" {ArrowRight} ");
    await user.keyboard(" {ArrowRight} ");

    await act(async () => {
      settle[0]?.reject(new Error("nope"));
    });
    await act(async () => {
      settle[1]?.resolve();
    });

    await waitFor(() => expect(titlesIn("Done")).toEqual(["Write brief"]));
    expect(card("Write brief")).not.toHaveAttribute("data-error");
    expect(
      screen.queryByRole("button", { name: "Retry" }),
    ).not.toBeInTheDocument();
  });

  it("moves the tab stop to a visible card when the active one collapses", async () => {
    const user = userEvent.setup();

    renderBoard();
    card("Build board").focus();
    await user.keyboard("{ArrowLeft}");
    expect(card("Write brief")).toHaveFocus();
    await user.click(screen.getByRole("button", { name: "Collapse To do" }));

    expect(card("Build board")).toHaveAttribute("tabindex", "0");
  });

  it("skips collapsed lanes when choosing the tab stop", () => {
    render(
      <KanbanBoard<Task>
        columns={columns}
        lanes={[
          { id: "ann", title: "Ann" },
          { id: "bo", title: "Bo" },
        ]}
        defaultCollapsedLanes={["ann"]}
        defaultItems={[
          { id: "l1", columnId: "todo", laneId: "ann", title: "Ann task" },
          { id: "l2", columnId: "todo", laneId: "bo", title: "Bo task" },
        ]}
        renderCard={(task) => <span>{task.title}</span>}
      />,
    );

    expect(card("Bo task")).toHaveAttribute("tabindex", "0");
  });

  it("collapses columns to a rail", async () => {
    const user = userEvent.setup();
    const onCollapsedColumnsChange = vi.fn();

    renderBoard({ onCollapsedColumnsChange });
    await user.click(screen.getByRole("button", { name: "Collapse Doing" }));

    expect(onCollapsedColumnsChange).toHaveBeenCalledWith(["doing"]);
    expect(screen.queryByText("Build board")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Expand Doing" }),
    ).toHaveAttribute("aria-expanded", "false");
  });

  it("renders swimlanes and moves between lanes with the keyboard", async () => {
    const user = userEvent.setup();
    const lanes: KanbanLane[] = [
      { id: "ann", title: "Ann" },
      { id: "bo", title: "Bo" },
    ];
    const onItemsChange = vi.fn();

    render(
      <KanbanBoard<Task>
        columns={columns}
        lanes={lanes}
        defaultItems={[
          { id: "l1", columnId: "todo", laneId: "ann", title: "Ann task" },
          { id: "l2", columnId: "todo", laneId: "bo", title: "Bo task" },
        ]}
        onItemsChange={onItemsChange}
        renderCard={(task) => <span>{task.title}</span>}
      />,
    );

    expect(
      screen.getByRole("list", { name: "To do, Ann" }),
    ).toBeInTheDocument();
    card("Ann task").focus();
    await user.keyboard(" {ArrowDown}");
    expect(status()).toContain("in To do, Bo");
    await user.keyboard(" ");
    expect(onItemsChange.mock.calls[0]?.[1].to).toEqual({
      columnId: "todo",
      laneId: "bo",
      index: 0,
    });
    expect(onItemsChange.mock.calls[0]?.[0][0]).toMatchObject({
      id: "l1",
      laneId: "bo",
    });

    await user.click(screen.getByRole("button", { name: "Collapse Ann" }));
    expect(
      screen.queryByRole("list", { name: "To do, Ann" }),
    ).not.toBeInTheDocument();
  });

  it("passes drag handle props in handle mode and disables moves when disabled", () => {
    const renderCard = vi.fn((task: Task, _state: KanbanCardRenderState) => (
      <span>{task.title}</span>
    ));

    renderBoard({ dragHandle: "handle", renderCard });
    expect(renderCard.mock.calls[0]?.[1]).toMatchObject({
      dragHandleProps: { "data-kanban-drag-handle": "" },
      isDragging: false,
      isOverlay: false,
    });
  });

  it("hides move affordances when disabled", async () => {
    const user = userEvent.setup();
    const { onItemsChange } = renderBoard({ disabled: true });

    expect(
      screen.queryByRole("button", { name: /^Move / }),
    ).not.toBeInTheDocument();
    card("Write brief").focus();
    await user.keyboard(" {ArrowRight} ");
    expect(onItemsChange).not.toHaveBeenCalled();
  });

  it("cancels a lifted card and blocks retry when the board becomes disabled", async () => {
    const user = userEvent.setup();
    const onMove = vi.fn(() => Promise.reject(new Error("nope")));
    const onItemsChange = vi.fn();
    const board = (disabled: boolean) => (
      <KanbanBoard<Task>
        columns={columns}
        defaultItems={tasks}
        disabled={disabled}
        onItemsChange={onItemsChange}
        onMove={onMove}
        renderCard={(task) => <span>{task.title}</span>}
      />
    );
    const { rerender } = render(board(false));

    card("Write brief").focus();
    await user.keyboard(" {ArrowRight} ");
    await waitFor(() =>
      expect(card("Write brief")).toHaveAttribute("data-error", "true"),
    );

    card("Sketch flows").focus();
    await user.keyboard(" {ArrowRight}");
    rerender(board(true));
    expect(titlesIn("To do")).toEqual(["Write brief", "Sketch flows"]);

    card("Sketch flows").focus();
    await user.keyboard("{Enter}");
    const retry = screen.getByRole("button", { name: "Retry" });
    expect(retry).toBeDisabled();
    await user.click(retry);

    expect(onMove).toHaveBeenCalledTimes(1);
    expect(onItemsChange).not.toHaveBeenCalled();
    expect(titlesIn("To do")).toEqual(["Write brief", "Sketch flows"]);
  });
});
