import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type ForwardedRef,
} from "react";
import { useReducedMotion } from "motion/react";
import { useProviderPortalRoot } from "../../utils/provider-portal";
import {
  applyKanbanMove,
  getKanbanCell,
  getKanbanDropRefusal,
  getKanbanLocation,
  isSameKanbanLocation,
  resolveKanbanLaneId,
  resolveKanbanWipLimit,
  countKanbanColumn,
  type KanbanItem,
  type KanbanLocation,
  type KanbanMove,
} from "./kanban-board-model";
import {
  defaultKanbanBoardLabels,
  type KanbanAnnouncementContext,
} from "./kanban-board-parts";
import type {
  CellTarget,
  DragState,
  KanbanBoardProps,
  PendingMove,
} from "./kanban-board-types";
import {
  cellKey,
  isPromiseLike,
  useIsomorphicLayoutEffect,
  useListState,
} from "./kanban-board-utils";

type KanbanBoardStateOptions<T extends KanbanItem> = Pick<
  KanbanBoardProps<T>,
  | "canMove"
  | "collapsedColumns"
  | "collapsedLanes"
  | "columns"
  | "defaultCollapsedColumns"
  | "defaultCollapsedLanes"
  | "defaultItems"
  | "disabled"
  | "getErrorMessage"
  | "items"
  | "labels"
  | "lanes"
  | "onCollapsedColumnsChange"
  | "onCollapsedLanesChange"
  | "onItemsChange"
  | "onMove"
> &
  Required<Pick<KanbanBoardProps<T>, "getItemLabel">>;

/**
 * Board state shared by the keyboard and pointer engines: committed and
 * optimistic items, the active drag, announcements, and focus requests.
 */
