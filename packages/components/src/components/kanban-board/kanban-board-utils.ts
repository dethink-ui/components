import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { cn } from "../../utils/cn";
import type { KanbanItem, KanbanLocation } from "./kanban-board-model";
import type { CellTarget } from "./kanban-board-types";

export const MOUSE_ACTIVATION_DISTANCE = 5;
export const TOUCH_ACTIVATION_DELAY = 180;
export const TOUCH_TOLERANCE = 8;
export const AUTO_SCROLL_EDGE = 72;
export const AUTO_SCROLL_MAX_SPEED = 20;
export const SPRING = {
  type: "spring",
  stiffness: 520,
  damping: 38,
  mass: 0.9,
} as const;

export const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

export const cellKey = (columnId: string, laneId: string | undefined) =>
  `${columnId}\u0000${laneId ?? ""}`;

export function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
  return (
    !!value &&
    (typeof value === "object" || typeof value === "function") &&
    typeof (value as PromiseLike<unknown>).then === "function"
  );
}

export function isInteractiveTarget(target: EventTarget | null, card: Element) {
  if (!(target instanceof Element)) {
    return false;
  }

  const interactive = target.closest(
    "a[href],button,input,select,textarea,label,summary,[contenteditable=''],[contenteditable='true'],[role='button'],[role='link'],[role='menuitem'],[data-kanban-no-drag]",
  );

  return !!interactive && interactive !== card && card.contains(interactive);
}

export function defaultItemLabel(item: KanbanItem) {
  const title = (item as { title?: unknown }).title;

  return typeof title === "string" && title ? title : item.id;
}

export function useListState(
  value: string[] | undefined,
  defaultValue: string[] | undefined,
  onChange: ((next: string[]) => void) | undefined,
) {
  const [internal, setInternal] = useState<string[]>(defaultValue ?? []);
  const current = value ?? internal;
  const toggle = useCallback(
    (id: string) => {
      const next = current.includes(id)
        ? current.filter((entry) => entry !== id)
        : [...current, id];

      if (value === undefined) {
        setInternal(next);
      }

      onChange?.(next);
    },
    [current, onChange, value],
  );

  return [current, toggle] as const;
}

export const boardRootClasses =
  "relative isolate flex min-h-0 min-w-0 flex-col text-foreground [--kanban-rail-width:3rem]";

export const boardScrollerClasses =
  "min-h-0 flex-1 overflow-auto overscroll-contain [scrollbar-gutter:stable] focus-visible:outline-none";

export const columnShellClasses =
  "group/kanban-column relative flex min-h-0 min-w-0 flex-col rounded-xl border border-border/70 bg-muted/45 motion-safe:transition-[background-color,border-color,box-shadow] motion-safe:duration-[var(--dt-motion-fast)] data-[drop-target=true]:border-primary/40 data-[drop-target=true]:bg-primary/[0.045] data-[drop-blocked=true]:border-destructive/50 data-[drop-blocked=true]:bg-destructive/[0.05]";

export const listClasses =
  "relative flex min-h-12 list-none flex-col gap-[calc(var(--dt-density-gap)+var(--dt-space-0-5))] p-[calc(var(--dt-density-gap)*0.75+var(--dt-space-0-5))] pt-0.5";

export const cardClasses =
  "group/kanban-card relative isolate cursor-grab touch-manipulation rounded-lg border border-border bg-background p-[calc(var(--dt-density-gap)+var(--dt-space-1))] text-sm shadow-[0_1px_2px_oklch(0_0_0/0.06)] outline-none select-none [-webkit-touch-callout:none] motion-safe:transition-[box-shadow,border-color,translate,scale,rotate,opacity] motion-safe:duration-[var(--dt-motion-fast)] motion-safe:ease-control hover:border-foreground/15 hover:shadow-[0_6px_16px_-8px_oklch(0_0_0/0.22)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background data-[lifted=true]:z-10 data-[lifted=true]:cursor-grabbing data-[lifted=true]:border-primary/50 data-[lifted=true]:shadow-[0_18px_36px_-14px_oklch(0_0_0/0.4)] motion-safe:data-[lifted=true]:scale-[1.025] motion-safe:data-[lifted=true]:-rotate-1 data-[placeholder=true]:border-transparent data-[placeholder=true]:bg-transparent data-[placeholder=true]:shadow-none data-[pending=true]:border-dashed data-[error=true]:border-destructive/60 data-[disabled=true]:cursor-default";

