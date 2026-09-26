"use client";
import { KanbanBoard, type KanbanColumn } from "@dethink/components";
import { GripVertical } from "lucide-react";

interface Note {
  id: string;
  columnId: string;
  title: string;
  body: string;
}

const columns: KanbanColumn[] = [
  { id: "ideas", title: "Ideas", tone: "info" },
  { id: "drafting", title: "Drafting", tone: "warning", wipLimit: 2 },
  { id: "published", title: "Published", tone: "success" },
];

const notes: Note[] = [
  {
    id: "n1",
    columnId: "ideas",
    title: "Release notes",
    body: "Summarise what changed this week.",
  },
  {
    id: "n2",
    columnId: "ideas",
    title: "Onboarding tips",
    body: "Three shortcuts every new user needs.",
  },
  {
    id: "n3",
    columnId: "drafting",
    title: "Pricing FAQ",
    body: "Answer the top five billing questions.",
  },
];

export function KanbanHandle() {
  return (
    <KanbanBoard<Note>
      label="Content pipeline"
      className="h-[22rem]"
      columns={columns}
      defaultItems={notes}
      dragHandle="handle"
      dragTilt={3}
      columnWidth="15rem"
      renderCard={(note, { dragHandleProps }) => (
        <div className="flex gap-2">
          <span
            {...dragHandleProps}
            aria-hidden="true"
            className="text-muted-foreground hover:text-foreground -ms-1 mt-0.5 rounded"
          >
            <GripVertical className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium">{note.title}</p>
            <p className="text-muted-foreground mt-1 text-xs select-text">
              {note.body}
            </p>
          </div>
        </div>
      )}
    />
  );
}
