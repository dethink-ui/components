import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { DataTable, type DataTableColumnDef } from ".";

interface Workspace {
  id: string;
  name: string;
  requests: number;
}

const data: Workspace[] = [
  {
    id: "workspace-production",
    name: "Production",
    requests: 12400,
  },
];

const columns: DataTableColumnDef<Workspace>[] = [
  {
    accessorKey: "name",
    header: "Workspace",
  },
  {
    accessorKey: "requests",
    header: "Requests",
  },
];

function ServerDataTable() {
  return (
    <DataTable
      caption="Server-rendered data table"
      columns={columns}
      data={data}
      density="compact"
      defaultSorting={[{ id: "requests", desc: true }]}
      enableGlobalFilter
      enablePagination
      getRowId={(row) => row.id}
      renderRowActions={(row) => (
        <button type="button">Manage {row.original.name}</button>
      )}
      selectionMode="multiple"
    />
  );
}

describe("DataTable SSR", () => {
  it("renders DataTable and table markup on the server", () => {
    const markup = renderToString(<ServerDataTable />);

    expect(markup).toContain('data-slot="data-table"');
    expect(markup).toContain('data-slot="table"');
    expect(markup).toContain('data-slot="table-caption"');
    expect(markup).toContain('data-slot="data-table-toolbar"');
    expect(markup).toContain('data-slot="data-table-global-filter"');
    expect(markup).toContain('data-slot="data-table-sort-button"');
    expect(markup).toContain('data-slot="data-table-pagination"');
    expect(markup).toContain('data-table-slot="selection-cell"');
    expect(markup).toContain('data-table-slot="row-actions"');
    expect(markup).toContain('data-density="compact"');
    expect(markup).toContain('aria-sort="descending"');
  });

  it("hydrates without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const container = document.createElement("div");
    container.innerHTML = renderToString(<ServerDataTable />);

    await act(async () => {
      hydrateRoot(container, <ServerDataTable />);
    });

    expect(
      consoleError.mock.calls.some(([message]) =>
        String(message).toLowerCase().includes("hydration"),
      ),
    ).toBe(false);

    consoleError.mockRestore();
  });
});