export const overlayClasses =
  "pointer-events-none fixed left-0 top-0 z-[60] cursor-grabbing rounded-lg border border-primary/35 bg-background p-[calc(var(--dt-density-gap)+var(--dt-space-1))] text-sm text-foreground shadow-[0_28px_60px_-18px_oklch(0_0_0/0.45),0_10px_20px_-12px_oklch(0_0_0/0.25)] ring-1 ring-primary/15";

export function kanbanBoardClassNames({
  className,
}: { className?: string } = {}) {
  return cn(boardRootClasses, className);
}

/**
 * Finds the drop location under the pointer. `countCell` sizes cells whose list
 * is not mounted (collapsed or empty) so the card lands at their end.
 */
export function hitTestKanbanCells(
  targets: Iterable<CellTarget>,
  lists: ReadonlyMap<string, HTMLElement>,
  x: number,
  y: number,
  itemId: string,
  countCell: (columnId: string, laneId: string | undefined) => number,
): KanbanLocation | null {
  let best: CellTarget | null = null;

  for (const target of targets) {
    const rect = target.zone.getBoundingClientRect();

    if (
      x >= rect.left &&
      x <= rect.right &&
      y >= rect.top &&
      y <= rect.bottom
    ) {
      best = target;
      break;
    }
  }

  if (!best) {
    return null;
  }

  const list = lists.get(best.key) ?? null;
  const cards = list
    ? Array.from(
        list.querySelectorAll<HTMLElement>(":scope > [data-kanban-card]"),
      )
    : [];

  if (!list) {
    return {
      columnId: best.columnId,
      laneId: best.laneId,
      index: countCell(best.columnId, best.laneId),
    };
  }

  // offsetTop ignores the transforms layout animations apply mid-flight,
  // which keeps hit-testing stable while siblings glide.
  const listRect = list.getBoundingClientRect();
  const pointerY = y - listRect.top + list.scrollTop;
  const placeholder = cards.find((card) => card.dataset.kanbanCard === itemId);
  const gap = Number.parseFloat(getComputedStyle(list).rowGap) || 0;
  const shift = placeholder ? placeholder.offsetHeight + gap : 0;
  let passedPlaceholder = false;
  let index = 0;

  for (const card of cards) {
    if (card === placeholder) {
      passedPlaceholder = true;
      continue;
    }

    const middle =
      card.offsetTop - (passedPlaceholder ? shift : 0) + card.offsetHeight / 2;

    if (pointerY > middle) {
      index += 1;
    }
  }

  return { columnId: best.columnId, laneId: best.laneId, index };
}

/** Scrolls the board and any overflowing list whose edge the pointer is near. */
export function autoScrollKanban(
  scroller: HTMLElement | null,
  lists: Iterable<HTMLElement>,
  x: number,
  y: number,
) {
  const scrollEdge = (element: HTMLElement | null, axis: "x" | "y") => {
    if (!element) {
      return false;
    }

    const rect = element.getBoundingClientRect();
    const start = axis === "x" ? rect.left : rect.top;
    const end = axis === "x" ? rect.right : rect.bottom;
    const cross = axis === "x" ? y : x;
    const crossStart = axis === "x" ? rect.top : rect.left;
    const crossEnd = axis === "x" ? rect.bottom : rect.right;

    if (cross < crossStart || cross > crossEnd) {
      return false;
    }

    const point = axis === "x" ? x : y;
    const edge = Math.min(AUTO_SCROLL_EDGE, (end - start) / 4);
    let delta = 0;

    if (point < start + edge) {
      delta = -Math.min(1, (start + edge - point) / edge);
    } else if (point > end - edge) {
      delta = Math.min(1, (point - (end - edge)) / edge);
    }

    if (delta === 0) {
      return false;
    }

    const speed = Math.sign(delta) * AUTO_SCROLL_MAX_SPEED * delta * delta;
    const before = axis === "x" ? element.scrollLeft : element.scrollTop;

    if (axis === "x") {
      element.scrollLeft += speed;
    } else {
      element.scrollTop += speed;
    }

    return (axis === "x" ? element.scrollLeft : element.scrollTop) !== before;
  };

  let scrolled = scrollEdge(scroller, "x");

  scrolled = scrollEdge(scroller, "y") || scrolled;

  for (const list of lists) {
    if (list.scrollHeight > list.clientHeight + 1) {
      scrolled = scrollEdge(list, "y") || scrolled;
    }
  }

  return scrolled;
}
