import {
  getKanbanCell,
  type KanbanColumn,
  type KanbanItem,
  type KanbanLane,
  type KanbanLocation,
} from "./kanban-board-model";
import {
  kanbanMenuIcons,
  type KanbanBoardLabels,
  type KanbanMoveMenuOption,
} from "./kanban-board-parts";

export interface KanbanMoveMenuContext<T extends KanbanItem> {
  item: T;
  location: KanbanLocation;
  cellCount: number;
  columns: readonly KanbanColumn[];
  lanes: readonly KanbanLane[] | undefined;
  items: readonly T[];
  labels: KanbanBoardLabels;
  getRefusal: (
    itemId: string,
    to: KanbanLocation,
    from: KanbanLocation,
  ) => string | null;
  onMove: (to: KanbanLocation) => void;
}

/** Options for a card's Move menu: reorder, then other columns, then lanes. */
export function buildKanbanMoveMenuOptions<T extends KanbanItem>({
  cellCount,
  columns,
  getRefusal,
  item,
  items,
  labels,
  lanes,
  location,
  onMove,
}: KanbanMoveMenuContext<T>): KanbanMoveMenuOption[] {
  const move = (to: KanbanLocation) => () => onMove(to);
  const options: KanbanMoveMenuOption[] = [
    {
      key: "up",
      label: labels.moveUp,
      icon: kanbanMenuIcons.up,
      section: "order",
      disabled: location.index === 0,
      onAction: move({ ...location, index: location.index - 1 }),
    },
    {
      key: "down",
      label: labels.moveDown,
      icon: kanbanMenuIcons.down,
      section: "order",
      disabled: location.index >= cellCount - 1,
      onAction: move({ ...location, index: location.index + 1 }),
    },
    {
      key: "top",
      label: labels.moveToTop,
      icon: kanbanMenuIcons.top,
      section: "order",
      disabled: location.index === 0,
      onAction: move({ ...location, index: 0 }),
    },
    {
      key: "bottom",
      label: labels.moveToBottom,
      icon: kanbanMenuIcons.bottom,
      section: "order",
      disabled: location.index >= cellCount - 1,
      onAction: move({ ...location, index: cellCount - 1 }),
    },
  ];

  for (const column of columns) {
    if (column.id === location.columnId) {
      continue;
    }

    const to: KanbanLocation = {
      columnId: column.id,
      laneId: location.laneId,
      index: getKanbanCell(items, column.id, location.laneId, lanes).length,
    };
    const reason = getRefusal(item.id, to, location);

    options.push({
      key: `column-${column.id}`,
      label: column.title,
      description: reason ?? undefined,
      icon: kanbanMenuIcons.column,
      section: "column",
      disabled: !!reason,
      onAction: move(to),
    });
  }

  for (const lane of lanes ?? []) {
    if (lane.id === location.laneId) {
      continue;
    }

    const to: KanbanLocation = {
      columnId: location.columnId,
      laneId: lane.id,
      index: getKanbanCell(items, location.columnId, lane.id, lanes).length,
    };
    const reason = getRefusal(item.id, to, location);

    options.push({
      key: `lane-${lane.id}`,
      label: lane.title,
      description: reason ?? undefined,
      icon: kanbanMenuIcons.lane,
      section: "lane",
      disabled: !!reason,
      onAction: move(to),
    });
  }

  return options;
}
