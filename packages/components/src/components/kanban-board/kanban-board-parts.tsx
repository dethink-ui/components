import { useState, type ReactNode } from "react";
import {
  ArrowDown,
  ArrowDownToLine,
  ArrowUp,
  ArrowUpToLine,
  Ban,
  ChevronRight,
  Columns3,
  EllipsisVertical,
  ChevronsLeftRight,
  ChevronsRightLeft,
  Rows3,
  TriangleAlert,
} from "lucide-react";
import { cn } from "../../utils/cn";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemDescription,
  DropdownMenuItemIcon,
  DropdownMenuItemLabel,
  DropdownMenuSection,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../dropdown-menu";
import type {
  KanbanColumn,
  KanbanColumnTone,
  KanbanLane,
  KanbanWipState,
} from "./kanban-board-model";

export interface KanbanAnnouncementContext {
  item: string;
  column: string;
  lane?: string;
  /** One-based position. */
  position: number;
  total: number;
  reason?: string;
}

export interface KanbanBoardLabels {
  board: string;
  cardRoleDescription: string;
  instructions: string;
  moveMenu: (item: string) => string;
  moveUp: string;
  moveDown: string;
  moveToTop: string;
  moveToBottom: string;
  moveToColumn: string;
  moveToLane: string;
  collapseColumn: (column: string) => string;
  expandColumn: (column: string) => string;
  collapseLane: (lane: string) => string;
  expandLane: (lane: string) => string;
  cardCount: (count: number) => string;
  emptyColumn: string;
  pending: string;
  error: string;
  retry: string;
  dismiss: string;
  wipLimit: string;
  wipOver: string;
  wipAt: string;
  wipUnder: string;
  wipValue: (count: number, max: number) => string;
  refusedLimit: (column: string, count: number, max: number) => string;
  refusedDisabled: (column: string) => string;
  refusedDefault: string;
  pickedUp: (context: KanbanAnnouncementContext) => string;
  moved: (context: KanbanAnnouncementContext) => string;
  dropped: (context: KanbanAnnouncementContext) => string;
  cancelled: (context: KanbanAnnouncementContext) => string;
  refused: (context: KanbanAnnouncementContext) => string;
  failed: (context: KanbanAnnouncementContext) => string;
}

function describePosition({
  column,
  lane,
  position,
  total,
}: KanbanAnnouncementContext) {
  return `position ${position} of ${total} in ${column}${lane ? `, ${lane}` : ""}`;
}

export const defaultKanbanBoardLabels: KanbanBoardLabels = {
  board: "Kanban board",
  cardRoleDescription: "movable card",
  instructions:
    "Press Space or Enter to pick up this card. Use the arrow keys to move it, Space or Enter to drop it, and Escape to cancel.",
  moveMenu: (item) => `Move ${item}`,
  moveUp: "Move up",
  moveDown: "Move down",
  moveToTop: "Move to top",
  moveToBottom: "Move to bottom",
  moveToColumn: "Move to column",
  moveToLane: "Move to lane",
  collapseColumn: (column) => `Collapse ${column}`,
  expandColumn: (column) => `Expand ${column}`,
  collapseLane: (lane) => `Collapse ${lane}`,
  expandLane: (lane) => `Expand ${lane}`,
  cardCount: (count) => `${count} ${count === 1 ? "card" : "cards"}`,
  emptyColumn: "No cards",
  pending: "Saving",
  error: "Couldn't save this move.",
  retry: "Retry",
  dismiss: "Dismiss",
  wipLimit: "Work in progress",
  wipOver: "Over limit",
  wipAt: "At limit",
  wipUnder: "Below minimum",
  wipValue: (count, max) => `${count} of ${max}`,
  refusedLimit: (column, count, max) =>
    `${column} is at its limit, ${count} of ${max}.`,
  refusedDisabled: (column) => `${column} doesn't accept cards.`,
  refusedDefault: "That move isn't allowed.",
  pickedUp: (context) =>
    `Picked up ${context.item}, ${describePosition(context)}.`,
  moved: (context) => `${describePosition(context)}.`,
  dropped: (context) =>
    `Dropped ${context.item}, ${describePosition(context)}.`,
  cancelled: (context) =>
    `Move cancelled. ${context.item} returned to ${describePosition(context)}.`,
  refused: (context) => context.reason ?? "That move isn't allowed.",
  failed: (context) =>
    `Couldn't move ${context.item}. It went back to ${describePosition(context)}.`,
};

