import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  createFilterId,
  diffFilter,
  getFilterSignature,
  isFilterConditionActive,
  normalizeFilter,
  reconcileFilterIds,
} from "./filter-core";
import type {
  Filter,
  FilterDiff,
  FilterFields,
  FilterNode,
} from "./filter-types";
import type { FilterState } from "./use-filter-state";

export type SavedViewScope = "personal" | "team";

/** A named filter people can return to. Persistence is up to you. */
export interface SavedView<TMeta = Record<string, unknown>> {
  id: string;
  name: string;
  filter: Filter;
  /** Filter schema version the view was saved with. */
  version: number;
  scope?: SavedViewScope;
  meta?: TMeta;
}

export interface UseSavedViewsOptions<TData = unknown> {
  state: FilterState;
  fields: FilterFields<TData>;
  views: readonly SavedView[];
  /** Current filter schema version, stamped on saves. Defaults to 1. */
  version?: number;
  /** Upgrades a view saved with an older version before it is applied. */
  migrate?: (filter: Filter, fromVersion: number) => Filter;
  activeViewId?: string | null;
  defaultActiveViewId?: string | null;
  onActiveViewChange?: (id: string | null) => void;
  /** Persist a new view. `views` should include it afterwards. */
  onCreate?: (view: SavedView) => void | Promise<unknown>;
  /** Persist a changed view (saved filter or new name). */
  onUpdate?: (view: SavedView) => void | Promise<unknown>;
  onDelete?: (view: SavedView) => void | Promise<unknown>;
  /** Id for a new view. Defaults to a random id. */
  createId?: () => string;
}

export interface SavedViewsState {
  /** Views with pending saves applied, until `views` catches up. */
  views: readonly SavedView[];
  activeViewId: string | null;
  activeView?: SavedView;
  /** Whether the filter differs from the active view's. */
  isDirty: boolean;
  /** What changed since the active view, matched by node id. */
  diff: FilterDiff;
  /** Replaces the filter with a view's, as one undo step. */
  apply: (id: string) => void;
  /** Saves the filter into the active view. */
  save: () => void;
  /** Saves the filter as a new view and makes it active. */
  saveAs: (
    name: string,
    options?: { scope?: SavedViewScope; meta?: Record<string, unknown> },
  ) => SavedView;
  rename: (id: string, name: string) => void;
  remove: (id: string) => void;
  /** Leaves the filter as is and clears the active view. */
  deselect: () => void;
}

const emptyDiff: FilterDiff = { added: [], removed: [], changed: [] };

interface PendingOperation {
  /** The view after this operation; null when it deletes the view. */
  change: SavedView | null;
  create: boolean;
}

function sameView(a: SavedView, b: SavedView) {
  return (
    a.name === b.name &&
    a.version === b.version &&
    a.scope === b.scope &&
    getFilterSignature(a.filter) === getFilterSignature(b.filter)
  );
}

/** The filter without conditions that have no usable value yet. */
function pruneFilter<TData>(filter: Filter, fields: FilterFields<TData>) {
  const prune = (node: FilterNode): FilterNode[] => {
    if (node.type === "condition") {
      return isFilterConditionActive(node, fields) ? [node] : [];
    }

    return [{ ...node, children: node.children.flatMap(prune) }];
  };

  return { ...filter, children: filter.children.flatMap(prune) };
}

/**
 * Saved views over a filter state: apply (one undo step), save, save as,
 * rename and delete through your callbacks, plus an accurate dirty flag.
 * Dirty compares filter content, so new ids, redundant groups and chips
 * without a value yet don't count as changes.
 */
