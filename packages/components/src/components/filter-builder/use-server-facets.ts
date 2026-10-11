import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  getFilterFacetFilter,
  getFilterSignature,
  type FilterFacetTarget,
} from "./filter-core";
import type { Filter, FilterFields } from "./filter-types";

/** What a server facet request asks for. */
export interface FilterFacetRequest {
  /** Field whose option counts are wanted. */
  field: string;
  /**
   * The filter to count under: the current filter without the condition the
   * counts are for, only active conditions, normalized.
   */
  filter: Filter;
  signal: AbortSignal;
}

/** Counts per option value, in any of these shapes. */
export type FilterFacetCounts =
  | ReadonlyMap<string, number>
  | Readonly<Record<string, number>>
  | readonly { value: string; count: number }[];

export type GetFilterFacets = (
  request: FilterFacetRequest,
) => Promise<FilterFacetCounts>;

export type FilterFacetStatus = "loading" | "ready" | "error" | "unsupported";

export interface ServerFacets {
  getFacets: (
    fieldKey: string,
    target?: FilterFacetTarget,
  ) => ReadonlyMap<string, number> | undefined;
  getFacetStatus: (
    fieldKey: string,
    target?: FilterFacetTarget,
  ) => FilterFacetStatus;
}

interface Entry {
  status: "loading" | "ready" | "error";
  counts?: ReadonlyMap<string, number>;
  /** When an error happened, for retries. */
  at?: number;
}

const MAX_ENTRIES = 60;

// Layout effects mark the bar mounted before a render's microtask runs;
// on the server (no effects run) plain useEffect avoids React 18's warning.
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;
/** A failed request is asked again after this long, on the next render. */
const RETRY_AFTER = 10_000;

function toMap(counts: FilterFacetCounts): ReadonlyMap<string, number> {
  if (counts instanceof Map) {
    return counts;
  }

  if (Array.isArray(counts)) {
    return new Map(
      (counts as readonly { value: string; count: number }[]).map((item) => [
        String(item.value),
        Number(item.count) || 0,
      ]),
    );
  }

  return new Map(
    Object.entries(counts as Record<string, number>).map(([key, count]) => [
      key,
      Number(count) || 0,
    ]),
  );
}

function stringifyKey(value: unknown) {
  try {
    return JSON.stringify(value) ?? "";
  } catch {
    return String(value);
  }
}

/**
 * Facet counts from your server. Pickers ask for a field's counts while
 * they render; each (facetsKey, field, filter) is requested once, cached,
 * and aborted when no longer needed. `getFacets` is read through a ref, so
 * an inline function is fine; change `facetsKey` (e.g. a time range or a
 * data version) when the same filter should count differently. `facetsKey`
 * is compared as JSON, so use a primitive or plain JSON value (not a Map,
 * Set, class instance or function). Until counts
 * arrive the status is "loading", so pickers can reserve their space.
 */
