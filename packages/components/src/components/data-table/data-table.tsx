import {
  type HTMLAttributes,
  type ReactNode,
  useId,
  useState,
} from "react";
import {
  flexRender,
  getFilteredRowModel,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type Cell,
  type Column,
  type ColumnFiltersState,
  type ColumnDef,
  type Header,
  type OnChangeFn,
  type PaginationState,
  type Row,
  type RowData,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { cn } from "../../utils/cn";
import { Button } from "../button";
import { Checkbox } from "../checkbox";
import { Input } from "../input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  type TableCaptionPlacement,
  type TableDensity,
} from "../table";

export type DataTableDensity = TableDensity;
export type DataTableSelectionMode = "none" | "single" | "multiple";
export type DataTableSortingState = SortingState;
export type DataTableColumnFiltersState = ColumnFiltersState;
export type DataTablePaginationState = PaginationState;
export type DataTableRowSelectionState = RowSelectionState;
export type DataTableVisibilityState = VisibilityState;
export type DataTableColumnDef<TData extends RowData, TValue = unknown> =
  ColumnDef<TData, TValue>;
export type DataTableRow<TData extends RowData> = Row<TData>;
export type DataTableCell<TData extends RowData, TValue = unknown> = Cell<
  TData,
  TValue
>;
export type DataTableHeader<TData extends RowData, TValue = unknown> = Header<
  TData,
  TValue
>;
export type DataTableColumn<TData extends RowData, TValue = unknown> = Column<
  TData,
  TValue
>;

export interface DataTableLabels {
  clearGlobalFilter?: string;
  columnVisibility?: string;
  empty?: string;
  error?: string;
  globalFilter?: string;
  loading?: string;
  nextPage?: string;
  pageLabel?: (page: number, pageCount: number) => string;
  pageSize?: string;
  previousPage?: string;
  rowActions?: string;
  rowCount?: (selectedCount: number, totalCount: number) => string;
  selectAllRows?: string;
  selectRow?: (rowId: string) => string;
  sortAscending?: (column: string) => string;
  sortDescending?: (column: string) => string;
  clearSort?: (column: string) => string;
}

export interface DataTableProps<TData extends RowData>
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  caption?: ReactNode;
  captionPlacement?: TableCaptionPlacement;
  columnFilters?: ColumnFiltersState;
  columnVisibility?: VisibilityState;
  columns: DataTableColumnDef<TData>[];
  data: TData[];
  defaultColumnFilters?: ColumnFiltersState;
  defaultColumnVisibility?: VisibilityState;
  defaultGlobalFilter?: string;
  defaultPagination?: PaginationState;
  defaultRowSelection?: RowSelectionState;
  defaultSorting?: SortingState;
  density?: DataTableDensity;
  emptyContent?: ReactNode;
  enableColumnFilters?: boolean;
  enableColumnVisibility?: boolean;
  enableGlobalFilter?: boolean;
  enablePagination?: boolean;
  enableSorting?: boolean;
  error?: ReactNode;
  globalFilter?: string;
  globalFilterPlaceholder?: string;
  getCellClassName?: (cell: DataTableCell<TData>) => string | undefined;
  getRowClassName?: (row: DataTableRow<TData>) => string | undefined;
  getRowId?: (row: TData, index: number, parent?: DataTableRow<TData>) => string;
  labels?: DataTableLabels;
  loading?: boolean;
  loadingContent?: ReactNode;
  manualFiltering?: boolean;
  manualPagination?: boolean;
  manualSorting?: boolean;
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>;
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>;
  onGlobalFilterChange?: (value: string) => void;
  onPaginationChange?: OnChangeFn<PaginationState>;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  onSortingChange?: OnChangeFn<SortingState>;
  pageCount?: number;
  pageSizeOptions?: number[];
  pagination?: PaginationState;
  renderColumnFilter?: (column: DataTableColumn<TData>) => ReactNode;
  renderRowActions?: (row: DataTableRow<TData>) => ReactNode;
  rowCount?: number;
  rowSelection?: RowSelectionState;
  selectionMode?: DataTableSelectionMode;
  sorting?: SortingState;
  tableClassName?: string;
  tableContainerClassName?: string;
}

