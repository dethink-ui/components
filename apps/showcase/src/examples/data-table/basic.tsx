"use client";

import { DataTable, type DataTableColumnDef } from "@dethink/components";

type Deploy = {
  id: string;
  service: string;
  env: string;
  status: "success" | "failed" | "running";
  duration: string;
};

const deploys: Deploy[] = [
  { id: "d1", service: "api-gateway", env: "production", status: "success", duration: "4m 12s" },
  { id: "d2", service: "billing", env: "production", status: "failed", duration: "1m 03s" },
  { id: "d3", service: "web-app", env: "staging", status: "success", duration: "6m 41s" },
  { id: "d4", service: "worker", env: "production", status: "running", duration: "—" },
  { id: "d5", service: "api-gateway", env: "staging", status: "success", duration: "3m 58s" },
];

const columns: DataTableColumnDef<Deploy>[] = [
  { accessorKey: "service", header: "Service" },
  { accessorKey: "env", header: "Environment" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const tone =
        status === "success"
          ? "text-success"
          : status === "failed"
            ? "text-destructive"
            : "text-info";
      return <span className={`font-medium ${tone}`}>{status}</span>;
    },
  },
  { accessorKey: "duration", header: "Duration" },
];

export function DataTableBasic() {
  return (
    <DataTable
      columns={columns}
      data={deploys}
      getRowId={(row) => row.id}
      caption="Latest deployments"
      enableGlobalFilter
      globalFilterPlaceholder="Filter deployments…"
      defaultSorting={[{ id: "service", desc: false }]}
    />
  );
}
