import {
  createFilterPredicate,
  getFilterField,
  readFilterFieldValue,
  type Filter,
  type FilterEvaluateOptions,
  type FilterFacetRequest,
  type FilterFields,
} from "@dethink/components";

/**
 * A pretend server for the examples. The browser sends the filter as plain
 * JSON; the "server" evaluates it (a real one would translate it to SQL or
 * Prisma, see the docs) and returns one page plus the total.
 */
export function createMockFilterApi<TData>(
  rows: readonly TData[],
  fields: FilterFields<TData>,
  {
    latency = 450,
    ...evaluateOptions
  }: FilterEvaluateOptions & { latency?: number } = {},
) {
  const wait = (signal: AbortSignal) =>
    new Promise<void>((resolve, reject) => {
      const timer = setTimeout(resolve, latency);

      signal.addEventListener("abort", () => {
        clearTimeout(timer);
        reject(new DOMException("Aborted", "AbortError"));
      });
    });

  return {
    async search({
      filter,
      pageSize = 50,
      signal,
    }: {
      filter: Filter;
      pageSize?: number;
      signal: AbortSignal;
    }) {
      // Round-trip through JSON, as a request body would.
      const received = JSON.parse(JSON.stringify(filter)) as Filter;

      await wait(signal);

      const matches = rows.filter(
        createFilterPredicate(received, fields, evaluateOptions),
      );

      return { rows: matches.slice(0, pageSize), total: matches.length };
    },

    async facets({ field: fieldKey, filter, signal }: FilterFacetRequest) {
      const received = JSON.parse(JSON.stringify(filter)) as Filter;

      await wait(signal);

      const field = getFilterField(fields, fieldKey);
      const counts: Record<string, number> = {};

      if (!field) {
        return counts;
      }

      const predicate = createFilterPredicate(
        received,
        fields,
        evaluateOptions,
      );

      for (const row of rows) {
        if (!predicate(row)) {
          continue;
        }

        const value = readFilterFieldValue(field, row);

        for (const key of Array.isArray(value) ? value : [value]) {
          if (key !== null && key !== undefined && key !== "") {
            counts[String(key)] = (counts[String(key)] ?? 0) + 1;
          }
        }
      }

      return counts;
    },
  };
}