export function useKanbanBoardState<T extends KanbanItem>(
  {
    canMove,
    collapsedColumns: collapsedColumnsProp,
    collapsedLanes: collapsedLanesProp,
    columns,
    defaultCollapsedColumns,
    defaultCollapsedLanes,
    defaultItems,
    disabled = false,
    getErrorMessage,
    getItemLabel,
    items: itemsProp,
    labels: labelsProp,
    lanes: lanesProp,
    onCollapsedColumnsChange,
    onCollapsedLanesChange,
    onItemsChange,
    onMove,
  }: KanbanBoardStateOptions<T>,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const labels = useMemo(
    () => ({ ...defaultKanbanBoardLabels, ...labelsProp }),
    [labelsProp],
  );
  const lanes = lanesProp && lanesProp.length > 0 ? lanesProp : undefined;
  const prefersReducedMotion = useReducedMotion() === true;
  const { portalContainer, rootRef } = useProviderPortalRoot<HTMLDivElement>({
    forwardedRef: ref,
    portalSlot: "kanban-board",
  });
  const rootElementRef = useRef<HTMLDivElement | null>(null);
  const setRootRef = useCallback(
    (node: HTMLDivElement | null) => {
      rootElementRef.current = node;
      rootRef(node);
    },
    [rootRef],
  );

  const [internalItems, setInternalItems] = useState<T[]>(
    () => defaultItems ?? [],
  );
  const baseItems = itemsProp ?? internalItems;
  const [pendingMoves, setPendingMoves] = useState<PendingMove[]>([]);
  const [errors, setErrors] = useState<
    Record<string, { key: number; move: KanbanMove; message: string }>
  >({});
  const [drag, setDragState] = useState<DragState | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [collapsedColumns, toggleColumn] = useListState(
    collapsedColumnsProp,
    defaultCollapsedColumns,
    onCollapsedColumnsChange,
  );
  const [collapsedLanes, toggleLane] = useListState(
    collapsedLanesProp,
    defaultCollapsedLanes,
    onCollapsedLanesChange,
  );

  const displayedItems = useMemo(
    () =>
      pendingMoves.reduce(
        (current, pending) => applyKanbanMove(current, pending.move, lanes),
        baseItems,
      ),
    [baseItems, lanes, pendingMoves],
  );
  const renderItems = useMemo(
    () =>
      drag
        ? applyKanbanMove(
            displayedItems,
            { itemId: drag.itemId, to: drag.preview },
            lanes,
          )
        : displayedItems,
    [displayedItems, drag, lanes],
  );
  const pendingIds = useMemo(
    () =>
      new Set(
        pendingMoves
          .filter((pending) => pending.status === "saving")
          .map((pending) => pending.move.itemId),
      ),
    [pendingMoves],
  );
  const columnById = useMemo(
    () => new Map(columns.map((column) => [column.id, column])),
    [columns],
  );
  const laneById = useMemo(
    () => new Map((lanes ?? []).map((lane) => [lane.id, lane])),
    [lanes],
  );
  const cells = useMemo(() => {
    const map = new Map<string, T[]>();

    for (const item of renderItems) {
      const key = cellKey(item.columnId, resolveKanbanLaneId(item, lanes));
      const list = map.get(key);

      if (list) {
        list.push(item);
      } else {
        map.set(key, [item]);
      }
    }

    return map;
  }, [lanes, renderItems]);

  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef(new Map<string, HTMLLIElement>());
  const cellTargets = useRef(new Map<string, CellTarget>());
  const cellLists = useRef(new Map<string, HTMLElement>());
  const dragRef = useRef<DragState | null>(null);
  const focusRequestRef = useRef<string | null>(null);
  const pendingSeq = useRef(0);
  // Every move that has not reached the base items, in submission order. Moves
  // are positional, so they are applied to the base strictly in this order even
  // when their saves settle out of order.
  const moveQueue = useRef<PendingMove[]>([]);
  const latest = useRef({
    baseItems,
    canMove,
    collapsedColumns,
    collapsedLanes,
    columnById,
    disabled,
    displayedItems,
    getErrorMessage,
    getItemLabel,
    labels,
    laneById,
    lanes,
    onItemsChange,
    onMove,
    prefersReducedMotion,
    isControlled: itemsProp !== undefined,
  });

  useIsomorphicLayoutEffect(() => {
    latest.current = {
      baseItems,
      canMove,
      collapsedColumns,
      collapsedLanes,
      columnById,
      disabled,
      displayedItems,
      getErrorMessage,
      getItemLabel,
      labels,
      laneById,
      lanes,
      onItemsChange,
      onMove,
      prefersReducedMotion,
      isControlled: itemsProp !== undefined,
    };
  });

  const setDrag = useCallback(
    (
      next:
        DragState | null | ((current: DragState | null) => DragState | null),
    ) => {
      const resolved =
        typeof next === "function" ? next(dragRef.current) : next;

      dragRef.current = resolved;
      setDragState(resolved);
    },
    [],
  );

  const announce = useCallback((message: string) => {
    // A trailing no-break space forces repeats of the same text to re-announce.
    setAnnouncement((current) =>
      current === message ? `${message}\u00a0` : message,
    );
  }, []);

  const describe = useCallback(
    (
      itemId: string,
      location: KanbanLocation,
      items: readonly T[],
      reason?: string,
    ): KanbanAnnouncementContext => {
      const {
        columnById: columnsById,
        getItemLabel: itemLabel,
        laneById: lanesById,
      } = latest.current;
      const item = items.find((candidate) => candidate.id === itemId);
      const total = getKanbanCell(
        items,
        location.columnId,
        location.laneId,
        latest.current.lanes,
      ).filter((candidate) => candidate.id !== itemId).length;

      return {
        item: item ? itemLabel(item) : itemId,
        column: columnsById.get(location.columnId)?.title ?? location.columnId,
        lane:
          location.laneId !== undefined
            ? lanesById.get(location.laneId)?.title
            : undefined,
        position: location.index + 1,
        total: total + 1,
        reason,
      };
    },
    [],
  );

  const getRefusal = useCallback(
    (itemId: string, to: KanbanLocation, from: KanbanLocation) => {
      const {
        canMove: veto,
        columnById: columnsById,
        displayedItems: items,
        labels: text,
      } = latest.current;
      const column = columnsById.get(to.columnId);
      const refusal = getKanbanDropRefusal(items, itemId, column);

      if (refusal === "limit" && column) {
        const limit = resolveKanbanWipLimit(column.wipLimit);

        return text.refusedLimit(
          column.title,
          countKanbanColumn(items, column.id),
          limit?.max ?? 0,
        );
      }

      if (refusal === "disabled") {
        return text.refusedDisabled(column?.title ?? to.columnId);
      }

      const item = items.find((candidate) => candidate.id === itemId);

      if (veto && item) {
        const verdict = veto({ itemId, from, to }, item);

        if (verdict === false) {
          return text.refusedDefault;
        }

        if (typeof verdict === "string") {
          return verdict;
        }
      }

      return null;
    },
    [],
  );

  const commitToBase = useCallback((move: KanbanMove) => {
    const {
      baseItems: base,
      isControlled,
      lanes: laneList,
      onItemsChange: notify,
    } = latest.current;
    const next = applyKanbanMove(base, move, laneList);

    if (!isControlled) {
      setInternalItems(next);
    }

    latest.current.baseItems = next;
    notify?.(next, move);
  }, []);

  const clearError = useCallback((itemId: string, beforeKey?: number) => {
    setErrors((current) => {
      const error = current[itemId];

      if (!error || (beforeKey !== undefined && error.key > beforeKey)) {
        return current;
      }

      const rest = { ...current };
      delete rest[itemId];

      return rest;
    });
  }, []);

  // Commits confirmed moves from the head of the queue until it reaches one
  // that is still saving.
  const flushQueue = useCallback(() => {
    const queue = moveQueue.current;

    while (queue[0]?.status === "saved") {
      const { key, move } = queue.shift() as PendingMove;

      commitToBase(move);
      // A newer confirmed move makes an older failure for the card obsolete.
      clearError(move.itemId, key);
    }

    setPendingMoves([...queue]);
  }, [clearError, commitToBase]);

  const commitMove = useCallback(
    (move: KanbanMove, options: { skipValidation?: boolean } = {}) => {
      const { displayedItems: items, lanes: laneList } = latest.current;
      const item = items.find((candidate) => candidate.id === move.itemId);

      // Every move path (drag, keyboard, menu, retry) funnels through here,
      // so a disabled board refuses them in one place.
      if (!item || latest.current.disabled) {
        return false;
      }

      if (isSameKanbanLocation(move.from, move.to)) {
        return false;
      }

      if (!options.skipValidation) {
        const refusal = getRefusal(move.itemId, move.to, move.from);

        if (refusal) {
          announce(
            latest.current.labels.refused(
              describe(move.itemId, move.from, items, refusal),
            ),
          );

          return false;
        }
      }

      const next = applyKanbanMove(items, move, laneList);

      clearError(move.itemId);

      const result = latest.current.onMove?.(move, {
        item,
        items: next,
        previousItems: items,
      });
      const key = ++pendingSeq.current;
      const saving = isPromiseLike(result);

      latest.current.displayedItems = next;
      moveQueue.current.push({
        key,
        move,
        status: saving ? "saving" : "saved",
      });
      // A synchronous move commits at once unless an earlier save is still
      // pending, in which case it waits its turn so the earlier save cannot
      // land on top of it.
      flushQueue();

      if (!saving) {
        return true;
      }

      Promise.resolve(result).then(
        () => {
          const entry = moveQueue.current.find(
            (pending) => pending.key === key,
          );

          if (entry) {
            entry.status = "saved";
          }

          flushQueue();
        },
        (error: unknown) => {
          const { getErrorMessage: toMessage, labels: text } = latest.current;
          const queue = moveQueue.current;
          const card = cardRefs.current.get(move.itemId);

          // Rolling back remounts the card in its original list, so keep
          // keyboard focus with it rather than letting it fall to the body.
          if (card?.contains(card.ownerDocument.activeElement)) {
            focusRequestRef.current = move.itemId;
            setActiveId(move.itemId);
          }

          moveQueue.current = queue.filter((pending) => pending.key !== key);
          flushQueue();

          // A later move for the same card replaces this one, so its failure
          // is no longer actionable.
          if (
            queue.some(
              (pending) =>
                pending.key > key && pending.move.itemId === move.itemId,
            )
          ) {
            return;
          }

          setErrors((current) => ({
            ...current,
            [move.itemId]: {
              key,
              move,
              message: toMessage?.(error, item) ?? text.error,
            },
          }));

          const base = latest.current.baseItems;
          const home = getKanbanLocation(
            base,
            move.itemId,
            latest.current.lanes,
          );

          if (home) {
            announce(text.failed(describe(move.itemId, home, base)));
          }
        },
      );

      return true;
    },
    [announce, clearError, describe, flushQueue, getRefusal],
  );

  const retry = useCallback(
    (itemId: string) => {
      const failure = errors[itemId];
      const from = getKanbanLocation(
        latest.current.displayedItems,
        itemId,
        latest.current.lanes,
      );

      if (!failure || !from) {
        return;
      }

      commitMove({ itemId, from, to: failure.move.to });
    },
    [commitMove, errors],
  );

  const dismissError = useCallback((itemId: string) => {
    setErrors((current) => {
      const rest = { ...current };
      delete rest[itemId];

      return rest;
    });
  }, []);

  // Focus follows the card when it re-mounts in another list.
  useIsomorphicLayoutEffect(() => {
    const id = focusRequestRef.current;

    if (!id) {
      return;
    }

    const element = cardRefs.current.get(id);

    if (element && element.ownerDocument.activeElement !== element) {
      element.focus({ preventScroll: true });
      element.scrollIntoView?.({ block: "nearest", inline: "nearest" });
    }

    if (element) {
      focusRequestRef.current = null;
    }
  });

  const focusCard = useCallback((id: string) => {
    setActiveId(id);
    focusRequestRef.current = id;
    const element = cardRefs.current.get(id);

    if (element) {
      element.focus({ preventScroll: true });
      element.scrollIntoView?.({ block: "nearest", inline: "nearest" });
      focusRequestRef.current = null;
    }
  }, []);

  const isRtl = useCallback(() => {
    const root = rootElementRef.current;

    return !!root && getComputedStyle(root).direction === "rtl";
  }, []);

  const registerCell = useCallback(
    (
      columnId: string,
      laneId: string | undefined,
      part: "zone" | "list",
      element: HTMLElement | null,
    ) => {
      const key = cellKey(columnId, laneId);
      if (!element) {
        (part === "zone" ? cellTargets.current : cellLists.current).delete(key);

        return;
      }

      if (part === "zone") {
        cellTargets.current.set(key, { key, columnId, laneId, zone: element });
      } else {
        cellLists.current.set(key, element);
      }
    },
    [],
  );

  return {
    activeId,
    announce,
    announcement,
    cardRefs,
    cellLists,
    cells,
    cellTargets,
    collapsedColumns,
    collapsedLanes,
    columnById,
    commitMove,
    describe,
    dismissError,
    displayedItems,
    drag,
    dragRef,
    errors,
    focusCard,
    focusRequestRef,
    getRefusal,
    isRtl,
    labels,
    laneById,
    lanes,
    latest,
    pendingIds,
    portalContainer,
    prefersReducedMotion,
    registerCell,
    renderItems,
    retry,
    scrollerRef,
    setActiveId,
    setDrag,
    setRootRef,
    toggleColumn,
    toggleLane,
  };
}

export type KanbanBoardState<T extends KanbanItem> = ReturnType<
  typeof useKanbanBoardState<T>
>;
