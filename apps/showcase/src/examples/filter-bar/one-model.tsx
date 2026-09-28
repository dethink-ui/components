"use client";

import { useState } from "react";
import {
  FilterBar,
  createFilter,
  createFilterCondition,
  defineFilterFields,
  describeFilter,
  type Filter,
} from "@dethink/components";

const fields = defineFilterFields([
  {
    key: "region",
    label: "Region",
    type: "option",
    options: [
      { value: "us-east", label: "US East" },
      { value: "eu-west", label: "EU West" },
      { value: "ap-south", label: "AP South" },
    ],
  },
  {
    key: "tags",
    label: "Tags",
    type: "multiOption",
    options: [
      { value: "gpu", label: "GPU" },
      { value: "spot", label: "Spot" },
      { value: "pci", label: "PCI" },
    ],
  },
  { key: "host", label: "Host", type: "text", placeholder: "api-" },
]);

export function FilterBarOneModel() {
  const [filter, setFilter] = useState<Filter>(() =>
    createFilter({
      id: "hosts",
      children: [
        createFilterCondition({
          id: "region",
          field: "region",
          operator: "isAnyOf",
          value: ["eu-west"],
        }),
        createFilterCondition({
          id: "tags",
          field: "tags",
          operator: "includesAll",
          value: ["gpu", "spot"],
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
      <pre className="bg-muted/40 max-h-64 overflow-auto rounded-md border p-3 text-xs">
        {JSON.stringify(filter, null, 2)}
      </pre>
    </div>
  );
}
