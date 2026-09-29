"use client";

import { useEffect, useState } from "react";
import type { Filter } from "@dethink/components";

/**
 * Fetches rows for a filter, keeping the last result on screen while the
 * next one loads (no layout shift), and aborting stale requests.
 */
export function useServerRows<TData>(
  filter: Filter,
  search: (request: {
    filter: Filter;
    signal: AbortSignal;
  }) => Promise<{ rows: TData[]; total: number }>,
) {
  const [response, setResponse] = useState<{
    filter: Filter;
    result?: { rows: TData[]; total: number };
    failed: boolean;
  }>();

  useEffect(() => {
    const controller = new AbortController();

    search({ filter, signal: controller.signal }).then(
      (result) => {
        setResponse({ filter, result, failed: false });
      },
      () => {
        if (!controller.signal.aborted) {
          setResponse((current) => ({ ...current, filter, failed: true }));
        }
      },
    );

    return () => {
      controller.abort();
    };
  }, [filter, search]);

  const result = response?.result;

  return {
    rows: result?.rows ?? [],
    total: result?.total,
    /** True until the first result arrives. */
    initial: result === undefined && !response?.failed,
    // Pending until the response is for the filter on screen now.
    pending: response?.filter !== filter,
    failed: response?.filter === filter && response.failed,
  };
}
