import type { PropRow } from "@/components/props-table";

export const dataTableProps: PropRow[] = [
  {
    prop: "columns",
    type: "DataTableColumnDef<TData>[]",
    defaultValue: "—",
    description:
      "TanStack-style column definitions: accessorKey, header, and an optional cell renderer.",
  },
  {
    prop: "data",
    type: "TData[]",
    defaultValue: "—",
    description: "Row data; pair with getRowId for stable selection keys.",
  },
  {
    prop: "enableSorting",
    type: "boolean",
    defaultValue: "true",
    description:
      "Sortable headers with accessible sort buttons; control with sorting/onSortingChange or seed defaultSorting.",
  },
  {
    prop: "enableGlobalFilter",
    type: "boolean",
    defaultValue: "false",
    description:
      "Toolbar text filter across all columns; globalFilterPlaceholder labels it.",
  },
  {
    prop: "enableColumnFilters / renderColumnFilter",
    type: "boolean / (column) => ReactNode",
    defaultValue: "false / —",
    description: "Per-column filtering with a custom filter UI per column.",
  },
  {
    prop: "selectionMode",
    type: '"none" | "single" | "multiple"',
    defaultValue: '"none"',
    description:
      "Row selection with header select-all in multiple mode; control with rowSelection/onRowSelectionChange.",
  },
  {
    prop: "enablePagination",
    type: "boolean",
    defaultValue: "false",
    description:
      "Pagination footer with pageSizeOptions; control with pagination/onPaginationChange.",
  },
  {
    prop: "loading / loadingContent",
    type: "boolean / ReactNode",
    defaultValue: "false / built-in",
    description: "Loading state announced to assistive tech.",
  },
  {
    prop: "error / emptyContent",
    type: "ReactNode",
    defaultValue: "—",
    description: "Error and empty states rendered inside the table region.",
  },
  {
    prop: "manualSorting / manualFiltering / manualPagination",
    type: "boolean",
    defaultValue: "false",
    description:
      "Server-driven mode: the table emits state changes and renders what you pass, with pageCount/rowCount.",
  },
  {
    prop: "renderRowActions",
    type: "(row) => ReactNode",
    defaultValue: "—",
    description: "Trailing actions cell per row — menus, buttons, links.",
  },
  {
    prop: "density / caption / labels",
    type: "density scale / ReactNode / DataTableLabels",
    defaultValue: "—",
    description:
      "Visual density, an accessible caption, and overridable UI strings for localization.",
  },
];
