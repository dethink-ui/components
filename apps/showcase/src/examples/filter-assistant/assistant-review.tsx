"use client";

import { useMemo } from "react";
import {
  FilterAssistant,
  FilterBar,
  countFilterMatches,
  createFilter,
  createFilterCondition,
  defineFilterFields,
  useFilterAssistant,
  useFilterState,
  type Filter,
} from "@dethink/components";
import { demoResolve } from "./demo-resolve";

type Issue = {
  title: string;
  status: "open" | "blocked" | "done";
  labels: string[];
  assignee: string;
  estimate: number;
  created: string;
  customer: boolean;
};

// A fixed "today" keeps relative dates identical on the server and client.
const evaluateOptions = { now: Date.UTC(2026, 8, 30, 12), timeZone: "UTC" };

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
      { value: "billing", label: "Billing" },
      { value: "auth", label: "Auth" },
    ],
  },
  { key: "assignee", label: "Assignee", type: "text" },
  { key: "estimate", label: "Estimate", type: "number" },
  { key: "created", label: "Created", type: "date" },
  { key: "customer", label: "Customer reported", type: "boolean" },
]);

const issues: Issue[] = [
  {
    title: "API latency spike",
    status: "blocked",
    labels: ["bug", "api"],
    assignee: "Ada",
    estimate: 5,
    created: "2026-09-29",
    customer: true,
  },
  {
    title: "Billing export drops tax",
    status: "open",
    labels: ["bug", "billing"],
    assignee: "Lin",
    estimate: 3,
    created: "2026-09-24",
    customer: true,
  },
  {
    title: "SSO login loop",
    status: "open",
    labels: ["bug", "auth"],
    assignee: "Ada",
    estimate: 8,
    created: "2026-09-12",
    customer: false,
  },
  {
    title: "Rate limit headers",
    status: "open",
    labels: ["api"],
    assignee: "Sam",
    estimate: 2,
    created: "2026-09-28",
    customer: false,
  },
  {
    title: "Invoice locale",
    status: "done",
    labels: ["billing"],
    assignee: "Lin",
    estimate: 1,
    created: "2026-08-30",
    customer: true,
  },
];

export function FilterAssistantReview() {
  const state = useFilterState({
    defaultValue: createFilter({
      id: "issues",
      children: [
        createFilterCondition({
          id: "status",
          field: "status",
          operator: "isAnyOf",
          value: ["open"],
        }),
      ],
    }),
  });
  const onPreviewCount = useMemo(
    () => async (filter: Filter) =>
      countFilterMatches(issues, filter, fields, evaluateOptions),
    [],
  );
  const assistant = useFilterAssistant({
    fields,
    state,
    resolve: demoResolve,
    evaluateOptions,
    onPreviewCount,
  });

  return (
    <div className="grid gap-4">
      <FilterAssistant assistant={assistant} />
      <FilterBar
        fields={fields}
        state={state}
        data={issues}
        evaluateOptions={evaluateOptions}
      />
    </div>
  );
}
