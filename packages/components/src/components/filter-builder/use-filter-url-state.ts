import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  createFilter,
  decodeFilterParam,
  encodeFilterParam,
  formatFilterSearch,
  isSameFilterSearch,
  printFilterQuery,
  reconcileFilterIds,
  type FilterParamError,
  type FilterParamOptions,
} from "./filter-core";
import {
  createHistoryFilterStore,
  type FilterUrlStore,
} from "./filter-url-store";
import type { Filter, FilterFields } from "./filter-types";
import { useFilterState, type FilterState } from "./use-filter-state";

export interface UseFilterUrlStateOptions<
  TData = unknown,
> extends FilterParamOptions<TData> {
  fields: FilterFields<TData>;
  /** Where the search string lives. Defaults to the page URL (History API). */
  store?: FilterUrlStore;
  /**
   * The search string the server rendered with, e.g. from Next.js
   * `searchParams`. Without it the server renders `defaultValue` and the
   * URL filter applies right after hydration, without a mismatch.
   */
  initialSearch?: string;
  /** Filter when the URL has none. It is left out of the URL. */
  defaultValue?: Filter;
  onValueChange?: (filter: Filter) => void;
  historyLimit?: number;
  /**
   * How long after the last write the hook still recognizes its own writes
   * coming back from a slow store. Defaults to 2000 ms.
   */
  writeTimeout?: number;
}

export interface FilterUrlState extends FilterState {
  /** Why the URL's filter could not be read; the filter is left as is. */
  urlError?: FilterParamError;
}

let defaultStore: FilterUrlStore | undefined;

function getDefaultStore() {
  defaultStore ??= createHistoryFilterStore();

  return defaultStore;
}

/**
 * `useFilterState` that mirrors the filter into the URL as readable text
 * with a schema version (`?q=status:open&v=1`), and follows the URL when it
 * changes (back, forward, pasted links). Undo still works; URL changes from
 * outside are not undo steps. Links from older versions migrate through
 * `fieldsAt` and `migrate`.
 */
export function useFilterUrlState<TData>({
  defaultValue,
  fields,
  historyLimit,
  initialSearch = "",
  onValueChange,
  store: storeProp,
  writeTimeout = 2000,
  ...codec
}: UseFilterUrlStateOptions<TData>): FilterUrlState {
  const store = storeProp ?? getDefaultStore();
  const search = useSyncExternalStore(
    store.subscribe,
    store.read,
    () => initialSearch,
  );
  const latest = useRef({ codec, defaultValue, fields });

  latest.current = { codec, defaultValue, fields };

  const fallback = () =>
    latest.current.defaultValue ?? createFilter({ id: "root" });
  const hasParam = (value: string) =>
    new URLSearchParams(value).has(latest.current.codec.param ?? "q");
  const read = (value: string) => {
    const result = decodeFilterParam(
      value,
      latest.current.fields,
      latest.current.codec,
    );

    return result.ok && !hasParam(value)
      ? { ...result, filter: fallback() }
      : result;
  };

  const [initial] = useState(() => read(search));
  const state = useFilterState({
    defaultValue: initial.ok ? initial.filter : fallback(),
    historyLimit,
    onValueChange,
  });
  const [urlError, setUrlError] = useState(
    initial.ok ? undefined : initial.error,
  );
  // The URL the filter should have now: the last search written, or the last
  // outside change applied. Writes build on it and compare against it, never
  // against echoes still expected back.
  const intendedSearchRef = useRef(search);
  // The last filter the URL already reflects: the initial one, or one
  // applied from the URL. Only other filters are written, which also keeps
  // StrictMode's repeated effects from writing on mount.
  const writtenFilterRef = useRef(state.filter);
  // Searches written but not yet seen back. Routers may deliver writes
  // late; an older write coming back is ours, not an outside change.
  // Entries expire (see `writeTimeout`), since a router that merges writes
  // may never report some of them, and an old entry must not swallow a
  // later real navigation.
  const pendingWritesRef = useRef<string[]>([]);
  const lastWriteAtRef = useRef(0);
  const stateRef = useRef(state);

  stateRef.current = state;

  const print = (filter: Filter) =>
    printFilterQuery(filter, latest.current.fields, latest.current.codec);

  // URL → filter: a link, back/forward, or the client URL after hydration.
  useEffect(() => {
    // Forget writes only once none has been made for a while, so a slow
    // router that is still catching up on a burst of edits isn't mistaken
    // for an outside change.
    if (Date.now() - lastWriteAtRef.current >= writeTimeout) {
      pendingWritesRef.current = [];
    }

    const pending = pendingWritesRef.current;

    const echo = pending.findIndex((written) =>
      isSameFilterSearch(written, search),
    );

    if (echo !== -1) {
      // Our own write arriving. Remove only that one: writes can land out of
      // order, and an older one arriving later is still ours.
      pendingWritesRef.current = pending.filter((_, index) => index !== echo);
      return;
    }

    if (isSameFilterSearch(search, intendedSearchRef.current)) {
      return;
    }

    // An outside change wins over writes still in flight.
    pendingWritesRef.current = [];
    intendedSearchRef.current = search;

    const result = read(search);

    if (!result.ok) {
      setUrlError(result.error);
      return;
    }

    setUrlError(undefined);

    const current = stateRef.current.filter;

    // Same text: keep the filter, including chips that have no value yet.
    if (print(result.filter) === print(current)) {
      return;
    }

    const next = reconcileFilterIds(result.filter, current);

    writtenFilterRef.current = next;
    stateRef.current.setFilter(next, { history: false });
    // Reads options through `latest`, so only the search matters here.
  }, [search]);

  // Filter → URL, except for the initial filter and ones from the URL.
  useEffect(() => {
    if (writtenFilterRef.current === state.filter) {
      return;
    }

    writtenFilterRef.current = state.filter;

    const { codec: options, fields: schema } = latest.current;
    const current = intendedSearchRef.current;
    const params = encodeFilterParam(state.filter, schema, options, current);
    const param = options.param ?? "q";

    if (print(state.filter) === print(fallback())) {
      // The default filter keeps the URL clean.
      params.delete(param);
      params.delete(options.versionParam ?? "v");
    } else if (!params.has(param)) {
      // An empty filter that differs from the default still needs a param.
      params.set(param, "");
      params.set(options.versionParam ?? "v", String(options.version ?? 1));
    }

    const next = formatFilterSearch(params);

    if (!isSameFilterSearch(next, current)) {
      intendedSearchRef.current = next;
      pendingWritesRef.current = [...pendingWritesRef.current, next];
      lastWriteAtRef.current = Date.now();
      store.write(next);
    }

    setUrlError(undefined);
  }, [state.filter, store]);

  return useMemo(
    () => (urlError ? { ...state, urlError } : state),
    [state, urlError],
  );
}
