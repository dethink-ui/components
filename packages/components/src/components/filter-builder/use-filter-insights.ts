import { useMemo } from "react";
import {
  computeFilterFacets,
  computeFilterImpact,
  countFilterMatches,
  findFilterRescue,
  type FilterFacetTarget,
  type FilterRescue,
} from "./filter-core";
import type {
  FilterEvaluateOptions,
  FilterFields,
  FilterNode,
} from "./filter-types";

export interface UseFilterInsightsOptions<TData> {
  /** Rows to count against. Without rows, every insight is undefined. */
  data?: readonly TData[];
  filter: FilterNode;
  fields: FilterFields<TData>;
  evaluateOptions?: FilterEvaluateOptions;
  /** Compute per-condition impact counts. */
  impact?: boolean;
  /** Suggest the most restrictive condition when nothing matches. */
  rescue?: boolean;
}

export interface FilterInsights {
  /** Matching rows, when rows were given. */
  count?: number;
  /**
   * Rows per value of a field under the rest of the filter. Pass the target
   * condition (or the group a new one joins) for counts that match the pick;
   * undefined where counts would be wrong. See `computeFilterFacets`.
   */
  getFacets?: (
    fieldKey: string,
    target?: FilterFacetTarget,
  ) => ReadonlyMap<string, number> | undefined;
  /**
   * Rows removed by each active condition, keyed by condition id. Negative
   * when the condition adds rows (an OR branch).
   */
  impact?: ReadonlyMap<string, number>;
  rescue?: FilterRescue;
}

/**
 * Client-side counts for a filter over `data`: result count, facet counts
 * (computed lazily per field and cached until the filter or rows change),
 * per-condition impact, and an empty-result rescue. Costs grow with rows ×
 * conditions; for large or server-side data, pass counts from your API.
 */
export function useFilterInsights<TData>({
  data,
  evaluateOptions,
  fields,
  filter,
  impact: withImpact = false,
  rescue: withRescue = true,
}: UseFilterInsightsOptions<TData>): FilterInsights {
  const count = useMemo(
    () =>
      data
        ? countFilterMatches(data, filter, fields, evaluateOptions)
        : undefined,
    [data, evaluateOptions, fields, filter],
  );

  const getFacets = useMemo(() => {
    if (!data) {
      return undefined;
    }

    const cache = new Map<string, ReadonlyMap<string, number> | undefined>();

    return (fieldKey: string, target?: FilterFacetTarget) => {
      const key = JSON.stringify([
        fieldKey,
        target?.conditionId,
        target?.parentId,
        target?.operator,
      ]);
      let facets = cache.get(key);

      if (!cache.has(key)) {
        facets = computeFilterFacets(data, filter, fields, fieldKey, {
          ...evaluateOptions,
          target,
        });
        cache.set(key, facets);
      }

      return facets;
    };
  }, [data, evaluateOptions, fields, filter]);

  const impact = useMemo(
    () =>
      data && withImpact
        ? computeFilterImpact(data, filter, fields, evaluateOptions)
        : undefined,
    [data, evaluateOptions, fields, filter, withImpact],
  );

  const rescue = useMemo(
    () =>
      data && withRescue && count === 0
        ? findFilterRescue(data, filter, fields, evaluateOptions)
        : undefined,
    [count, data, evaluateOptions, fields, filter, withRescue],
  );

  return { count, getFacets, impact, rescue };
}
