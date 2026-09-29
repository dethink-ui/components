import { isSameFilterSearch } from "./filter-url";

/**
 * Where `useFilterUrlState` reads and writes the search string. Stores are
 * plain objects, so any router can provide one: see the docs for nuqs and
 * Next.js recipes.
 */
export interface FilterUrlStore {
  /** The current search string, e.g. "?q=status:open&v=1" (or ""). */
  read: () => string;
  /** Replaces the search string. */
  write: (search: string) => void;
  /** Calls `onChange` when the search changes; returns an unsubscribe. */
  subscribe: (onChange: () => void) => () => void;
}

function normalizeSearch(search: string) {
  const trimmed = search.startsWith("?") ? search.slice(1) : search;

  return trimmed === "" ? "" : `?${trimmed}`;
}

/**
 * The current history state without routers' "this is my own call" markers.
 * Next.js skips syncing its router for states carrying `__NA`/`_N` and would
 * later restore its stale URL, dropping the filter; without them it copies
 * its internals back and follows the new URL. Other keys are kept.
 */
function historyState() {
  const current: unknown = window.history.state;

  if (!current || typeof current !== "object") {
    return current ?? null;
  }

  const { __NA: _na, _N: _n, ...rest } = current as Record<string, unknown>;

  return rest;
}

/**
 * A store over `window.location` and the History API. Writes use
 * `history.replaceState` by default, so filter edits don't flood the back
 * stack; pass `mode: "push"` to make each change a history entry. Back and
 * forward (`popstate`) are picked up. On the server, `read` returns "".
 */
export function createHistoryFilterStore({
  mode = "replace",
}: { mode?: "replace" | "push" } = {}): FilterUrlStore {
  const listeners = new Set<() => void>();
  const notify = () => {
    for (const listener of listeners) {
      listener();
    }
  };

  return {
    read: () =>
      typeof window === "undefined"
        ? ""
        : normalizeSearch(window.location.search),
    write: (search) => {
      if (typeof window === "undefined") {
        return;
      }

      const next = normalizeSearch(search);

      if (isSameFilterSearch(next, window.location.search)) {
        return;
      }

      const url = `${window.location.pathname}${next}${window.location.hash}`;
      const state = historyState();

      if (mode === "push") {
        window.history.pushState(state, "", url);
      } else {
        window.history.replaceState(state, "", url);
      }

      notify();
    },
    subscribe: (onChange) => {
      listeners.add(onChange);

      if (typeof window !== "undefined") {
        window.addEventListener("popstate", onChange);
      }

      return () => {
        listeners.delete(onChange);

        if (typeof window !== "undefined") {
          window.removeEventListener("popstate", onChange);
        }
      };
    },
  };
}

/**
 * An in-memory store, for tests, previews, SSR and embedded views that
 * should not touch the page URL.
 */
export function createMemoryFilterStore(initialSearch = ""): FilterUrlStore {
  let search = normalizeSearch(initialSearch);
  const listeners = new Set<() => void>();

  return {
    read: () => search,
    write: (next) => {
      const normalized = normalizeSearch(next);

      if (isSameFilterSearch(normalized, search)) {
        return;
      }

      search = normalized;

      for (const listener of listeners) {
        listener();
      }
    },
    subscribe: (onChange) => {
      listeners.add(onChange);

      return () => {
        listeners.delete(onChange);
      };
    },
  };
}
