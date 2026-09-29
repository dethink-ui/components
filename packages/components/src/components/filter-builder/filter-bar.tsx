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
import { LiveRegion } from "../live-region";
import {
  DEFAULT_FILTER_MAX_DEPTH,
  describeFilter,
  describeFilterCondition,
  type DescribeFilterOptions,
} from "./filter-core";
import type {
  Filter,
  FilterEvaluateOptions,
  FilterFields,
} from "./filter-types";
import { FilterBarRescue } from "./filter-bar-rescue";
import { useFilterInsights } from "./use-filter-insights";
import { useServerFacets, type GetFilterFacets } from "./use-server-facets";
import { useFilterState, type FilterState } from "./use-filter-state";
import { FilterAddMenu } from "./filter-add-menu";
import { FilterBarAdvanced } from "./filter-group-chip";
import {
  FilterBarContext,
  ITEM_SELECTOR,
  defaultFilterBarLabels,
  filterBarClassNames,
  filterBarToolbarClasses,
  isEditableTarget,
  isVisible,
  type FilterBarContextValue,
  type FilterBarLabels,
  type FilterBarSize,
} from "./filter-bar-parts";

import {
  FilterBarChips,
  FilterBarClear,
  FilterBarUndo,
} from "./filter-bar-chips";

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
  /**
   * Rows to filter on the client. Enables facet counts in option pickers,
   * an announced result count and the empty-result rescue.
   */
  data?: readonly TData[];
  /**
   * Facet counts from your server, for server-side data: called with the
   * field and the filter to count under. Takes precedence over counts from
   * `data`. Pickers reserve space while counts load.
   */
  getFacets?: GetFilterFacets;
  /**
   * Cache key for server facets besides the filter, e.g. a time range or a
   * data version: counts are fetched again when it changes. Compared as
   * JSON, so use a primitive or plain JSON value. `getFacets` itself may be
   * an inline function.
   */
  facetsKey?: unknown;
  /** Shows how many rows each chip removes ("−42"). Needs `data`. */
  showImpact?: boolean;
  /** Offers "Relax" on the most restrictive chip when nothing matches. */
  rescue?: boolean;
  /**
   * `now`, `timeZone` and `weekStartsOn` for relative dates. Inject `now`
   * so server and client counts match.
   */
  evaluateOptions?: FilterEvaluateOptions;
  /** Locale for numbers, dates and calendars. Defaults to "en-US". */
  locale?: string;
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
  data,
  defaultValue,
  evaluateOptions: evaluateOptionsProp,
  fields,
  facetsKey,
  getFacets: getServerFacets,
  labels: labelOverrides,
  locale = "en-US",
  maxDepth = DEFAULT_FILTER_MAX_DEPTH,
  onValueChange,
  rescue: withRescue = true,
  resultCount,
  showImpact = false,
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
      locale,
      labels: {
        and: labels.and,
        empty: labels.empty,
        missingValue: labels.missingValue,
        not: labels.not,
        or: labels.or,
      },
    }),
    [labels, locale],
  );
  // A fixed default `now` keeps relative dates and counts stable across
  // renders; pass `evaluateOptions.now` to match server output.
  const [mountedAt] = useState(() => Date.now());
  const evaluateNow = evaluateOptionsProp?.now ?? mountedAt;
  const evaluateTimeZone = evaluateOptionsProp?.timeZone;
  const evaluateWeekStart = evaluateOptionsProp?.weekStartsOn ?? 1;
  const evaluateOptions = useMemo<FilterEvaluateOptions>(
    () => ({
      now: evaluateNow,
      timeZone: evaluateTimeZone,
      weekStartsOn: evaluateWeekStart,
    }),
    [evaluateNow, evaluateTimeZone, evaluateWeekStart],
  );
  const insights = useFilterInsights({
    data,
    evaluateOptions,
    fields,
    filter: state.filter,
    impact: showImpact,
    rescue: withRescue,
  });
  const serverFacets = useServerFacets({
    facetsKey,
    fields,
    filter: state.filter,
    getFacets: getServerFacets,
  });
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
      evaluateOptions,
      expanded,
      fields: fields as FilterFields,
      getFacets: serverFacets?.getFacets ?? insights.getFacets,
      getFacetStatus: serverFacets?.getFacetStatus,
      impact: insights.impact,
      labels,
      locale,
      maxDepth,
      rescue: insights.rescue,
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
      evaluateOptions,
      expanded,
      fields,
      insights,
      labels,
      serverFacets,
      locale,
      maxDepth,
      requestFocus,
      size,
      state,
    ],
  );

  const announcedCount = resultCount ?? insights.count;
  const rescueText = insights.rescue
    ? labels.rescue(
        describeFilterCondition(
          insights.rescue.condition,
          fields,
          describeOptions,
        ),
        insights.rescue.count,
      )
    : undefined;

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
        <FilterBarRescue />
        <LiveRegion slotName="filter-bar-status">
          {announcedCount === undefined
            ? ""
            : labels.resultCount(announcedCount)}
          {rescueText ? ` ${rescueText}` : ""}
        </LiveRegion>
      </div>
    </FilterBarContext.Provider>
  );
}
