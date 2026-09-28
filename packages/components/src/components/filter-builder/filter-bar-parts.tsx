import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type KeyboardEvent,
} from "react";
import { cn } from "../../utils/cn";
import {
  getFilterOperatorLabel,
  type DescribeFilterOptions,
  type FilterFacetTarget,
  type FilterRescue,
} from "./filter-core";
import type {
  FilterEvaluateOptions,
  FilterFields,
  FilterOperatorDefinition,
  FilterValue,
} from "./filter-types";
import {
  defaultFilterEditorLabels,
  type FilterEditorLabels,
} from "./filter-value-editor";
import type { FilterState } from "./use-filter-state";

export type FilterBarSize = "sm" | "md";

export interface FilterBarLabels extends FilterEditorLabels {
  toolbar: string;
  add: string;
  addFirst: string;
  addMenu: string;
  back: string;
  clear: string;
  undo: string;
  searchFields: string;
  fieldList: string;
  operatorList: string;
  selectValue: string;
  changeField: (fieldLabel: string) => string;
  changeOperator: (operatorLabel: string) => string;
  changeValue: (valueText: string) => string;
  remove: (description: string) => string;
  editor: (description: string) => string;
  showMore: (hiddenCount: number) => string;
  showLess: string;
  resultCount: (count: number) => string;
  unknownField: (fieldKey: string) => string;
  and: string;
  or: string;
  not: string;
  /** Shown before the chips when the whole filter is negated. */
  notMatching: string;
  missingValue: string;
  empty: string;
  advanced: string;
  groupEditor: string;
  editGroup: (description: string) => string;
  emptyGroup: string;
  matchAll: string;
  matchAny: string;
  matchPrefix: string;
  matchSuffix: string;
  negate: string;
  addCondition: string;
  addGroup: string;
  wrapInGroup: string;
  ungroup: string;
  removeGroup: string;
  moveUp: string;
  moveDown: string;
  nodeActions: (description: string) => string;
  maxDepthReached: (maxDepth: number) => string;
  /**
   * Screen-reader text for a chip's impact count: positive when the chip
   * removes rows, negative when it adds them (an OR branch).
   */
  impact: (count: number) => string;
  relax: string;
  rescue: (description: string, count: number) => string;
  operator: (
    operator: FilterOperatorDefinition,
    value: FilterValue | undefined,
  ) => string;
}

export const defaultFilterBarLabels: FilterBarLabels = {
  ...defaultFilterEditorLabels,
  toolbar: "Filters",
  add: "Filter",
  addFirst: "Add filter",
  addMenu: "Add a filter",
  back: "Back to fields",
  clear: "Clear",
  undo: "Undo filter change",
  searchFields: "Filter by…",
  fieldList: "Fields",
  operatorList: "Operators",
  selectValue: "Select…",
  changeField: (fieldLabel) => `Change field, ${fieldLabel}`,
  changeOperator: (operatorLabel) => `Change operator, ${operatorLabel}`,
  changeValue: (valueText) => `Change value, ${valueText}`,
  remove: (description) => `Remove filter, ${description}`,
  editor: (description) => `Edit filter, ${description}`,
  showMore: (hiddenCount) => `+${hiddenCount} more`,
  showLess: "Show fewer",
  resultCount: (count) => `${count} ${count === 1 ? "result" : "results"}`,
  unknownField: (fieldKey) => `Unknown field ${fieldKey}`,
  and: "and",
  or: "or",
  not: "not",
  notMatching: "Not matching",
  missingValue: "(no value)",
  empty: "No filters",
  advanced: "Advanced",
  groupEditor: "Edit filter groups",
  editGroup: (description) => `Edit group, ${description}`,
  emptyGroup: "Empty group",
  matchAll: "all",
  matchAny: "any",
  matchPrefix: "Match",
  matchSuffix: "of the following",
  negate: "Not",
  addCondition: "Condition",
  addGroup: "Group",
  wrapInGroup: "Wrap in group",
  ungroup: "Ungroup",
  removeGroup: "Remove group",
  moveUp: "Move up",
  moveDown: "Move down",
  nodeActions: (description) => `Actions for ${description}`,
  maxDepthReached: (maxDepth) =>
    `Groups can be nested ${maxDepth} levels deep.`,
  operator: getFilterOperatorLabel,
  impact: (count) => {
    const rows = Math.abs(count);

    return `${count < 0 ? "adds" : "removes"} ${rows} ${rows === 1 ? "row" : "rows"}`;
  },
  relax: "Relax",
  rescue: (description, count) =>
    `No results. Removing “${description}” would show ${count}.`,
};

