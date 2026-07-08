"use client";

import { useState } from "react";
import {
  Button,
  DataTable,
  type DataTableColumnDef,
  type DataTableRowSelectionState,
} from "@dethink/components";

type Incident = {
  id: string;
  title: string;
  service: string;
  severity: "sev1" | "sev2" | "sev3";
  status: "open" | "acknowledged" | "resolved";
};

const initialIncidents: Incident[] = [
  {
    id: "i1",
    title: "Elevated 5xx on checkout",
    service: "billing",
    severity: "sev1",
    status: "open",
  },
  {
    id: "i2",
    title: "Slow queries on search",
    service: "search",
    severity: "sev2",
    status: "open",
  },
  {
    id: "i3",
    title: "Webhook retries spiking",
    service: "integrations",
    severity: "sev3",
    status: "acknowledged",
  },
  {
    id: "i4",
    title: "Cache hit rate dropped",
    service: "api-gateway",
    severity: "sev2",
    status: "open",
  },
  {
    id: "i5",
    title: "Cert expiring in 7 days",
    service: "edge",
    severity: "sev3",
    status: "open",
  },
];

const severityTone: Record<Incident["severity"], string> = {
  sev1: "bg-destructive/10 text-destructive",
  sev2: "bg-warning/15 text-warning",
  sev3: "bg-muted text-muted-foreground",
};

const columns: DataTableColumnDef<Incident>[] = [
  { accessorKey: "title", header: "Incident" },
  { accessorKey: "service", header: "Service" },
  {
    accessorKey: "severity",
    header: "Severity",
    cell: ({ row }) => (
      <span
        className={`rounded-full px-2 py-0.5 text-xs font-medium uppercase ${severityTone[row.original.severity]}`}
      >
        {row.original.severity}
      </span>
    ),
  },
  { accessorKey: "status", header: "Status" },
];

/**
 * The full feature set in one seat: sorting, filtering, selection, and
 * pagination together, with a bulk action operating on the selected rows
 * and a live region confirming what changed.
 */
export function DataTableRecipeOpsDashboard() {
  const [incidents, setIncidents] = useState(initialIncidents);
  const [rowSelection, setRowSelection] = useState<DataTableRowSelectionState>(
    {},
  );
  const [statusMessage, setStatusMessage] = useState("");
  const selectedIds = Object.keys(rowSelection).filter(
    (id) => rowSelection[id],
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p aria-live="polite" className="text-muted-foreground text-sm">
          {statusMessage || `${selectedIds.length} selected`}
        </p>
        <Button
          size="sm"
          disabled={selectedIds.length === 0}
          onClick={() => {
            setIncidents((current) =>
              current.map((incident) =>
                selectedIds.includes(incident.id)
                  ? { ...incident, status: "acknowledged" }
                  : incident,
              ),
            );
            setStatusMessage(`Acknowledged ${selectedIds.length} incident(s).`);
            setRowSelection({});
          }}
        >
          Acknowledge selected
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={incidents}
        getRowId={(row) => row.id}
        selectionMode="multiple"
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        enableGlobalFilter
        globalFilterPlaceholder="Filter incidents…"
        enablePagination
        defaultPagination={{ pageIndex: 0, pageSize: 4 }}
        pageSizeOptions={[4, 8]}
        defaultSorting={[{ id: "severity", desc: false }]}
      />
    </div>
  );
}