export function useSavedViews<TData>({
  activeViewId: activeProp,
  createId = () => createFilterId("view"),
  defaultActiveViewId = null,
  fields,
  migrate,
  onActiveViewChange,
  onCreate,
  onDelete,
  onUpdate,
  state,
  version = 1,
  views: viewsProp,
}: UseSavedViewsOptions<TData>): SavedViewsState {
  const [activeInternal, setActiveInternal] = useState(defaultActiveViewId);
  const activeViewId = activeProp === undefined ? activeInternal : activeProp;
  // Optimistic operations per view id, oldest first. The newest one still
  // in flight is shown until `views` reflects it; a rejected one is removed
  // (a rejected create removes everything after it too).
  const [pending, setPending] = useState<
    ReadonlyMap<string, readonly PendingOperation[]>
  >(() => new Map());

  // Views deleted while their create was still in flight: their tombstone
  // must outlive the moment the create lands in `views`.
  const creatingRef = useRef(new Map<string, Promise<unknown>>());
  const [awaitingCreate, setAwaitingCreate] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const stopAwaiting = useCallback((id: string) => {
    setAwaitingCreate((current) => {
      if (!current.has(id)) {
        return current;
      }

      const rest = new Set(current);

      rest.delete(id);

      return rest;
    });
  }, []);

  // Once a deleted-while-creating view shows up in `views`, its tombstone
  // settles like any other: when the view is gone again.
  useEffect(() => {
    for (const id of awaitingCreate) {
      if (viewsProp.some((view) => view.id === id)) {
        stopAwaiting(id);
      }
    }
  }, [awaitingCreate, stopAwaiting, viewsProp]);

  const isSettled = (id: string, change: SavedView | null) => {
    const persisted = viewsProp.find((view) => view.id === id);

    return change === null
      ? persisted === undefined && !awaitingCreate.has(id)
      : persisted !== undefined && sameView(persisted, change);
  };
  const settled = [...pending].flatMap(([id, operations]) => {
    const latest = operations.at(-1);

    return latest && isSettled(id, latest.change)
      ? [[id, latest] as const]
      : [];
  });

  // Drop operations `views` now reflects, so later changes to those views
  // (from another tab, a refetch, an undo) show through.
  if (settled.length > 0) {
    setPending((current) => {
      const next = new Map(current);

      for (const [id, latest] of settled) {
        if (next.get(id)?.at(-1) === latest) {
          next.delete(id);
        }
      }

      return next;
    });
  }

  const views = useMemo(() => {
    const open = new Map(
      [...pending].flatMap(([id, operations]) => {
        const latest = operations.at(-1);

        return latest &&
          !settled.some(
            ([settledId, settledLatest]) =>
              settledId === id && settledLatest === latest,
          )
          ? [[id, latest.change] as const]
          : [];
      }),
    );
    const merged = viewsProp.flatMap((view) => {
      if (!open.has(view.id)) {
        return [view];
      }

      const change = open.get(view.id);

      return change ? [change] : [];
    });

    for (const [id, change] of open) {
      if (change && !viewsProp.some((view) => view.id === id)) {
        merged.push(change);
      }
    }

    return merged;
    // `settled` is derived from `pending` and `viewsProp`.
  }, [pending, viewsProp]);

  const setActive = useCallback(
    (id: string | null) => {
      setActiveInternal(id);
      onActiveViewChange?.(id);
    },
    [onActiveViewChange],
  );
  const activeRef = useRef(activeViewId);

  activeRef.current = activeViewId;

  const record = (
    view: SavedView,
    change: SavedView | null,
    persist: void | Promise<unknown>,
    {
      active,
      create = false,
    }: {
      // On rollback, restore the active view `to` if it is still `from`.
      active?: { from: string | null; to: string | null };
      create?: boolean;
    } = {},
  ) => {
    const operation: PendingOperation = { change, create };

    setPending((current) =>
      new Map(current).set(view.id, [
        ...(current.get(view.id) ?? []),
        operation,
      ]),
    );

    // A rejected operation rolls back to the newest one still in flight, or
    // to the persisted view. A rejected create takes later ones with it.
    if (persist && typeof persist.then === "function") {
      persist.then(undefined, () => {
        setPending((current) => {
          const operations = current.get(view.id);

          if (!operations?.includes(operation)) {
            return current;
          }

          const rest = create
            ? []
            : operations.filter((candidate) => candidate !== operation);
          const next = new Map(current);

          if (rest.length > 0) {
            next.set(view.id, rest);
          } else {
            next.delete(view.id);
          }

          return next;
        });

        if (active && activeRef.current === active.from) {
          setActive(active.to);
        }
      });
    }
  };

  const viewFilter = useCallback(
    (view: SavedView) =>
      migrate && view.version < version
        ? normalizeFilter(migrate(view.filter, view.version))
        : view.filter,
    [migrate, version],
  );

  const activeView = views.find((view) => view.id === activeViewId);
  const effective = (filter: Filter) =>
    getFilterSignature(normalizeFilter(pruneFilter(filter, fields)));
  const isDirty =
    activeView !== undefined &&
    effective(viewFilter(activeView)) !== effective(state.filter);
  // Compare under one root id: the root is the same filter either way.
  const pruned = pruneFilter(state.filter, fields);
  // diffFilter matches by id; give the view's nodes the ids of matching
  // nodes in the current filter so only real changes show.
  const diff = activeView
    ? diffFilter(
        reconcileFilterIds(viewFilter(activeView), pruned, {
          // Stable across renders: the diff is compared, never stored.
          createId: (node) => `${node.id}~view`,
        }),
        pruned,
      )
    : emptyDiff;

  const snapshot = (): Filter => pruneFilter(state.filter, fields);

  return {
    views,
    activeViewId,
    activeView,
    isDirty,
    diff: isDirty ? diff : emptyDiff,
    apply: (id) => {
      const view = views.find((candidate) => candidate.id === id);

      if (!view) {
        return;
      }

      const next = viewFilter(view);

      if (effective(next) !== effective(state.filter)) {
        state.setFilter(reconcileFilterIds(next, state.filter));
      }

      setActive(id);
    },
    save: () => {
      if (!activeView) {
        return;
      }

      const next = { ...activeView, filter: snapshot(), version };

      record(activeView, next, onUpdate?.(next));
    },
    saveAs: (name, { meta, scope } = {}) => {
      const view: SavedView = {
        id: createId(),
        name,
        filter: snapshot(),
        version,
        ...(scope ? { scope } : {}),
        ...(meta ? { meta } : {}),
      };

      const persist = onCreate?.(view);

      if (persist && typeof persist.then === "function") {
        const creating = creatingRef.current;

        creating.set(view.id, persist);
        persist.then(
          () => creating.delete(view.id),
          () => creating.delete(view.id),
        );
      }

      record(view, view, persist, {
        active: { from: view.id, to: activeViewId },
        create: true,
      });
      setActive(view.id);

      return view;
    },
    rename: (id, name) => {
      const view = views.find((candidate) => candidate.id === id);

      if (!view || view.name === name) {
        return;
      }

      const next = { ...view, name };

      record(view, next, onUpdate?.(next));
    },
    remove: (id) => {
      const view = views.find((candidate) => candidate.id === id);

      if (!view) {
        return;
      }

      const creating = creatingRef.current.get(id);
      let persist: void | Promise<unknown>;

      if (creating && !viewsProp.some((candidate) => candidate.id === id)) {
        // Delete once the create lands; if it fails there is nothing to
        // delete and the tombstone can go.
        setAwaitingCreate((current) => new Set(current).add(id));
        persist = creating.then(
          // However the delete ends, stop waiting: a refetch may never show
          // the view at all.
          () =>
            Promise.resolve(onDelete?.(view)).finally(() => {
              stopAwaiting(id);
            }),
          () => {
            // The failed create already removed this view's operations.
            stopAwaiting(id);
          },
        );
      } else {
        persist = onDelete?.(view);
      }

      record(
        view,
        null,
        persist,
        id === activeViewId ? { active: { from: null, to: id } } : {},
      );

      if (id === activeViewId) {
        setActive(null);
      }
    },
    deselect: () => {
      setActive(null);
    },
  };
}
