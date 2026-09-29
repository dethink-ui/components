"use client";

import { useMemo } from "react";
import {
  Badge,
  DataTable,
  FilterBar,
  createFilter,
  createFilterCondition,
  createFilterPredicate,
  defineFilterFields,
  useFilterState,
  type BadgeTone,
  type DataTableColumnDef,
} from "@dethink/components";

type Status = "open" | "blocked" | "in-review" | "done";

type Issue = {
  id: string;
  title: string;
  status: Status;
  priority: "urgent" | "high" | "medium" | "low";
  labels: string[];
  assignee: string | null;
  estimate: number;
  created: string;
  customer: boolean;
};

// A fixed "today" keeps relative dates and counts identical on the server
// and in the browser. In an app, pass the request time instead.
const today = Date.UTC(2026, 8, 30, 12);
const evaluateOptions = { now: today };

const statusOptions = [
  { value: "open", label: "Open" },
  { value: "blocked", label: "Blocked" },
  { value: "in-review", label: "In review" },
  { value: "done", label: "Done" },
];

const statusTone: Record<Status, BadgeTone> = {
  open: "info",
  blocked: "destructive",
  "in-review": "warning",
  done: "success",
};

const issues: Issue[] = [
  {
    id: "DT-412",
    title: "API latency spike on /search",
    status: "blocked",
    priority: "urgent",
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
    priority: "high",
    labels: ["bug", "billing"],
    assignee: "Lin",
    estimate: 3,
    created: "2026-09-24",
    customer: true,
  },
  {
    id: "DT-421",
    title: "SSO login loops on Safari",
    status: "in-review",
    priority: "high",
    labels: ["bug", "auth"],
    assignee: "Ada",
    estimate: 8,
    created: "2026-09-30",
    customer: false,
  },
  {
    id: "DT-425",
    title: "Usage dashboard for workspaces",
    status: "open",
    priority: "medium",
    labels: ["feature"],
    assignee: null,
    estimate: 13,
    created: "2026-09-02",
    customer: false,
  },
  {
    id: "DT-430",
    title: "Rate limit headers on public API",
    status: "done",
    priority: "medium",
    labels: ["api"],
    assignee: "Sam",
    estimate: 2,
    created: "2026-08-18",
    customer: true,
  },
  {
    id: "DT-433",
    title: "Audit log retention settings",
    status: "open",
    priority: "low",
    labels: ["feature", "auth"],
    assignee: "Sam",
    estimate: 5,
    created: "2026-09-15",
    customer: false,
  },
  {
    id: "DT-437",
    title: "Webhook retries back off too fast",
    status: "blocked",
    priority: "high",
    labels: ["api"],
    assignee: null,
    estimate: 3,
    created: "2026-09-28",
    customer: true,
  },
];

const fields = defineFilterFields<Issue>([
  {
    key: "status",
    label: "Status",
    type: "option",
    options: statusOptions,
  },
  {
    key: "priority",
    label: "Priority",
    type: "option",
    options: [
      { value: "urgent", label: "Urgent" },
      { value: "high", label: "High" },
      { value: "medium", label: "Medium" },
      { value: "low", label: "Low" },
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
      { value: "feature", label: "Feature" },
    ],
  },
  {
    key: "assignee",
    label: "Assignee",
    type: "text",
    placeholder: "Name",
  },
  { key: "title", label: "Title", type: "text", placeholder: "Contains…" },
  { key: "estimate", label: "Estimate", type: "number" },
  { key: "created", label: "Created", type: "date" },
  {
    key: "customer",
    label: "Customer reported",
    type: "boolean",
  },
]);

const columns: DataTableColumnDef<Issue>[] = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "title", header: "Title" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => {
      const status = getValue<Status>();

      return (
        <Badge tone={statusTone[status]} variant="soft" size="sm">
          {statusOptions.find((option) => option.value === status)?.label}
        </Badge>
      );
    },
  },
  { accessorKey: "priority", header: "Priority" },
  {
    accessorKey: "labels",
    header: "Labels",
    enableSorting: false,
    cell: ({ getValue }) => getValue<string[]>().join(", "),
  },
  {
    accessorKey: "assignee",
    header: "Assignee",
    cell: ({ getValue }) => getValue<string | null>() ?? "—",
  },
  { accessorKey: "estimate", header: "Est." },
  { accessorKey: "created", header: "Created" },
];

export function FilterBarIssueTable() {
  const filterState = useFilterState({
    defaultValue: createFilter({
      id: "issues",
      children: [
        createFilterCondition({
          id: "status",
          field: "status",
          operator: "isAnyOf",
          value: ["open", "blocked"],
        }),
      ],
    }),
  });
  const rowFilter = useMemo(
    () => createFilterPredicate(filterState.filter, fields, evaluateOptions),
    [filterState.filter],
  );
  return (
    <DataTable
      aria-label="Issues"
      columns={columns}
      data={issues}
      getRowId={(row) => row.id}
      rowFilter={rowFilter}
      emptyContent="No issues match these filters."
      toolbar={
        <FilterBar
          fields={fields}
          state={filterState}
          data={issues}
          evaluateOptions={evaluateOptions}
          showImpact
          addShortcut="f"
        />
      }
    />
  );
}
