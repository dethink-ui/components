import { useState } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import {
  DataTable,
  dataTableClassNames,
  dataTableEmptyClassNames,
  dataTableSortButtonClassNames,
  type DataTableColumnDef,
  type DataTableSortingState,
} from ".";

interface Workspace {
  id: string;
  name: string;
  owner: string;
  requests: number;
}

const workspaces: Workspace[] = [
  {
    id: "workspace-production",
    name: "Production",
    owner: "ops@example.com",
    requests: 12400,
  },
  {
    id: "workspace-sandbox",
    name: "Sandbox",
    owner: "qa@example.com",
    requests: 320,
  },
  {
    id: "workspace-audit",
    name: "Audit",
    owner: "security@example.com",
    requests: 18,
  },
];

const columns: DataTableColumnDef<Workspace>[] = [
  {
    accessorKey: "name",
    header: "Workspace",
    cell: ({ getValue }) => getValue<string>(),
  },
  {
    accessorKey: "owner",
    header: "Owner",
    enableSorting: false,
  },
  {
    accessorKey: "requests",
    header: "Requests",
    cell: ({ getValue }) => getValue<number>().toLocaleString("en-US"),
  },
];

function getBodyRows() {
  return screen.getAllByRole("row").slice(1);
}

describe("DataTable", () => {
  it("renders typed data through semantic Dethink Table slots", () => {
    render(
      <DataTable
        aria-label="Workspace usage"
        caption="Workspace usage summary"
        columns={columns}
        data={workspaces}
        density="compact"
        getRowId={(row) => row.id}
      />,
    );

    const table = screen.getByRole("table", { name: "Workspace usage" });
    const root = table.closest('[data-slot="data-table"]');
    const firstBodyRow = getBodyRows()[0];

    expect(root).toHaveAttribute("data-density", "compact");
    expect(root).toHaveClass("w-full");
    expect(table).toHaveAttribute("data-slot", "table");
    expect(table).toHaveAttribute("data-density", "compact");
    expect(table).not.toHaveAttribute("role", "grid");
    expect(screen.queryByRole("grid")).toBeNull();
    expect(screen.getByText("Workspace usage summary").tagName).toBe("CAPTION");
    expect(screen.getByRole("columnheader", { name: /Workspace/ })).toHaveAttribute(
      "data-table-slot",
      "header-cell",
    );
    expect(firstBodyRow).toHaveAttribute("data-table-slot", "row");
    expect(firstBodyRow).toHaveAttribute("data-row-id", "workspace-production");
    expect(within(firstBodyRow).getByText("Production")).toBeInTheDocument();
    expect(within(firstBodyRow).getByText("ops@example.com")).toBeInTheDocument();
    expect(within(firstBodyRow).getByText("12,400")).toBeInTheDocument();
  });

  it("sorts rows with keyboard-operable header buttons", async () => {
    const user = userEvent.setup();

    render(
      <DataTable
        aria-label="Workspace usage"
        columns={columns}
        data={workspaces}
        getRowId={(row) => row.id}
      />,
    );

    const requestsButton = screen.getByRole("button", {
      name: "Sort Requests ascending",
    });
    const requestsHeader = requestsButton.closest("th");

    expect(requestsHeader).not.toHaveAttribute("aria-sort");
    expect(requestsHeader).toHaveAttribute("data-sortable", "true");
    expect(requestsButton).toHaveAttribute("data-slot", "data-table-sort-button");

    requestsButton.focus();
    await user.keyboard("[Enter]");

    expect(requestsHeader).toHaveAttribute("aria-sort", "ascending");
    expect(requestsHeader).toHaveAttribute("data-sorted", "asc");
    expect(requestsButton).toHaveAccessibleName("Sort Requests descending");
    expect(within(getBodyRows()[0]).getByText("Audit")).toBeInTheDocument();
    expect(within(getBodyRows()[1]).getByText("Sandbox")).toBeInTheDocument();
    expect(within(getBodyRows()[2]).getByText("Production")).toBeInTheDocument();

    await user.click(requestsButton);

    expect(requestsHeader).toHaveAttribute("aria-sort", "descending");
    expect(requestsHeader).toHaveAttribute("data-sorted", "desc");
    expect(requestsButton).toHaveAccessibleName("Clear Requests sort");
    expect(within(getBodyRows()[0]).getByText("Production")).toBeInTheDocument();
  });

  it("supports controlled sorting state and change callbacks", async () => {
    const user = userEvent.setup();

    function ControlledDataTable() {
      const [sorting, setSorting] = useState<DataTableSortingState>([]);

      return (
        <DataTable
          aria-label="Controlled workspaces"
          columns={columns}
          data={workspaces}
          getRowId={(row) => row.id}
          sorting={sorting}
          onSortingChange={setSorting}
        />
      );
    }

    render(<ControlledDataTable />);

    await user.click(
      screen.getByRole("button", { name: "Sort Workspace ascending" }),
    );

    expect(
      screen.getByRole("button", { name: "Sort Workspace descending" }),
    ).toBeInTheDocument();
    expect(within(getBodyRows()[0]).getByText("Audit")).toBeInTheDocument();
  });

  it("can expose sort state without client-side sorting in manual mode", () => {
    render(
      <DataTable
        aria-label="Manual workspaces"
        columns={columns}
        data={workspaces}
        defaultSorting={[{ id: "requests", desc: false }]}
        getRowId={(row) => row.id}
        manualSorting
      />,
    );

    const root = screen
      .getByRole("table", { name: "Manual workspaces" })
      .closest('[data-slot="data-table"]');
    const requestsButton = screen.getByRole("button", {
      name: "Sort Requests descending",
    });

    expect(root).toHaveAttribute("data-manual-sorting", "true");
    expect(requestsButton.closest("th")).toHaveAttribute(
      "aria-sort",
      "ascending",
    );
    expect(within(getBodyRows()[0]).getByText("Production")).toBeInTheDocument();
    expect(within(getBodyRows()[1]).getByText("Sandbox")).toBeInTheDocument();
    expect(within(getBodyRows()[2]).getByText("Audit")).toBeInTheDocument();
  });

  it("renders custom classes and an empty state", () => {
    render(
      <DataTable
        aria-label="Empty workspaces"
        columns={columns}
        data={[]}
        className="custom-root"
        tableClassName="custom-table"
        tableContainerClassName="custom-container"
        emptyContent="No workspaces match this view."
      />,
    );

    const table = screen.getByRole("table", { name: "Empty workspaces" });
    const root = table.closest('[data-slot="data-table"]');
    const emptyCell = screen.getByText("No workspaces match this view.");

    expect(root).toHaveClass("custom-root");
    expect(table).toHaveClass("custom-table");
    expect(table.parentElement).toHaveClass("custom-container");
    expect(emptyCell).toHaveAttribute("data-table-slot", "empty");
    expect(emptyCell).toHaveAttribute("colspan", "3");
    expect(emptyCell).toHaveClass("h-24", "text-center", "text-muted-foreground");
  });

  it("exposes class name helpers", () => {
    expect(dataTableClassNames({ className: "custom" })).toContain("custom");
    expect(dataTableSortButtonClassNames({ className: "custom" })).toContain(
      "custom",
    );
    expect(dataTableEmptyClassNames({ className: "custom" })).toContain(
      "custom",
    );
  });

  it("filters rows with the global filter control", async () => {
    const user = userEvent.setup();

    render(
      <DataTable
        aria-label="Filterable workspaces"
        columns={columns}
        data={workspaces}
        enableGlobalFilter
        getRowId={(row) => row.id}
      />,
    );

    await user.type(screen.getByLabelText("Search table"), "sand");

    expect(within(getBodyRows()[0]).getByText("Sandbox")).toBeInTheDocument();
    expect(screen.queryByText("Production")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Clear search" }));

    expect(screen.getByText("Production")).toBeInTheDocument();
  });

  it("filters rows with column filter controls", async () => {
    const user = userEvent.setup();

    render(
      <DataTable
        aria-label="Column filter workspaces"
        columns={columns}
        data={workspaces}
        enableColumnFilters
        getRowId={(row) => row.id}
      />,
    );

    await user.type(screen.getByLabelText("Filter Owner"), "qa");

    expect(within(getBodyRows()[0]).getByText("Sandbox")).toBeInTheDocument();
    expect(screen.queryByText("ops@example.com")).not.toBeInTheDocument();
  });

  it("paginates local rows and changes page size", async () => {
    const user = userEvent.setup();

    render(
      <DataTable
        aria-label="Paginated workspaces"
        columns={columns}
        data={workspaces}
        defaultPagination={{ pageIndex: 0, pageSize: 1 }}
        enablePagination
        getRowId={(row) => row.id}
        pageSizeOptions={[1, 2]}
      />,
    );

    expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();
    expect(within(getBodyRows()[0]).getByText("Production")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Next page" }));

    expect(screen.getByText("Page 2 of 3")).toBeInTheDocument();
    expect(within(getBodyRows()[0]).getByText("Sandbox")).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Rows per page"), "2");

    expect(screen.getByText("Page 1 of 2")).toBeInTheDocument();
    expect(getBodyRows()).toHaveLength(2);
  });

  it("selects rows and renders row actions", async () => {
    const user = userEvent.setup();

    render(
      <DataTable
        aria-label="Selectable workspaces"
        columns={columns}
        data={workspaces}
        getRowId={(row) => row.id}
        renderRowActions={(row) => (
          <button type="button">Manage {row.original.name}</button>
        )}
        selectionMode="multiple"
      />,
    );

    expect(screen.getByText("3 rows")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Manage Production" }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("checkbox", { name: "Select row workspace-production" }),
    );

    expect(screen.getByText("1 of 3 rows selected")).toBeInTheDocument();
    expect(getBodyRows()[0]).toHaveAttribute("data-selected", "true");

    await user.click(screen.getByRole("checkbox", { name: "Select all rows" }));

    expect(screen.getByText("3 of 3 rows selected")).toBeInTheDocument();
  });

  it("toggles column visibility", async () => {
    const user = userEvent.setup();

    render(
      <DataTable
        aria-label="Column visibility workspaces"
        columns={columns}
        data={workspaces}
        enableColumnVisibility
        getRowId={(row) => row.id}
      />,
    );

    expect(screen.getByRole("columnheader", { name: "Owner" })).toBeInTheDocument();

    await user.click(
      screen.getByRole("checkbox", { name: "Toggle Owner column" }),
    );

    expect(
      screen.queryByRole("columnheader", { name: "Owner" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("ops@example.com")).not.toBeInTheDocument();
  });

  it("keeps rows in manual filtering and pagination modes", async () => {
    const user = userEvent.setup();

    render(
      <DataTable
        aria-label="Manual workflow workspaces"
        columns={columns}
        data={workspaces.slice(0, 1)}
        enableGlobalFilter
        enablePagination
        getRowId={(row) => row.id}
        manualFiltering
        manualPagination
        pageCount={10}
        rowCount={100}
      />,
    );

    const root = screen
      .getByRole("table", { name: "Manual workflow workspaces" })
      .closest('[data-slot="data-table"]');

    expect(root).toHaveAttribute("data-manual-filtering", "true");
    expect(root).toHaveAttribute("data-manual-pagination", "true");
    expect(screen.getByText("Page 1 of 10")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Search table"), "missing");

    expect(within(getBodyRows()[0]).getByText("Production")).toBeInTheDocument();
  });

  it("renders loading and error states", () => {
    const { rerender } = render(
      <DataTable
        aria-label="Loading workspaces"
        columns={columns}
        data={workspaces}
        loading
        loadingContent="Refreshing workspaces"
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent(
      "Refreshing workspaces",
    );
    expect(
      screen.getByRole("table", { name: "Loading workspaces" }).closest(
        '[data-slot="data-table"]',
      ),
    ).toHaveAttribute("data-status", "loading");

    rerender(
      <DataTable
        aria-label="Errored workspaces"
        columns={columns}
        data={workspaces}
        error="Workspaces could not be loaded"
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Workspaces could not be loaded",
    );
    expect(
      screen.getByRole("table", { name: "Errored workspaces" }).closest(
        '[data-slot="data-table"]',
      ),
    ).toHaveAttribute("data-status", "error");
  });
});
