import { parseDate } from "@internationalized/date";
import { useEffect, useState } from "react";
import { buttonClassNames } from "../button";
import type {
  SlotPlannerConventionalSlotData,
  SlotPlannerOccurrenceStatus,
  SlotPlannerSlotPayload,
} from "./slot-planner-contract";

/**
 * Internal DOM-layer constants and helpers shared by the manage-mode
 * `SlotPlanner` and the book-mode `SlotPicker`. Both components render the
 * same tokenized visual language (toolbar, day rail, day panel, slot cards),
 * so the class recipes live here once. Not part of the public package API.
 */

export const slotPlannerRootClasses =
  "flex w-full min-w-0 flex-col gap-[var(--dt-space-3)] text-foreground";

export const slotPlannerToolbarClasses =
  "grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-[var(--dt-space-2)] sm:grid-cols-[auto_1fr_auto]";

export const slotPlannerToolbarButtonClasses = buttonClassNames({
  className: "shadow-sm",
  size: "sm",
  variant: "outline",
});

export const slotPlannerDayRailClasses =
  "flex min-w-0 gap-[var(--dt-space-2)] overflow-x-auto pb-[var(--dt-space-1)] md:min-h-full md:flex-col md:gap-0 md:overflow-visible md:rounded-md md:border md:border-border md:bg-background md:p-[var(--dt-space-1)] md:pb-[var(--dt-space-1)]";

export const slotPlannerDayTabClasses =
  "relative flex h-24 w-28 shrink-0 flex-col items-start gap-[var(--dt-space-1)] overflow-hidden rounded-md border border-border bg-background p-[var(--dt-space-2)] text-left motion-safe:transition-colors motion-safe:duration-150 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background data-[past=true]:text-muted-foreground data-[selected=true]:border-ring data-[selected=true]:bg-muted/40 data-[today=true]:border-primary/60 md:h-auto md:min-h-16 md:w-full md:border-transparent md:bg-transparent md:shadow-none md:after:absolute md:after:inset-x-[var(--dt-space-2)] md:after:bottom-0 md:after:h-px md:after:bg-border/50 md:after:content-[''] md:last:after:hidden md:data-[selected=true]:border-ring md:data-[selected=true]:bg-muted/50 md:data-[selected=true]:after:hidden";

// Inner day-tab content wrapper; the motion layer slides it in on week
// changes while the structural tab button keeps the ARIA wiring.
export const slotPlannerDayTabContentClasses =
  "flex w-full min-w-0 flex-col items-start gap-[var(--dt-space-1)]";

// `relative` contains the popLayout-exiting week content during transitions.
export const slotPlannerDayPanelClasses =
  "relative flex min-w-0 flex-col rounded-md border border-border bg-background p-[var(--dt-space-3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:p-[var(--dt-space-4)]";

// Inner day-panel content wrapper; the motion layer slides it directionally
// when the focused week changes.
export const slotPlannerWeekPanelContentClasses =
  "flex min-w-0 flex-col gap-[var(--dt-space-3)]";

// `relative` anchors the created/edited highlight overlay.
export const slotPlannerSlotCardClasses =
  "relative flex flex-col gap-[var(--dt-space-2)] rounded-md border border-border bg-background p-[var(--dt-space-3)] motion-safe:transition-colors motion-safe:duration-150 data-[locked=true]:border-border/70 data-[locked=true]:bg-muted/40 data-[locked=true]:text-muted-foreground";

export const slotPlannerChipClasses =
  "inline-flex items-center rounded-full border border-border bg-muted px-[var(--dt-space-2)] py-[var(--dt-space-0-5)] text-xs font-medium text-muted-foreground";

export const slotPlannerStatusBadgeClasses =
  "inline-flex items-center gap-[var(--dt-space-1)] rounded-full border border-border bg-background px-[var(--dt-space-2)] py-[var(--dt-space-0-5)] text-xs font-medium text-foreground";

export const slotPlannerStatusDotClasses: Record<
  SlotPlannerOccurrenceStatus,
  string
> = {
  draft: "bg-muted-foreground",
  requestable: "bg-success",
  requested: "bg-warning",
  booked: "bg-primary",
  blocked: "bg-destructive",
  expired: "bg-muted-foreground",
  cancelled: "bg-destructive",
};

export const slotPlannerSlotActionButtonClasses = buttonClassNames({
  className: "shadow-sm",
  size: "xs",
  variant: "outline",
});

export const slotPlannerSavePendingClasses = "text-xs text-muted-foreground";

export const slotPlannerSaveErrorClasses =
  "flex flex-wrap items-center gap-[var(--dt-space-2)] text-xs font-medium text-destructive";

export function ChevronIcon({
  direction,
}: {
  direction: "backward" | "forward";
}) {
  return (
    <svg
      aria-hidden="true"
      className="size-4 rtl:-scale-x-100"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        d={direction === "backward" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CalendarIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M8 2v4M16 2v4M3 10h18" strokeLinecap="round" />
      <rect
        x="3"
        y="4"
        width="18"
        height="18"
        rx="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CopyIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="8" y="8" width="12" height="12" rx="2" />
      <path d="M4 16V6a2 2 0 0 1 2-2h10" strokeLinecap="round" />
    </svg>
  );
}

export function EditIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PlusIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  );
}

export function TrashIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M3 6h18M8 6V4h8v2M10 11v6M14 11v6" strokeLinecap="round" />
      <path
        d="M6 6l1 16h10l1-16"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// The day rail stacks vertically from the `md` breakpoint up (see
// `slotPlannerDayRailClasses`). Tailwind v4's default `md` is 48rem.
const SLOT_PLANNER_RAIL_VERTICAL_QUERY = "(min-width: 48rem)";

/**
 * Tracks whether the day rail is laid out vertically (the `md:` and up layout)
 * so the tablist can advertise the matching `aria-orientation`. SSR-safe: the
 * horizontal (default) orientation is assumed until the client can read
 * `matchMedia`.
 */
export function useSlotPlannerRailOrientation(): "horizontal" | "vertical" {
  const [vertical, setVertical] = useState(false);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      return;
    }

    const query = window.matchMedia(SLOT_PLANNER_RAIL_VERTICAL_QUERY);
    const update = () => setVertical(query.matches);

    update();
    query.addEventListener("change", update);

    return () => query.removeEventListener("change", update);
  }, []);

  return vertical ? "vertical" : "horizontal";
}

export function getSlotPlannerDirection(element: HTMLElement) {
  const explicitDir = element.closest("[dir]")?.getAttribute("dir");

  if (explicitDir === "rtl" || explicitDir === "ltr") {
    return explicitDir;
  }

  return window.getComputedStyle(element).direction === "rtl" ? "rtl" : "ltr";
}

export function toUtcDate(dateIso: string) {
  return parseDate(dateIso).toDate("UTC");
}

export function getConventionalSlotData(
  data: SlotPlannerSlotPayload | undefined,
) {
  const conventional = (data ?? {}) as SlotPlannerConventionalSlotData;
  const tags = Array.isArray(conventional.tags)
    ? conventional.tags.filter((tag): tag is string => typeof tag === "string")
    : [];
  const note = typeof conventional.note === "string" ? conventional.note : "";

  return { note, tags };
}
