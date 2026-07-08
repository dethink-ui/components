import {
  forwardRef,
  type HTMLAttributes,
  type TableHTMLAttributes,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
} from "react";
import { cn } from "../../utils/cn";

export type TableDensity = "compact" | "default" | "comfortable";
export type TableCaptionPlacement = "top" | "bottom";
export type TableCellAlign = "start" | "center" | "end";
export type TableRowTone = "default" | "muted";

export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  containerClassName?: string;
  density?: TableDensity;
}

export interface TableHeaderProps extends HTMLAttributes<HTMLTableSectionElement> {}

export interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {}

export interface TableFooterProps extends HTMLAttributes<HTMLTableSectionElement> {}

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  hoverable?: boolean;
  selected?: boolean;
  tone?: TableRowTone;
}

export type TableHeadProps = Omit<
  ThHTMLAttributes<HTMLTableCellElement>,
  "align"
> & {
  align?: TableCellAlign;
};

export type TableCellProps = Omit<
  TdHTMLAttributes<HTMLTableCellElement>,
  "align"
> & {
  align?: TableCellAlign;
  numeric?: boolean;
};

export interface TableCaptionProps extends HTMLAttributes<HTMLTableCaptionElement> {
  placement?: TableCaptionPlacement;
}

const tableContainerBaseClasses =
  "relative w-full overflow-x-auto overscroll-x-contain";

const tableDensityClasses: Record<TableDensity, string> = {
  compact:
    "[--table-cell-px:var(--dt-space-2)] [--table-cell-py:var(--dt-space-1-5)] [--table-row-min-height:2rem]",
  default:
    "[--table-cell-px:var(--dt-space-3)] [--table-cell-py:var(--dt-space-2)] [--table-row-min-height:2.5rem]",
  comfortable:
    "[--table-cell-px:var(--dt-space-4)] [--table-cell-py:var(--dt-space-3)] [--table-row-min-height:3rem]",
};

const tableBaseClasses =
  "w-full min-w-full caption-bottom border-collapse text-sm text-foreground";

const tableHeaderBaseClasses = "[&_tr]:border-b";
const tableBodyBaseClasses = "[&_tr:last-child]:border-0";
const tableFooterBaseClasses =
  "border-t border-border bg-muted/40 font-medium text-foreground [&>tr]:last:border-b-0";

const tableRowBaseClasses =
  "min-h-[var(--table-row-min-height)] border-b border-border motion-safe:transition-colors motion-safe:duration-150 motion-safe:ease-out motion-reduce:transition-none data-[hoverable=true]:hover:bg-muted/50 data-[selected=true]:bg-muted data-[tone=muted]:bg-muted/30";

const tableHeadBaseClasses =
  "h-[var(--table-row-min-height)] whitespace-nowrap px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-start align-middle font-medium text-muted-foreground [&:has([data-slot=checkbox])]:pe-0 [&:has([data-slot=checkbox-input])]:pe-0 [&:has(input[type=checkbox])]:pe-0";

const tableCellBaseClasses =
  "h-[var(--table-row-min-height)] px-[var(--table-cell-px)] py-[var(--table-cell-py)] align-middle text-foreground [&:has([data-slot=checkbox])]:pe-0 [&:has([data-slot=checkbox-input])]:pe-0 [&:has(input[type=checkbox])]:pe-0";

const tableCaptionBaseClasses = "text-sm text-muted-foreground";

const tableCellAlignClasses: Record<TableCellAlign, string> = {
  start: "text-start",
  center: "text-center",
  end: "text-end",
};

const tableCaptionPlacementClasses: Record<TableCaptionPlacement, string> = {
  top: "caption-top mb-[var(--dt-space-3)] mt-0",
  bottom: "caption-bottom mt-[var(--dt-space-3)]",
};

export function tableContainerClassNames({
  className,
  density = "default",
}: Pick<TableProps, "density"> & { className?: string } = {}) {
  return cn(tableContainerBaseClasses, tableDensityClasses[density], className);
}

export function tableClassNames({
  className,
}: Pick<TableProps, "className"> = {}) {
  return cn(tableBaseClasses, className);
}

export function tableHeaderClassNames({
  className,
}: Pick<TableHeaderProps, "className"> = {}) {
  return cn(tableHeaderBaseClasses, className);
}

