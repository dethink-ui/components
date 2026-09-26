import {
  useCallback,
  useEffect,
  type FocusEvent,
  type KeyboardEvent,
} from "react";
import {
  getKanbanCell,
  getKanbanLocation,
  isSameKanbanLocation,
  resolveKanbanLaneId,
  type KanbanColumn,
  type KanbanItem,
  type KanbanLocation,
} from "./kanban-board-model";
import type { KanbanBoardState } from "./use-kanban-board-state";

/**
 * Keyboard pick-up, move and drop, plus roving arrow-key navigation between
 * cards when nothing is lifted.
 */
export function useKanbanKeyboard<T extends KanbanItem>(
  board: KanbanBoardState<T>,
  {
    columns,
    disabled,
  }: { columns: readonly KanbanColumn[]; disabled: boolean },
) {
  const {
    activeId,
    announce,
    collapsedColumns,
    collapsedLanes,
    commitMove,
    describe,
    dragRef,
    focusCard,
    focusRequestRef,
    getRefusal,
    isRtl,
    lanes,
    latest,
    renderItems,
    setDrag,
  } = board;

  const visibleLaneIds = useCallback((): (string | undefined)[] => {
    const { collapsedLanes: collapsed, lanes: laneList } = latest.current;

    return laneList
      ? laneList.filter((lane) => !collapsed.includes(lane.id)).map((l) => l.id)
      : [undefined];
  }, []);

  const stepKeyboardDrag = useCallback(
    (direction: "up" | "down" | "left" | "right" | "home" | "end") => {
      const current = dragRef.current;

      if (!current) {
        return;
      }

      const {
        displayedItems: items,
        lanes: laneList,
        collapsedColumns: collapsed,
      } = latest.current;
      const countIn = (columnId: string, laneId: string | undefined) =>
        getKanbanCell(items, columnId, laneId, laneList).filter(
          (item) => item.id !== current.itemId,
        ).length;
      const laneIds = visibleLaneIds();
      const { preview } = current;
      let next: KanbanLocation | null = null;
      let refusal: string | null = null;

      if (direction === "home") {
        next = { ...preview, index: 0 };
      } else if (direction === "end") {
        next = { ...preview, index: countIn(preview.columnId, preview.laneId) };
      } else if (direction === "up" || direction === "down") {
        const count = countIn(preview.columnId, preview.laneId);
        const laneIndex = laneIds.indexOf(preview.laneId);

        if (direction === "up" && preview.index > 0) {
          next = { ...preview, index: preview.index - 1 };
        } else if (direction === "down" && preview.index < count) {
          next = { ...preview, index: preview.index + 1 };
        } else {
          const neighbour = laneIds[laneIndex + (direction === "up" ? -1 : 1)];

          if (laneIndex !== -1 && neighbour !== undefined) {
            next = {
              columnId: preview.columnId,
              laneId: neighbour,
              index:
                direction === "up" ? countIn(preview.columnId, neighbour) : 0,
            };
          }
        }
      } else {
        const forward = (direction === "right") !== isRtl();
        const order = columns.map((column) => column.id);
        let index = order.indexOf(preview.columnId);

        while (!next) {
          index += forward ? 1 : -1;
          const columnId = order[index];

          if (columnId === undefined) {
            break;
          }

          if (collapsed.includes(columnId)) {
            continue;
          }

          const candidate: KanbanLocation = {
            columnId,
            laneId: preview.laneId,
            index: Math.min(preview.index, countIn(columnId, preview.laneId)),
          };
          const reason = getRefusal(current.itemId, candidate, current.from);

          if (reason) {
            refusal ??= reason;
            continue;
          }

          next = candidate;
        }
      }

      if (!next) {
        if (refusal) {
          announce(
            latest.current.labels.refused(
              describe(current.itemId, preview, items, refusal),
            ),
          );
        }

        return;
      }

      if (isSameKanbanLocation(next, preview)) {
        return;
      }

      setDrag({ ...current, preview: next, blocked: null });
      focusRequestRef.current = current.itemId;
      announce(
        latest.current.labels.moved(describe(current.itemId, next, items)),
      );
    },
    [announce, columns, describe, getRefusal, isRtl, setDrag, visibleLaneIds],
  );

  const startKeyboardDrag = useCallback(
    (itemId: string) => {
      const { displayedItems: items, lanes: laneList } = latest.current;
      const from = getKanbanLocation(items, itemId, laneList);

      if (!from) {
        return;
      }

      setDrag({
        itemId,
        from,
        preview: from,
        mode: "keyboard",
        phase: "dragging",
        blocked: null,
      });
      announce(latest.current.labels.pickedUp(describe(itemId, from, items)));
    },
    [announce, describe, setDrag],
  );

  const endKeyboardDrag = useCallback(
    (commit: boolean) => {
      const current = dragRef.current;

      if (!current || current.mode !== "keyboard") {
        return;
      }

      const items = latest.current.displayedItems;

      setDrag(null);
      focusRequestRef.current = current.itemId;

      if (!commit || isSameKanbanLocation(current.from, current.preview)) {
        announce(
          latest.current.labels.cancelled(
            describe(current.itemId, current.from, items),
          ),
        );

        return;
      }

      const move = {
        itemId: current.itemId,
        from: current.from,
        to: current.preview,
      };

      if (commitMove(move)) {
        announce(
          latest.current.labels.dropped(
            describe(current.itemId, current.preview, items),
          ),
        );
      }
    },
    [announce, commitMove, describe, setDrag],
  );

  // Disabling the board drops a lifted card back where it started.
  useEffect(() => {
    if (disabled) {
      endKeyboardDrag(false);
    }
  }, [disabled, endKeyboardDrag]);

  const navigate = useCallback(
    (itemId: string, key: string) => {
      const { collapsedColumns: collapsed, lanes: laneList } = latest.current;
      const items = renderItems;
      const laneIds = visibleLaneIds();
      const columnCards = (columnId: string) =>
        collapsed.includes(columnId)
          ? []
          : laneIds.flatMap((laneId) =>
              getKanbanCell(items, columnId, laneId, laneList),
            );
      const item = items.find((candidate) => candidate.id === itemId);

      if (!item) {
        return;
      }

      const own = columnCards(item.columnId);
      const position = own.findIndex((candidate) => candidate.id === itemId);
      let target: T | undefined;

      if (key === "ArrowUp") {
        target = own[position - 1];
      } else if (key === "ArrowDown") {
        target = own[position + 1];
      } else if (key === "Home") {
        target = own[0];
      } else if (key === "End") {
        target = own[own.length - 1];
      } else {
        const forward = (key === "ArrowRight") !== isRtl();
        const order = columns.map((column) => column.id);
        let index = order.indexOf(item.columnId);

        while (!target) {
          index += forward ? 1 : -1;
          const columnId = order[index];

          if (columnId === undefined) {
            break;
          }

          const cards = columnCards(columnId);

          if (cards.length === 0) {
            continue;
          }

          const laneId = resolveKanbanLaneId(item, laneList);
          const sameLane = cards.filter(
            (card) => resolveKanbanLaneId(card, laneList) === laneId,
          );
          const cellPosition = getKanbanCell(
            items,
            item.columnId,
            laneId,
            laneList,
          ).findIndex((candidate) => candidate.id === itemId);

          target =
            sameLane.length > 0
              ? sameLane[Math.min(cellPosition, sameLane.length - 1)]
              : cards[Math.min(position, cards.length - 1)];
        }
      }

      if (target) {
        focusCard(target.id);
      }
    },
    [columns, focusCard, isRtl, renderItems, visibleLaneIds],
  );

  const handleCardKeyDown = useCallback(
    (event: KeyboardEvent<HTMLLIElement>, itemId: string) => {
      const current = dragRef.current;

      if (current?.mode === "keyboard" && current.itemId === itemId) {
        const map: Record<string, Parameters<typeof stepKeyboardDrag>[0]> = {
          ArrowUp: "up",
          ArrowDown: "down",
          ArrowLeft: "left",
          ArrowRight: "right",
          Home: "home",
          End: "end",
        };

        if (map[event.key]) {
          event.preventDefault();
          stepKeyboardDrag(
            map[event.key] as Parameters<typeof stepKeyboardDrag>[0],
          );
        } else if (event.key === " " || event.key === "Enter") {
          event.preventDefault();
          endKeyboardDrag(true);
        } else if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          endKeyboardDrag(false);
        } else if (event.key === "Tab") {
          endKeyboardDrag(false);
        }

        return;
      }

      if (event.target !== event.currentTarget || current) {
        return;
      }

      if ((event.key === " " || event.key === "Enter") && !disabled) {
        event.preventDefault();
        startKeyboardDrag(itemId);
      } else if (
        [
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
          "Home",
          "End",
        ].includes(event.key)
      ) {
        event.preventDefault();
        navigate(itemId, event.key);
      }
    },
    [disabled, endKeyboardDrag, navigate, startKeyboardDrag, stepKeyboardDrag],
  );

  const handleRootBlur = useCallback(
    (event: FocusEvent<HTMLDivElement>) => {
      const next = event.relatedTarget;

      if (
        dragRef.current?.mode === "keyboard" &&
        next instanceof Node &&
        !event.currentTarget.contains(next)
      ) {
        endKeyboardDrag(false);
      }
    },
    [endKeyboardDrag],
  );

  // The roving tab stop must land on a rendered card, never one hidden inside
  // a collapsed column or lane.
  const isCardVisible = (item: T) =>
    !collapsedColumns.includes(item.columnId) &&
    !(
      lanes &&
      lanes.length > 0 &&
      collapsedLanes.includes(resolveKanbanLaneId(item, lanes) ?? "")
    );
  const visibleItems = renderItems.filter(isCardVisible);
  const rovingId =
    activeId && visibleItems.some((item) => item.id === activeId)
      ? activeId
      : (visibleItems[0]?.id ?? null);

  return { handleCardKeyDown, handleRootBlur, rovingId };
}