export interface FilterBarContextValue {
  // A plain mutable ref: React 18's RefObject is read-only.
  addButtonRef: { current: HTMLButtonElement | null };
  addMenuOpen: boolean;
  collapseAfter: number;
  describeOptions: DescribeFilterOptions;
  evaluateOptions: FilterEvaluateOptions;
  expanded: boolean;
  /** Rows per value of a field, applying the other conditions. */
  getFacets?: (
    fieldKey: string,
    target?: FilterFacetTarget,
  ) => ReadonlyMap<string, number> | undefined;
  /**
   * Rows removed by each active condition, keyed by condition id. Negative
   * when the condition adds rows (an OR branch).
   */
  impact?: ReadonlyMap<string, number>;
  /** Most restrictive condition when nothing matches. */
  rescue?: FilterRescue;
  fields: FilterFields;
  labels: FilterBarLabels;
  locale: string;
  maxDepth: number;
  requestFocus: (element: HTMLElement | null | undefined) => void;
  setAddMenuOpen: (open: boolean) => void;
  setExpanded: (expanded: boolean) => void;
  size: FilterBarSize;
  state: FilterState;
}

export const FilterBarContext = createContext<FilterBarContextValue | null>(
  null,
);

export function useFilterBarContext(part: string) {
  const context = useContext(FilterBarContext);

  if (!context) {
    throw new Error(`${part} must be rendered inside <FilterBar>.`);
  }

  return context;
}

/** Filter state and labels of the nearest FilterBar. */
export function useFilterBar() {
  const { fields, labels, state } = useFilterBarContext("useFilterBar");

  return { fields, labels, state };
}

export const ITEM_SELECTOR = "[data-filter-bar-item]";

export const filterBarClasses =
  "@container grid min-w-0 gap-[var(--dt-space-2)]";

export const filterBarToolbarClasses =
  "flex min-w-0 flex-wrap items-center gap-[var(--dt-space-2)]";

export const chipBaseClasses =
  "inline-flex min-w-0 max-w-full items-stretch overflow-hidden rounded-md border border-border bg-background text-foreground shadow-xs @max-xl:data-[overflow]:hidden data-[incomplete]:border-dashed";

export const chipSizeClasses: Record<FilterBarSize, string> = {
  sm: "h-7 text-xs",
  md: "h-8 text-sm",
};

export const segmentClasses =
  "inline-flex min-w-0 items-center gap-[var(--dt-space-1)] px-[var(--dt-space-2)] outline-none [&+&]:border-s [&+&]:border-border motion-safe:transition-colors motion-safe:duration-[var(--dt-motion-fast)] hover:bg-muted focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring aria-expanded:bg-muted";

export const segmentFieldClasses = "shrink-0 font-medium";

export const segmentOperatorClasses = "shrink-0 text-muted-foreground";

export const segmentValueClasses =
  "max-w-[16rem] data-[incomplete]:italic data-[incomplete]:text-muted-foreground";

export const segmentRemoveClasses =
  "shrink-0 justify-center px-[var(--dt-space-1-5)] text-muted-foreground hover:text-foreground";

export const groupChipTextClasses =
  "inline-flex min-w-0 items-center px-[var(--dt-space-2)] text-muted-foreground";

export const actionBaseClasses =
  "inline-flex shrink-0 items-center gap-[var(--dt-space-1-5)] rounded-md px-[var(--dt-space-2-5)] font-medium outline-none motion-safe:transition-colors motion-safe:duration-[var(--dt-motion-fast)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export const addButtonClasses =
  "border border-dashed border-border text-muted-foreground hover:border-solid hover:bg-muted hover:text-foreground aria-expanded:border-solid aria-expanded:bg-muted aria-expanded:text-foreground";

export const ghostActionClasses =
  "text-muted-foreground hover:bg-muted hover:text-foreground";

export const moreButtonClasses = `${ghostActionClasses} hidden @max-xl:inline-flex`;

