import { useCallback, useMemo, useRef, useState } from "react";
import {
  addFilterNode,
  clearFilter,
  createFilter,
  removeFilterNode,
  updateFilterCondition,
  updateFilterGroup,
} from "./filter-core";
import type {
  Filter,
  FilterCombinator,
  FilterCondition,
  FilterNode,
} from "./filter-types";

export interface FilterCommitOptions {
  /**
   * Consecutive commits with the same key merge into one history entry, so a
   * whole editing session (typing, toggling options) undoes in one step.
   */
  coalesceKey?: string;
  /** Set to false to change the filter without recording history. */
  history?: boolean;
}

export interface UseFilterStateOptions {
  value?: Filter;
  defaultValue?: Filter;
  onValueChange?: (filter: Filter) => void;
  /** Maximum undo steps kept. Defaults to 50. */
  historyLimit?: number;
}

export interface FilterState {
  filter: Filter;
  setFilter: (
    next: Filter | ((current: Filter) => Filter),
    options?: FilterCommitOptions,
  ) => void;
  addNode: (
    node: FilterNode,
    options?: FilterCommitOptions & { index?: number; parentId?: string },
  ) => void;
  updateCondition: (
    id: string,
    patch: Partial<Omit<FilterCondition, "id" | "type">>,
    options?: FilterCommitOptions,
  ) => void;
  removeNode: (id: string, options?: FilterCommitOptions) => void;
  setCombinator: (
    groupId: string,
    combinator: FilterCombinator,
    options?: FilterCommitOptions,
  ) => void;
  clear: (options?: FilterCommitOptions) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

interface FilterHistory {
  past: Filter[];
  future: Filter[];
  coalesceKey?: string;
}

const emptyHistory: FilterHistory = { past: [], future: [] };

/**
 * Controlled or uncontrolled filter state with undo/redo. Every command is a
 * single history entry.
 */
export function useFilterState({
  defaultValue,
  historyLimit = 50,
  onValueChange,
  value,
}: UseFilterStateOptions = {}): FilterState {
  const [internalFilter, setInternalFilter] = useState<Filter>(
    () => defaultValue ?? createFilter({ id: "root" }),
  );
  const [history, setHistoryState] = useState<FilterHistory>(emptyHistory);
  const isControlled = value !== undefined;
  const filter = value ?? internalFilter;
  const filterRef = useRef(filter);
  const historyRef = useRef(history);
  const onValueChangeRef = useRef(onValueChange);

  filterRef.current = filter;
  historyRef.current = history;
  onValueChangeRef.current = onValueChange;

  const setHistory = useCallback((next: FilterHistory) => {
    historyRef.current = next;
    setHistoryState(next);
  }, []);

  const apply = useCallback(
    (next: Filter) => {
      filterRef.current = next;

      if (!isControlled) {
        setInternalFilter(next);
      }

      onValueChangeRef.current?.(next);
    },
    [isControlled],
  );

  const setFilter = useCallback<FilterState["setFilter"]>(
    (nextOrUpdater, { coalesceKey, history: record = true } = {}) => {
      const current = filterRef.current;
      const next =
        typeof nextOrUpdater === "function"
          ? nextOrUpdater(current)
          : nextOrUpdater;

      if (next === current) {
        return;
      }

      if (record) {
        const previous = historyRef.current;
        const coalesce =
          coalesceKey !== undefined &&
          previous.coalesceKey === coalesceKey &&
          previous.past.length > 0;

        setHistory({
          past: coalesce
            ? previous.past
            : [...previous.past, current].slice(-historyLimit),
          future: [],
          coalesceKey,
        });
      }

      apply(next);
    },
    [apply, historyLimit, setHistory],
  );

  const undo = useCallback(() => {
    const { future, past } = historyRef.current;
    const previous = past.at(-1);

    if (!previous) {
      return;
    }

    setHistory({
      past: past.slice(0, -1),
      future: [filterRef.current, ...future],
    });
    apply(previous);
  }, [apply, setHistory]);

  const redo = useCallback(() => {
    const { future, past } = historyRef.current;
    const [next, ...rest] = future;

    if (!next) {
      return;
    }

    setHistory({ past: [...past, filterRef.current], future: rest });
    apply(next);
  }, [apply, setHistory]);

  return useMemo<FilterState>(
    () => ({
      filter,
      setFilter,
      addNode: (node, { index, parentId, ...options } = {}) => {
        setFilter(
          (current) => addFilterNode(current, node, { index, parentId }),
          options,
        );
      },
      updateCondition: (id, patch, options) => {
        setFilter(
          (current) => updateFilterCondition(current, id, patch),
          options,
        );
      },
      removeNode: (id, options) => {
        setFilter((current) => removeFilterNode(current, id), options);
      },
      setCombinator: (groupId, combinator, options) => {
        setFilter(
          (current) => updateFilterGroup(current, groupId, { combinator }),
          options,
        );
      },
      clear: (options) => {
        setFilter(
          (current) =>
            current.children.length === 0 ? current : clearFilter(current),
          options,
        );
      },
      undo,
      redo,
      canUndo: history.past.length > 0,
      canRedo: history.future.length > 0,
    }),
    [filter, history, redo, setFilter, undo],
  );
}