const defaultLabels = {
  clearGlobalFilter: "Clear search",
  columnVisibility: "Columns",
  empty: "No results.",
  error: "Unable to load table data.",
  globalFilter: "Search table",
  loading: "Loading table data.",
  nextPage: "Next page",
  pageLabel: (page: number, pageCount: number) => `Page ${page} of ${pageCount}`,
  pageSize: "Rows per page",
  previousPage: "Previous page",
  rowActions: "Actions",
  rowCount: (selectedCount: number, totalCount: number) =>
    selectedCount > 0
      ? `${selectedCount} of ${totalCount} row${totalCount === 1 ? "" : "s"} selected`
      : `${totalCount} row${totalCount === 1 ? "" : "s"}`,
  selectAllRows: "Select all rows",
  selectRow: (rowId: string) => `Select row ${rowId}`,
  sortAscending: (column: string) => `Sort ${column} ascending`,
  sortDescending: (column: string) => `Sort ${column} descending`,
  clearSort: (column: string) => `Clear ${column} sort`,
} satisfies Required<DataTableLabels>;

const dataTableBaseClasses = "w-full";

const dataTableToolbarBaseClasses =
  "mb-[var(--dt-space-3)] flex flex-wrap items-end gap-[var(--dt-space-3)]";

const dataTableToolbarGroupBaseClasses =
  "flex min-w-0 flex-wrap items-center gap-[var(--dt-space-2)]";

const dataTableControlLabelBaseClasses =
  "text-xs font-medium uppercase tracking-normal text-muted-foreground";

const dataTableColumnVisibilityBaseClasses =
  "flex min-w-0 flex-wrap items-center gap-[var(--dt-space-2)] rounded-md border border-border bg-muted/30 px-[var(--dt-space-2)] py-[var(--dt-space-1-5)]";

const dataTableColumnVisibilityOptionsBaseClasses =
  "flex flex-wrap items-center gap-[var(--dt-space-2)]";

const dataTableCheckboxLabelBaseClasses =
  "inline-flex min-h-8 items-center gap-[var(--dt-space-2)] rounded-sm px-[var(--dt-space-1)] text-sm text-foreground";

const dataTableHeaderCellFilterableClasses = "min-w-40 align-top";

const dataTableHeaderContentBaseClasses =
  "grid min-w-0 gap-[var(--dt-space-2)]";

const dataTableHeaderLabelBaseClasses = "block min-w-0 truncate";

const dataTableColumnFilterBaseClasses = "block min-w-0";

const dataTablePaginationBaseClasses =
  "mt-[var(--dt-space-3)] flex flex-wrap items-center justify-between gap-[var(--dt-space-3)] text-sm text-muted-foreground";

const dataTablePaginationControlsBaseClasses =
  "flex flex-wrap items-center gap-[var(--dt-space-2)]";

const dataTablePageSizeSelectBaseClasses =
  "h-8 rounded-md border border-input bg-background px-[var(--dt-space-2)] text-sm text-foreground shadow-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20";

const dataTableStateCellBaseClasses =
  "h-24 text-center text-sm text-muted-foreground";

const dataTableErrorCellBaseClasses =
  "h-24 text-center text-sm font-medium text-destructive";

const dataTableSortButtonBaseClasses =
  "group flex min-h-8 w-full min-w-0 items-center justify-start gap-[var(--dt-space-1-5)] rounded-sm text-start font-medium text-muted-foreground outline-none motion-safe:transition-colors motion-safe:duration-150 motion-safe:ease-out motion-reduce:transition-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const dataTableSortLabelBaseClasses = "min-w-0 truncate";

const dataTableSortIndicatorBaseClasses =
  "ms-auto inline-flex size-5 shrink-0 items-center justify-center rounded-sm text-muted-foreground motion-safe:transition-colors motion-safe:duration-150 group-hover:text-foreground group-data-[sorted=asc]:text-foreground group-data-[sorted=desc]:text-foreground";

