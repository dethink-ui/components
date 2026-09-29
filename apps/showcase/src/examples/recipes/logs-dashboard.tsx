"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Badge,
  DataTable,
  FilterAssistant,
  FilterBar,
  QueryInput,
  SavedViewsMenu,
  cn,
  createHistoryFilterStore,
  createMemoryFilterStore,
  useFilterAssistant,
  useFilterUrlState,
  useSavedViews,
  type DataTableColumnDef,
  type Filter,
} from "@dethink/components";
import type { RecipePreviewProps } from "@/lib/recipe-presentation";
import {
  logsApi,
  logsAssistant,
  type LogSearchResult,
} from "./logs-dashboard-api";
import {
  LOGS_NOW,
  initialLogViews,
  logFields,
  timeRanges,
  type LogEntry,
  type TimeRangeId,
} from "./logs-dashboard-data";
import { PendingLine } from "../filter-server/pending-line";
import {
  LevelBadge,
  LogDetails,
  LogFacets,
  LogHistogram,
} from "./logs-dashboard-parts";
import { formatTime } from "./logs-dashboard-format";

/** Searches the pretend backend, keeping the last result while loading. */
function useLogSearch(filter: Filter, range: TimeRangeId) {
  const [response, setResponse] = useState<{
    filter: Filter;
    range: TimeRangeId;
    result: LogSearchResult;
  }>();

  useEffect(() => {
    const controller = new AbortController();

    logsApi.search({ filter, range, signal: controller.signal }).then(
      (result) => {
        setResponse({ filter, range, result });
      },
      () => undefined,
    );

    return () => {
      controller.abort();
    };
  }, [filter, range]);

  return {
    result: response?.result,
    // Pending until the response matches what is on screen now.
    pending: response?.filter !== filter || response.range !== range,
  };
}

