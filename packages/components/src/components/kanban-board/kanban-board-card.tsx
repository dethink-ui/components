import type {
  KeyboardEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode,
} from "react";
import { motion } from "motion/react";
import { LoaderCircle, RotateCcw, TriangleAlert, X } from "lucide-react";
import { cn } from "../../utils/cn";
import {
  KanbanMoveMenu,
  type KanbanBoardLabels,
  type KanbanMoveMenuOption,
} from "./kanban-board-parts";
import type { KanbanDragHandleMode } from "./kanban-board-types";
import { SPRING, cardClasses } from "./kanban-board-utils";

export interface KanbanCardShellProps {
  itemId: string;
  /** The consumer's rendered card. */
  children: ReactNode;
  itemLabel: string;
  labels: KanbanBoardLabels;
  instructionsId: string;
  /** Shared layout id; `undefined` disables layout animation. */
  layoutId: string | undefined;
  cardRef: (node: HTMLLIElement | null) => void;
  /** The card holds the board's single roving tab stop. */
  focusable: boolean;
  disabled: boolean;
  dragHandle: KanbanDragHandleMode;
  isLifted: boolean;
  isPlaceholder: boolean;
  isPending: boolean;
  error: string | null;
  showMoveMenu: boolean;
  getMenuOptions: () => KanbanMoveMenuOption[];
  onFocus: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLLIElement>) => void;
  onPointerDown: (event: ReactPointerEvent<HTMLLIElement>) => void;
  onRetry: () => void;
  onDismiss: () => void;
}

/** A movable card in a kanban list, with its pending, error and drop states. */
export function KanbanCardShell({
  cardRef,
  children,
  disabled,
  dragHandle,
  error,
  focusable,
  getMenuOptions,
  instructionsId,
  isLifted,
  isPending,
  isPlaceholder,
  itemId,
  itemLabel,
  labels,
  layoutId,
  onDismiss,
  onFocus,
  onKeyDown,
  onPointerDown,
  onRetry,
  showMoveMenu,
}: KanbanCardShellProps) {
  return (
    <motion.li
      layoutId={layoutId}
      layout={layoutId ? "position" : false}
      transition={SPRING}
      ref={cardRef}
      tabIndex={focusable ? 0 : -1}
      aria-roledescription={labels.cardRoleDescription}
      aria-describedby={disabled ? undefined : instructionsId}
      aria-busy={isPending || undefined}
      className={cn(cardClasses, dragHandle === "handle" && "cursor-default")}
      data-kanban-card={itemId}
      data-slot="kanban-card"
      data-lifted={isLifted || undefined}
      data-placeholder={isPlaceholder || undefined}
      data-pending={isPending || undefined}
      data-error={error !== null ? true : undefined}
      data-disabled={disabled || undefined}
      onFocus={(event) => {
        if (event.target === event.currentTarget) {
          onFocus();
        }
      }}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
    >
      <div
        className={cn(
          "flex min-w-0 items-start gap-1",
          isPlaceholder && "invisible",
        )}
      >
        <div className="min-w-0 flex-1">{children}</div>
        {isPending ? (
          <span className="text-muted-foreground mt-0.5 inline-flex shrink-0">
            <LoaderCircle
              aria-hidden="true"
              className="size-3.5 motion-safe:animate-spin"
            />
            <span className="sr-only">{labels.pending}</span>
          </span>
        ) : null}
        {showMoveMenu ? (
          <KanbanMoveMenu
            focusable={focusable}
            label={labels.moveMenu(itemLabel)}
            labels={labels}
            getOptions={getMenuOptions}
          />
        ) : null}
      </div>
      {error !== null && !isPlaceholder ? (
        <div
          className="border-destructive/25 text-destructive mt-2 flex items-center gap-1.5 border-t pt-2 text-xs"
          data-slot="kanban-card-error"
        >
          <TriangleAlert aria-hidden="true" className="size-3.5 shrink-0" />
          <span className="min-w-0 flex-1">{error}</span>
          <button
            type="button"
            className="hover:bg-destructive/10 focus-visible:ring-ring inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-medium focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
            disabled={disabled}
            tabIndex={focusable ? 0 : -1}
            onClick={onRetry}
          >
            <RotateCcw aria-hidden="true" className="size-3" />
            {labels.retry}
          </button>
          <button
            type="button"
            aria-label={labels.dismiss}
            className="hover:bg-destructive/10 focus-visible:ring-ring inline-flex size-5 items-center justify-center rounded focus-visible:ring-2 focus-visible:outline-none"
            tabIndex={focusable ? 0 : -1}
            onClick={onDismiss}
          >
            <X aria-hidden="true" className="size-3" />
          </button>
        </div>
      ) : null}
      {isPlaceholder ? (
        <span
          aria-hidden="true"
          className="border-primary/45 bg-primary/[0.06] absolute -inset-px rounded-[inherit] border-2 border-dashed"
          data-slot="kanban-drop-indicator"
        />
      ) : null}
    </motion.li>
  );
}