const dataTableEmptyBaseClasses =
  "h-24 text-center text-sm text-muted-foreground";

export function dataTableClassNames({
  className,
}: Pick<DataTableProps<RowData>, "className"> = {}) {
  return cn(dataTableBaseClasses, className);
}

export function dataTableSortButtonClassNames({
  className,
}: { className?: string } = {}) {
  return cn(dataTableSortButtonBaseClasses, className);
}

export function dataTableSortIndicatorClassNames({
  className,
}: { className?: string } = {}) {
  return cn(dataTableSortIndicatorBaseClasses, className);
}

export function dataTableToolbarClassNames({
  className,
}: { className?: string } = {}) {
  return cn(dataTableToolbarBaseClasses, className);
}

export function dataTablePaginationClassNames({
  className,
}: { className?: string } = {}) {
  return cn(dataTablePaginationBaseClasses, className);
}

export function dataTableEmptyClassNames({
  className,
}: { className?: string } = {}) {
  return cn(dataTableEmptyBaseClasses, className);
}

function getHeaderLabel<TData extends RowData>(header: Header<TData, unknown>) {
  const headerValue = header.column.columnDef.header;

  if (typeof headerValue === "string") {
    return headerValue;
  }

  return header.column.id;
}

function getNextSortLabel(
  labels: Required<DataTableLabels>,
  columnLabel: string,
  sorted: false | "asc" | "desc",
) {
  if (sorted === "asc") {
    return labels.sortDescending(columnLabel);
  }

  if (sorted === "desc") {
    return labels.clearSort(columnLabel);
  }

  return labels.sortAscending(columnLabel);
}

function getAriaSort(sorted: false | "asc" | "desc") {
  if (sorted === "asc") {
    return "ascending";
  }

  if (sorted === "desc") {
    return "descending";
  }

  return undefined;
}

function getColumnLabel<TData extends RowData>(column: Column<TData, unknown>) {
  const headerValue = column.columnDef.header;

  if (typeof headerValue === "string") {
    return headerValue;
  }

  return column.id;
}

function resolveUpdater<T>(updater: T | ((old: T) => T), current: T) {
  return typeof updater === "function" ? (updater as (old: T) => T)(current) : updater;
}

function getSelectedRowCount(rowSelection: RowSelectionState) {
  return Object.values(rowSelection).filter(Boolean).length;
}

function SortIcon({ sorted }: { sorted: false | "asc" | "desc" }) {
  return (
    <svg
      aria-hidden="true"
      data-slot="data-table-sort-icon"
      data-sort-state={sorted || "none"}
      focusable="false"
      viewBox="0 0 16 16"
      className="size-4"
    >
      <path
        d="M4.5 3 2 5.5h5L4.5 3Z"
        fill="currentColor"
        opacity={sorted === "desc" ? 0.35 : 1}
      />
      <path
        d="M11.5 13 14 10.5H9l2.5 2.5Z"
        fill="currentColor"
        opacity={sorted === "asc" ? 0.35 : 1}
      />
      <path
        d="M4.5 5v8M11.5 11V3"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
        opacity={sorted ? 1 : 0.65}
      />
    </svg>
  );
}

function DefaultColumnFilter<TData extends RowData>({
  column,
  label,
}: {
  column: Column<TData, unknown>;
  label: string;
}) {
  return (
    <label
      data-slot="data-table-column-filter"
      className={dataTableColumnFilterBaseClasses}
    >
      <span className="sr-only">Filter {label}</span>
      <Input
        aria-label={`Filter ${label}`}
        controlSize="sm"
        value={(column.getFilterValue() ?? "") as string}
        onChange={(event) => {
          column.setFilterValue(event.currentTarget.value);
        }}
        placeholder={`Filter ${label}`}
      />
    </label>
  );
}

