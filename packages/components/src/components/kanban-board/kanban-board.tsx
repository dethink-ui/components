import {
  forwardRef,
  useId,
  type CSSProperties,
  type ForwardedRef,
  type ReactElement,
  type Ref,
} from "react";
import { createPortal } from "react-dom";
import { LayoutGroup, motion } from "motion/react";
import { cn } from "../../utils/cn";
import {
  countKanbanColumn,
  getKanbanWipState,
  resolveKanbanLaneId,
  type KanbanColumn,
  type KanbanItem,
  type KanbanLane,
  type KanbanLocation,
} from "./kanban-board-model";
import { KanbanCardShell } from "./kanban-board-card";
import { buildKanbanMoveMenuOptions } from "./kanban-board-menu";
import { KanbanColumnHeader, KanbanLaneHeader } from "./kanban-board-parts";
import type {
  KanbanBoardProps,
  KanbanCardRenderState,
} from "./kanban-board-types";
import {
  boardScrollerClasses,
  cellKey,
  columnShellClasses,
  defaultItemLabel,
  kanbanBoardClassNames,
  listClasses,
  overlayClasses,
} from "./kanban-board-utils";
import { useKanbanBoardState } from "./use-kanban-board-state";
import { useKanbanKeyboard } from "./use-kanban-keyboard";
import { useKanbanPointer } from "./use-kanban-pointer";

