import type { PropRow } from "@/components/props-table";

export const kanbanBoardProps: PropRow[] = [
  {
    prop: "columns",
    type: "KanbanColumn[]",
    defaultValue: "—",
    description: "Columns in display order.",
  },
  {
    prop: "items / defaultItems",
    type: "T extends KanbanItem[]",
    defaultValue: "—",
    description:
      "Ordered cards, as { id, columnId, laneId? } plus your own fields. Array order sets the order inside each cell.",
  },
  {
    prop: "onItemsChange",
    type: "(items, move) => void",
    defaultValue: "—",
    description:
      "Called when a move is committed, or when a pending async move resolves.",
  },
  {
    prop: "onMove",
    type: "(move, { item, items, previousItems }) => void | Promise",
    defaultValue: "—",
    description:
      "Persist a move. Return a Promise to save optimistically: the card is marked as saving, and springs back with an error and Retry if the Promise rejects.",
  },
  {
    prop: "renderCard",
    type: "(item, state) => ReactNode",
    defaultValue: "—",
    description:
      "Card content. The board provides the surface, focus, and Move menu.",
  },
  {
    prop: "lanes",
    type: "KanbanLane[]",
    defaultValue: "—",
    description:
      "Swimlanes. Cards without a known laneId go in the first lane. Lanes can collapse.",
  },
  {
    prop: "canMove",
    type: "(move, item) => boolean | string",
    defaultValue: "—",
    description:
      "Refuse a move. Return a string to explain why; it is shown and announced.",
  },
  {
    prop: "getItemLabel",
    type: "(item) => string",
    defaultValue: "item.title ?? item.id",
    description: "Plain-text name for announcements and the Move menu.",
  },
  {
    prop: "getErrorMessage",
    type: "(error, item) => string",
    defaultValue: '"Couldn\'t save this move."',
    description: "Message shown on a card whose save failed.",
  },
  {
    prop: "dragHandle",
    type: '"card" | "handle"',
    defaultValue: '"card"',
    description:
      "Where pointer drags start. With handle, spread state.dragHandleProps on your grip.",
  },
  {
    prop: "dragTilt",
    type: "number",
    defaultValue: "6",
    description:
      "Maximum tilt in degrees, driven by horizontal drag speed. 0 turns it off.",
  },
  {
    prop: "columnWidth",
    type: "string",
    defaultValue: '"18rem"',
    description: "CSS width of an expanded column.",
  },
  {
    prop: "collapsibleColumns",
    type: "boolean",
    defaultValue: "true",
    description:
      "Shows a collapse button that shrinks a column to a rail showing its count.",
  },
  {
    prop: "collapsedColumns / collapsedLanes",
    type: "string[]",
    defaultValue: "—",
    description:
      "Controlled collapsed ids, with default… and on…Change counterparts.",
  },
  {
    prop: "renderColumnFooter / renderEmptyColumn",
    type: "(column, …) => ReactNode",
    defaultValue: "—",
    description: "Extra slots for column totals and empty cells.",
  },
  {
    prop: "showMoveMenu",
    type: "boolean",
    defaultValue: "true",
    description:
      "The per-card Move menu. It is the single-pointer alternative to dragging, so keep it on unless you provide another one.",
  },
  {
    prop: "disabled",
    type: "boolean",
    defaultValue: "false",
    description: "Read-only board: no drags, keyboard moves, or menus.",
  },
  {
    prop: "label / labels",
    type: "string / Partial<KanbanBoardLabels>",
    defaultValue: '"Kanban board"',
    description:
      "Accessible name and every string the board shows or announces.",
  },
];

export const kanbanColumnProps: PropRow[] = [
  {
    prop: "id / title",
    type: "string",
    defaultValue: "—",
    description: "Stable id and visible name.",
  },
  {
    prop: "tone",
    type: '"neutral" | "primary" | "info" | "success" | "warning" | "destructive"',
    defaultValue: '"neutral"',
    description: "Accent line and status dot.",
  },
  {
    prop: "icon / description",
    type: "ReactNode / string",
    defaultValue: "—",
    description: "Optional header decoration and subtitle.",
  },
  {
    prop: "wipLimit",
    type: '{ max, min?, mode?: "soft" | "hard" } | number',
    defaultValue: "—",
    description:
      "Work-in-progress limit shown as a meter. A number is soft. Hard limits refuse drops that would pass max.",
  },
  {
    prop: "dropDisabled",
    type: "boolean",
    defaultValue: "false",
    description: "Refuses every incoming card.",
  },
];

export const kanbanCardStateProps: PropRow[] = [
  {
    prop: "location / column / lane",
    type: "KanbanLocation / KanbanColumn / KanbanLane",
    defaultValue: "—",
    description: "Where the card is rendered.",
  },
  {
    prop: "isDragging / isOverlay",
    type: "boolean",
    defaultValue: "—",
    description:
      "True for the card being moved, and for the floating copy that follows the pointer.",
  },
  {
    prop: "isPending / error",
    type: "boolean / string | null",
    defaultValue: "—",
    description: "Async save state.",
  },
  {
    prop: "dragHandleProps",
    type: "object | undefined",
    defaultValue: "—",
    description: 'Spread on your grip when dragHandle="handle".',
  },
];
