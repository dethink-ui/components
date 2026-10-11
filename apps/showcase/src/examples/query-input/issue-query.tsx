"use client";

import { useMemo } from "react";
import {
  DataTable,
  FilterBar,
  QueryInput,
  createFilter,
  createFilterCondition,
  createFilterPredicate,
  defineFilterFields,
  useFilterState,
  type DataTableColumnDef,
} from "@dethink/components";

type Issue = {
  id: string;
  title: string;
  status: "open" | "blocked" | "done";
  labels: string[];
  assignee: string;
  estimate: number;
  created: string;
  customer: boolean;
};

// A fixed "today" keeps relative dates identical on the server and in the
// browser. In an app, pass the request time instead.
const evaluateOptions = { now: Date.UTC(2026, 8, 30, 12) };

const fields = defineFilterFields<Issue>([
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
      { value: "auth", label: "Auth" },
      { value: "billing", label: "Billing" },
    ],
  },
  { key: "assignee", label: "Assignee", type: "text" },
  { key: "estimate", label: "Estimate", type: "number" },
  { key: "created", label: "Created", type: "date" },
  { key: "customer", label: "Customer reported", type: "boolean" },
]);

const issues: Issue[] = [
  {
    id: "DT-412",
    title: "API latency spike on /search",
    status: "blocked",
    labels: ["bug", "api"],
    assignee: "Ada",
    estimate: 5,
    created: "2026-09-29",
    customer: true,
  },
  {
    id: "DT-418",
    title: "Billing export drops tax lines",
    status: "open",
    labels: ["bug", "billing"],
    assignee: "Lin",
    estimate: 3,
    created: "2026-09-24",
    customer: true,
  },
  {
    id: "DT-421",
    title: "SSO login loops on Safari",
    status: "open",
    labels: ["bug", "auth"],
    assignee: "Ada",
    estimate: 8,
    created: "2026-09-12",
    customer: false,
  },
  {
    id: "DT-430",
    title: "Rate limit headers for the public API",
    status: "open",
    labels: ["api"],
    assignee: "Sam",
    estimate: 2,
    created: "2026-09-28",
    customer: false,
  },
  {
    id: "DT-433",
    title: "Invoice PDF uses the wrong locale",
    status: "done",
    labels: ["billing"],
    assignee: "Lin",
    estimate: 1,
    created: "2026-08-30",
    customer: true,
  },
];

const columns: DataTableColumnDef<Issue>[] = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "title", header: "Title" },
  { accessorKey: "status", header: "Status" },
  { accessorKey: "assignee", header: "Assignee" },
  { accessorKey: "estimate", header: "Estimate" },
];

export function QueryInputIssueQuery() {
  // One state drives both the text and the chips.
  const state = useFilterState({
    defaultValue: createFilter({
      id: "issues",
      children: [
        createFilterCondition({
          id: "status",
          field: "status",
          operator: "isAnyOf",
          value: ["open", "blocked"],
        }),
        createFilterCondition({
          id: "created",
          field: "created",
          operator: "inLast",
          value: { amount: 30, unit: "day" },
        }),
      ],
    }),
  });
  const rowFilter = useMemo(
    () => createFilterPredicate(state.filter, fields, evaluateOptions),
    [state.filter],
  );

  return (
    <DataTable
      aria-label="Issues"
      columns={columns}
      data={issues}
      getRowId={(row) => row.id}
      rowFilter={rowFilter}
      emptyContent="No issues match this query."
      toolbar={
        <div className="grid w-full gap-3">
          <QueryInput fields={fields} state={state} defaultField="title" />
          <FilterBar
            fields={fields}
            state={state}
            data={issues}
            evaluateOptions={evaluateOptions}
          />
        </div>
      }
    />
  );
}