function KanbanBoardImpl<T extends KanbanItem>(
  {
    canMove,
    className,
    collapsedColumns: collapsedColumnsProp,
    collapsedLanes: collapsedLanesProp,
    collapsibleColumns = true,
    columnWidth = "18rem",
    columns,
    defaultCollapsedColumns,
    defaultCollapsedLanes,
    defaultItems,
    disabled = false,
    dragHandle = "card",
    dragTilt = 6,
    getErrorMessage,
    getItemLabel = defaultItemLabel,
    items: itemsProp,
    label,
    labels: labelsProp,
    lanes: lanesProp,
    onCollapsedColumnsChange,
    onCollapsedLanesChange,
    onItemsChange,
    onMove,
    renderCard,
    renderColumnFooter,
    renderEmptyColumn,
    showMoveMenu = true,
    style,
    ...props
  }: KanbanBoardProps<T>,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const board = useKanbanBoardState(
    {
      canMove,
      collapsedColumns: collapsedColumnsProp,
      collapsedLanes: collapsedLanesProp,
      columns,
      defaultCollapsedColumns,
      defaultCollapsedLanes,
      defaultItems,
      disabled,
      getErrorMessage,
      getItemLabel,
      items: itemsProp,
      labels: labelsProp,
      lanes: lanesProp,
      onCollapsedColumnsChange,
      onCollapsedLanesChange,
      onItemsChange,
      onMove,
    },
    ref,
  );
  const {
    announce,
    announcement,
    cardRefs,
    cells,
    collapsedColumns,
    collapsedLanes,
    columnById,
    commitMove,
    describe,
    dismissError,
    displayedItems,
    drag,
    errors,
    focusRequestRef,
    getRefusal,
    labels,
    laneById,
    lanes,
    pendingIds,
    portalContainer,
    prefersReducedMotion,
    registerCell,
    renderItems,
    retry,
    scrollerRef,
    setActiveId,
    setRootRef,
    toggleColumn,
    toggleLane,
  } = board;
  const { handleCardKeyDown, handleRootBlur, rovingId } = useKanbanKeyboard(
    board,
    {
      columns,
      disabled,
    },
  );
  const {
    handlePointerDown,
    overlayRotate,
    overlayScale,
    overlaySize,
    overlayX,
    overlayY,
  } = useKanbanPointer(board, { disabled, dragHandle, dragTilt });
  const baseId = useId();
  const instructionsId = `${baseId}-instructions`;
  const animateLayout = !prefersReducedMotion;

  /* -------------------------------- rendering ------------------------------- */

  const moveFromMenu = (
    itemId: string,
    from: KanbanLocation,
    to: KanbanLocation,
  ) => {
    if (commitMove({ itemId, from, to })) {
      focusRequestRef.current = itemId;
      setActiveId(itemId);
      announce(labels.dropped(describe(itemId, to, displayedItems)));
    }
  };

  const renderCardShell = (
    item: T,
    index: number,
    column: KanbanColumn,
    lane: KanbanLane | undefined,
    cellCount: number,
  ) => {
    const location: KanbanLocation = {
      columnId: column.id,
      laneId: lane?.id,
      index,
    };
    const isMoving = drag?.itemId === item.id;
    const failure = errors[item.id];
    const isPending = pendingIds.has(item.id);
    const state: KanbanCardRenderState = {
      location,
      column,
      lane,
      isDragging: isMoving,
      isOverlay: false,
      isPending,
      error: failure?.message ?? null,
      dragHandleProps:
        dragHandle === "handle" && !disabled
          ? {
              "data-kanban-drag-handle": "",
              style: { touchAction: "none", cursor: "grab" },
            }
          : undefined,
    };

    return (
      <KanbanCardShell
        key={item.id}
        itemId={item.id}
        itemLabel={getItemLabel(item)}
        labels={labels}
        instructionsId={instructionsId}
        layoutId={animateLayout ? `${baseId}-card-${item.id}` : undefined}
        cardRef={(node) => {
          if (node) {
            cardRefs.current.set(item.id, node);
          } else if (cardRefs.current.get(item.id)?.isConnected === false) {
            cardRefs.current.delete(item.id);
          }
        }}
        focusable={rovingId === item.id}
        disabled={disabled}
        dragHandle={dragHandle}
        isLifted={isMoving && drag.mode === "keyboard"}
        isPlaceholder={isMoving && drag.mode === "pointer"}
        isPending={isPending}
        error={state.error}
        showMoveMenu={showMoveMenu && !disabled && !isMoving}
        getMenuOptions={() =>
          buildKanbanMoveMenuOptions({
            cellCount,
            columns,
            getRefusal,
            item,
            items: displayedItems,
            labels,
            lanes,
            location,
            onMove: (to) => moveFromMenu(item.id, location, to),
          })
        }
        onFocus={() => setActiveId(item.id)}
        onKeyDown={(event) => handleCardKeyDown(event, item.id)}
        onPointerDown={(event) => handlePointerDown(event, item.id)}
        onRetry={() => retry(item.id)}
        onDismiss={() => dismissError(item.id)}
      >
        {renderCard(item, state)}
      </KanbanCardShell>
    );
  };

  const renderCell = (
    column: KanbanColumn,
    lane: KanbanLane | undefined,
    headingId: string,
  ) => {
    const cellItems = cells.get(cellKey(column.id, lane?.id)) ?? [];
    const listLabel = lane ? `${column.title}, ${lane.title}` : undefined;
    const empty = cellItems.length === 0;

    return (
      <motion.ul
        layoutScroll={animateLayout}
        ref={(node: HTMLUListElement | null) =>
          registerCell(column.id, lane?.id, "list", node)
        }
        aria-label={listLabel}
        aria-labelledby={listLabel ? undefined : headingId}
        className={cn(listClasses, !lanes && "min-h-0 flex-1 overflow-y-auto")}
        data-slot="kanban-list"
      >
        {cellItems.map((item, index) =>
          renderCardShell(item, index, column, lane, cellItems.length),
        )}
        {empty ? (
          <li
            aria-hidden={renderEmptyColumn ? undefined : true}
            className="text-muted-foreground/80 border-border/80 flex min-h-16 items-center justify-center rounded-lg border border-dashed px-3 text-center text-xs"
            data-slot="kanban-empty"
          >
            {renderEmptyColumn?.(column, lane) ?? labels.emptyColumn}
          </li>
        ) : null}
      </motion.ul>
    );
  };

  const gridTemplateColumns = columns
    .map((column) =>
      collapsedColumns.includes(column.id)
        ? "var(--kanban-rail-width)"
        : "var(--kanban-column-width)",
    )
    .join(" ");

  const columnState = (column: KanbanColumn) => {
    const count = countKanbanColumn(renderItems, column.id);
    const isTarget =
      drag?.mode === "pointer" &&
      drag.phase === "dragging" &&
      drag.preview.columnId === column.id &&
      drag.preview.columnId !== drag.from.columnId;
    const blocked =
      drag?.blocked?.columnId === column.id ? drag.blocked.reason : null;

    return {
      collapsed: collapsedColumns.includes(column.id),
      count,
      isTarget,
      blocked,
      wip: getKanbanWipState(count, column.wipLimit),
    };
  };

  const header = (column: KanbanColumn, headingId: string) => {
    const state = columnState(column);

    return (
      <KanbanColumnHeader
        collapsed={state.collapsed}
        collapsible={collapsibleColumns}
        column={column}
        count={state.count}
        headingId={headingId}
        labels={labels}
        onToggle={() => toggleColumn(column.id)}
        refusal={state.blocked}
        wip={state.wip}
      />
    );
  };

  const draggedItem = drag
    ? displayedItems.find((item) => item.id === drag.itemId)
    : undefined;
  const overlay =
    drag?.mode === "pointer" && draggedItem && portalContainer
      ? createPortal(
          <motion.div
            aria-hidden="true"
            className={overlayClasses}
            data-slot="kanban-drag-overlay"
            style={{
              x: overlayX,
              y: overlayY,
              rotate: overlayRotate,
              scale: overlayScale,
              width: overlaySize.width,
              minHeight: overlaySize.height,
            }}
          >
            {(() => {
              const column = columnById.get(drag.preview.columnId);

              return column
                ? renderCard(draggedItem, {
                    location: drag.preview,
                    column,
                    lane:
                      drag.preview.laneId !== undefined
                        ? laneById.get(drag.preview.laneId)
                        : undefined,
                    isDragging: true,
                    isOverlay: true,
                    isPending: false,
                    error: null,
                    dragHandleProps: undefined,
                  })
                : null;
            })()}
          </motion.div>,
          portalContainer,
        )
      : null;

  const rootStyle = {
    ...style,
    "--kanban-column-width": columnWidth,
  } as CSSProperties;

  return (
    <div
      {...props}
      ref={setRootRef}
      role="region"
      aria-label={label ?? labels.board}
      className={kanbanBoardClassNames({ className })}
      style={rootStyle}
      data-slot="kanban-board"
      data-dragging={drag ? drag.mode : undefined}
      data-disabled={disabled || undefined}
      onBlur={handleRootBlur}
    >
      <p id={instructionsId} className="sr-only">
        {labels.instructions}
      </p>
      <LayoutGroup id={baseId}>
        <motion.div
          layoutScroll={animateLayout}
          ref={scrollerRef}
          className={boardScrollerClasses}
          data-slot="kanban-scroller"
        >
          {lanes ? (
            <div className="flex w-max min-w-full flex-col gap-3 pb-2">
              <div
                className="bg-background/85 sticky top-0 z-20 grid gap-3 pb-1 backdrop-blur-sm"
                style={{ gridTemplateColumns }}
              >
                {columns.map((column) => {
                  const state = columnState(column);

                  return (
                    <div
                      key={column.id}
                      className={cn(columnShellClasses, "h-full")}
                      data-slot="kanban-column"
                      data-collapsed={state.collapsed || undefined}
                      data-drop-target={state.isTarget || undefined}
                      data-drop-blocked={!!state.blocked || undefined}
                      data-wip={state.wip.status}
                    >
                      {header(column, `${baseId}-col-${column.id}`)}
                    </div>
                  );
                })}
              </div>
              {lanes.map((lane) => {
                const laneCollapsed = collapsedLanes.includes(lane.id);
                const laneHeadingId = `${baseId}-lane-${lane.id}`;
                const laneCount = renderItems.filter(
                  (item) => resolveKanbanLaneId(item, lanes) === lane.id,
                ).length;

                return (
                  <div
                    key={lane.id}
                    role="group"
                    aria-labelledby={laneHeadingId}
                    className="flex flex-col"
                    data-slot="kanban-lane"
                    data-collapsed={laneCollapsed || undefined}
                  >
                    <KanbanLaneHeader
                      collapsed={laneCollapsed}
                      count={laneCount}
                      headingId={laneHeadingId}
                      labels={labels}
                      lane={lane}
                      onToggle={() => toggleLane(lane.id)}
                    />
                    {laneCollapsed ? null : (
                      <div
                        className="grid gap-3"
                        style={{ gridTemplateColumns }}
                      >
                        {columns.map((column) => {
                          const state = columnState(column);

                          return (
                            <div
                              key={column.id}
                              ref={(node) =>
                                registerCell(column.id, lane.id, "zone", node)
                              }
                              role="group"
                              aria-labelledby={`${baseId}-col-${column.id}`}
                              className={cn(
                                columnShellClasses,
                                "min-h-20",
                                state.collapsed &&
                                  "items-center justify-center",
                              )}
                              data-slot="kanban-cell"
                              data-collapsed={state.collapsed || undefined}
                              data-drop-target={
                                (state.isTarget &&
                                  drag?.preview.laneId === lane.id) ||
                                undefined
                              }
                              data-drop-blocked={!!state.blocked || undefined}
                            >
                              {state.collapsed ? (
                                <span className="text-muted-foreground text-xs tabular-nums">
                                  {
                                    (
                                      cells.get(cellKey(column.id, lane.id)) ??
                                      []
                                    ).length
                                  }
                                </span>
                              ) : (
                                <div className="pt-[calc(var(--dt-density-gap)*0.75+var(--dt-space-0-5))]">
                                  {renderCell(
                                    column,
                                    lane,
                                    `${baseId}-col-${column.id}`,
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              className="grid h-full w-max min-w-full gap-3 pb-2"
              style={{ gridTemplateColumns }}
            >
              {columns.map((column) => {
                const state = columnState(column);
                const headingId = `${baseId}-col-${column.id}`;
                const columnItems =
                  cells.get(cellKey(column.id, undefined)) ?? [];

                return (
                  <div
                    key={column.id}
                    role="group"
                    ref={(node) =>
                      registerCell(column.id, undefined, "zone", node)
                    }
                    aria-labelledby={headingId}
                    className={columnShellClasses}
                    data-slot="kanban-column"
                    data-collapsed={state.collapsed || undefined}
                    data-drop-target={state.isTarget || undefined}
                    data-drop-blocked={!!state.blocked || undefined}
                    data-wip={state.wip.status}
                  >
                    {header(column, headingId)}
                    {state.collapsed ? null : (
                      <>
                        {renderCell(column, undefined, headingId)}
                        {renderColumnFooter ? (
                          <div
                            className="px-[calc(var(--dt-density-gap)*0.75+var(--dt-space-0-5))] pb-[calc(var(--dt-density-gap)*0.75+var(--dt-space-0-5))]"
                            data-slot="kanban-column-footer"
                          >
                            {renderColumnFooter(column, columnItems)}
                          </div>
                        ) : null}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </LayoutGroup>
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>
      {overlay}
    </div>
  );
}

export const KanbanBoard = forwardRef(KanbanBoardImpl) as (<
  T extends KanbanItem,
>(
  props: KanbanBoardProps<T> & { ref?: Ref<HTMLDivElement> },
) => ReactElement | null) & { displayName?: string };

KanbanBoard.displayName = "KanbanBoard";