export const kanbanToneDotClasses: Record<KanbanColumnTone, string> = {
  neutral: "bg-muted-foreground/60",
  primary: "bg-primary",
  info: "bg-info",
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
};

const kanbanToneAccentClasses: Record<KanbanColumnTone, string> = {
  neutral: "from-muted-foreground/40",
  primary: "from-primary",
  info: "from-info",
  success: "from-success",
  warning: "from-warning",
  destructive: "from-destructive",
};

const wipFillClasses: Record<KanbanWipState["status"], string> = {
  none: "bg-muted-foreground/40",
  ok: "bg-foreground/55",
  under: "bg-info",
  at: "bg-warning",
  over: "bg-destructive",
};

const collapseButtonClasses =
  "inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-safe:transition-colors motion-safe:duration-[var(--dt-motion-fast)] [&>svg]:size-4";

export function KanbanWipMeter({
  labels,
  state,
}: {
  labels: KanbanBoardLabels;
  state: KanbanWipState;
}) {
  if (state.max === null) {
    return null;
  }

  const max = state.max;
  const segmented = max > 0 && max <= 12;
  const filled = Math.min(state.count, max);
  const statusLabel =
    state.status === "over"
      ? labels.wipOver
      : state.status === "under"
        ? labels.wipUnder
        : state.status === "at"
          ? labels.wipAt
          : null;
  const valueText = `${labels.wipValue(state.count, max)}${statusLabel ? `, ${statusLabel}` : ""}`;

  return (
    <div
      className="flex min-w-0 items-center gap-2"
      data-slot="kanban-wip"
      data-status={state.status}
      data-mode={state.mode}
    >
      <div
        role="meter"
        aria-label={labels.wipLimit}
        aria-valuemin={0}
        aria-valuemax={Math.max(max, 1)}
        aria-valuenow={Math.min(state.count, Math.max(max, 1))}
        aria-valuetext={valueText}
        className="flex h-1.5 min-w-0 flex-1 items-stretch gap-0.5"
      >
        {segmented ? (
          Array.from({ length: max }, (_, index) => (
            <span
              key={index}
              className={cn(
                "flex-1 rounded-full motion-safe:transition-colors motion-safe:duration-[var(--dt-motion-standard)]",
                index < filled
                  ? wipFillClasses[state.status]
                  : "bg-foreground/10",
              )}
            />
          ))
        ) : (
          <span className="bg-foreground/10 relative flex-1 overflow-hidden rounded-full">
            <span
              className={cn(
                "absolute inset-y-0 start-0 rounded-full motion-safe:transition-[width,background-color] motion-safe:duration-[var(--dt-motion-standard)]",
                wipFillClasses[state.status],
              )}
              style={{
                width: `${max === 0 ? 100 : Math.min(100, (state.count / max) * 100)}%`,
              }}
            />
          </span>
        )}
      </div>
      <span
        aria-hidden="true"
        className={cn(
          "shrink-0 text-[0.6875rem] font-medium tabular-nums",
          state.status === "over"
            ? "text-destructive"
            : state.status === "at"
              ? "text-warning"
              : state.status === "under"
                ? "text-info"
                : "text-muted-foreground",
        )}
      >
        {state.count}/{max}
      </span>
      {state.status === "over" ? (
        <span
          aria-hidden="true"
          className="bg-destructive/10 text-destructive inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 py-px text-[0.6875rem] font-medium"
        >
          <TriangleAlert className="size-3" />
          {labels.wipOver}
        </span>
      ) : null}
    </div>
  );
}

