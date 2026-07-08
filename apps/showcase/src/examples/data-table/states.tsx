"use client";

import { useState } from "react";
import {
  Button,
  DataTable,
  type DataTableColumnDef,
} from "@dethink/components";

type Row = { id: string; name: string };

const columns: DataTableColumnDef<Row>[] = [
  { accessorKey: "name", header: "Name" },
];

export function DataTableStates() {
  const [state, setState] = useState<"loading" | "empty" | "error">("empty");

  return (
    <div className="space-y-3">
      <div className="flex justify-center gap-2">
        {(["empty", "loading", "error"] as const).map((mode) => (
          <Button
            key={mode}
            size="sm"
            variant={state === mode ? "solid" : "outline"}
            onClick={() => setState(mode)}
          >
            {mode}
          </Button>
        ))}
      </div>
      <DataTable
        columns={columns}
        data={[]}
        getRowId={(row) => row.id}
        loading={state === "loading"}
        error={
          state === "error"
            ? "Could not load projects — retry shortly."
            : undefined
        }
        emptyContent="No projects yet. Create one to get started."
      />
    </div>
  );
}