export function LogsDashboardRecipe({
  presentation = "embedded",
}: RecipePreviewProps) {
  const fullPage = presentation === "full-page";
  // The full-page recipe keeps the query in the page URL; previews don't.
  const [store] = useState(() =>
    fullPage ? createHistoryFilterStore() : createMemoryFilterStore(),
  );
  const state = useFilterUrlState({ fields: logFields, store });
  const [range, setRange] = useState<TimeRangeId>("1h");
  const [views, setViews] = useState(initialLogViews);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [selected, setSelected] = useState<LogEntry>();
  const { pending, result } = useLogSearch(state.filter, range);
  const getFacets = useMemo(() => logsApi.facets(range), [range]);
  const previewCount = useCallback(
    async (filter: Filter, signal: AbortSignal) =>
      (await logsApi.search({ filter, range, signal })).total,
    [range],
  );
  const savedViews = useSavedViews({
    state,
    fields: logFields,
    views,
    onCreate: (view) => setViews((current) => [...current, view]),
    onUpdate: (view) =>
      setViews((current) =>
        current.map((item) => (item.id === view.id ? view : item)),
      ),
    onDelete: (view) =>
      setViews((current) => current.filter((item) => item.id !== view.id)),
  });
  const assistant = useFilterAssistant({
    fields: logFields,
    state,
    resolve: logsAssistant,
    evaluateOptions: { now: LOGS_NOW, timeZone: "UTC" },
    onPreviewCount: previewCount,
  });

  const columns = useMemo<DataTableColumnDef<LogEntry>[]>(
    () => [
      {
        accessorKey: "time",
        header: "Time (UTC)",
        cell: ({ row }) => (
          <span className="font-mono text-xs whitespace-nowrap tabular-nums">
            {formatTime(row.original.time)}
          </span>
        ),
      },
      {
        accessorKey: "level",
        header: "Level",
        cell: ({ row }) => <LevelBadge level={row.original.level} />,
      },
      { accessorKey: "service", header: "Service" },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <span className="tabular-nums">{row.original.status}</span>
        ),
      },
      {
        accessorKey: "duration",
        header: "Duration",
        cell: ({ row }) => (
          <span className="whitespace-nowrap tabular-nums">
            {row.original.duration} ms
          </span>
        ),
      },
      {
        accessorKey: "message",
        header: "Message",
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => {
              setSelected(row.original);
            }}
            className="focus-visible:ring-ring max-w-80 truncate rounded-sm text-start underline-offset-2 outline-none hover:underline focus-visible:ring-2"
          >
            {row.original.route} — {row.original.message}
          </button>
        ),
      },
    ],
    [],
  );

  return (
    <div
      data-recipe-surface="logs-dashboard"
      className={cn(
        "bg-muted/30 grid w-full min-w-0 content-start gap-4 p-4 sm:p-6",
        fullPage
          ? "min-h-[calc(100dvh-7rem)]"
          : "border-border min-h-[42rem] rounded-xl border",
      )}
    >
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Logs</h2>
          <Badge tone="success" variant="soft" size="sm">
            Live · sample data
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div
            role="group"
            aria-label="Time range"
            className="border-border bg-background inline-flex rounded-md border p-0.5"
          >
            {timeRanges.map((option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={range === option.id}
                aria-label={`Last ${option.label}`}
                onClick={() => {
                  setRange(option.id);
                }}
                className="text-muted-foreground focus-visible:ring-ring aria-pressed:bg-primary aria-pressed:text-primary-foreground h-7 rounded-[5px] px-2.5 text-xs font-medium outline-none focus-visible:ring-2"
              >
                {option.label}
              </button>
            ))}
          </div>
          <SavedViewsMenu
            savedViews={savedViews}
            scopes={["personal", "team"]}
          />
          <button
            type="button"
            aria-expanded={assistantOpen}
            aria-controls="logs-assistant"
            onClick={() => {
              setAssistantOpen((open) => !open);
            }}
            className="border-border bg-background hover:bg-muted focus-visible:ring-ring aria-expanded:bg-muted inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-sm font-medium outline-none focus-visible:ring-2"
          >
            Ask in words
          </button>
        </div>
      </header>

      <div className="grid gap-2">
        <QueryInput
          fields={logFields}
          state={state}
          defaultField="message"
          labels={{
            input: "Log query",
            placeholder:
              "level:error service:checkout duration:>=1000 or plain words",
          }}
        />
        <FilterBar
          fields={logFields}
          state={state}
          getFacets={getFacets}
          facetsKey={range}
          resultCount={pending ? undefined : result?.total}
          collapseAfter={4}
          aria-label="Log filters"
        />
      </div>

      <div id="logs-assistant" hidden={!assistantOpen}>
        {assistantOpen ? (
          <FilterAssistant
            assistant={assistant}
            labels={{
              placeholder: "e.g. slow checkout errors in prod",
            }}
          />
        ) : null}
      </div>

      <LogHistogram buckets={result?.buckets ?? []} pending={pending} />

      <div className="grid min-w-0 gap-4 lg:grid-cols-[12rem_minmax(0,1fr)]">
        <LogFacets getFacets={getFacets} state={state} />
        <div
          className={cn(
            "grid min-w-0 content-start gap-4",
            // Beside the table only when there's room; above it otherwise.
            selected && "2xl:grid-cols-[minmax(0,1fr)_18rem]",
          )}
        >
          <div aria-busy={pending} className="relative min-w-0">
            <PendingLine active={pending && result !== undefined} />
            <DataTable
              aria-label="Log lines"
              columns={columns}
              data={result?.rows ?? []}
              getRowId={(row) => row.id}
              manualFiltering
              loading={!result}
              density="compact"
              emptyContent="No logs match this query in the time range."
            />
            <p className="text-muted-foreground mt-2 h-4 text-xs">
              {result
                ? `Showing ${result.rows.length} of ${result.total.toLocaleString("en-US")} matching logs.`
                : ""}
            </p>
          </div>
          {selected ? (
            <LogDetails
              className="-order-1 2xl:order-none"
              entry={selected}
              onClose={() => {
                setSelected(undefined);
              }}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
