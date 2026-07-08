import { createRef, forwardRef, type MouseEvent } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  Grid,
  GridItem,
  gridClassNames,
  gridItemClassNames,
  type GridAlign,
  type GridColumns,
  type GridContent,
  type GridElement,
  type GridGap,
  type GridItemAlign,
  type GridItemElement,
  type GridItemJustify,
  type GridItemMinInlineSize,
  type GridItemSpan,
  type GridJustify,
  type GridRows,
} from ".";

const elements: GridElement[] = [
  "div",
  "section",
  "article",
  "main",
  "aside",
  "nav",
  "header",
  "footer",
  "ul",
  "ol",
  "li",
  "form",
  "fieldset",
];
const itemElements: GridItemElement[] = [
  "div",
  "span",
  "li",
  "section",
  "article",
  "aside",
];
const columns: GridColumns[] = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "12",
  "auto-fit-xs",
  "auto-fit-sm",
  "auto-fit-md",
  "auto-fit-lg",
];
const rows: GridRows[] = ["none", "1", "2", "3", "4", "5", "6"];
const gaps: GridGap[] = ["none", "1", "2", "3", "4", "5", "6", "8", "10", "12"];
const aligns: GridAlign[] = ["stretch", "start", "center", "end"];
const justifies: GridJustify[] = ["stretch", "start", "center", "end"];
const contents: GridContent[] = [
  "start",
  "center",
  "end",
  "between",
  "around",
  "evenly",
  "stretch",
];
const itemSpans: GridItemSpan[] = ["1", "2", "3", "4", "5", "6", "full"];
const itemAligns: GridItemAlign[] = [
  "auto",
  "stretch",
  "start",
  "center",
  "end",
];
const itemJustifies: GridItemJustify[] = [
  "auto",
  "stretch",
  "start",
  "center",
  "end",
];
const itemMinInlineSizes: GridItemMinInlineSize[] = ["auto", "0"];

const columnClasses: Record<GridColumns, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
  12: "grid-cols-12",
  "auto-fit-xs": "grid-cols-[repeat(auto-fit,minmax(min(12rem,100%),1fr))]",
  "auto-fit-sm": "grid-cols-[repeat(auto-fit,minmax(min(16rem,100%),1fr))]",
  "auto-fit-md": "grid-cols-[repeat(auto-fit,minmax(min(20rem,100%),1fr))]",
  "auto-fit-lg": "grid-cols-[repeat(auto-fit,minmax(min(24rem,100%),1fr))]",
};
const alignClasses: Record<GridAlign, string> = {
  stretch: "items-stretch",
  start: "items-start",
  center: "items-center",
  end: "items-end",
};
const justifyClasses: Record<GridJustify, string> = {
  stretch: "justify-items-stretch",
  start: "justify-items-start",
  center: "justify-items-center",
  end: "justify-items-end",
};
const contentClasses: Record<GridContent, string> = {
  start: "content-start",
  center: "content-center",
  end: "content-end",
  between: "content-between",
  around: "content-around",
  evenly: "content-evenly",
  stretch: "content-stretch",
};
const justifyContentClasses: Record<GridContent, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
  evenly: "justify-evenly",
  stretch: "justify-stretch",
};
const itemSpanClasses: Record<GridItemSpan, string> = {
  1: "col-span-1",
  2: "col-span-2",
  3: "col-span-3",
  4: "col-span-4",
  5: "col-span-5",
  6: "col-span-6",
  full: "col-span-full",
};
const itemRowSpanClasses: Record<GridItemSpan, string> = {
  1: "row-span-1",
  2: "row-span-2",
  3: "row-span-3",
  4: "row-span-4",
  5: "row-span-5",
  6: "row-span-6",
  full: "row-span-full",
};
const itemAlignClasses: Record<GridItemAlign, string> = {
  auto: "self-auto",
  stretch: "self-stretch",
  start: "self-start",
  center: "self-center",
  end: "self-end",
};
const itemJustifyClasses: Record<GridItemJustify, string> = {
  auto: "justify-self-auto",
  stretch: "justify-self-stretch",
  start: "justify-self-start",
  center: "justify-self-center",
  end: "justify-self-end",
};

const RouterAnchor = forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }
>(({ to, ...props }, ref) => <a ref={ref} href={to} {...props} />);
RouterAnchor.displayName = "RouterAnchor";

function gapClass(gap: GridGap) {
  return `gap-[var(--dt-space-${gap === "none" ? "0" : gap})]`;
}

function rowGapClass(gap: GridGap) {
  return `gap-y-[var(--dt-space-${gap === "none" ? "0" : gap})]`;
}

function columnGapClass(gap: GridGap) {
  return `gap-x-[var(--dt-space-${gap === "none" ? "0" : gap})]`;
}

