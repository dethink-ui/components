import { normalizeFilter } from "./filter-commands";
import { createFilter } from "./filter-model";
import {
  parseFilterQuery,
  printFilterQuery,
  type FilterQueryOptions,
} from "./filter-query";
import type { FilterQueryError } from "./filter-query-values";
import { validateFilter } from "./filter-validate";
import type {
  Filter,
  FilterCondition,
  FilterFields,
  FilterNode,
} from "./filter-types";

/**
 * Versioned URL state for filters. The filter is written as its text query
 * (`?q=status:open created:>-7d&v=2`), so links stay readable, and the
 * schema version lets old links migrate when fields or operators are
 * renamed.
 */

export interface FilterParamOptions<
  TData = unknown,
> extends FilterQueryOptions {
  /** Current schema version, written as `v`. Defaults to 1. */
  version?: number;
  /** Search param for the query text. Defaults to "q". */
  param?: string;
  /** Search param for the version. Defaults to "v". */
  versionParam?: string;
  /**
   * The field schema a link from an older version was written with, used to
   * parse its text. Defaults to the current fields. For a renamed field,
   * return the fields with the old key.
   */
  fieldsAt?: (version: number) => FilterFields<TData>;
  /**
   * Upgrades a filter parsed at `fromVersion` to the current schema, e.g.
   * with `renameFilterField`. Runs only for older versions.
   */
  migrate?: (filter: Filter, fromVersion: number) => Filter;
}

export type FilterParamErrorCode =
  "invalid-version" | "future-version" | "invalid-query" | "invalid-filter";

export interface FilterParamError {
  code: FilterParamErrorCode;
  message: string;
  /** The parse error, for `invalid-query`. */
  query?: FilterQueryError;
}

export type FilterParamResult =
  | {
      ok: true;
      filter: Filter;
      /** Version the link was written with. */
      version: number;
      /** Whether `migrate` ran. */
      migrated: boolean;
    }
  | { ok: false; error: FilterParamError };

function toParams(search: URLSearchParams | string) {
  return new URLSearchParams(
    typeof search === "string" ? search : search.toString(),
  );
}

/**
 * Search params with the filter written into them. Other params are kept.
 * An empty filter removes both params, so a cleared filter leaves a clean
 * URL.
 */
export function encodeFilterParam<TData>(
  filter: Filter,
  fields: FilterFields<TData>,
  {
    param = "q",
    version = 1,
    versionParam = "v",
    ...options
  }: FilterParamOptions<TData> = {},
  search: URLSearchParams | string = "",
): URLSearchParams {
  const params = toParams(search);
  const text = printFilterQuery(filter, fields, options);

  if (text === "") {
    params.delete(param);
    params.delete(versionParam);
  } else {
    params.set(param, text);
    params.set(versionParam, String(version));
  }

  return params;
}

/**
 * Reads a filter from search params. A missing query is an empty filter; a
 * missing version is the current one. Older links are parsed with
 * `fieldsAt(version)` and upgraded with `migrate`, then checked against the
 * current fields, so a link can never produce unknown fields or operators.
 */
export function decodeFilterParam<TData>(
  search: URLSearchParams | string,
  fields: FilterFields<TData>,
  {
    fieldsAt,
    migrate,
    param = "q",
    version: current = 1,
    versionParam = "v",
    ...options
  }: FilterParamOptions<TData> = {},
): FilterParamResult {
  const params = toParams(search);
  const text = params.get(param) ?? "";
  const rawVersion = params.get(versionParam);
  const version = rawVersion === null ? current : Number(rawVersion);

  if (!Number.isInteger(version) || version < 1) {
    return {
      ok: false,
      error: {
        code: "invalid-version",
        message: `Unknown filter version "${rawVersion}"`,
      },
    };
  }

  if (version > current) {
    return {
      ok: false,
      error: {
        code: "future-version",
        message: `This link uses filter version ${version}; this page reads up to ${current}`,
      },
    };
  }

  const older = version < current;
  const parsed = parseFilterQuery(
    text,
    older && fieldsAt ? fieldsAt(version) : fields,
    options,
  );

  if (!parsed.ok) {
    return {
      ok: false,
      error: {
        code: "invalid-query",
        message: parsed.error.message,
        query: parsed.error,
      },
    };
  }

  const migrated = older && migrate !== undefined;
  const filter = migrated
    ? normalizeFilter(migrate(parsed.filter, version))
    : parsed.filter;
  const issue = validateFilter(filter, fields, {
    maxDepth: options.maxDepth,
  }).find(
    (candidate) =>
      candidate.code === "unknown-field" ||
      candidate.code === "unknown-operator" ||
      candidate.code === "invalid-value" ||
      candidate.code === "max-depth",
  );

  if (issue) {
    return {
      ok: false,
      error: { code: "invalid-filter", message: issue.message },
    };
  }

  return { ok: true, filter, version, migrated };
}

/** Decoded filter, or `fallback` (default: empty) when the link is invalid. */
export function readFilterParam<TData>(
  search: URLSearchParams | string,
  fields: FilterFields<TData>,
  options?: FilterParamOptions<TData>,
  fallback: Filter = createFilter({ id: "root" }),
): Filter {
  const result = decodeFilterParam(search, fields, options);

  return result.ok ? result.filter : fallback;
}

/**
 * Renames a field in every condition, for `migrate`. Pass `operators` to
 * rename operator ids of that field at the same time.
 */
export function renameFilterField(
  filter: Filter,
  from: string,
  to: string,
  operators: Record<string, string> = {},
): Filter {
  const rename = (node: FilterNode): FilterNode => {
    if (node.type === "group") {
      return { ...node, children: node.children.map(rename) };
    }

    if (node.field !== from) {
      return node;
    }

    const condition: FilterCondition = {
      ...node,
      field: to,
      operator: operators[node.operator] ?? node.operator,
    };

    return condition;
  };

  return rename(filter) as Filter;
}

// Characters left readable in the query string: safe in a URL query and
// kept as-is by browsers (unlike < > ', which location.search re-encodes).
const READABLE = /%(3A|2C|40|21|24|28|29|5E|7E|2A)/gi;

/**
 * "?key=value…" for search params, keeping filter syntax readable
 * (`q=status:open,blocked+created:%3E-7d`), or "" when there are none.
 */
export function formatFilterSearch(params: URLSearchParams): string {
  const parts: string[] = [];

  params.forEach((value, key) => {
    const encode = (text: string) =>
      encodeURIComponent(text)
        .replace(/%20/g, "+")
        .replace(READABLE, (match) => decodeURIComponent(match));

    parts.push(`${encode(key)}=${encode(value)}`);
  });

  return parts.length === 0 ? "" : `?${parts.join("&")}`;
}

/** Whether two search strings hold the same params, however encoded. */
export function isSameFilterSearch(a: string, b: string) {
  return (
    new URLSearchParams(a).toString() === new URLSearchParams(b).toString()
  );
}