export function KanbanColumnHeader({
  collapsed,
  collapsible,
  column,
  count,
  headingId,
  labels,
  onToggle,
  refusal,
  wip,
}: {
  collapsed: boolean;
  collapsible: boolean;
  column: KanbanColumn;
  count: number;
  headingId: string;
  labels: KanbanBoardLabels;
  onToggle: () => void;
  refusal: string | null;
  wip: KanbanWipState;
}) {
  const tone = column.tone ?? "neutral";

  if (collapsed) {
    return (
      <div
        className="flex h-full flex-col items-center gap-2 py-2 select-none"
        data-slot="kanban-column-header"
      >
        <button
          type="button"
          className={collapseButtonClasses}
          aria-label={labels.expandColumn(column.title)}
          aria-expanded={false}
          onClick={onToggle}
        >
          <ChevronsLeftRight aria-hidden="true" />
        </button>
        <span
          aria-hidden="true"
          className={cn("size-2 rounded-full", kanbanToneDotClasses[tone])}
        />
        <span
          id={headingId}
          className="text-foreground text-sm font-medium [writing-mode:vertical-rl]"
        >
          {column.title}
        </span>
        <span className="bg-background text-muted-foreground ring-border rounded-full px-1.5 text-xs tabular-nums ring-1">
          <span aria-hidden="true">{count}</span>
          <span className="sr-only">{labels.cardCount(count)}</span>
        </span>
      </div>
    );
  }

  return (
    <div
      className="relative flex flex-col gap-2 px-[calc(var(--dt-density-gap)+var(--dt-space-1))] pt-[calc(var(--dt-density-gap)+var(--dt-space-1))] pb-2 select-none"
      data-slot="kanban-column-header"
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-x-3 top-0 h-0.5 rounded-b-full bg-gradient-to-r to-transparent",
          kanbanToneAccentClasses[tone],
        )}
      />
      <div className="flex min-w-0 items-center gap-2">
        {column.icon ? (
          <span
            aria-hidden="true"
            className="text-muted-foreground inline-flex shrink-0 [&>svg]:size-4"
          >
            {column.icon}
          </span>
        ) : (
          <span
            aria-hidden="true"
            className={cn(
              "size-2 shrink-0 rounded-full",
              kanbanToneDotClasses[tone],
            )}
          />
        )}
        <h3
          id={headingId}
          className="text-foreground min-w-0 truncate text-sm font-semibold tracking-tight"
        >
          {column.title}
        </h3>
        <span className="bg-background text-muted-foreground ring-border shrink-0 rounded-full px-1.5 text-xs tabular-nums ring-1">
          <span aria-hidden="true">{count}</span>
          <span className="sr-only">{labels.cardCount(count)}</span>
        </span>
        <span className="flex-1" />
        {collapsible ? (
          <button
            type="button"
            className={collapseButtonClasses}
            aria-label={labels.collapseColumn(column.title)}
            aria-expanded={true}
            onClick={onToggle}
          >
            <ChevronsRightLeft aria-hidden="true" />
          </button>
        ) : null}
      </div>
      {column.description ? (
        <p className="text-muted-foreground -mt-1 truncate text-xs">
          {column.description}
        </p>
      ) : null}
      <KanbanWipMeter labels={labels} state={wip} />
      {refusal ? (
        <p
          aria-hidden="true"
          className="bg-destructive/10 text-destructive flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium"
          data-slot="kanban-refusal"
        >
          <Ban className="size-3.5 shrink-0" />
          <span className="min-w-0 truncate">{refusal}</span>
        </p>
      ) : null}
    </div>
  );
}

