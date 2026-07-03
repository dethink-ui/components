import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from ".";

function ServerTable() {
  return (
    <Table density="compact">
      <TableCaption placement="top">Server-rendered table</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Workspace</TableHead>
          <TableHead align="end">Requests</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow selected tone="muted">
          <TableHead scope="row">Production</TableHead>
          <TableCell numeric align="end">
            12,400
          </TableCell>
        </TableRow>
      </TableBody>
      <TableFooter>
        <TableRow hoverable={false}>
          <TableCell colSpan={2}>Total</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}

describe("Table SSR", () => {
  it("renders Table and slot markup on the server", () => {
    const markup = renderToString(<ServerTable />);

    expect(markup).toContain('data-slot="table-container"');
    expect(markup).toContain('data-slot="table"');
    expect(markup).toContain('data-slot="table-caption"');
    expect(markup).toContain('data-slot="table-header"');
    expect(markup).toContain('data-slot="table-body"');
    expect(markup).toContain('data-slot="table-footer"');
    expect(markup).toContain('data-slot="table-row"');
    expect(markup).toContain('data-slot="table-head"');
    expect(markup).toContain('data-slot="table-cell"');
    expect(markup).toContain('data-density="compact"');
    expect(markup).toContain('scope="row"');
    expect(markup).toContain('data-numeric="true"');
  });

  it("hydrates without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const container = document.createElement("div");
    container.innerHTML = renderToString(<ServerTable />);

    await act(async () => {
      hydrateRoot(container, <ServerTable />);
    });

    expect(
      consoleError.mock.calls.some(([message]) =>
        String(message).toLowerCase().includes("hydration"),
      ),
    ).toBe(false);

    consoleError.mockRestore();
  });
});
