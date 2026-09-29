"use client";

import { useState } from "react";
import {
  FilterBar,
  QueryInput,
  SavedViewsMenu,
  createFilter,
  createFilterCondition,
  defineFilterFields,
  encodeFilterParam,
  formatFilterSearch,
  useFilterUrlState,
  useSavedViews,
  type SavedView,
} from "@dethink/components";

const fields = defineFilterFields([
  { key: "title", label: "Title", type: "text" },
  {
    key: "status",
    label: "Status",
    type: "option",
    options: [
      { value: "open", label: "Open" },
      { value: "blocked", label: "Blocked" },
      { value: "done", label: "Done" },
    ],
  },
  {
    key: "labels",
    label: "Labels",
    type: "multiOption",
    options: [
      { value: "bug", label: "Bug" },
      { value: "api", label: "API" },
      { value: "billing", label: "Billing" },
    ],
  },
  { key: "estimate", label: "Estimate", type: "number" },
  { key: "created", label: "Created", type: "date" },
]);

const initialViews: SavedView[] = [
  {
    id: "my-open",
    name: "Open this month",
    version: 1,
    scope: "personal",
    filter: createFilter({
      children: [
        createFilterCondition({
          field: "status",
          operator: "isAnyOf",
          value: ["open"],
        }),
        createFilterCondition({
          field: "created",
          operator: "inPeriod",
          value: { kind: "relative", amount: 0, unit: "month" },
        }),
      ],
    }),
  },
  {
    id: "team-bugs",
    name: "Big bugs",
    version: 1,
    scope: "team",
    filter: createFilter({
      children: [
        createFilterCondition({
          field: "labels",
          operator: "includesAny",
          value: ["bug"],
        }),
        createFilterCondition({
          field: "estimate",
          operator: "gte",
          value: 5,
        }),
      ],
    }),
  },
];

export function SavedViewsUrlExample() {
  // The filter lives in this page's URL (?q=…&v=1). Try editing it, then
  // reload or use back and forward.
  const state = useFilterUrlState({ fields });
  // In an app, persist views in your API; here they live in memory.
  const [views, setViews] = useState(initialViews);
  const savedViews = useSavedViews({
    state,
    fields,
    views,
    onCreate: (view) => setViews((current) => [...current, view]),
    onUpdate: (view) =>
      setViews((current) =>
        current.map((item) => (item.id === view.id ? view : item)),
      ),
    onDelete: (view) =>
      setViews((current) => current.filter((item) => item.id !== view.id)),
  });
  const search = formatFilterSearch(encodeFilterParam(state.filter, fields));

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <SavedViewsMenu savedViews={savedViews} scopes={["personal", "team"]} />
        <QueryInput
          fields={fields}
          state={state}
          className="min-w-0 flex-1 basis-72"
        />
      </div>
      <FilterBar fields={fields} state={state} />
      <p className="text-muted-foreground text-xs">
        URL:{" "}
        <code className="text-foreground font-mono break-all">
          {search || "(no filter)"}
        </code>
      </p>
    </div>
  );
}