export function tableBodyClassNames({
  className,
}: Pick<TableBodyProps, "className"> = {}) {
  return cn(tableBodyBaseClasses, className);
}

export function tableFooterClassNames({
  className,
}: Pick<TableFooterProps, "className"> = {}) {
  return cn(tableFooterBaseClasses, className);
}

export function tableRowClassNames({
  className,
}: Pick<TableRowProps, "className"> = {}) {
  return cn(tableRowBaseClasses, className);
}

export function tableHeadClassNames({
  align = "start",
  className,
}: Pick<TableHeadProps, "align" | "className"> = {}) {
  return cn(tableHeadBaseClasses, tableCellAlignClasses[align], className);
}

export function tableCellClassNames({
  align = "start",
  className,
  numeric = false,
}: Pick<TableCellProps, "align" | "className" | "numeric"> = {}) {
  return cn(
    tableCellBaseClasses,
    tableCellAlignClasses[align],
    numeric ? "tabular-nums" : undefined,
    className,
  );
}

export function tableCaptionClassNames({
  className,
  placement = "bottom",
}: Pick<TableCaptionProps, "className" | "placement"> = {}) {
  return cn(
    tableCaptionBaseClasses,
    tableCaptionPlacementClasses[placement],
    className,
  );
}

export const Table = forwardRef<HTMLTableElement, TableProps>(
  (
    { children, className, containerClassName, density = "default", ...props },
    ref,
  ) => (
    <div
      data-slot="table-container"
      data-density={density}
      className={tableContainerClassNames({
        className: containerClassName,
        density,
      })}
    >
      <table
        {...props}
        ref={ref}
        data-slot="table"
        data-density={density}
        className={tableClassNames({ className })}
      >
        {children}
      </table>
    </div>
  ),
);

Table.displayName = "Table";

export const TableHeader = forwardRef<
  HTMLTableSectionElement,
  TableHeaderProps
>(({ className, ...props }, ref) => (
  <thead
    {...props}
    ref={ref}
    data-slot="table-header"
    className={tableHeaderClassNames({ className })}
  />
));

TableHeader.displayName = "TableHeader";

export const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, ...props }, ref) => (
    <tbody
      {...props}
      ref={ref}
      data-slot="table-body"
      className={tableBodyClassNames({ className })}
    />
  ),
);

TableBody.displayName = "TableBody";

export const TableFooter = forwardRef<
  HTMLTableSectionElement,
  TableFooterProps
>(({ className, ...props }, ref) => (
  <tfoot
    {...props}
    ref={ref}
    data-slot="table-footer"
    className={tableFooterClassNames({ className })}
  />
));

TableFooter.displayName = "TableFooter";

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  (
    {
      className,
      hoverable = true,
      selected = false,
      tone = "default",
      ...props
    },
    ref,
  ) => (
    <tr
      {...props}
      ref={ref}
      data-slot="table-row"
      data-hoverable={hoverable ? "true" : "false"}
      data-selected={selected ? "true" : undefined}
      data-tone={tone}
      className={tableRowClassNames({ className })}
    />
  ),
);

TableRow.displayName = "TableRow";

export const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ align = "start", className, scope = "col", ...props }, ref) => (
    <th
      {...props}
      ref={ref}
      scope={scope}
      data-slot="table-head"
      data-align={align}
      className={tableHeadClassNames({ align, className })}
    />
  ),
);

TableHead.displayName = "TableHead";

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ align = "start", className, numeric = false, ...props }, ref) => (
    <td
      {...props}
      ref={ref}
      data-slot="table-cell"
      data-align={align}
      data-numeric={numeric ? "true" : undefined}
      className={tableCellClassNames({ align, className, numeric })}
    />
  ),
);

TableCell.displayName = "TableCell";

export const TableCaption = forwardRef<
  HTMLTableCaptionElement,
  TableCaptionProps
>(({ className, placement = "bottom", ...props }, ref) => (
  <caption
    {...props}
    ref={ref}
    data-slot="table-caption"
    data-placement={placement}
    className={tableCaptionClassNames({ className, placement })}
  />
));

TableCaption.displayName = "TableCaption";
