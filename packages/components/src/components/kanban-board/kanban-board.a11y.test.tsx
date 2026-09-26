import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { DethinkProvider } from "../../foundation/dethink-provider";
import { KanbanBoard, type KanbanColumn, type KanbanLane } from ".";

expect.extend(toHaveNoViolations);

interface Task {
  id: string;
  columnId: string;
  laneId?: string;
  title: string;
}

const columns: KanbanColumn[] = [
  { id: "todo", title: "To do", tone: "info", wipLimit: 1 },
  {
    id: "doing",
    title: "Doing",
    tone: "warning",
    wipLimit: { max: 3, mode: "hard" },
  },
  { id: "done", title: "Done", tone: "success" },
];

const lanes: KanbanLane[] = [
  { id: "web", title: "Web" },
  { id: "api", title: "API" },
];

const tasks: Task[] = [
  { id: "t1", columnId: "todo", laneId: "web", title: "Write brief" },
  { id: "t2", columnId: "todo", laneId: "api", title: "Sketch flows" },
  { id: "t3", columnId: "doing", laneId: "web", title: "Build board" },
];

const renderCard = (task: Task) => (
  <div>
    <p className="font-medium">{task.title}</p>
    <a href={`#${task.id}`}>Open</a>
  </div>
);

describe("KanbanBoard accessibility", () => {
  it("has no axe violations with WIP warnings", async () => {
    const { container } = render(
      <DethinkProvider>
        <KanbanBoard<Task>
          columns={columns}
          defaultItems={tasks}
          renderCard={renderCard}
        />
      </DethinkProvider>,
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations with swimlanes and a collapsed column", async () => {
    const { container } = render(
      <DethinkProvider>
        <KanbanBoard<Task>
          columns={columns}
          lanes={lanes}
          defaultItems={tasks}
          defaultCollapsedColumns={["done"]}
          renderCard={renderCard}
        />
      </DethinkProvider>,
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations while a card is lifted by keyboard", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <DethinkProvider>
        <KanbanBoard<Task>
          columns={columns}
          defaultItems={tasks}
          renderCard={renderCard}
        />
      </DethinkProvider>,
    );

    screen
      .getByText("Write brief")
      .closest<HTMLElement>("[data-kanban-card]")!
      .focus();
    await user.keyboard(" {ArrowRight}");

    expect(await axe(container)).toHaveNoViolations();
  });
});
