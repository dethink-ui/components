"use client";
import {
  Button,
  KanbanBoard,
  Switch,
  type KanbanColumn,
  type KanbanLane,
  type KanbanMove,
} from "@dethink/components";
import {
  CircleCheck,
  CircleDashed,
  CircleDot,
  Eye,
  Flame,
  SignalHigh,
  SignalLow,
  SignalMedium,
} from "lucide-react";
import { useId, useState } from "react";

type Priority = "urgent" | "high" | "medium" | "low";

interface Issue {
  id: string;
  columnId: string;
  laneId?: string;
  key: string;
  title: string;
  tag: "Web" | "API" | "Design" | "Infra";
  priority: Priority;
  points: number;
  assignee: string;
}

const columns: KanbanColumn[] = [
  {
    id: "backlog",
    title: "Backlog",
    tone: "neutral",
    icon: <CircleDashed />,
  },
  {
    id: "progress",
    title: "In progress",
    description: "Hard limit: finish before you start.",
    tone: "primary",
    icon: <CircleDot />,
    wipLimit: { max: 3, mode: "hard" },
  },
  {
    id: "review",
    title: "In review",
    tone: "warning",
    icon: <Eye />,
    wipLimit: 2,
  },
  {
    id: "done",
    title: "Done",
    tone: "success",
    icon: <CircleCheck />,
  },
];

const people: KanbanLane[] = [
  { id: "maya", title: "Maya Chen", description: "Frontend" },
  { id: "ravi", title: "Ravi Patel", description: "Platform" },
  { id: "ines", title: "Inès Laurent", description: "Design" },
];

const initialIssues: Issue[] = [
  {
    id: "i1",
    columnId: "backlog",
    laneId: "maya",
    key: "DT-142",
    title: "Empty state for saved filters",
    tag: "Web",
    priority: "low",
    points: 2,
    assignee: "maya",
  },
  {
    id: "i2",
    columnId: "backlog",
    laneId: "ravi",
    key: "DT-155",
    title: "Rate-limit the export endpoint",
    tag: "API",
    priority: "high",
    points: 3,
    assignee: "ravi",
  },
  {
    id: "i3",
    columnId: "backlog",
    laneId: "ines",
    key: "DT-158",
    title: "Audit icon weights in dark mode",
    tag: "Design",
    priority: "medium",
    points: 1,
    assignee: "ines",
  },
  {
    id: "i4",
    columnId: "progress",
    laneId: "maya",
    key: "DT-131",
    title: "Keyboard moves for the board",
    tag: "Web",
    priority: "urgent",
    points: 5,
    assignee: "maya",
  },
  {
    id: "i5",
    columnId: "progress",
    laneId: "ravi",
    key: "DT-137",
    title: "Optimistic writes with rollback",
    tag: "API",
    priority: "high",
    points: 3,
    assignee: "ravi",
  },
  {
    id: "i6",
    columnId: "progress",
    laneId: "ines",
    key: "DT-139",
    title: "Lift and tilt drag motion",
    tag: "Design",
    priority: "medium",
    points: 2,
    assignee: "ines",
  },
  {
    id: "i7",
    columnId: "review",
    laneId: "ravi",
    key: "DT-120",
    title: "Swimlane grouping query",
    tag: "Infra",
    priority: "medium",
    points: 3,
    assignee: "ravi",
  },
  {
    id: "i8",
    columnId: "review",
    laneId: "maya",
    key: "DT-118",
    title: "WIP meter in column headers",
    tag: "Web",
    priority: "low",
    points: 2,
    assignee: "maya",
  },
  {
    id: "i9",
    columnId: "review",
    laneId: "ines",
    key: "DT-121",
    title: "Drop indicator spec",
    tag: "Design",
    priority: "low",
    points: 1,
    assignee: "ines",
  },
  {
    id: "i10",
    columnId: "done",
    laneId: "maya",
    key: "DT-101",
    title: "Board scaffolding",
    tag: "Web",
    priority: "medium",
    points: 3,
    assignee: "maya",
  },
];

const tagClasses: Record<Issue["tag"], string> = {
  Web: "bg-info/12 text-info",
  API: "bg-primary/10 text-primary",
  Design: "bg-warning/15 text-warning",
  Infra: "bg-success/12 text-success",
};