export function DataTable<TData extends RowData>({
  "aria-describedby": ariaDescribedBy,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  caption,
  captionPlacement = "bottom",
  className,
  columnFilters,
  columnVisibility,
  columns,
  data,
  defaultColumnFilters = [],
  defaultColumnVisibility = {},
  defaultGlobalFilter = "",
  defaultPagination = {
    pageIndex: 0,
    pageSize: 10,
  },
  defaultRowSelection = {},
  defaultSorting = [],
  density = "default",
  emptyContent,
  enableColumnFilters = false,
  enableColumnVisibility = false,
  enableGlobalFilter = false,
  enablePagination = false,
  enableSorting = true,
  error,
  globalFilter,
  globalFilterPlaceholder,
  getCellClassName,
  getRowClassName,
  getRowId,
  labels,
  loading = false,
  loadingContent,
  manualFiltering = false,
  manualPagination = false,
  manualSorting = false,
  onColumnFiltersChange,
  onColumnVisibilityChange,
  onGlobalFilterChange,
  onPaginationChange,
  onRowSelectionChange,
  onSortingChange,
  pageCount,
  pageSizeOptions = [10, 25, 50],
  pagination,
  renderColumnFilter,
  renderRowActions,
  rowCount,
  rowSelection,
  selectionMode = "none",
  sorting,
  tableClassName,
  tableContainerClassName,
  ...props
}: DataTableProps<TData>) {
  const generatedId = useId();
  const mergedLabels: Required<DataTableLabels> = {
    clearGlobalFilter:
      labels?.clearGlobalFilter ?? defaultLabels.clearGlobalFilter,
    columnVisibility:
      labels?.columnVisibility ?? defaultLabels.columnVisibility,
    empty: labels?.empty ?? defaultLabels.empty,
    error: labels?.error ?? defaultLabels.error,
    globalFilter: labels?.globalFilter ?? defaultLabels.globalFilter,
    loading: labels?.loading ?? defaultLabels.loading,
    nextPage: labels?.nextPage ?? defaultLabels.nextPage,
    pageLabel: labels?.pageLabel ?? defaultLabels.pageLabel,
    pageSize: labels?.pageSize ?? defaultLabels.pageSize,
    previousPage: labels?.previousPage ?? defaultLabels.previousPage,
    rowActions: labels?.rowActions ?? defaultLabels.rowActions,
    rowCount: labels?.rowCount ?? defaultLabels.rowCount,
    selectAllRows: labels?.selectAllRows ?? defaultLabels.selectAllRows,
    selectRow: labels?.selectRow ?? defaultLabels.selectRow,
    sortAscending: labels?.sortAscending ?? defaultLabels.sortAscending,
    sortDescending: labels?.sortDescending ?? defaultLabels.sortDescending,
    clearSort: labels?.clearSort ?? defaultLabels.clearSort,
  };
  const [internalColumnFilters, setInternalColumnFilters] =
    useState<ColumnFiltersState>(defaultColumnFilters);
  const [internalColumnVisibility, setInternalColumnVisibility] =
    useState<VisibilityState>(defaultColumnVisibility);
  const [internalGlobalFilter, setInternalGlobalFilter] =
    useState(defaultGlobalFilter);
  const [internalPagination, setInternalPagination] =
    useState<PaginationState>(defaultPagination);
  const [internalRowSelection, setInternalRowSelection] =
    useState<RowSelectionState>(defaultRowSelection);
  const [internalSorting, setInternalSorting] =
    useState<SortingState>(defaultSorting);
  const currentColumnFilters = columnFilters ?? internalColumnFilters;
  const currentColumnVisibility = columnVisibility ?? internalColumnVisibility;
  const currentGlobalFilter = globalFilter ?? internalGlobalFilter;
  const currentPagination = pagination ?? internalPagination;
  const currentRowSelection = rowSelection ?? internalRowSelection;
  const currentSorting = sorting ?? internalSorting;
  const isColumnFiltersControlled = columnFilters !== undefined;
  const isColumnVisibilityControlled = columnVisibility !== undefined;
  const isGlobalFilterControlled = globalFilter !== undefined;
  const isPaginationControlled = pagination !== undefined;
  const isRowSelectionControlled = rowSelection !== undefined;
  const isSortingControlled = sorting !== undefined;
  const hasRowSelection = selectionMode !== "none";
  const hasRowActions = renderRowActions !== undefined;

  const table = useReactTable({
    autoResetPageIndex: !manualPagination,
    columnResizeMode: "onChange",
    columns,
    data,
    enableColumnFilters,
    enableGlobalFilter,
    enableHiding: enableColumnVisibility,
    enableMultiRowSelection: selectionMode === "multiple",
    enableMultiSort: false,
    enableRowSelection: hasRowSelection,
    enableSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: manualFiltering ? undefined : getFilteredRowModel(),
    getPaginationRowModel:
      enablePagination && !manualPagination
        ? getPaginationRowModel()
        : undefined,
    getRowId,
    getSortedRowModel: manualSorting ? undefined : getSortedRowModel(),
    globalFilterFn: "includesString",
    manualFiltering,
    manualPagination,
    manualSorting,
    onColumnFiltersChange: (updater) => {
      if (!isColumnFiltersControlled) {
        setInternalColumnFilters(updater);
      }

      onColumnFiltersChange?.(updater);
    },
    onColumnVisibilityChange: (updater) => {
      if (!isColumnVisibilityControlled) {
        setInternalColumnVisibility(updater);
      }

      onColumnVisibilityChange?.(updater);
    },
    onGlobalFilterChange: (updater) => {
      const nextValue = String(resolveUpdater(updater, currentGlobalFilter) ?? "");

      if (!isGlobalFilterControlled) {
        setInternalGlobalFilter(nextValue);
      }

      if (!isPaginationControlled) {
        setInternalPagination((current) => ({
          ...current,
          pageIndex: 0,
        }));
      }

      onGlobalFilterChange?.(nextValue);
    },
    onPaginationChange: (updater) => {
      if (!isPaginationControlled) {
        setInternalPagination(updater);
      }

      onPaginationChange?.(updater);
    },
    onRowSelectionChange: (updater) => {
      if (!isRowSelectionControlled) {
        setInternalRowSelection(updater);
      }

      onRowSelectionChange?.(updater);
    },
    onSortingChange: (updater) => {
      if (!isSortingControlled) {
        setInternalSorting(updater);
      }

      onSortingChange?.(updater);
    },
    pageCount,
    rowCount,
    state: {
      columnFilters: currentColumnFilters,
      columnVisibility: currentColumnVisibility,
      globalFilter: currentGlobalFilter,
      pagination: currentPagination,
      rowSelection: currentRowSelection,
      sorting: currentSorting,
    },
    sortDescFirst: false,
  });
  const rows = table.getRowModel().rows;
  const selectedRowCount = getSelectedRowCount(currentRowSelection);
  const totalRowCount = rowCount ?? table.getPrePaginationRowModel().rows.length;
  const visibleColumnCount = Math.max(
    table.getVisibleLeafColumns().length +
      (hasRowSelection ? 1 : 0) +
      (hasRowActions ? 1 : 0),
    1,
  );
  const pageCountLabel = Math.max(table.getPageCount(), 1);
  const currentStatus = error
    ? "error"
    : loading
      ? "loading"
      : rows.length === 0
        ? "empty"
        : "idle";
  const globalFilterId = `${generatedId}-global-filter`;
  const pageSizeId = `${generatedId}-page-size`;
  const hasToolbar =
    enableGlobalFilter || enableColumnVisibility || hasRowSelection;

  return (
    <div
      {...props}
      data-slot="data-table"
      data-density={density}
      data-status={currentStatus}
      data-manual-filtering={manualFiltering ? "true" : undefined}
      data-manual-pagination={manualPagination ? "true" : undefined}
      data-manual-sorting={manualSorting ? "true" : undefined}
      className={dataTableClassNames({ className })}
    >
      {hasToolbar ? (
        <div data-slot="data-table-toolbar" className={dataTableToolbarClassNames()}>
          {enableGlobalFilter ? (
            <div
              data-slot="data-table-global-filter"
              className={dataTableToolbarGroupBaseClasses}
            >
              <label
                htmlFor={globalFilterId}
                className={dataTableControlLabelBaseClasses}
              >
                {mergedLabels.globalFilter}
              </label>
              <Input
                id={globalFilterId}
                controlSize="sm"
                value={currentGlobalFilter}
                onChange={(event) => {
                  table.setGlobalFilter(event.currentTarget.value);
                }}
                placeholder={globalFilterPlaceholder ?? mergedLabels.globalFilter}
              />
              {currentGlobalFilter ? (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    table.setGlobalFilter("");
                  }}
                >
                  {mergedLabels.clearGlobalFilter}
                </Button>
              ) : null}
            </div>
          ) : null}

          {enableColumnVisibility ? (
            <fieldset
              data-slot="data-table-column-visibility"
              className={dataTableColumnVisibilityBaseClasses}
            >
              <legend className={dataTableControlLabelBaseClasses}>
                {mergedLabels.columnVisibility}
              </legend>
              <div className={dataTableColumnVisibilityOptionsBaseClasses}>
                {table
                  .getAllLeafColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    const label = getColumnLabel(column);

                    return (
                      <label
                        key={column.id}
                        className={dataTableCheckboxLabelBaseClasses}
                      >
                        <Checkbox
                          aria-label={`Toggle ${label} column`}
                          checked={column.getIsVisible()}
                          controlSize="sm"
                          onCheckedChange={(checked) => {
                            column.toggleVisibility(checked === true);
                          }}
                        />
                        <span>{label}</span>
                      </label>
                    );
                  })}
              </div>
            </fieldset>
          ) : null}

          {hasRowSelection ? (
            <div
              aria-live="polite"
              data-slot="data-table-selection-summary"
              className={dataTableControlLabelBaseClasses}
            >
              {mergedLabels.rowCount(selectedRowCount, totalRowCount)}
            </div>
          ) : null}
        </div>
      ) : null}

      <Table
        aria-describedby={ariaDescribedBy}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        density={density}
        className={tableClassName}
        containerClassName={tableContainerClassName}
      >
        {caption ? (
          <TableCaption placement={captionPlacement}>{caption}</TableCaption>
        ) : null}
        <TableHeader data-table-slot="header">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              hoverable={false}
              data-table-slot="header-row"
            >
              {hasRowSelection ? (
                <TableHead
                  data-table-slot="selection-header-cell"
                  className="w-density-control"
                >
                  {selectionMode === "multiple" ? (
                    <Checkbox
                      aria-label={mergedLabels.selectAllRows}
                      checked={
                        table.getIsAllRowsSelected()
                          ? true
                          : table.getIsSomeRowsSelected()
                            ? "indeterminate"
                            : false
                      }
                      controlSize="sm"
                      onCheckedChange={(checked) => {
                        table.toggleAllRowsSelected(checked === true);
                      }}
                    />
                  ) : null}
                </TableHead>
              ) : null}
              {headerGroup.headers.map((header) => {
                const sorted = header.column.getIsSorted();
                const canSort = header.column.getCanSort();
                const canFilter =
                  enableColumnFilters && header.column.getCanFilter();
                const columnLabel = getHeaderLabel(header);
                const headerContent = header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    );

                return (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    aria-sort={getAriaSort(sorted)}
                    data-table-slot="header-cell"
                    data-filterable={canFilter ? "true" : undefined}
                    data-sortable={canSort ? "true" : undefined}
                    data-sorted={sorted || undefined}
                    className={cn(
                      canFilter ? dataTableHeaderCellFilterableClasses : undefined,
                    )}
                  >
                    <div
                      data-slot="data-table-header-content"
                      className={dataTableHeaderContentBaseClasses}
                    >
                      {canSort && !header.isPlaceholder ? (
                        <button
                          type="button"
                          data-slot="data-table-sort-button"
                          data-sorted={sorted || undefined}
                          aria-label={getNextSortLabel(
                            mergedLabels,
                            columnLabel,
                            sorted,
                          )}
                          aria-pressed={sorted ? "true" : undefined}
                          className={dataTableSortButtonClassNames()}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <span className={dataTableSortLabelBaseClasses}>
                            {headerContent}
                          </span>
                          <span
                            aria-hidden="true"
                            data-slot="data-table-sort-indicator"
                            className={dataTableSortIndicatorClassNames()}
                          >
                            <SortIcon sorted={sorted} />
                          </span>
                        </button>
                      ) : (
                        <span className={dataTableHeaderLabelBaseClasses}>
                          {headerContent}
                        </span>
                      )}
                      {canFilter && !header.isPlaceholder
                        ? renderColumnFilter?.(header.column) ?? (
                            <DefaultColumnFilter
                              column={header.column}
                              label={columnLabel}
                            />
                          )
                        : null}
                    </div>
                  </TableHead>
                );
              })}
              {hasRowActions ? (
                <TableHead data-table-slot="actions-header-cell" align="end">
                  <span className="sr-only">{mergedLabels.rowActions}</span>
                </TableHead>
              ) : null}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody data-table-slot="body">
          {error ? (
            <TableRow hoverable={false} data-table-slot="error-row">
              <TableCell
                colSpan={visibleColumnCount}
                data-table-slot="error"
                className={dataTableErrorCellBaseClasses}
              >
                <div role="alert">{error ?? mergedLabels.error}</div>
              </TableCell>
            </TableRow>
          ) : loading ? (
            <TableRow hoverable={false} data-table-slot="loading-row">
              <TableCell
                colSpan={visibleColumnCount}
                data-table-slot="loading"
                className={dataTableStateCellBaseClasses}
              >
                <div role="status">{loadingContent ?? mergedLabels.loading}</div>
              </TableCell>
            </TableRow>
          ) : rows.length > 0 ? (
            rows.map((row) => (
              <TableRow
                key={row.id}
                data-table-slot="row"
                data-row-id={row.id}
                selected={row.getIsSelected()}
                className={getRowClassName?.(row)}
              >
                {hasRowSelection ? (
                  <TableCell data-table-slot="selection-cell">
                    <Checkbox
                      aria-label={mergedLabels.selectRow(row.id)}
                      checked={row.getIsSelected()}
                      controlSize="sm"
                      disabled={!row.getCanSelect()}
                      onCheckedChange={(checked) => {
                        row.toggleSelected(checked === true);
                      }}
                    />
                  </TableCell>
                ) : null}
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    data-table-slot="cell"
                    className={getCellClassName?.(cell)}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
                {hasRowActions ? (
                  <TableCell data-table-slot="row-actions" align="end">
                    {renderRowActions(row)}
                  </TableCell>
                ) : null}
              </TableRow>
            ))
          ) : (
            <TableRow hoverable={false} data-table-slot="empty-row">
              <TableCell
                colSpan={visibleColumnCount}
                data-table-slot="empty"
                className={dataTableEmptyClassNames()}
              >
                {emptyContent ?? mergedLabels.empty}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {enablePagination ? (
        <div
          data-slot="data-table-pagination"
          className={dataTablePaginationClassNames()}
        >
          <div data-slot="data-table-page-summary">
            {mergedLabels.pageLabel(
              table.getState().pagination.pageIndex + 1,
              pageCountLabel,
            )}
          </div>
          <div className={dataTablePaginationControlsBaseClasses}>
            <label
              htmlFor={pageSizeId}
              className={dataTableControlLabelBaseClasses}
            >
              {mergedLabels.pageSize}
            </label>
            <select
              id={pageSizeId}
              aria-label={mergedLabels.pageSize}
              className={dataTablePageSizeSelectBaseClasses}
              value={table.getState().pagination.pageSize}
              onChange={(event) => {
                table.setPageSize(Number(event.currentTarget.value));
              }}
            >
              {pageSizeOptions.map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
            <Button
              size="sm"
              variant="outline"
              disabled={!table.getCanPreviousPage()}
              onClick={() => {
                table.previousPage();
              }}
            >
              {mergedLabels.previousPage}
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={!table.getCanNextPage()}
              onClick={() => {
                table.nextPage();
              }}
            >
              {mergedLabels.nextPage}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
