import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { DethinkProvider } from "../../foundation/dethink-provider";
import { DataTable, type DataTableColumnDef } from ".";

expect.extend(toHaveNoViolations);

interface Invoice {
  id: string;
  customer: string;
  status: string;
  total: number;
}

const invoices: Invoice[] = [
  {
    id: "invoice-1",
    customer: "Acme Corp",
    status: "Paid",
    total: 4200,
  },
  {
    id: "invoice-2",
    customer: "Globex",
    status: "Open",
    total: 1800,
  },
];

const columns: DataTableColumnDef<Invoice>[] = [
  {
    accessorKey: "customer",
    header: "Customer",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ getValue }) => `$${getValue<number>().toLocaleString("en-US")}`,
  },
];

describe("DataTable accessibility", () => {
  it("has no axe violations for captioned sortable table markup", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <main aria-label="DataTable accessibility smoke">
          <DataTable
            caption="Invoices"
            columns={columns}
            data={invoices}
            defaultSorting={[{ id: "customer", desc: false }]}
            getRowId={(row) => row.id}
          />
        </main>
      </DethinkProvider>,
    );

    const table = screen.getByRole("table", { name: "Invoices" });
    const customerSort = screen.getByRole("button", {
      name: "Sort Customer descending",
    });

    expect(table).toHaveAttribute("data-slot", "table");
    expect(table).not.toHaveAttribute("role", "grid");
    expect(container.querySelector('[role="grid"]')).toBeNull();
    expect(customerSort.closest("th")).toHaveAttribute("aria-sort", "ascending");

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it("has no axe violations for filter, visibility, selection, pagination, and row actions", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <main aria-label="DataTable workflow accessibility smoke">
          <DataTable
            aria-label="Invoice workflow"
            columns={columns}
            data={invoices}
            enableColumnFilters
            enableColumnVisibility
            enableGlobalFilter
            enablePagination
            getRowId={(row) => row.id}
            renderRowActions={(row) => (
              <button type="button">Open {row.original.customer}</button>
            )}
            selectionMode="multiple"
          />
        </main>
      </DethinkProvider>,
    );

    expect(
      screen.getByRole("textbox", { name: "Search table" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", { name: "Select all rows" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", { name: "Toggle Status column" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Next page" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Open Acme Corp" }),
    ).toBeInTheDocument();
    expect(container.querySelector('[role="grid"]')).toBeNull();

    await expect(axe(container)).resolves.toHaveNoViolations();
  });
});
