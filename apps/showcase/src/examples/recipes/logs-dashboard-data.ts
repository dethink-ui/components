import {
  createFilter,
  createFilterCondition,
  defineFilterFields,
  type SavedView,
} from "@dethink/components";

export type LogLevel = "error" | "warn" | "info" | "debug";

export type LogEntry = {
  id: string;
  /** Epoch ms. */
  time: number;
  level: LogLevel;
  service: string;
  env: "production" | "staging";
  route: string;
  status: number;
  /** Milliseconds. */
  duration: number;
  message: string;
  host: string;
  traceId: string;
};

/** A fixed "now" keeps server and client renders identical. */
export const LOGS_NOW = Date.UTC(2026, 8, 30, 12, 0, 0);

export const timeRanges = [
  { id: "15m", label: "15m", minutes: 15 },
  { id: "1h", label: "1h", minutes: 60 },
  { id: "4h", label: "4h", minutes: 240 },
  { id: "24h", label: "24h", minutes: 1440 },
] as const;

export type TimeRangeId = (typeof timeRanges)[number]["id"];

const services = ["api", "checkout", "auth", "search", "worker"] as const;
const hosts = ["ip-10-0-1-14", "ip-10-0-2-31", "ip-10-0-3-07", "ip-10-0-4-22"];
const routes: Record<(typeof services)[number], string[]> = {
  api: ["GET /v1/orders", "GET /v1/orders/:id", "POST /v1/orders"],
  checkout: ["POST /checkout", "POST /checkout/confirm", "GET /cart"],
  auth: ["POST /login", "POST /token/refresh", "GET /session"],
  search: ["GET /search", "GET /search/suggest"],
  worker: ["job:send-invoice", "job:sync-inventory", "job:reindex"],
};
const messages: Record<LogLevel, string[]> = {
  error: [
    "upstream timeout after 3000ms",
    "payment provider returned 502",
    "database connection reset",
    "unhandled exception in handler",
  ],
  warn: [
    "slow query detected",
    "retrying request (attempt 2)",
    "cache miss storm",
    "rate limit close to threshold",
  ],
  info: [
    "request completed",
    "user signed in",
    "order created",
    "job finished",
  ],
  debug: ["cache hit", "feature flag evaluated", "token validated"],
};

/** Small deterministic PRNG, so the data is the same everywhere. */
function prng(seed: number) {
  let state = seed;

  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;

    return state / 4294967296;
  };
}

function pick<T>(items: readonly T[], next: () => number): T {
  return items[Math.floor(next() * items.length)] as T;
}

export const logs: LogEntry[] = (() => {
  const next = prng(42);
  const entries: LogEntry[] = [];

  for (let index = 0; index < 1800; index += 1) {
    const minutesAgo = Math.floor(next() ** 1.6 * 1440);
    const service = pick(services, next);
    // An incident: checkout errors spike 20–40 minutes ago.
    const incident =
      service === "checkout" && minutesAgo >= 20 && minutesAgo < 40;
    const roll = next();
    const level: LogLevel = incident
      ? roll < 0.55
        ? "error"
        : "warn"
      : roll < 0.04
        ? "error"
        : roll < 0.14
          ? "warn"
          : roll < 0.88
            ? "info"
            : "debug";
    const status =
      level === "error"
        ? pick([500, 502, 503, 504], next)
        : level === "warn"
          ? pick([200, 429, 404], next)
          : pick([200, 200, 201, 204, 304], next);

    entries.push({
      id: `log-${index.toString(36)}`,
      time: LOGS_NOW - minutesAgo * 60_000 - Math.floor(next() * 60_000),
      level,
      service,
      env: next() < 0.8 ? "production" : "staging",
      route: pick(routes[service], next),
      status,
      duration: Math.round(
        (incident ? 1200 : 40) + next() ** 3 * (level === "error" ? 3200 : 900),
      ),
      message: pick(messages[level], next),
      host: pick(hosts, next),
      traceId: Math.floor(next() * 0xffffffff)
        .toString(16)
        .padStart(8, "0"),
    });
  }

  return entries.sort((a, b) => b.time - a.time);
})();

export const logFields = defineFilterFields<LogEntry>([
  { key: "message", label: "Message", type: "text" },
  {
    key: "level",
    label: "Level",
    type: "option",
    options: [
      { value: "error", label: "Error" },
      { value: "warn", label: "Warning", keywords: ["warn"] },
      { value: "info", label: "Info" },
      { value: "debug", label: "Debug" },
    ],
  },
  {
    key: "service",
    label: "Service",
    type: "option",
    options: services.map((service) => ({ value: service, label: service })),
  },
  {
    key: "env",
    label: "Environment",
    type: "option",
    options: [
      { value: "production", label: "production", keywords: ["prod"] },
      { value: "staging", label: "staging" },
    ],
  },
  { key: "status", label: "Status code", type: "number" },
  { key: "duration", label: "Duration (ms)", type: "number" },
  { key: "route", label: "Route", type: "text" },
  { key: "host", label: "Host", type: "text" },
  { key: "traceId", label: "Trace ID", type: "text" },
]);

export const initialLogViews: SavedView[] = [
  {
    id: "prod-errors",
    name: "Production errors",
    version: 1,
    scope: "team",
    filter: createFilter({
      children: [
        createFilterCondition({
          field: "level",
          operator: "isAnyOf",
          value: ["error"],
        }),
        createFilterCondition({
          field: "env",
          operator: "isAnyOf",
          value: ["production"],
        }),
      ],
    }),
  },
  {
    id: "slow-checkout",
    name: "Slow checkout",
    version: 1,
    scope: "team",
    filter: createFilter({
      children: [
        createFilterCondition({
          field: "service",
          operator: "isAnyOf",
          value: ["checkout"],
        }),
        createFilterCondition({
          field: "duration",
          operator: "gte",
          value: 1000,
        }),
      ],
    }),
  },
  {
    id: "server-errors",
    name: "5xx or timeouts",
    version: 1,
    scope: "personal",
    filter: createFilter({
      combinator: "or",
      children: [
        createFilterCondition({ field: "status", operator: "gte", value: 500 }),
        createFilterCondition({
          field: "message",
          operator: "contains",
          value: "timeout",
        }),
      ],
    }),
  },
];
