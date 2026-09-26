import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { KanbanBoard, type KanbanColumn } from ".";

interface Task {
  id: string;
  columnId: string;
  title: string;
}

const columns: KanbanColumn[] = [
  { id: "todo", title: "To do", wipLimit: 3 },
  { id: "done", title: "Done" },
];

const tasks: Task[] = [
  { id: "t1", columnId: "todo", title: "Write brief" },
  { id: "t2", columnId: "done", title: "Ship it" },
];

const element = (
  <KanbanBoard<Task>
    columns={columns}
    defaultItems={tasks}
    renderCard={(task) => <span>{task.title}</span>}
  />
);

describe("KanbanBoard SSR", () => {
  it("renders board markup on the server", () => {
    const markup = renderToString(element);

    expect(markup).toContain('data-slot="kanban-board"');
    expect(markup).toContain('data-kanban-card="t1"');
    expect(markup).toContain("Write brief");
    expect(markup).toContain('role="meter"');
  });

  it("hydrates without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const container = document.createElement("div");

    container.innerHTML = renderToString(element);
    document.body.appendChild(container);

    await act(async () => {
      hydrateRoot(container, element);
    });

    expect(
      consoleError.mock.calls.some(([message]) =>
        String(message).toLowerCase().includes("hydration"),
      ),
    ).toBe(false);
    consoleError.mockRestore();
    container.remove();
  });
});