export function KanbanLaneHeader({
  collapsed,
  count,
  headingId,
  labels,
  lane,
  onToggle,
}: {
  collapsed: boolean;
  count: number;
  headingId: string;
  labels: KanbanBoardLabels;
  lane: KanbanLane;
  onToggle: () => void;
}) {
  return (
    <div
      className="sticky start-0 flex w-fit max-w-[min(100%,40rem)] items-center gap-2 py-1.5"
      data-slot="kanban-lane-header"
    >
      <button
        type="button"
        className="text-foreground hover:bg-muted focus-visible:ring-ring inline-flex min-w-0 items-center gap-1.5 rounded-md px-1.5 py-1 text-sm font-semibold focus-visible:ring-2 focus-visible:outline-none"
        aria-expanded={!collapsed}
        aria-label={
          collapsed
            ? labels.expandLane(lane.title)
            : labels.collapseLane(lane.title)
        }
        onClick={onToggle}
      >
        <ChevronRight
          aria-hidden="true"
          className={cn(
            "text-muted-foreground size-4 shrink-0 motion-safe:transition-transform motion-safe:duration-[var(--dt-motion-fast)] rtl:-scale-x-100",
            !collapsed && "rotate-90 rtl:-rotate-90",
          )}
        />
        <span id={headingId} className="truncate">
          {lane.title}
        </span>
      </button>
      <span className="bg-muted text-muted-foreground rounded-full px-1.5 text-xs tabular-nums">
        <span aria-hidden="true">{count}</span>
        <span className="sr-only">{labels.cardCount(count)}</span>
      </span>
      {lane.description ? (
        <span className="text-muted-foreground truncate text-xs">
          {lane.description}
        </span>
      ) : null}
    </div>
  );
}

export interface KanbanMoveMenuOption {
  key: string;
  label: string;
  description?: string;
  icon: ReactNode;
  disabled?: boolean;
  section: "order" | "column" | "lane";
  onAction: () => void;
}

export function KanbanMoveMenu({
  focusable,
  getOptions,
  label,
  labels,
}: {
  focusable: boolean;
  /** Called when the menu opens so limits and vetoes reflect the latest board. */
  getOptions: () => KanbanMoveMenuOption[];
  label: string;
  labels: KanbanBoardLabels;
}) {
  const [open, setOpen] = useState(false);
  const options = open ? getOptions() : [];
  const order = options.filter((option) => option.section === "order");
  const columns = options.filter((option) => option.section === "column");
  const lanes = options.filter((option) => option.section === "lane");
  const renderOption = (option: KanbanMoveMenuOption) => (
    <DropdownMenuItem
      key={option.key}
      textValue={option.label}
      disabled={option.disabled}
      onAction={option.onAction}
    >
      <DropdownMenuItemIcon aria-hidden="true">
        {option.icon}
      </DropdownMenuItemIcon>
      <DropdownMenuItemLabel>{option.label}</DropdownMenuItemLabel>
      {option.description ? (
        <DropdownMenuItemDescription>
          {option.description}
        </DropdownMenuItemDescription>
      ) : null}
    </DropdownMenuItem>
  );

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        size="icon"
        variant="ghost"
        aria-label={label}
        excludeFromTabOrder={!focusable}
        className="text-muted-foreground hover:text-foreground data-[pressed]:text-foreground -me-1 -mt-0.5 size-7 shrink-0 opacity-70 group-focus-within/kanban-card:opacity-100 group-hover/kanban-card:opacity-100 pointer-coarse:opacity-100 [&_svg]:size-4"
        data-kanban-no-drag=""
      >
        <EllipsisVertical aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent placement="bottom end" className="min-w-52">
        {order.length > 0 ? (
          <DropdownMenuSection>{order.map(renderOption)}</DropdownMenuSection>
        ) : null}
        {columns.length > 0 ? (
          <>
            {order.length > 0 ? <DropdownMenuSeparator /> : null}
            <DropdownMenuSection>
              <DropdownMenuLabel>{labels.moveToColumn}</DropdownMenuLabel>
              {columns.map(renderOption)}
            </DropdownMenuSection>
          </>
        ) : null}
        {lanes.length > 0 ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuSection>
              <DropdownMenuLabel>{labels.moveToLane}</DropdownMenuLabel>
              {lanes.map(renderOption)}
            </DropdownMenuSection>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const kanbanMenuIcons = {
  up: <ArrowUp />,
  down: <ArrowDown />,
  top: <ArrowUpToLine />,
  bottom: <ArrowDownToLine />,
  column: <Columns3 />,
  lane: <Rows3 />,
};