function rowClass(row: GridRows) {
  return row === "none" ? undefined : `grid-rows-${row}`;
}

describe("Grid", () => {
  it("renders a neutral div with safe defaults", () => {
    render(
      <Grid>
        <span>Grid content</span>
      </Grid>,
    );

    const grid = screen.getByText("Grid content").parentElement;

    expect(grid?.tagName).toBe("DIV");
    expect(grid).toHaveAttribute("data-slot", "grid");
    expect(grid).toHaveAttribute("data-element", "div");
    expect(grid).toHaveAttribute("data-columns", "1");
    expect(grid).toHaveAttribute("data-rows", "none");
    expect(grid).toHaveAttribute("data-gap", "none");
    expect(grid).toHaveAttribute("data-align", "stretch");
    expect(grid).toHaveAttribute("data-justify", "stretch");
    expect(grid).toHaveAttribute("data-align-content", "start");
    expect(grid).toHaveAttribute("data-justify-content", "start");
    expect(grid).toHaveClass(
      "grid",
      "grid-cols-1",
      "gap-[var(--dt-space-0)]",
      "items-stretch",
      "justify-items-stretch",
      "content-start",
      "justify-start",
    );
  });

  it.each(elements)("renders a semantic %s element", (as) => {
    render(<Grid as={as}>Semantic {as}</Grid>);

    expect(screen.getByText(`Semantic ${as}`).tagName).toBe(as.toUpperCase());
  });

  it.each(columns)("applies %s column data and class", (column) => {
    render(<Grid columns={column}>columns {column}</Grid>);

    const grid = screen.getByText(`columns ${column}`);

    expect(grid).toHaveAttribute("data-columns", column);
    expect(grid).toHaveClass(columnClasses[column]);
  });

  it.each(rows)("applies %s row data and class", (row) => {
    render(<Grid rows={row}>rows {row}</Grid>);

    const grid = screen.getByText(`rows ${row}`);

    expect(grid).toHaveAttribute("data-rows", row);

    const expectedClass = rowClass(row);
    if (expectedClass) {
      expect(grid).toHaveClass(expectedClass);
    } else {
      expect(grid).not.toHaveClass("grid-rows-1");
    }
  });

  it.each(gaps)("applies %s gap token data and class", (gap) => {
    render(<Grid gap={gap}>gap {gap}</Grid>);

    const grid = screen.getByText(`gap ${gap}`);

    expect(grid).toHaveAttribute("data-gap", gap);
    expect(grid).toHaveClass(gapClass(gap));
  });

  it.each(gaps)("applies %s row and column gap overrides", (gap) => {
    render(
      <Grid columnGap={gap} gap="4" rowGap={gap}>
        axis gap {gap}
      </Grid>,
    );

    const grid = screen.getByText(`axis gap ${gap}`);

    expect(grid).toHaveAttribute("data-row-gap", gap);
    expect(grid).toHaveAttribute("data-column-gap", gap);
    expect(grid).toHaveClass(rowGapClass(gap));
    expect(grid).toHaveClass(columnGapClass(gap));
  });

  it.each(aligns)("applies %s item alignment data and class", (align) => {
    render(<Grid align={align}>align {align}</Grid>);

    const grid = screen.getByText(`align ${align}`);

    expect(grid).toHaveAttribute("data-align", align);
    expect(grid).toHaveClass(alignClasses[align]);
  });

  it.each(justifies)(
    "applies %s item justification data and class",
    (justify) => {
      render(<Grid justify={justify}>justify {justify}</Grid>);

      const grid = screen.getByText(`justify ${justify}`);

      expect(grid).toHaveAttribute("data-justify", justify);
      expect(grid).toHaveClass(justifyClasses[justify]);
    },
  );

  it.each(contents)(
    "applies %s align-content data and class",
    (alignContent) => {
      render(
        <Grid alignContent={alignContent}>align content {alignContent}</Grid>,
      );

      const grid = screen.getByText(`align content ${alignContent}`);

      expect(grid).toHaveAttribute("data-align-content", alignContent);
      expect(grid).toHaveClass(contentClasses[alignContent]);
    },
  );

  it.each(contents)(
    "applies %s justify-content data and class",
    (justifyContent) => {
      render(
        <Grid justifyContent={justifyContent}>
          justify content {justifyContent}
        </Grid>,
      );

      const grid = screen.getByText(`justify content ${justifyContent}`);

      expect(grid).toHaveAttribute("data-justify-content", justifyContent);
      expect(grid).toHaveClass(justifyContentClasses[justifyContent]);
    },
  );

  it("composes consumer classes after baseline classes", () => {
    expect(gridClassNames({ className: "custom-grid" })).toContain(
      "custom-grid",
    );
  });

  it("uses grid columns, rows, axis gap, alignment, and content utilities", () => {
    const className = gridClassNames({
      align: "center",
      alignContent: "between",
      columnGap: "6",
      columns: "auto-fit-sm",
      gap: "4",
      justify: "end",
      justifyContent: "around",
      rowGap: "2",
      rows: "3",
    });

    expect(className).toContain("grid");
    expect(className).toContain(
      "grid-cols-[repeat(auto-fit,minmax(min(16rem,100%),1fr))]",
    );
    expect(className).toContain("grid-rows-3");
    expect(className).toContain("gap-[var(--dt-space-4)]");
    expect(className).toContain("gap-y-[var(--dt-space-2)]");
    expect(className).toContain("gap-x-[var(--dt-space-6)]");
    expect(className).toContain("items-center");
    expect(className).toContain("justify-items-end");
    expect(className).toContain("content-between");
    expect(className).toContain("justify-around");
  });

  it("rejects unsupported token values at the TypeScript boundary", () => {
    const valid = <Grid columns="4" gap="4" />;
    const validForm = (
      <Grid as="form" action="/search" method="get" noValidate />
    );
    const validFieldset = <Grid as="fieldset" disabled />;
    // @ts-expect-error Grid columns use constrained token values.
    const invalidColumns = <Grid columns="7" />;
    // @ts-expect-error Grid does not expose inline-grid display in v1.
    const invalidDisplay = <Grid display="inline-grid" />;
    // @ts-expect-error Grid does not expose arbitrary template strings.
    const invalidTemplate = <Grid templateColumns="200px 1fr" />;

    expect(valid).toBeTruthy();
    expect(validForm).toBeTruthy();
    expect(validFieldset).toBeTruthy();
    expect(invalidColumns).toBeTruthy();
    expect(invalidDisplay).toBeTruthy();
    expect(invalidTemplate).toBeTruthy();
  });

  it("forwards refs to the native element", () => {
    const ref = createRef<HTMLElement>();

    render(
      <Grid ref={ref} as="section">
        Ref grid
      </Grid>,
    );

    expect(ref.current?.tagName).toBe("SECTION");
  });

  it("composes classes, refs, events, and data attributes onto a child element", async () => {
    const user = userEvent.setup();
    const gridRef = createRef<HTMLElement>();
    const childRef = createRef<HTMLAnchorElement>();
    const gridClick = vi.fn();
    const childClick = vi.fn((event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
    });

    render(
      <Grid ref={gridRef} asChild columns="3" gap="3" onClick={gridClick}>
        <RouterAnchor
          ref={childRef}
          className="custom-child"
          onClick={childClick}
          to="/docs"
        >
          Grid child
        </RouterAnchor>
      </Grid>,
    );

    const link = screen.getByRole("link", { name: "Grid child" });

    expect(link).toHaveAttribute("href", "/docs");
    expect(link).toHaveAttribute("data-slot", "grid");
    expect(link).toHaveAttribute("data-as-child", "true");
    expect(link).toHaveAttribute("data-columns", "3");
    expect(link).toHaveAttribute("data-gap", "3");
    expect(link.className).toContain("custom-child");
    expect(gridRef.current).toBe(link);
    expect(childRef.current).toBe(link);

    await user.click(link);

    expect(gridClick).toHaveBeenCalledTimes(1);
    expect(childClick).toHaveBeenCalledTimes(1);
  });

  it("keeps child DOM order unchanged", () => {
    render(
      <Grid>
        <button type="button">First</button>
        <button type="button">Second</button>
        <button type="button">Third</button>
      </Grid>,
    );

    expect(
      screen.getAllByRole("button").map((button) => button.textContent),
    ).toEqual(["First", "Second", "Third"]);
  });
});