export const negationClasses =
  "inline-flex shrink-0 items-center self-stretch rounded-sm bg-muted px-[var(--dt-space-1-5)] text-xs font-semibold uppercase text-foreground";

export const conjunctionClasses =
  "select-none text-xs font-medium uppercase text-muted-foreground";

export const editorHeaderClasses =
  "flex min-w-0 items-center gap-[var(--dt-space-1)] text-sm";

export const editorBackClasses =
  "inline-flex size-7 shrink-0 items-center justify-center rounded-sm text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring";

export const editorPopoverClasses =
  "w-max min-w-[var(--dt-filter-editor-width,16rem)] p-[var(--dt-space-2)]";

export function filterBarClassNames({
  className,
}: { className?: string } = {}) {
  return cn(filterBarClasses, className);
}

export function filterChipClassNames({
  className,
  size = "md",
}: { className?: string; size?: FilterBarSize } = {}) {
  return cn(chipBaseClasses, chipSizeClasses[size], className);
}

export function filterBarActionClassNames({
  className,
  size = "md",
  variant = "ghost",
}: {
  className?: string;
  size?: FilterBarSize;
  variant?: "add" | "ghost";
} = {}) {
  return cn(
    actionBaseClasses,
    chipSizeClasses[size],
    variant === "add" ? addButtonClasses : ghostActionClasses,
    className,
  );
}

export function PlusIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4 shrink-0">
      <path
        d="M8 3.5v9M3.5 8h9"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function CloseIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5 shrink-0">
      <path
        d="m4.5 4.5 7 7m0-7-7 7"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function UndoIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="size-4 shrink-0 rtl:-scale-x-100"
    >
      <path
        d="M5.5 4 2.5 7l3 3M3 7h6.5a3.5 3.5 0 0 1 0 7H8"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function BackIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="size-4 shrink-0 rtl:-scale-x-100"
    >
      <path
        d="M10 3.5 5.5 8l4.5 4.5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function isVisible(element: HTMLElement) {
  return typeof element.checkVisibility === "function"
    ? element.checkVisibility()
    : true;
}

export function isEditableTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.tagName === "SELECT")
  );
}

export function formatChipValue(values: string[], placeholder: string) {
  if (values.length === 0) {
    return placeholder;
  }

  if (values.length <= 2) {
    return values.join(", ");
  }

  return `${values[0]}, ${values[1]} +${values.length - 2}`;
}

/** Restores focus to the segment that opened an editor once it closes. */
export function useEditorFocusReturn(open: boolean) {
  const returnRef = useRef<HTMLElement | null>(null);
  const wasOpenRef = useRef(open);

  useEffect(() => {
    const wasOpen = wasOpenRef.current;

    wasOpenRef.current = open;

    if (!wasOpen || open) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      const target = returnRef.current;

      if (target?.isConnected) {
        target.focus();
      }
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [open]);

  return returnRef;
}

/** The toolbar item to focus after a chip is removed: next, else previous. */
export function getNeighborItem(chip: HTMLElement | null) {
  // The toolbar and each group editor mark their own focus scope.
  const scope = chip?.closest<HTMLElement>("[data-filter-focus-scope]");

  if (!chip || !scope) {
    return undefined;
  }

  const items = [...scope.querySelectorAll<HTMLElement>(ITEM_SELECTOR)].filter(
    (item) =>
      isVisible(item) &&
      !chip.contains(item) &&
      item.closest("[data-filter-focus-scope]") === scope,
  );
  const after = items.find(
    (item) =>
      chip.compareDocumentPosition(item) & Node.DOCUMENT_POSITION_FOLLOWING,
  );

  return (
    after ??
    [...items]
      .reverse()
      .find(
        (item) =>
          chip.compareDocumentPosition(item) & Node.DOCUMENT_POSITION_PRECEDING,
      )
  );
}

/**
 * Backspace/Delete on one of this chip's own items. Checked against the DOM
 * because React bubbles keys out of portaled editors (a group editor's chips)
 * to the chip that opened them.
 */
export function isRemoveKey(event: KeyboardEvent<HTMLElement>) {
  return (
    (event.key === "Backspace" || event.key === "Delete") &&
    event.target instanceof HTMLElement &&
    event.target.hasAttribute("data-filter-bar-item") &&
    event.currentTarget.contains(event.target)
  );
}
