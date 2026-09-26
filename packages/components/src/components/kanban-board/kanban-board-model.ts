import type { ReactNode } from "react";

export interface KanbanItem {
  id: string;
  columnId: string;
  laneId?: string;
}

export interface KanbanLocation {
  columnId: string;
  laneId?: string;
  /** Zero-based position inside the column/lane cell. */
  index: number;
}

export interface KanbanMove {
  itemId: string;
  from: KanbanLocation;
  to: KanbanLocation;
}

export type KanbanWipMode = "soft" | "hard";

export type KanbanWipLimit =
  number | { max: number; min?: number; mode?: KanbanWipMode };

export type KanbanColumnTone =
  "neutral" | "primary" | "info" | "success" | "warning" | "destructive";

export interface KanbanColumn {
  id: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  tone?: KanbanColumnTone;
  wipLimit?: KanbanWipLimit;
  /** Refuses every drop into this column. Cards can still leave it. */
  dropDisabled?: boolean;
}

export interface KanbanLane {
  id: string;
  title: string;
  description?: string;
}

export type KanbanWipStatus = "none" | "under" | "ok" | "at" | "over";

export interface KanbanWipState {
  count: number;
  max: number | null;
  min: number | null;
  mode: KanbanWipMode;
  status: KanbanWipStatus;
}

export function resolveKanbanWipLimit(limit: KanbanWipLimit | undefined) {
  if (limit === undefined) {
    return null;
  }

  const raw = typeof limit === "number" ? { max: limit } : limit;

  if (!Number.isFinite(raw.max) || raw.max < 0) {
    return null;
  }

  const min =
    raw.min !== undefined && Number.isFinite(raw.min) && raw.min >= 0
      ? Math.min(Math.trunc(raw.min), Math.trunc(raw.max))
      : null;

  return {
    max: Math.trunc(raw.max),
    min,
    mode: raw.mode ?? "soft",
  } as const;
}

export function getKanbanWipState(
  count: number,
  limit: KanbanWipLimit | undefined,
): KanbanWipState {
  const resolved = resolveKanbanWipLimit(limit);

  if (!resolved) {
    return { count, max: null, min: null, mode: "soft", status: "none" };
  }

  let status: KanbanWipStatus = "ok";

  if (count > resolved.max) {
    status = "over";
  } else if (count === resolved.max) {
    status = "at";
  } else if (resolved.min !== null && count < resolved.min) {
    status = "under";
  }

  return { count, ...resolved, status };
}

/** Lane an item renders in: its own lane when known, otherwise the first lane. */
export function resolveKanbanLaneId(
  item: Pick<KanbanItem, "laneId">,
  lanes: readonly KanbanLane[] | undefined,
) {
  if (!lanes || lanes.length === 0) {
    return undefined;
  }

  if (item.laneId !== undefined && lanes.some((l) => l.id === item.laneId)) {
    return item.laneId;
  }

  return lanes[0]?.id;
}

function isInCell<T extends KanbanItem>(
  item: T,
  columnId: string,
  laneId: string | undefined,
  lanes: readonly KanbanLane[] | undefined,
) {
  return (
    item.columnId === columnId && resolveKanbanLaneId(item, lanes) === laneId
  );
}

/** Items in one column (and lane, when lanes are used), in board order. */
export function getKanbanCell<T extends KanbanItem>(
  items: readonly T[],
  columnId: string,
  laneId?: string,
  lanes?: readonly KanbanLane[],
): T[] {
  return items.filter((item) => isInCell(item, columnId, laneId, lanes));
}

export function getKanbanLocation<T extends KanbanItem>(
  items: readonly T[],
  itemId: string,
  lanes?: readonly KanbanLane[],
): KanbanLocation | null {
  const item = items.find((candidate) => candidate.id === itemId);

  if (!item) {
    return null;
  }

  const laneId = resolveKanbanLaneId(item, lanes);
  const index = getKanbanCell(items, item.columnId, laneId, lanes).findIndex(
    (candidate) => candidate.id === itemId,
  );

  return { columnId: item.columnId, laneId, index };
}

export function isSameKanbanLocation(
  a: KanbanLocation | null | undefined,
  b: KanbanLocation | null | undefined,
) {
  return (
    !!a &&
    !!b &&
    a.columnId === b.columnId &&
    a.laneId === b.laneId &&
    a.index === b.index
  );
}

/**
 * Returns a new array with the item placed at `move.to`. Pure and idempotent:
 * re-applying a move that already happened yields the same order, which keeps
 * optimistic overlays safe when the consumer's store catches up.
 */
export function applyKanbanMove<T extends KanbanItem>(
  items: readonly T[],
  move: Pick<KanbanMove, "itemId" | "to">,
  lanes?: readonly KanbanLane[],
): T[] {
  const sourceIndex = items.findIndex((item) => item.id === move.itemId);

  if (sourceIndex === -1) {
    return [...items];
  }

  const source = items[sourceIndex] as T;
  const hasLanes = !!lanes && lanes.length > 0;
  const laneId = hasLanes
    ? (move.to.laneId ?? resolveKanbanLaneId(source, lanes))
    : undefined;
  const moved = { ...source, columnId: move.to.columnId } as T;

  if (hasLanes) {
    moved.laneId = laneId;
  }

  const rest = items.filter((_, index) => index !== sourceIndex);
  const cell = rest.filter((item) =>
    isInCell(item, move.to.columnId, laneId, lanes),
  );
  const targetIndex = Math.min(
    Math.max(Math.trunc(move.to.index), 0),
    cell.length,
  );
  let insertAt: number;

  if (cell.length === 0) {
    insertAt = rest.length;
  } else if (targetIndex < cell.length) {
    insertAt = rest.indexOf(cell[targetIndex] as T);
  } else {
    insertAt = rest.indexOf(cell[cell.length - 1] as T) + 1;
  }

  rest.splice(insertAt, 0, moved);

  return rest;
}

export function countKanbanColumn<T extends KanbanItem>(
  items: readonly T[],
  columnId: string,
) {
  return items.reduce(
    (total, item) => (item.columnId === columnId ? total + 1 : total),
    0,
  );
}

/**
 * Whether a hard WIP limit or `dropDisabled` refuses a card entering the
 * column. Reordering inside a column is always allowed.
 */
export function getKanbanDropRefusal<T extends KanbanItem>(
  items: readonly T[],
  itemId: string,
  column: KanbanColumn | undefined,
): "disabled" | "limit" | null {
  if (!column) {
    return "disabled";
  }

  const item = items.find((candidate) => candidate.id === itemId);

  if (item?.columnId === column.id) {
    return null;
  }

  if (column.dropDisabled) {
    return "disabled";
  }

  const limit = resolveKanbanWipLimit(column.wipLimit);

  if (
    limit?.mode === "hard" &&
    countKanbanColumn(items, column.id) >= limit.max
  ) {
    return "limit";
  }

  return null;
}
