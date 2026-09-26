import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  KanbanBoard,
  type KanbanColumn,
  type KanbanLane,
} from "@dethink/components";
import { expect, userEvent, within } from "storybook/test";

interface Task {
  id: string;
  columnId: string;
  laneId?: string;
  title: string;
}

const columns: KanbanColumn[] = [
  { id: "todo", title: "To do", tone: "info" },
  {
    id: "doing",
    title: "Doing",
    tone: "primary",
    wipLimit: { max: 2, mode: "hard" },
  },
  { id: "review", title: "Review", tone: "warning", wipLimit: 1 },
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
  { id: "t4", columnId: "doing", laneId: "api", title: "Wire API" },
  { id: "t5", columnId: "review", laneId: "web", title: "Polish motion" },
  { id: "t6", columnId: "review", laneId: "api", title: "Load test" },
];

const meta = {
  title: "Components/KanbanBoard",
  component: KanbanBoard<Task>,
  parameters: { layout: "padded" },
  args: {
    columns,
    defaultItems: tasks,
    className: "h-[30rem]",
    renderCard: (task: Task) => (
      <span className="text-sm font-medium">{task.title}</span>
    ),
  },
} satisfies Meta<typeof KanbanBoard<Task>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Swimlanes: Story = {
  args: { lanes, className: "h-[36rem]" },
};

export const CollapsedColumn: Story = {
  args: { defaultCollapsedColumns: ["done"] },
};

export const OptimisticFailure: Story = {
  args: {
    onMove: () =>
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("offline")), 600),
      ),
    getErrorMessage: () => "Couldn't reach the server.",
  },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const KeyboardMove: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const card = canvas
      .getByText("Write brief")
      .closest<HTMLElement>("[data-kanban-card]")!;

    card.focus();
    await userEvent.keyboard(" ");
    await userEvent.keyboard("{ArrowRight}");
    // Doing is full (hard limit), so the card skips to Review.
    await userEvent.keyboard(" ");
    await expect(
      canvas.getByText("Write brief").closest('[data-slot="kanban-column"]'),
    ).toHaveTextContent("Review");
  },
};
