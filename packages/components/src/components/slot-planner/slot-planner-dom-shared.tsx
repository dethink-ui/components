import { parseDate } from "@internationalized/date";
import { cn } from "../../utils/cn";
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
  "flex w-full flex-col gap-[var(--dt-space-4)] text-foreground";

export const slotPlannerToolbarClasses =
  "flex flex-wrap items-center justify-between gap-[var(--dt-space-2)]";

export const slotPlannerToolbarButtonClasses =
  "inline-flex h-8 min-w-8 items-center justify-center gap-[var(--dt-space-1)] rounded-md border border-border bg-background px-[var(--dt-space-2)] text-sm font-medium text-foreground shadow-sm motion-safe:transition-colors motion-safe:duration-150 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export const slotPlannerDayRailClasses =
  "grid grid-cols-7 gap-[var(--dt-space-2)]";

export const slotPlannerDayTabClasses =
  "relative flex min-w-0 flex-col items-start gap-[var(--dt-space-1)] rounded-md border border-border bg-background p-[var(--dt-space-2)] text-left motion-safe:transition-colors motion-safe:duration-150 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background data-[past=true]:text-muted-foreground data-[selected=true]:border-ring data-[selected=true]:bg-muted/40 data-[today=true]:border-primary/60";

// Inner day-tab content wrapper; the motion layer slides it in on week
// changes while the structural tab button keeps the ARIA wiring.
export const slotPlannerDayTabContentClasses =
  "flex w-full min-w-0 flex-col items-start gap-[var(--dt-space-1)]";

// `relative` contains the popLayout-exiting week content during transitions.
export const slotPlannerDayPanelClasses =
  "relative flex flex-col rounded-md border border-border bg-background p-[var(--dt-space-4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

// Inner day-panel content wrapper; the motion layer slides it directionally
// when the focused week changes.
export const slotPlannerWeekPanelContentClasses =
  "flex min-w-0 flex-col gap-[var(--dt-space-3)]";

// `relative` anchors the created/edited highlight overlay.
export const slotPlannerSlotCardClasses =
  "relative flex flex-col gap-[var(--dt-space-2)] rounded-md border border-border bg-background p-[var(--dt-space-3)] shadow-sm motion-safe:transition-colors motion-safe:duration-150 data-[locked=true]:border-border/70 data-[locked=true]:bg-muted/40 data-[locked=true]:text-muted-foreground";

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

export const slotPlannerSlotActionButtonClasses =
  "inline-flex h-7 items-center justify-center rounded-md border border-border bg-background px-[var(--dt-space-2)] text-xs font-medium text-foreground shadow-sm motion-safe:transition-colors motion-safe:duration-150 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50";

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
      className={cn("size-4", direction === "forward" && "rtl:-scale-x-100")}
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
