import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { cn } from "../../utils/cn";
import { LiveRegion } from "../live-region";
import {
  DEFAULT_FILTER_MAX_DEPTH,
  describeFilter,
  type DescribeFilterOptions,
} from "./filter-core";
import type { Filter, FilterCondition, FilterFields } from "./filter-types";
import { useFilterState, type FilterState } from "./use-filter-state";
import { FilterAddMenu } from "./filter-add-menu";
import { FilterChip } from "./filter-chip";
import { FilterBarAdvanced, FilterGroupChip } from "./filter-group-chip";
import {
  FilterBarContext,
  ITEM_SELECTOR,
  UndoIcon,
  conjunctionClasses,
  defaultFilterBarLabels,
  filterBarActionClassNames,
  filterBarClassNames,
  filterBarToolbarClasses,
  isEditableTarget,
  isVisible,
  moreButtonClasses,
  negationClasses,
  useFilterBarContext,
  type FilterBarContextValue,
  type FilterBarLabels,
  type FilterBarSize,
} from "./filter-bar-parts";

export interface FilterBarChipsProps {
  /** Custom chip renderer. Return `undefined` to use the default chip. */
  renderChip?: (condition: FilterCondition, index: number) => ReactNode;
}

/** Chips for the root conditions, with narrow-width collapsing. */
export function FilterBarChips({ renderChip }: FilterBarChipsProps) {
  const { collapseAfter, expanded, labels, setExpanded, size, state } =
    useFilterBarContext("FilterBarChips");
  const { children, combinator } = state.filter;
  const hiddenCount = Math.max(children.length - collapseAfter, 0);

  return (
    <>
      {state.filter.not && children.length > 0 ? (
        <span data-slot="filter-bar-not" className={negationClasses}>
          {labels.notMatching}
        </span>
      ) : null}
      {children.map((node, index) => (
        <FilterBarChipSlot
          key={node.id}
          conjunction={index > 0 && combinator === "or" ? labels.or : undefined}
        >
          {node.type === "condition" ? (
            (renderChip?.(node, index) ?? (
              <FilterChip condition={node} index={index} />
            ))
          ) : (
            <FilterGroupChip group={node} index={index} />
          )}
        </FilterBarChipSlot>
      ))}
      {hiddenCount > 0 ? (
        <button
          type="button"
          data-filter-bar-item="more"
          data-slot="filter-bar-more"
          aria-expanded={expanded}
          className={filterBarActionClassNames({
            size,
            className: moreButtonClasses,
          })}
          onClick={() => {
            setExpanded(!expanded);
          }}
        >
          {expanded ? labels.showLess : labels.showMore(hiddenCount)}
        </button>
      ) : null}
    </>
  );
}

function FilterBarChipSlot({
  children,
  conjunction,
}: {
  children: ReactNode;
  conjunction?: string;
}) {
  if (!conjunction) {
    return children;
  }

  return (
    <>
      <span aria-hidden="true" className={conjunctionClasses}>
        {conjunction}
      </span>
      {children}
    </>
  );
}

export interface FilterBarActionProps {
  className?: string;
  children?: ReactNode;
}

/** Removes every filter. Hidden while the filter is empty. */
export function FilterBarClear({ children, className }: FilterBarActionProps) {
  const { addButtonRef, labels, requestFocus, size, state } =
    useFilterBarContext("FilterBarClear");

  if (state.filter.children.length === 0) {
    return null;
  }

  return (
    <button
      type="button"
      data-filter-bar-item="clear"
      data-slot="filter-bar-clear"
      className={filterBarActionClassNames({ size, className })}
      onClick={() => {
        requestFocus(addButtonRef.current);
        state.clear();
      }}
    >
      {children ?? labels.clear}
    </button>
  );
}

/** Undoes the last filter change. Hidden when there is nothing to undo. */
export function FilterBarUndo({ children, className }: FilterBarActionProps) {
  const { labels, size, state } = useFilterBarContext("FilterBarUndo");

  if (!state.canUndo) {
    return null;
  }

  return (
    <button
      type="button"
      data-filter-bar-item="undo"
      data-slot="filter-bar-undo"
      aria-label={children ? undefined : labels.undo}
      title={children ? undefined : labels.undo}
      className={filterBarActionClassNames({
        size,
        className: cn(
          children ? undefined : "px-[var(--dt-space-1-5)]",
          className,
        ),
      })}
      onClick={() => {
        state.undo();
      }}
    >
      {children ?? <UndoIcon />}
    </button>
  );
}

