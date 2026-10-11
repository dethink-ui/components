"use client";

import {
  DataTable,
  FilterBar,
  QueryInput,
  createFilter,
  createFilterCondition,
  defineFilterFields,
  useFilterState,
  type DataTableColumnDef,
} from "@dethink/components";
import { createMockFilterApi } from "../filter-server/mock-api";
import { PendingLine } from "../filter-server/pending-line";
import { useServerRows } from "../filter-server/use-server-rows";

type Order = {
  id: string;
  customer: string;
  region: "emea" | "amer" | "apac";
  plan: "starter" | "team" | "enterprise";
  amount: number;
  refunded: boolean;
};

const regions = ["emea", "amer", "apac"] as const;
const plans = ["starter", "team", "enterprise"] as const;
const customers = ["Acme", "Globex", "Initech", "Umbrella", "Hooli", "Stark"];

// Deterministic sample data, standing in for a database table.
const orders: Order[] = Array.from({ length: 240 }, (_, index) => ({
  id: `ORD-${1000 + index}`,
  customer: customers[index % customers.length] ?? "Acme",
  region: regions[(index * 7) % 3] ?? "emea",
  plan: plans[(index * 5) % 3] ?? "team",
  amount: ((index * 137) % 4900) + 100,
  refunded: index % 11 === 0,
}));

const fields = defineFilterFields<Order>([
  { key: "customer", label: "Customer", type: "text" },
  {
    key: "region",
    label: "Region",
    type: "option",
    options: [
      { value: "emea", label: "EMEA" },
      { value: "amer", label: "Americas" },
      { value: "apac", label: "APAC" },
    ],
  },
  {
    key: "plan",
    label: "Plan",
    type: "option",
    options: [
      { value: "starter", label: "Starter" },
      { value: "team", label: "Team" },
      { value: "enterprise", label: "Enterprise" },
    ],
  },
  { key: "amount", label: "Amount", type: "number" },
  { key: "refunded", label: "Refunded", type: "boolean" },
]);

// The "server": receives the filter as JSON, returns a page and counts.
const api = createMockFilterApi(orders, fields, { latency: 500 });

const columns: DataTableColumnDef<Order>[] = [
  { accessorKey: "id", header: "Order" },
  { accessorKey: "customer", header: "Customer" },
  { accessorKey: "region", header: "Region" },
  { accessorKey: "plan", header: "Plan" },
  { accessorKey: "amount", header: "Amount" },
];

export function FilterBarServerMode() {
  const state = useFilterState({
    defaultValue: createFilter({
      id: "orders",
      children: [
        createFilterCondition({
          id: "plan",
          field: "plan",
          operator: "isAnyOf",
          value: ["enterprise"],
        }),
      ],
    }),
  });
  const result = useServerRows(state.filter, api.search);

  return (
    <div className="relative grid gap-2" aria-busy={result.pending}>
      {/* A thin progress line instead of dimming: text keeps its contrast. */}
      <PendingLine active={result.pending && !result.initial} />
      <DataTable
        aria-label="Orders"
        columns={columns}
        data={result.rows}
        getRowId={(row) => row.id}
        // The server filters; the table shows what it returns.
        manualFiltering
        loading={result.initial}
        error={result.failed ? "Couldn't load orders." : undefined}
        emptyContent="No orders match."
        toolbar={
          <div className="grid w-full gap-2">
            <QueryInput fields={fields} state={state} controlSize="sm" />
            <FilterBar
              fields={fields}
              state={state}
              getFacets={api.facets}
              resultCount={result.pending ? undefined : result.total}
            />
          </div>
        }
      />
      {/* Fixed height: the status never pushes the table around. */}
      <p className="text-muted-foreground h-5 text-xs" aria-hidden="true">
        {result.pending
          ? "Updating…"
          : result.total === undefined
            ? ""
            : `${result.total} orders on the server; showing ${result.rows.length}.`}
      </p>
    </div>
  );
}
