import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { DethinkProvider } from "../../foundation/dethink-provider";
import { Button } from "../button";
import { Checkbox } from "../checkbox";
import { Link } from "../link";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from ".";

expect.extend(toHaveNoViolations);

describe("Table accessibility", () => {
  it("has no axe violations for captions, scoped headers, and nested actions", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <main aria-label="Table accessibility smoke">
          <Table>
            <TableCaption>Workspace billing summary</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead id="workspace">Workspace</TableHead>
                <TableHead id="owner">Owner</TableHead>
                <TableHead id="usage" align="end">
                  Usage
                </TableHead>
                <TableHead id="actions">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow selected>
                <TableHead id="production" scope="row">
                  Production
                </TableHead>
                <TableCell headers="production owner">
                  ops@example.com
                </TableCell>
                <TableCell headers="production usage" numeric align="end">
                  2.4 TB
                </TableCell>
                <TableCell headers="production actions">
                  <Button size="sm" variant="outline">
                    Manage
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableHead id="sandbox" scope="row">
                  Sandbox
                </TableHead>
                <TableCell headers="sandbox owner">qa@example.com</TableCell>
                <TableCell headers="sandbox usage" numeric align="end">
                  320 GB
                </TableCell>
                <TableCell headers="sandbox actions">
                  <Link href="/billing/sandbox">View details</Link>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableHead id="audit" scope="row">
                  Audit
                </TableHead>
                <TableCell headers="audit owner">
                  security@example.com
                </TableCell>
                <TableCell headers="audit usage" numeric align="end">
                  18 GB
                </TableCell>
                <TableCell headers="audit actions">
                  <Checkbox aria-label="Include audit workspace" />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </main>
      </DethinkProvider>,
    );

    const table = screen.getByRole("table", {
      name: "Workspace billing summary",
    });
    const rowHeader = screen.getByRole("rowheader", { name: "Production" });
    const button = screen.getByRole("button", { name: "Manage" });
    const link = screen.getByRole("link", { name: "View details" });
    const checkbox = screen.getByRole("checkbox", {
      name: "Include audit workspace",
    });

    expect(table).toHaveAttribute("data-slot", "table");
    expect(table).not.toHaveAttribute("role", "grid");
    expect(container.querySelector('[role="grid"]')).toBeNull();
    expect(rowHeader).toHaveAttribute("scope", "row");
    expect(button).toHaveAttribute("data-slot", "button");
    expect(link).toHaveAttribute("data-slot", "link");
    expect(checkbox).toHaveAttribute("data-slot", "checkbox-input");

    await expect(axe(container)).resolves.toHaveNoViolations();
  });
});