export interface FilterBarProps<TData = unknown> extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "defaultValue" | "onChange"
> {
  fields: FilterFields<TData>;
  value?: Filter;
  defaultValue?: Filter;
  onValueChange?: (filter: Filter) => void;
  /** External state from `useFilterState`. Takes precedence over value props. */
  state?: FilterState;
  labels?: Partial<FilterBarLabels>;
  /** Number of matching rows, announced politely when it changes. */
  resultCount?: number;
  /** Single key that opens the add menu when focus is not in a text field. */
  addShortcut?: string | false;
  /** Chips shown before "+N more" on narrow containers. Defaults to 2. */
  collapseAfter?: number;
  /** Group levels allowed, counting the root as 1. Defaults to 3. */
  maxDepth?: number;
  size?: FilterBarSize;
  /** Custom composition of FilterBar parts. Defaults to chips and actions. */
  children?: ReactNode;
}

/**
 * Filter chips in a keyboard-navigable toolbar. Arrow keys move between
 * segments, Backspace/Delete removes the focused chip and Cmd/Ctrl+Z undoes.
 */
export function FilterBar<TData>({
  "aria-label": ariaLabel,
  addShortcut = false,
  children,
  className,
  collapseAfter = 2,
  defaultValue,
  fields,
  labels: labelOverrides,
  maxDepth = DEFAULT_FILTER_MAX_DEPTH,
  onValueChange,
  resultCount,
  size = "md",
  state: externalState,
  value,
  ...props
}: FilterBarProps<TData>) {
  const internalState = useFilterState({ defaultValue, onValueChange, value });
  const state = externalState ?? internalState;
  const labels = useMemo(
    () => ({ ...defaultFilterBarLabels, ...labelOverrides }),
    [labelOverrides],
  );
  const describeOptions = useMemo<DescribeFilterOptions>(
    () => ({
      labels: {
        and: labels.and,
        empty: labels.empty,
        missingValue: labels.missingValue,
        not: labels.not,
        or: labels.or,
      },
    }),
    [labels],
  );
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const activeItemRef = useRef<HTMLElement | null>(null);
  const pendingFocusRef = useRef<HTMLElement | null>(null);
  // Position of the tab stop, used to recover focus if its element is removed.
  const activeIndexRef = useRef(0);
  // Whether focus is in the toolbar, so recovery never steals focus.
  const focusWithinRef = useRef(false);
  const summaryId = useId();

  const getAllItems = useCallback(() => {
    const toolbar = toolbarRef.current;

    return toolbar
      ? [...toolbar.querySelectorAll<HTMLElement>(ITEM_SELECTOR)].filter(
          // Items inside a nested focus scope (an inline group editor) keep
          // their own tab order.
          (item) => item.closest("[data-filter-focus-scope]") === toolbar,
        )
      : [];
  }, []);

  const getItems = useCallback(
    () => getAllItems().filter(isVisible),
    [getAllItems],
  );

  const syncTabStops = useCallback(() => {
    const items = getAllItems();
    const visible = items.filter(isVisible);
    const activeItem = activeItemRef.current;
    const tabStop =
      activeItem && visible.includes(activeItem) ? activeItem : visible[0];

    // Hidden (collapsed) items get -1 too, so revealing them later never
    // exposes extra tab stops.
    for (const item of items) {
      item.tabIndex = item === tabStop ? 0 : -1;
    }

    if (tabStop) {
      activeIndexRef.current = visible.indexOf(tabStop);
    }
  }, [getAllItems]);

  const requestFocus = useCallback((element?: HTMLElement | null) => {
    pendingFocusRef.current = element ?? null;
  }, []);

  // Roving tabindex: runs after every render so added/removed chips keep a
  // single tab stop, and moves focus after a chip is removed.
  useEffect(() => {
    const pending = pendingFocusRef.current;

    pendingFocusRef.current = null;

    const lost = activeItemRef.current;

    if (pending?.isConnected) {
      activeItemRef.current = pending;
      pending.focus();
    } else if (lost && !lost.isConnected) {
      activeItemRef.current = null;

      // A render removed the focused item (e.g. undo hid the Undo button or
      // a chip). Keep keyboard users in the toolbar at the same position.
      const focusLost =
        document.activeElement === null ||
        document.activeElement === document.body;

      if (focusWithinRef.current && focusLost) {
        const visible = getItems();
        const next =
          visible[Math.min(activeIndexRef.current, visible.length - 1)];

        if (next) {
          activeItemRef.current = next;
          next.focus();
        }
      }
    }

    syncTabStops();
  });

  // Chips collapse through a container query, which does not re-render, so
  // re-sync when the toolbar's size changes.
  useEffect(() => {
    const toolbar = toolbarRef.current;

    if (!toolbar || typeof ResizeObserver === "undefined") {
      return undefined;
    }

    const observer = new ResizeObserver(() => {
      syncTabStops();
    });

    observer.observe(toolbar);

    return () => {
      observer.disconnect();
    };
  }, [syncTabStops]);

  useEffect(() => {
    if (!addShortcut) {
      return undefined;
    }

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        event.key.toLowerCase() !== addShortcut.toLowerCase() ||
        isEditableTarget(event.target)
      ) {
        return;
      }

      event.preventDefault();
      addButtonRef.current?.focus();
      setAddMenuOpen(true);
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [addShortcut]);

  const contextValue = useMemo<FilterBarContextValue>(
    () => ({
      addButtonRef,
      addMenuOpen,
      collapseAfter,
      describeOptions,
      expanded,
      fields: fields as FilterFields,
      labels,
      maxDepth,
      requestFocus,
      setAddMenuOpen,
      setExpanded,
      size,
      state,
    }),
    [
      addMenuOpen,
      collapseAfter,
      describeOptions,
      expanded,
      fields,
      labels,
      maxDepth,
      requestFocus,
      size,
      state,
    ],
  );

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const target = event.target;

    if (
      !(target instanceof HTMLElement) ||
      !target.hasAttribute("data-filter-bar-item")
    ) {
      return;
    }

    const modifier = event.metaKey || event.ctrlKey;

    if (modifier && event.key.toLowerCase() === "z") {
      event.preventDefault();

      if (event.shiftKey) {
        state.redo();
      } else {
        state.undo();
      }

      return;
    }

    const items = getItems();
    const index = items.indexOf(target);

    if (index === -1) {
      return;
    }

    const rtl =
      toolbarRef.current !== null &&
      getComputedStyle(toolbarRef.current).direction === "rtl";
    let next: HTMLElement | undefined;

    switch (event.key) {
      case "ArrowRight":
        next = items[rtl ? index - 1 : index + 1];
        break;
      case "ArrowLeft":
        next = items[rtl ? index + 1 : index - 1];
        break;
      case "Home":
        next = items[0];
        break;
      case "End":
        next = items.at(-1);
        break;
      default:
        return;
    }

    event.preventDefault();

    if (next) {
      activeItemRef.current = next;
      syncTabStops();
      next.focus();
    }
  };

  return (
    <FilterBarContext.Provider value={contextValue}>
      <div
        {...props}
        data-slot="filter-bar"
        data-size={size}
        data-empty={state.filter.children.length === 0 ? "" : undefined}
        className={filterBarClassNames({ className })}
      >
        <div
          ref={toolbarRef}
          role="toolbar"
          data-filter-focus-scope=""
          aria-label={ariaLabel ?? labels.toolbar}
          aria-describedby={summaryId}
          data-slot="filter-bar-toolbar"
          className={filterBarToolbarClasses}
          onKeyDown={handleKeyDown}
          onBlur={(event) => {
            // A removed element blurs with no related target; only a move
            // to somewhere else counts as leaving.
            if (
              event.relatedTarget instanceof Node &&
              !event.currentTarget.contains(event.relatedTarget)
            ) {
              focusWithinRef.current = false;
            }
          }}
          onFocus={(event) => {
            focusWithinRef.current = true;

            if (
              event.target instanceof HTMLElement &&
              event.target.hasAttribute("data-filter-bar-item") &&
              event.target.closest("[data-filter-focus-scope]") ===
                toolbarRef.current
            ) {
              activeItemRef.current = event.target;
              syncTabStops();
            }
          }}
        >
          {children ?? (
            <>
              <FilterBarChips />
              <FilterAddMenu />
              <FilterBarAdvanced />
              <FilterBarClear />
              <FilterBarUndo />
            </>
          )}
        </div>
        <span id={summaryId} hidden>
          {describeFilter(state.filter, fields, describeOptions)}
        </span>
        <LiveRegion slotName="filter-bar-status">
          {resultCount === undefined ? "" : labels.resultCount(resultCount)}
        </LiveRegion>
      </div>
    </FilterBarContext.Provider>
  );
}
