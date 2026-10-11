"use client";

import { useState } from "react";
import {
  FilterBar,
  FilterGroupEditor,
  createFilter,
  createFilterCondition,
  defineFilterFields,
  describeFilter,
  type Filter,
} from "@dethink/components";

const fields = defineFilterFields([
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
    key: "priority",
    label: "Priority",
    type: "option",
    options: [
      { value: "urgent", label: "Urgent" },
      { value: "high", label: "High" },
      { value: "low", label: "Low" },
    ],
  },
  {
    key: "labels",
    label: "Labels",
    type: "multiOption",
    options: [
      { value: "bug", label: "Bug" },
      { value: "security", label: "Security" },
      { value: "customer", label: "Customer" },
    ],
  },
  { key: "assignee", label: "Assignee", type: "text", placeholder: "Name" },
]);

export function FilterBarGroups() {
  const [filter, setFilter] = useState<Filter>(() =>
    createFilter({
      id: "triage",
      children: [
        createFilterCondition({
          id: "status",
          field: "status",
          operator: "isNoneOf",
          value: ["done"],
        }),
        createFilter({
          id: "hot",
          combinator: "or",
          children: [
            createFilterCondition({
              id: "priority",
              field: "priority",
              operator: "isAnyOf",
              value: ["urgent"],
            }),
            createFilterCondition({
              id: "labels",
              field: "labels",
              operator: "includesAny",
              value: ["security", "customer"],
            }),
          ],
        }),
      ],
    }),
  );

  return (
    <div className="grid gap-4">
      <FilterBar fields={fields} value={filter} onValueChange={setFilter} />
      <p className="text-muted-foreground text-sm">
        {describeFilter(filter, fields)}
      </p>
      <div className="rounded-lg border p-4">
        <p className="mb-3 text-sm font-medium">Inline group editor</p>
        <FilterBar fields={fields} value={filter} onValueChange={setFilter}>
          <FilterGroupEditor className="basis-full" />
        </FilterBar>
      </div>
    </div>
  );
}
