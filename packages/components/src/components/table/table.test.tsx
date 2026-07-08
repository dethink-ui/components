import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Checkbox } from "../checkbox";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  tableCaptionClassNames,
  tableCellClassNames,
  tableContainerClassNames,
  tableHeadClassNames,
  tableRowClassNames,
  type TableCaptionPlacement,
  type TableCellAlign,
  type TableDensity,
  type TableRowTone,
} from ".";

const densities: TableDensity[] = ["compact", "default", "comfortable"];
const alignments: TableCellAlign[] = ["start", "center", "end"];
const captionPlacements: TableCaptionPlacement[] = ["top", "bottom"];
const rowTones: TableRowTone[] = ["default", "muted"];

const alignClasses: Record<TableCellAlign, string> = {
  start: "text-start",
  center: "text-center",
  end: "text-end",
};

describe("Table", () => {
  it("renders a responsive wrapper and native table with safe defaults", () => {
    render(
      <Table aria-label="Workspace usage">
        <TableHeader>
          <TableRow>
            <TableHead>Workspace</TableHead>
            <TableHead align="end">Requests</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableHead scope="row">Production</TableHead>
            <TableCell numeric align="end">
              12,400
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );

    const table = screen.getByRole("table", { name: "Workspace usage" });
    const container = table.parentElement;

    expect(container).toHaveAttribute("data-slot", "table-container");
    expect(container).toHaveAttribute("data-density", "default");
    expect(container).toHaveClass("relative", "w-full", "overflow-x-auto");
    expect(table.tagName).toBe("TABLE");
    expect(table).toHaveAttribute("data-slot", "table");
    expect(table).toHaveAttribute("data-density", "default");
    expect(table).not.toHaveAttribute("role");
    expect(table).toHaveClass(
      "w-full",
      "min-w-full",
      "caption-bottom",
      "border-collapse",
      "text-sm",
      "text-foreground",
    );
  });

  it("renders the approved table anatomy slots", () => {
    render(
      <Table>
        <TableCaption>Current workspace quotas</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Workspace</TableHead>
            <TableHead>Plan</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow selected tone="muted">
            <TableHead scope="row">Production</TableHead>
            <TableCell>Enterprise</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow hoverable={false}>
            <TableCell colSpan={2}>1 workspace</TableCell>
          </TableRow>
        </TableFooter>
      </Table>,
    );

    const table = screen.getByRole("table", {
      name: "Current workspace quotas",
    });
    const caption = screen.getByText("Current workspace quotas");
    const productionHeader = screen.getByRole("rowheader", {
      name: "Production",
    });
    const selectedRow = productionHeader.parentElement;
    const footerCell = screen.getByText("1 workspace");

    expect(caption.tagName).toBe("CAPTION");
    expect(caption).toHaveAttribute("data-slot", "table-caption");
    expect(caption).toHaveAttribute("data-placement", "bottom");
    expect(table.querySelector("thead")).toHaveAttribute(
      "data-slot",
      "table-header",
    );
    expect(table.querySelector("tbody")).toHaveAttribute(
      "data-slot",
      "table-body",
    );
    expect(table.querySelector("tfoot")).toHaveAttribute(
      "data-slot",
      "table-footer",
    );
    expect(selectedRow).toHaveAttribute("data-slot", "table-row");
    expect(selectedRow).toHaveAttribute("data-selected", "true");
    expect(selectedRow).toHaveAttribute("data-tone", "muted");
    expect(selectedRow).toHaveClass(
      "motion-safe:transition-colors",
      "motion-safe:duration-150",
      "motion-safe:ease-out",
      "motion-reduce:transition-none",
    );
    expect(productionHeader).toHaveClass("h-[var(--table-row-min-height)]");
    expect(footerCell).toHaveClass("h-[var(--table-row-min-height)]");
    expect(footerCell).toHaveAttribute("colspan", "2");
    expect(footerCell.parentElement).toHaveAttribute("data-hoverable", "false");
  });

  it("targets real checkbox markup for compact selection cell padding", () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Checkbox aria-label="Select all invoices" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>
              <Checkbox aria-label="Select invoice" />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );

    const [headerCheckbox, bodyCheckbox] = screen.getAllByRole("checkbox");
    const headerCell = headerCheckbox.closest("th");
    const bodyCell = bodyCheckbox.closest("td");

    expect(headerCell).toHaveClass(
      "[&:has([data-slot=checkbox])]:pe-0",
      "[&:has([data-slot=checkbox-input])]:pe-0",
      "[&:has(input[type=checkbox])]:pe-0",
    );
    expect(bodyCell).toHaveClass(
      "h-[var(--table-row-min-height)]",
      "[&:has([data-slot=checkbox])]:pe-0",
      "[&:has([data-slot=checkbox-input])]:pe-0",
      "[&:has(input[type=checkbox])]:pe-0",
    );
  });

  it.each(densities)(
    "applies %s density to the responsive wrapper",
    (density) => {
      render(
        <Table density={density} aria-label={`${density} table`}>
          <TableBody>
            <TableRow>
              <TableCell>{density}</TableCell>
            </TableRow>
          </TableBody>
        </Table>,
      );

      const table = screen.getByRole("table", { name: `${density} table` });

      expect(table).toHaveAttribute("data-density", density);
      expect(table.parentElement).toHaveAttribute("data-density", density);
      expect(table.parentElement?.className).toContain("--table-cell-px");
      expect(table.parentElement?.className).toContain("--table-cell-py");
    },
  );

  it.each(alignments)(
    "applies %s alignment to header and data cells",
    (align) => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead align={align}>Head {align}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell align={align}>Cell {align}</TableCell>
            </TableRow>
          </TableBody>
        </Table>,
      );

      const head = screen.getByRole("columnheader", { name: `Head ${align}` });
      const cell = screen.getByText(`Cell ${align}`);

      expect(head).toHaveAttribute("data-align", align);
      expect(cell).toHaveAttribute("data-align", align);
      expect(head).toHaveClass(alignClasses[align]);
      expect(cell).toHaveClass(alignClasses[align]);
    },
  );

  it.each(captionPlacements)("applies %s caption placement", (placement) => {
    render(
      <Table>
        <TableCaption placement={placement}>Caption {placement}</TableCaption>
      </Table>,
    );

    const caption = screen.getByText(`Caption ${placement}`);

    expect(caption).toHaveAttribute("data-placement", placement);
    expect(caption).toHaveClass(
      placement === "top" ? "caption-top" : "caption-bottom",
    );
  });

  it.each(rowTones)("applies %s row tone", (tone) => {
    render(
      <Table>
        <TableBody>
          <TableRow tone={tone}>
            <TableCell>tone {tone}</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );

    expect(screen.getByText(`tone ${tone}`).parentElement).toHaveAttribute(
      "data-tone",
      tone,
    );
  });

  it("preserves native table attributes for simple and complex header relationships", () => {
    render(
      <Table aria-label="Billing">
        <TableHeader>
          <TableRow>
            <TableHead id="workspace-header" abbr="Workspace">
              Workspace
            </TableHead>
            <TableHead id="quota-header" colSpan={2}>
              Quota
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableHead id="production-row" scope="row">
              Production
            </TableHead>
            <TableCell headers="production-row quota-header" rowSpan={2}>
              2 TB
            </TableCell>
            <TableCell headers="production-row workspace-header">
              Active
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );

    expect(
      screen.getByRole("columnheader", { name: "Workspace" }),
    ).toHaveAttribute("abbr", "Workspace");
    expect(screen.getByRole("columnheader", { name: "Quota" })).toHaveAttribute(
      "colspan",
      "2",
    );
    expect(
      screen.getByRole("rowheader", { name: "Production" }),
    ).toHaveAttribute("scope", "row");
    expect(screen.getByText("2 TB")).toHaveAttribute(
      "headers",
      "production-row quota-header",
    );
    expect(screen.getByText("2 TB")).toHaveAttribute("rowspan", "2");
  });

  it("defaults TableHead scope to column headers while preserving overrides", () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Default column</TableHead>
            <TableHead scope="colgroup">Grouped column</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableHead scope="row">Row header</TableHead>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );

    expect(
      screen.getByRole("columnheader", { name: "Default column" }),
    ).toHaveAttribute("scope", "col");
    expect(screen.getByText("Grouped column")).toHaveAttribute(
      "scope",
      "colgroup",
    );
    expect(
      screen.getByRole("rowheader", { name: "Row header" }),
    ).toHaveAttribute("scope", "row");
  });

  it("marks numeric cells without formatting their values", () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell numeric align="end">
              99.95%
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );

    const cell = screen.getByText("99.95%");

    expect(cell).toHaveAttribute("data-numeric", "true");
    expect(cell).toHaveClass("tabular-nums", "text-end");
  });

  it("composes consumer classes through helper functions", () => {
    expect(
      tableContainerClassNames({ className: "custom-container" }),
    ).toContain("custom-container");
    expect(tableRowClassNames({ className: "custom-row" })).toContain(
      "custom-row",
    );
    expect(tableHeadClassNames({ className: "custom-head" })).toContain(
      "custom-head",
    );
    expect(tableCellClassNames({ className: "custom-cell" })).toContain(
      "custom-cell",
    );
    expect(tableCaptionClassNames({ className: "custom-caption" })).toContain(
      "custom-caption",
    );
  });

  it("rejects unsupported design-system values at the TypeScript boundary", () => {
    const validDensity = <Table density="compact" />;
    const validHead = <TableHead align="end" />;
    const validCell = <TableCell align="center" numeric />;
    // @ts-expect-error Table density uses constrained token values.
    const invalidDensity = <Table density="dense" />;
    // @ts-expect-error TableCell align uses logical alignment tokens.
    const invalidAlign = <TableCell align="right" />;
    // @ts-expect-error TableRow tone only exposes approved visual hooks.
    const invalidTone = <TableRow tone="danger" />;

    expect(validDensity).toBeTruthy();
    expect(validHead).toBeTruthy();
    expect(validCell).toBeTruthy();
    expect(invalidDensity).toBeTruthy();
    expect(invalidAlign).toBeTruthy();
    expect(invalidTone).toBeTruthy();
  });

  it("forwards refs to every native table slot", () => {
    const tableRef = createRef<HTMLTableElement>();
    const headerRef = createRef<HTMLTableSectionElement>();
    const bodyRef = createRef<HTMLTableSectionElement>();
    const footerRef = createRef<HTMLTableSectionElement>();
    const rowRef = createRef<HTMLTableRowElement>();
    const headRef = createRef<HTMLTableCellElement>();
    const cellRef = createRef<HTMLTableCellElement>();
    const captionRef = createRef<HTMLTableCaptionElement>();

    render(
      <Table ref={tableRef}>
        <TableCaption ref={captionRef}>Ref table</TableCaption>
        <TableHeader ref={headerRef}>
          <TableRow>
            <TableHead ref={headRef}>Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody ref={bodyRef}>
          <TableRow ref={rowRef}>
            <TableCell ref={cellRef}>Production</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter ref={footerRef}>
          <TableRow>
            <TableCell>Total</TableCell>
          </TableRow>
        </TableFooter>
      </Table>,
    );

    expect(tableRef.current?.tagName).toBe("TABLE");
    expect(headerRef.current?.tagName).toBe("THEAD");
    expect(bodyRef.current?.tagName).toBe("TBODY");
    expect(footerRef.current?.tagName).toBe("TFOOT");
    expect(rowRef.current?.tagName).toBe("TR");
    expect(headRef.current?.tagName).toBe("TH");
    expect(cellRef.current?.tagName).toBe("TD");
    expect(captionRef.current?.tagName).toBe("CAPTION");
  });
});
