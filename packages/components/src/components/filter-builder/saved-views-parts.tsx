import { cn } from "../../utils/cn";
import type { SavedViewScope } from "./use-saved-views";

export interface SavedViewsMenuLabels {
  /** Trigger text when no view is active. */
  views: string;
  /** Accessible name of the popover. */
  menu: string;
  /** Appended to the trigger's name while the filter differs from the view. */
  edited: string;
  empty: string;
  scope: Record<SavedViewScope, string>;
  /** Heading for views without a scope. */
  unscoped: string;
  apply: (name: string) => string;
  rename: (name: string) => string;
  delete: (name: string) => string;
  confirmDelete: (name: string) => string;
  deleteConfirm: string;
  cancel: string;
  save: string;
  saveChanges: string;
  saveAs: string;
  viewName: string;
  scopeLabel: string;
  /** Clears the active view and keeps the filter. */
  clear: string;
}

export const defaultSavedViewsMenuLabels: SavedViewsMenuLabels = {
  views: "Views",
  menu: "Saved views",
  edited: "edited",
  empty: "No saved views yet.",
  scope: { personal: "Personal", team: "Team" },
  unscoped: "Views",
  apply: (name) => `Apply view ${name}`,
  rename: (name) => `Rename view ${name}`,
  delete: (name) => `Delete view ${name}`,
  confirmDelete: (name) => `Delete "${name}"?`,
  deleteConfirm: "Delete",
  cancel: "Cancel",
  save: "Save",
  saveChanges: "Save changes",
  saveAs: "Save as new view",
  viewName: "View name",
  scopeLabel: "Visible to",
  clear: "Leave view",
};

export const savedViewsPopoverClasses =
  "w-[min(22rem,calc(100vw_-_var(--dt-space-6)))] p-[var(--dt-space-2)]";

export const savedViewsSectionClasses = "grid gap-[var(--dt-space-0-5)]";

export const savedViewsHeadingClasses =
  "px-[var(--dt-space-2)] pt-[var(--dt-space-2)] pb-[var(--dt-space-1)] text-xs font-medium text-muted-foreground";

export const savedViewsRowClasses =
  "group/row grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-[var(--dt-space-0-5)] rounded-md data-[active]:bg-muted/60";

export const savedViewsApplyClasses =
  "flex min-w-0 items-center gap-[var(--dt-space-2)] rounded-md px-[var(--dt-space-2)] py-[var(--dt-space-1-5)] text-start text-sm text-foreground outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring motion-safe:transition-colors motion-safe:duration-[var(--dt-motion-fast)]";

export const savedViewsIconButtonClasses =
  "inline-flex size-7 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring motion-safe:transition-colors motion-safe:duration-[var(--dt-motion-fast)]";

export const savedViewsFooterClasses =
  "mt-[var(--dt-space-2)] grid gap-[var(--dt-space-1)] border-t border-border pt-[var(--dt-space-2)]";

export const savedViewsTextButtonClasses =
  "inline-flex h-8 items-center justify-center gap-[var(--dt-space-1-5)] rounded-md px-[var(--dt-space-2-5)] text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 motion-safe:transition-colors motion-safe:duration-[var(--dt-motion-fast)]";

export const savedViewsPrimaryButtonClasses = cn(
  savedViewsTextButtonClasses,
  "bg-primary text-primary-foreground hover:bg-primary/90",
);

export const savedViewsGhostButtonClasses = cn(
  savedViewsTextButtonClasses,
  "justify-start text-foreground hover:bg-muted",
);

export const savedViewsDangerButtonClasses = cn(
  savedViewsTextButtonClasses,
  "bg-destructive text-destructive-foreground hover:bg-destructive/90",
);

export const savedViewsDirtyDotClasses =
  "size-1.5 shrink-0 rounded-full bg-warning";

export function CheckIcon({ visible }: { visible: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className={cn("size-3.5 shrink-0", !visible && "invisible")}
    >
      <path
        d="m3.5 8.5 3 3 6-7"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function PencilIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5">
      <path
        d="m10.5 3 2.5 2.5L6 12.5H3.5V10z"
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function TrashIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5">
      <path
        d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.5 8.5h6l.5-8.5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function ViewsIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4 shrink-0">
      <path
        d="M4 2.5h8v11l-4-2.5-4 2.5z"
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}
