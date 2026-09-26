import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import type {
  KanbanColumn,
  KanbanItem,
  KanbanLane,
  KanbanLocation,
  KanbanMove,
} from "./kanban-board-model";
import type { KanbanBoardLabels } from "./kanban-board-parts";

export type KanbanDragHandleMode = "card" | "handle";

export interface KanbanDragHandleProps {
  "data-kanban-drag-handle": "";
  style: CSSProperties;
}

export interface KanbanCardRenderState {
  location: KanbanLocation;
  column: KanbanColumn;
  lane?: KanbanLane;
  /** The card is being moved: the in-board placeholder or the keyboard-lifted card. */
  isDragging: boolean;
  /** The floating copy that follows the pointer. */
  isOverlay: boolean;
  isPending: boolean;
  error: string | null;
  /** Spread on a custom grip when `dragHandle="handle"`. */
  dragHandleProps: KanbanDragHandleProps | undefined;
}

export interface KanbanMoveContext<T extends KanbanItem> {
  item: T;
  /** Items with the move applied. */
  items: T[];
  previousItems: T[];
}

export interface KanbanBoardProps<T extends KanbanItem> extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "defaultValue" | "onChange"
> {
  columns: readonly KanbanColumn[];
  /** Optional swimlanes. Cards without a known `laneId` render in the first lane. */
  lanes?: readonly KanbanLane[];
  items?: T[];
  defaultItems?: T[];
  /** Called when a move is committed, or when a pending move resolves. */
  onItemsChange?: (items: T[], move: KanbanMove) => void;
  /**
   * Persist a move. Return a Promise to make it optimistic: the card shows in its
   * new place while pending, and springs back with an error when it rejects.
   */
  onMove?: (
    move: KanbanMove,
    context: KanbanMoveContext<T>,
  ) => void | Promise<unknown>;
  /** Veto a move. Return a string to explain why; it is shown and announced. */
  canMove?: (move: KanbanMove, item: T) => boolean | string;
  renderCard: (item: T, state: KanbanCardRenderState) => ReactNode;
  /** Plain-text card name for announcements and the move menu. */
  getItemLabel?: (item: T) => string;
  /** Turn a rejected move into a user-facing message. */
  getErrorMessage?: (error: unknown, item: T) => string;
  label?: string;
  labels?: Partial<KanbanBoardLabels>;
  /** Column width as a CSS length. Default `18rem`. */
  columnWidth?: string;
  /** Maximum tilt in degrees while dragging. `0` disables it. Default `6`. */
  dragTilt?: number;
  /** Start pointer drags from the whole card or only from `dragHandleProps`. */
  dragHandle?: KanbanDragHandleMode;
  disabled?: boolean;
  showMoveMenu?: boolean;
  collapsibleColumns?: boolean;
  collapsedColumns?: string[];
  defaultCollapsedColumns?: string[];
  onCollapsedColumnsChange?: (columnIds: string[]) => void;
  collapsedLanes?: string[];
  defaultCollapsedLanes?: string[];
  onCollapsedLanesChange?: (laneIds: string[]) => void;
  renderColumnFooter?: (column: KanbanColumn, items: T[]) => ReactNode;
  renderEmptyColumn?: (column: KanbanColumn, lane?: KanbanLane) => ReactNode;
}

export type DragMode = "keyboard" | "pointer";

export interface DragState {
  itemId: string;
  from: KanbanLocation;
  preview: KanbanLocation;
  mode: DragMode;
  phase: "dragging" | "settling";
  blocked: { columnId: string; reason: string } | null;
}

export interface PointerSession {
  pointerId: number;
  pointerType: string;
  itemId: string;
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
  lastTime: number;
  offsetX: number;
  offsetY: number;
  active: boolean;
  timer: ReturnType<typeof setTimeout> | undefined;
  frame: number | undefined;
  idle: ReturnType<typeof setTimeout> | undefined;
}

export interface CellTarget {
  key: string;
  columnId: string;
  laneId: string | undefined;
  zone: HTMLElement;
}

export interface PendingMove {
  key: number;
  move: KanbanMove;
  /**
   * `saving` while onMove is unresolved; `saved` once confirmed but still
   * waiting behind an earlier unsettled move before it reaches the base items.
   */
  status: "saving" | "saved";
}
