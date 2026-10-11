import {
  createFilterPredicate,
  type Filter,
  type FilterAssistantRequest,
  type FilterAssistantResult,
  type FilterFacetRequest,
} from "@dethink/components";
import {
  LOGS_NOW,
  logFields,
  logs,
  timeRanges,
  type LogEntry,
  type LogLevel,
  type TimeRangeId,
} from "./logs-dashboard-data";

export interface LogBucket {
  start: number;
  counts: Record<LogLevel, number>;
}

export interface LogSearchResult {
  rows: LogEntry[];
  total: number;
  buckets: LogBucket[];
}

const BUCKETS = 36;
const LATENCY = 350;

function wait(signal: AbortSignal, ms = LATENCY) {
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms);

    signal.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });
}

function inRange(range: TimeRangeId) {
  const minutes =
    timeRanges.find((candidate) => candidate.id === range)?.minutes ?? 60;
  const from = LOGS_NOW - minutes * 60_000;

  return { from, test: (entry: LogEntry) => entry.time > from };
}

/**
 * The pretend log backend. The filter arrives as JSON (as it would over
 * HTTP); the time range is a separate parameter, like most log tools.
 */
export const logsApi = {
  async search({
    filter,
    range,
    signal,
  }: {
    filter: Filter;
    range: TimeRangeId;
    signal: AbortSignal;
  }): Promise<LogSearchResult> {
    const received = JSON.parse(JSON.stringify(filter)) as Filter;

    await wait(signal);

    const { from, test } = inRange(range);
    const predicate = createFilterPredicate(received, logFields);
    const matches = logs.filter((entry) => test(entry) && predicate(entry));
    const size = (LOGS_NOW - from) / BUCKETS;
    const buckets: LogBucket[] = Array.from(
      { length: BUCKETS },
      (_, index) => ({
        start: from + index * size,
        counts: { error: 0, warn: 0, info: 0, debug: 0 },
      }),
    );

    for (const entry of matches) {
      const index = Math.min(
        BUCKETS - 1,
        Math.floor((entry.time - from) / size),
      );

      buckets[index]!.counts[entry.level] += 1;
    }

    return { rows: matches.slice(0, 100), total: matches.length, buckets };
  },

  facets(range: TimeRangeId) {
    return async ({ field, filter, signal }: FilterFacetRequest) => {
      const received = JSON.parse(JSON.stringify(filter)) as Filter;

      await wait(signal, 250);

      const { test } = inRange(range);
      const predicate = createFilterPredicate(received, logFields);
      const counts: Record<string, number> = {};

      for (const entry of logs) {
        if (test(entry) && predicate(entry)) {
          const key = String(entry[field as keyof LogEntry]);

          counts[key] = (counts[key] ?? 0) + 1;
        }
      }

      return counts;
    };
  },
};

/**
 * A stand-in for a model, so the recipe works offline. It answers in the
 * shape a real model would; see the FilterAssistant docs for an AI SDK
 * version.
 */
export async function logsAssistant({
  current,
  prompt,
  signal,
}: FilterAssistantRequest): Promise<FilterAssistantResult | false> {
  await wait(signal, 600);

  const text = prompt.toLowerCase();
  const has = (...words: string[]) => words.some((word) => text.includes(word));
  const children: Record<string, unknown>[] = [];
  const unresolved: { text: string }[] = [];
  const levels = [
    ["error", "error"],
    ["fail", "error"],
    ["warn", "warn"],
    ["debug", "debug"],
  ].flatMap(([word, level]) => (has(word ?? "") ? [level] : []));

  if (levels.length > 0) {
    children.push({
      type: "condition",
      field: "level",
      operator: "isAnyOf",
      value: [...new Set(levels)],
    });
  }

  const serviceNames = [
    "api",
    "checkout",
    "auth",
    "search",
    "worker",
    "payments",
  ];
  const mentioned = serviceNames.filter((name) => has(name));

  if (mentioned.length > 0) {
    // "payments" isn't a service here: it becomes "Couldn't use".
    children.push({
      type: "condition",
      field: "service",
      operator: "isAnyOf",
      value: mentioned,
    });
  }

  if (has("prod")) {
    children.push({
      type: "condition",
      field: "env",
      operator: "isAnyOf",
      value: ["production"],
    });
  } else if (has("staging")) {
    children.push({
      type: "condition",
      field: "env",
      operator: "isAnyOf",
      value: ["staging"],
    });
  }

  if (has("slow", "latency")) {
    children.push({
      type: "condition",
      field: "duration",
      operator: "gte",
      value: 1000,
    });
  }

  if (has("5xx", "server error")) {
    children.push({
      type: "condition",
      field: "status",
      operator: "gte",
      value: 500,
    });
  }

  if (has("timeout")) {
    children.push({
      type: "condition",
      field: "message",
      operator: "contains",
      value: "timeout",
    });
  }

  if (has("region", "country")) {
    unresolved.push({ text: "region (logs have no region field)" });
  }

  if (children.length === 0 && unresolved.length === 0) {
    return false;
  }

  // The answer is the complete filter: keep what the request didn't mention.
  const touched = new Set(children.map((child) => String(child.field)));
  const kept = current.children.filter(
    (node) => node.type !== "condition" || !touched.has(node.field),
  );

  return {
    filter: {
      type: "group",
      combinator: "and",
      children: [...kept, ...children],
    },
    unresolved,
  };
}
