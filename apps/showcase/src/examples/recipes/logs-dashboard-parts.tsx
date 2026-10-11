"use client";

import { useEffect, useState } from "react";
import {
  Badge,
  createFilterCondition,
  getFilterFacetFilter,
  type FilterCondition,
  type FilterFacetRequest,
  type FilterState,
  cn,
} from "@dethink/components";
import type { LogBucket } from "./logs-dashboard-api";
import { formatTime, levelTone } from "./logs-dashboard-format";
import { logFields, type LogEntry, type LogLevel } from "./logs-dashboard-data";

const levelBar: Record<LogLevel, string> = {
  error: "bg-destructive",
  warn: "bg-warning",
  info: "bg-info/70",
  debug: "bg-muted-foreground/40",
};

const levelOrder: LogLevel[] = ["error", "warn", "info", "debug"];

export function LevelBadge({ level }: { level: LogLevel }) {
  return (
    <Badge tone={levelTone[level]} variant="soft" size="xs">
      {level}
    </Badge>
  );
}

/** Log volume over the time range, stacked by level. */
export function LogHistogram({
  buckets,
  pending,
}: {
  buckets: LogBucket[];
  pending: boolean;
}) {
  const totals = buckets.map((bucket) =>
    levelOrder.reduce((sum, level) => sum + bucket.counts[level], 0),
  );
  const max = Math.max(1, ...totals);
  const total = totals.reduce((sum, value) => sum + value, 0);
  const errors = buckets.reduce((sum, bucket) => sum + bucket.counts.error, 0);
  const peak = totals.indexOf(Math.max(...totals, 0));

  return (
    <figure data-slot="logs-histogram" className="grid gap-2">
      {/* Only the bars dim while loading; text keeps full contrast. */}
      <div
        aria-hidden="true"
        data-slot="logs-histogram-bars"
        className={cn(
          "border-border flex h-24 items-end gap-[2px] border-b motion-safe:transition-opacity",
          pending && "opacity-50",
        )}
      >
        {buckets.map((bucket, index) => (
          <div
            key={bucket.start}
            title={`${formatTime(bucket.start)} · ${totals[index]} logs`}
            className="flex min-w-0 flex-1 flex-col-reverse overflow-hidden rounded-t-[2px]"
            style={{ height: `${((totals[index] ?? 0) / max) * 100}%` }}
          >
            {levelOrder.map((level) =>
              bucket.counts[level] > 0 ? (
                <div
                  key={level}
                  className={levelBar[level]}
                  style={{
                    height: `${(bucket.counts[level] / (totals[index] || 1)) * 100}%`,
                  }}
                />
              ) : null,
            )}
          </div>
        ))}
      </div>
      <figcaption className="text-muted-foreground flex flex-wrap items-center justify-between gap-2 text-xs">
        <span>
          {total.toLocaleString("en-US")} logs, {errors.toLocaleString("en-US")}{" "}
          errors
          {total > 0 && buckets[peak]
            ? `, peak at ${formatTime(buckets[peak].start)} UTC`
            : ""}
        </span>
        <span className="flex gap-3" aria-hidden="true">
          {levelOrder.map((level) => (
            <span key={level} className="inline-flex items-center gap-1">
              <span className={cn("size-2 rounded-sm", levelBar[level])} />
              {level}
            </span>
          ))}
        </span>
      </figcaption>
    </figure>
  );
}

const facetFields = ["level", "service", "env"] as const;

function selectedValues(state: FilterState, field: string) {
  const condition = state.filter.children.find(
    (node): node is FilterCondition =>
      node.type === "condition" &&
      node.field === field &&
      node.operator === "isAnyOf" &&
      !node.not,
  );

  return {
    condition,
    values: Array.isArray(condition?.value) ? condition.value.map(String) : [],
  };
}

/** Toggles a value in the root "is any of" condition for a field. */
function toggle(state: FilterState, field: string, value: string) {
  const { condition, values } = selectedValues(state, field);

  if (!condition) {
    state.addNode(
      createFilterCondition({ field, operator: "isAnyOf", value: [value] }),
    );
    return;
  }

  const next = values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];

  if (next.length === 0) {
    state.removeNode(condition.id);
  } else {
    state.updateCondition(condition.id, { value: next });
  }
}