export function useServerFacets<TData>({
  facetsKey,
  fields,
  filter,
  getFacets: fetchFacets,
}: {
  fields: FilterFields<TData>;
  filter: Filter;
  getFacets?: GetFilterFacets;
  facetsKey?: unknown;
}): ServerFacets | undefined {
  const [entries, setEntries] = useState<ReadonlyMap<string, Entry>>(
    () => new Map(),
  );
  const wantedRef = useRef(
    new Map<
      string,
      { field: string; filter: Filter; fetcher: GetFilterFacets }
    >(),
  );
  const inFlightRef = useRef(new Map<string, AbortController>());
  const fetchRef = useRef(fetchFacets);
  const entriesRef = useRef(entries);
  const scheduledRef = useRef(false);
  const mountedRef = useRef(false);
  const source = stringifyKey(facetsKey);
  const sourceRef = useRef(source);

  fetchRef.current = fetchFacets;
  entriesRef.current = entries;
  sourceRef.current = source;

  // Aborts in-flight requests for a facetsKey that is no longer current:
  // their entries are then forgotten, so a later render asks again.
  useEffect(() => {
    const inFlight = inFlightRef.current;

    // Only this key's requests: ones for the next key may already run.
    const prefix = `${source}\u0000`;

    return () => {
      for (const [key, controller] of inFlight) {
        if (key.startsWith(prefix)) {
          controller.abort();
          inFlight.delete(key);
        }
      }
    };
  }, [source]);

  // Starts requests that renders asked for. Pickers render in their own
  // commits (popovers), so this runs from a microtask, not an effect here.
  // Only while mounted (requests asked for before the commit wait for it),
  // and only for the current facetsKey.
  const flush = useCallback(() => {
    scheduledRef.current = false;

    if (!mountedRef.current) {
      return;
    }

    const wanted = [...wantedRef.current];
    const prefix = `${sourceRef.current}\u0000`;

    wantedRef.current.clear();

    for (const [key, request] of wanted) {
      if (!key.startsWith(prefix)) {
        continue;
      }

      const existing = entriesRef.current.get(key);

      if (
        inFlightRef.current.has(key) ||
        existing?.status === "ready" ||
        (existing?.status === "error" &&
          Date.now() - (existing.at ?? 0) < RETRY_AFTER)
      ) {
        continue;
      }

      const controller = new AbortController();

      inFlightRef.current.set(key, controller);
      setEntries((current) => new Map(current).set(key, { status: "loading" }));

      const settle = (entry: Entry) => {
        if (inFlightRef.current.get(key) === controller) {
          inFlightRef.current.delete(key);
        }

        setEntries((current) => {
          const next = new Map(current);

          if (controller.signal.aborted) {
            // Forget the pending entry so a later render asks again.
            if (next.get(key)?.status === "loading") {
              next.delete(key);
            }

            return next;
          }

          next.delete(key);
          next.set(key, entry);

          // Keep the cache small: drop the oldest entries.
          while (next.size > MAX_ENTRIES) {
            const oldest = next.keys().next().value;

            if (oldest === undefined) {
              break;
            }

            next.delete(oldest);
          }

          return next;
        });
      };

      Promise.resolve()
        .then(() =>
          request.fetcher({
            field: request.field,
            filter: request.filter,
            signal: controller.signal,
          }),
        )
        .then(
          (counts) => {
            settle({ status: "ready", counts: toMap(counts) });
          },
          () => {
            settle({ status: "error", at: Date.now() });
          },
        );
    }
  }, []);

  const schedule = useCallback(() => {
    if (!scheduledRef.current) {
      scheduledRef.current = true;
      queueMicrotask(flush);
    }
  }, [flush]);

  // Mounted (or shown again after Activity hid it): start what renders
  // asked for meanwhile. Unmounted (or hidden): abort everything.
  useIsomorphicLayoutEffect(() => {
    const inFlight = inFlightRef.current;

    mountedRef.current = true;

    if (wantedRef.current.size > 0) {
      schedule();
    }

    return () => {
      mountedRef.current = false;

      for (const controller of inFlight.values()) {
        controller.abort();
      }

      inFlight.clear();
    };
  }, [schedule]);

  const enabled = fetchFacets !== undefined;

  return useMemo(() => {
    if (!enabled) {
      return undefined;
    }

    const lookup = (fieldKey: string, target?: FilterFacetTarget) => {
      const facetFilter = getFilterFacetFilter(
        filter,
        fields,
        fieldKey,
        target,
      );

      if (!facetFilter) {
        return { supported: false, entry: undefined };
      }

      const key = `${source}\u0000${fieldKey}\u0000${getFilterSignature(facetFilter)}`;
      const entry = entries.get(key);
      const retry =
        entry?.status === "error" &&
        Date.now() - (entry.at ?? 0) >= RETRY_AFTER;

      // Asked for during render; a microtask starts the request, with the
      // getFacets of this render. Never on the server.
      const fetcher = fetchRef.current;

      if ((!entry || retry) && fetcher && typeof window !== "undefined") {
        wantedRef.current.set(key, {
          field: fieldKey,
          filter: facetFilter,
          fetcher,
        });
        schedule();
      }

      return { supported: true, entry };
    };

    return {
      getFacets: (fieldKey, target) => lookup(fieldKey, target).entry?.counts,
      getFacetStatus: (fieldKey, target) => {
        const { entry, supported } = lookup(fieldKey, target);

        return supported ? (entry?.status ?? "loading") : "unsupported";
      },
    };
  }, [enabled, entries, fields, filter, schedule, source]);
}
