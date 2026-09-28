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
};

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
  },
  {
    id: "DT-418",
    title: "Billing export drops tax lines",
    status: "open",
    priority: "high",
    labels: ["bug", "billing"],
    assignee: "Lin",
  },
  {
    id: "DT-421",
    title: "SSO login loops on Safari",
    status: "in-review",
    priority: "high",
    labels: ["bug", "auth"],
    assignee: "Ada",
  },
  {
    id: "DT-425",
    title: "Usage dashboard for workspaces",
    status: "open",
    priority: "medium",
    labels: ["feature"],
    assignee: null,
  },
  {
    id: "DT-430",
    title: "Rate limit headers on public API",
    status: "done",
    priority: "medium",
    labels: ["api"],
    assignee: "Sam",
  },
  {
    id: "DT-433",
    title: "Audit log retention settings",
    status: "open",
    priority: "low",
    labels: ["feature", "auth"],
    assignee: "Sam",
  },
  {
    id: "DT-437",
    title: "Webhook retries back off too fast",
    status: "blocked",
    priority: "high",
    labels: ["api"],
    assignee: null,
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
    () => createFilterPredicate(filterState.filter, fields),
    [filterState.filter],
  );
  const resultCount = useMemo(
    () => issues.filter(rowFilter).length,
    [rowFilter],
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
          resultCount={resultCount}
          addShortcut="f"
        />
      }
    />
  );
}