/**
 * Facet sidebar: counts per level, service and environment from the
 * server, each value a toggle that edits the filter (and so the chips, the
 * query and the URL).
 */
export function LogFacets({
  getFacets,
  state,
}: {
  getFacets: (request: FilterFacetRequest) => Promise<Record<string, number>>;
  state: FilterState;
}) {
  const [counts, setCounts] = useState<
    Record<string, Record<string, number> | null | undefined>
  >({});

  useEffect(() => {
    const controller = new AbortController();

    for (const field of facetFields) {
      const filter = getFilterFacetFilter(state.filter, logFields, field);

      // Unsupported scopes are derived during render, not stored.
      if (filter) {
        getFacets({ field, filter, signal: controller.signal }).then(
          (next) => {
            setCounts((current) => ({ ...current, [field]: next }));
          },
          () => undefined,
        );
      }
    }

    return () => {
      controller.abort();
    };
  }, [getFacets, state.filter]);

  return (
    <nav aria-label="Log facets" className="grid content-start gap-5">
      {facetFields.map((fieldKey) => {
        const field = logFields.find((candidate) => candidate.key === fieldKey);
        const { values } = selectedValues(state, fieldKey);
        const fieldCounts = getFilterFacetFilter(
          state.filter,
          logFields,
          fieldKey,
        )
          ? counts[fieldKey]
          : null;

        return (
          <section key={fieldKey} aria-labelledby={`facet-${fieldKey}`}>
            <h3
              id={`facet-${fieldKey}`}
              className="text-muted-foreground mb-1.5 text-xs font-medium tracking-wide uppercase"
            >
              {field?.label}
            </h3>
            <ul className="grid gap-0.5">
              {field?.options?.map((option) => {
                const active = values.includes(option.value);
                const count = fieldCounts?.[option.value];

                return (
                  <li key={option.value}>
                    <button
                      type="button"
                      aria-pressed={active}
                      onClick={() => {
                        toggle(state, fieldKey, option.value);
                      }}
                      className="hover:bg-muted focus-visible:ring-ring aria-pressed:bg-muted flex w-full items-center gap-2 rounded-md px-2 py-1 text-start text-sm outline-none focus-visible:ring-2 aria-pressed:font-medium"
                    >
                      <span
                        aria-hidden="true"
                        className="border-input grid size-3.5 place-items-center rounded-[3px] border text-[10px] leading-none"
                      >
                        {active ? "✓" : ""}
                      </span>
                      <span className="min-w-0 flex-1 truncate">
                        {option.label}
                      </span>
                      {/* Fixed width: counts arriving never move the labels. */}
                      <span className="text-muted-foreground min-w-8 text-end text-xs tabular-nums">
                        {fieldCounts === null
                          ? "–"
                          : count === undefined
                            ? fieldCounts
                              ? "0"
                              : ""
                            : count.toLocaleString("en-US")}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </nav>
  );
}

/** Details of one log line. */
export function LogDetails({
  className,
  entry,
  onClose,
}: {
  className?: string;
  entry: LogEntry;
  onClose: () => void;
}) {
  const rows: [string, string][] = [
    ["Time", `${new Date(entry.time).toISOString()}`],
    ["Level", entry.level],
    ["Service", entry.service],
    ["Environment", entry.env],
    ["Route", entry.route],
    ["Status", String(entry.status)],
    ["Duration", `${entry.duration} ms`],
    ["Host", entry.host],
    ["Trace ID", entry.traceId],
  ];

  return (
    <section
      aria-labelledby="log-details-heading"
      data-slot="log-details"
      className={cn(
        "border-border bg-background grid content-start gap-3 self-start rounded-lg border p-4",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 id="log-details-heading" className="text-sm font-semibold">
          {entry.message}
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="text-muted-foreground hover:bg-muted focus-visible:ring-ring rounded-md px-2 py-1 text-xs outline-none focus-visible:ring-2"
        >
          Close
        </button>
      </div>
      <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 text-xs">
        {rows.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="min-w-0 font-mono [overflow-wrap:anywhere]">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
