"use client";

import { useMemo, useState } from "react";
import {
  Badge,
  DataTable,
  FilterAssistant,
  FilterBar,
  QueryInput,
  SavedViewsMenu,
  cn,
  countFilterMatches,
  createFilterPredicate,
  createHistoryFilterStore,
  createMemoryFilterStore,
  useFilterAssistant,
  useFilterUrlState,
  useSavedViews,
  type BadgeTone,
  type DataTableColumnDef,
  type Filter,
} from "@dethink/components";
import type { RecipePreviewProps } from "@/lib/recipe-presentation";
import {
  initialIssueViews,
  issueAssistant,
  issueEvaluateOptions,
  issueFields,
  issues,
  type Issue,
  type IssueStatus,
} from "./issue-tracker-data";

const statusTone: Record<IssueStatus, BadgeTone> = {
  backlog: "neutral",
  todo: "info",
  "in-progress": "warning",
  "in-review": "primary",
  done: "success",
};

const statusLabel: Record<IssueStatus, string> = {
  backlog: "Backlog",
  todo: "Todo",
  "in-progress": "In progress",
  "in-review": "In review",
  done: "Done",
};

const columns: DataTableColumnDef<Issue>[] = [
  {
    accessorKey: "key",
    header: "Key",
    cell: ({ row }) => (
      <span className="font-mono text-xs whitespace-nowrap">
        {row.original.key}
      </span>
    ),
  },
  { accessorKey: "title", header: "Title" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge tone={statusTone[row.original.status]} variant="soft" size="sm">
        {statusLabel[row.original.status]}
      </Badge>
    ),
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => (
      <span className="capitalize">{row.original.priority}</span>
    ),
  },
  { accessorKey: "assignee", header: "Assignee" },
  { accessorKey: "estimate", header: "Est." },
  {
    accessorKey: "updated",
    header: "Updated",
    cell: ({ row }) => (
      <span className="whitespace-nowrap tabular-nums">
        {row.original.updated}
      </span>
    ),
  },
];

export function IssueTrackerRecipe({
  presentation = "embedded",
}: RecipePreviewProps) {
  const fullPage = presentation === "full-page";
  const [store] = useState(() =>
    fullPage ? createHistoryFilterStore() : createMemoryFilterStore(),
  );
  const state = useFilterUrlState({ fields: issueFields, store });
  const [views, setViews] = useState(initialIssueViews);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const rowFilter = useMemo(
    () =>
      createFilterPredicate(state.filter, issueFields, issueEvaluateOptions),
    [state.filter],
  );
  const count = useMemo(() => issues.filter(rowFilter).length, [rowFilter]);
  const previewCount = useMemo(
    () => async (filter: Filter) =>
      countFilterMatches(issues, filter, issueFields, issueEvaluateOptions),
    [],
  );
  const savedViews = useSavedViews({
    state,
    fields: issueFields,
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
    fields: issueFields,
    state,
    resolve: issueAssistant,
    evaluateOptions: issueEvaluateOptions,
    onPreviewCount: previewCount,
  });

  return (
    <div
      data-recipe-surface="issue-tracker"
      className={cn(
        "bg-muted/30 grid w-full min-w-0 gap-4 p-4 sm:p-6 lg:grid-cols-[13rem_minmax(0,1fr)]",
        fullPage
          ? "min-h-[calc(100dvh-7rem)]"
          : "border-border min-h-[42rem] rounded-xl border",
      )}
    >
      <nav aria-label="Issue views" className="grid content-start gap-1">
        <p className="text-muted-foreground px-2 pb-1 text-xs font-medium tracking-wide uppercase">
          Views
        </p>
        <button
          type="button"
          aria-current={savedViews.activeViewId === null ? "page" : undefined}
          onClick={() => {
            savedViews.deselect();
            state.clear();
          }}
          className="hover:bg-muted focus-visible:ring-ring aria-[current=page]:bg-muted rounded-md px-2 py-1.5 text-start text-sm outline-none focus-visible:ring-2 aria-[current=page]:font-medium"
        >
          All issues
        </button>
        {savedViews.views.map((view) => {
          const active = view.id === savedViews.activeViewId;

          return (
            <button
              key={view.id}
              type="button"
              aria-current={active ? "page" : undefined}
              onClick={() => {
                savedViews.apply(view.id);
              }}
              className="hover:bg-muted focus-visible:ring-ring aria-[current=page]:bg-muted flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-start text-sm outline-none focus-visible:ring-2 aria-[current=page]:font-medium"
            >
              <span className="min-w-0 truncate">{view.name}</span>
              {active && savedViews.isDirty ? (
                <span className="text-muted-foreground text-xs">edited</span>
              ) : null}
            </button>
          );
        })}
      </nav>

      <div className="grid min-w-0 content-start gap-3">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <h2 className="text-xl font-semibold tracking-tight">Issues</h2>
            <span className="text-muted-foreground text-sm tabular-nums">
              {count} of {issues.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <SavedViewsMenu
              savedViews={savedViews}
              scopes={["personal", "team"]}
            />
            <button
              type="button"
              aria-expanded={assistantOpen}
              aria-controls="issues-assistant"
              onClick={() => {
                setAssistantOpen((open) => !open);
              }}
              className="border-border bg-background hover:bg-muted focus-visible:ring-ring aria-expanded:bg-muted inline-flex h-8 items-center rounded-md border px-3 text-sm font-medium outline-none focus-visible:ring-2"
            >
              Ask in words
            </button>
          </div>
        </header>

        <QueryInput
          fields={issueFields}
          state={state}
          defaultField="title"
          labels={{
            input: "Issue query",
            placeholder: "status:!done assignee:ada labels:bug or plain words",
          }}
        />

        <div id="issues-assistant" hidden={!assistantOpen}>
          {assistantOpen ? (
            <FilterAssistant
              assistant={assistant}
              labels={{ placeholder: "e.g. my urgent bugs updated this week" }}
            />
          ) : null}
        </div>

        <DataTable
          aria-label="Issues"
          columns={columns}
          data={issues}
          getRowId={(row) => row.key}
          rowFilter={rowFilter}
          emptyContent="No issues match these filters."
          toolbar={
            <FilterBar
              fields={issueFields}
              state={state}
              data={issues}
              evaluateOptions={issueEvaluateOptions}
              showImpact
              addShortcut="f"
              collapseAfter={4}
              aria-label="Issue filters"
            />
          }
        />
      </div>
    </div>
  );
}