const priorityIcon: Record<Priority, typeof Flame> = {
  urgent: Flame,
  high: SignalHigh,
  medium: SignalMedium,
  low: SignalLow,
};

const initials = (id: string) =>
  (people.find((person) => person.id === id)?.title ?? id)
    .split(" ")
    .map((part) => part[0])
    .join("");

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function KanbanSprintBoard() {
  const [issues, setIssues] = useState(initialIssues);
  const [grouped, setGrouped] = useState(false);
  const [failSaves, setFailSaves] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const failId = useId();

  const handleMove = async (move: KanbanMove) => {
    const issue = issues.find((candidate) => candidate.id === move.itemId);

    const shouldFail = failSaves;

    await wait(700);

    if (shouldFail) {
      setLog((entries) =>
        [`${issue?.key} · save failed`, ...entries].slice(0, 4),
      );
      throw new Error("offline");
    }

    setLog((entries) =>
      [
        `${issue?.key} → ${columns.find((c) => c.id === move.to.columnId)?.title}`,
        ...entries,
      ].slice(0, 4),
    );
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <div
          role="group"
          aria-label="Group by"
          className="bg-muted inline-flex rounded-lg p-0.5"
        >
          {[
            { value: false, label: "Status" },
            { value: true, label: "Assignee" },
          ].map((option) => (
            <Button
              key={option.label}
              size="sm"
              variant={grouped === option.value ? "outline" : "ghost"}
              aria-pressed={grouped === option.value}
              className="h-7 border-transparent px-3"
              onClick={() => setGrouped(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id={failId}
            checked={failSaves}
            onCheckedChange={setFailSaves}
            controlSize="sm"
          />
          <label htmlFor={failId} className="text-muted-foreground text-sm">
            Simulate failed saves
          </label>
        </div>
        <p
          className="text-muted-foreground ms-auto truncate font-mono text-xs"
          aria-live="off"
        >
          {log[0] ?? "Drag a card, or focus one and press Space."}
        </p>
      </div>
      <KanbanBoard<Issue>
        label="Sprint 24"
        className={grouped ? "h-[40rem]" : "h-[34rem]"}
        columns={columns}
        lanes={grouped ? people : undefined}
        items={issues}
        onItemsChange={setIssues}
        onMove={handleMove}
        getItemLabel={(issue) => `${issue.key} ${issue.title}`}
        getErrorMessage={() => "Couldn't reach the server."}
        columnWidth="17.5rem"
        renderColumnFooter={(column, items) => (
          <p className="text-muted-foreground flex items-center justify-between px-1 text-xs">
            <span>{column.id === "done" ? "Shipped" : "Estimate"}</span>
            <span className="tabular-nums">
              {items.reduce((total, issue) => total + issue.points, 0)} pts
            </span>
          </p>
        )}
        renderCard={(issue, state) => {
          const Priority = priorityIcon[issue.priority];

          return (
            <div
              className={
                state.isPending ? "opacity-70 transition-opacity" : undefined
              }
            >
              <div className="text-muted-foreground mb-1.5 flex items-center gap-2 text-xs">
                <span className="font-mono">{issue.key}</span>
                <span
                  className={`rounded px-1.5 py-px text-[0.6875rem] font-medium ${tagClasses[issue.tag]}`}
                >
                  {issue.tag}
                </span>
              </div>
              <p className="text-foreground text-sm leading-snug font-medium">
                {issue.title}
              </p>
              <div className="text-muted-foreground mt-3 flex items-center gap-2 text-xs">
                <Priority
                  aria-label={`${issue.priority} priority`}
                  className={
                    issue.priority === "urgent"
                      ? "text-destructive size-3.5"
                      : "size-3.5"
                  }
                />
                <span className="tabular-nums">{issue.points} pts</span>
                <span
                  aria-label={
                    people.find((person) => person.id === issue.assignee)?.title
                  }
                  className="bg-foreground/8 text-foreground ms-auto inline-flex size-6 items-center justify-center rounded-full text-[0.625rem] font-semibold"
                >
                  {initials(issue.assignee)}
                </span>
              </div>
            </div>
          );
        }}
      />
    </div>
  );
}