describe("GridItem", () => {
  it("renders a neutral div with safe defaults", () => {
    render(<GridItem>Grid item</GridItem>);

    const item = screen.getByText("Grid item");

    expect(item.tagName).toBe("DIV");
    expect(item).toHaveAttribute("data-slot", "grid-item");
    expect(item).toHaveAttribute("data-element", "div");
    expect(item).toHaveAttribute("data-col-span", "1");
    expect(item).toHaveAttribute("data-row-span", "1");
    expect(item).toHaveAttribute("data-align", "auto");
    expect(item).toHaveAttribute("data-justify", "auto");
    expect(item).toHaveAttribute("data-min-inline-size", "auto");
    expect(item).toHaveClass(
      "col-span-1",
      "row-span-1",
      "self-auto",
      "justify-self-auto",
    );
  });

  it.each(itemElements)("renders a semantic %s item element", (as) => {
    render(<GridItem as={as}>Semantic item {as}</GridItem>);

    expect(screen.getByText(`Semantic item ${as}`).tagName).toBe(
      as.toUpperCase(),
    );
  });

  it.each(itemSpans)("applies %s column span data and class", (colSpan) => {
    render(<GridItem colSpan={colSpan}>col span {colSpan}</GridItem>);

    const item = screen.getByText(`col span ${colSpan}`);

    expect(item).toHaveAttribute("data-col-span", colSpan);
    expect(item).toHaveClass(itemSpanClasses[colSpan]);
  });

  it.each(itemSpans)("applies %s row span data and class", (rowSpan) => {
    render(<GridItem rowSpan={rowSpan}>row span {rowSpan}</GridItem>);

    const item = screen.getByText(`row span ${rowSpan}`);

    expect(item).toHaveAttribute("data-row-span", rowSpan);
    expect(item).toHaveClass(itemRowSpanClasses[rowSpan]);
  });

  it.each(itemAligns)("applies %s self-alignment data and class", (align) => {
    render(<GridItem align={align}>item align {align}</GridItem>);

    const item = screen.getByText(`item align ${align}`);

    expect(item).toHaveAttribute("data-align", align);
    expect(item).toHaveClass(itemAlignClasses[align]);
  });

  it.each(itemJustifies)(
    "applies %s self-justification data and class",
    (justify) => {
      render(<GridItem justify={justify}>item justify {justify}</GridItem>);

      const item = screen.getByText(`item justify ${justify}`);

      expect(item).toHaveAttribute("data-justify", justify);
      expect(item).toHaveClass(itemJustifyClasses[justify]);
    },
  );

  it.each(itemMinInlineSizes)(
    "applies %s min inline size data",
    (minInlineSize) => {
      render(
        <GridItem minInlineSize={minInlineSize}>
          min inline {minInlineSize}
        </GridItem>,
      );

      const item = screen.getByText(`min inline ${minInlineSize}`);

      expect(item).toHaveAttribute("data-min-inline-size", minInlineSize);

      if (minInlineSize === "0") {
        expect(item).toHaveClass("min-w-0");
      } else {
        expect(item).not.toHaveClass("min-w-0");
      }
    },
  );

  it("composes item classes after baseline classes", () => {
    expect(gridItemClassNames({ className: "custom-item" })).toContain(
      "custom-item",
    );
  });

  it("uses item spans, alignment, justification, and long-content utilities", () => {
    const className = gridItemClassNames({
      align: "center",
      colSpan: "3",
      justify: "end",
      minInlineSize: "0",
      rowSpan: "2",
    });

    expect(className).toContain("col-span-3");
    expect(className).toContain("row-span-2");
    expect(className).toContain("self-center");
    expect(className).toContain("justify-self-end");
    expect(className).toContain("min-w-0");
  });

  it("rejects unsupported item token values at the TypeScript boundary", () => {
    const valid = <GridItem colSpan="3" minInlineSize="0" rowSpan="2" />;
    // @ts-expect-error GridItem spans use constrained token values.
    const invalidSpan = <GridItem colSpan="12" />;
    // @ts-expect-error GridItem does not expose line placement.
    const invalidLine = <GridItem colStart="2" />;
    // @ts-expect-error GridItem does not expose item ordering.
    const invalidOrder = <GridItem order="1" />;

    expect(valid).toBeTruthy();
    expect(invalidSpan).toBeTruthy();
    expect(invalidLine).toBeTruthy();
    expect(invalidOrder).toBeTruthy();
  });

  it("forwards refs to the native item element", () => {
    const ref = createRef<HTMLElement>();

    render(
      <GridItem ref={ref} as="section">
        Ref item
      </GridItem>,
    );

    expect(ref.current?.tagName).toBe("SECTION");
  });

  it("composes item classes, refs, events, and data attributes onto a child element", async () => {
    const user = userEvent.setup();
    const itemRef = createRef<HTMLElement>();
    const childRef = createRef<HTMLButtonElement>();
    const itemClick = vi.fn();
    const childClick = vi.fn();

    render(
      <GridItem
        ref={itemRef}
        asChild
        colSpan="3"
        minInlineSize="0"
        onClick={itemClick}
        rowSpan="2"
      >
        <button
          ref={childRef}
          className="custom-item-child"
          onClick={childClick}
          type="button"
        >
          Grid item child
        </button>
      </GridItem>,
    );

    const button = screen.getByRole("button", { name: "Grid item child" });

    expect(button).toHaveAttribute("data-slot", "grid-item");
    expect(button).toHaveAttribute("data-as-child", "true");
    expect(button).toHaveAttribute("data-col-span", "3");
    expect(button).toHaveAttribute("data-row-span", "2");
    expect(button).toHaveAttribute("data-min-inline-size", "0");
    expect(button.className).toContain("custom-item-child");
    expect(itemRef.current).toBe(button);
    expect(childRef.current).toBe(button);

    await user.click(button);

    expect(itemClick).toHaveBeenCalledTimes(1);
    expect(childClick).toHaveBeenCalledTimes(1);
  });
});
