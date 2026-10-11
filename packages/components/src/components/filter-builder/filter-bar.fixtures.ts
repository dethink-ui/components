import { screen } from "@testing-library/react";
import { createFilter, createFilterCondition, defineFilterFields } from ".";

interface Issue {
  title: string;
  status: string;
  labels: string[];
}

export const fields = defineFilterFields<Issue>([
  { key: "title", label: "Title", type: "text", placeholder: "Search titles" },
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
    ],
  },
]);

export function statusFilter(value: string[] = ["open", "blocked"]) {
  return createFilter({
    id: "root",
    children: [
      createFilterCondition({
        id: "status",
        field: "status",
        operator: "isAnyOf",
        value,
      }),
      createFilterCondition({
        id: "title",
        field: "title",
        operator: "contains",
        value: "api",
      }),
    ],
  });
}

export function toolbar() {
  return screen.getByRole("toolbar", { name: "Filters" });
}
