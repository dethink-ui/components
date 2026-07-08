import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import {
  Button,
  DataTable,
  DethinkProvider,
  Stack,
  Text,
  defineDethinkTheme,
  type DataTableColumnDef,
  type DataTableDensity,
  type DethinkTheme,
  type DethinkThemeConfig,
} from "@dethink/components";

type InvoiceStatus = "Paid" | "Open" | "Overdue" | "Review";

interface Invoice {
  id: string;
  account: string;
  owner: string;
  region: string;
  status: InvoiceStatus;
  total: number;
  updated: string;
}

const meta = {
  title: "Components/DataTable",
  args: {
    density: "default",
  },
  argTypes: {
    density: {
      control: "inline-radio",
      options: ["compact", "default", "comfortable"],
    },
  },
} satisfies Meta<StoryArgs>;

export default meta;

type StoryArgs = {
  density?: DataTableDensity;
};

type Story = StoryObj<StoryArgs>;

const invoices: Invoice[] = [
  {
    id: "inv-2048",
    account: "Acme Operations",
    owner: "ops@example.com",
    region: "North America",
    status: "Paid",
    total: 12400,
    updated: "Jul 03, 2026",
  },
  {
    id: "inv-2049",
    account: "Dethink Labs",
    owner: "finance@example.com",
    region: "Europe",
    status: "Open",
    total: 8750,
    updated: "Jul 04, 2026",
  },
  {
    id: "inv-2050",
    account: "Northstar Systems",
    owner: "revops@example.com",
    region: "Asia Pacific",
    status: "Review",
    total: 3120,
    updated: "Jul 08, 2026",
  },
  {
    id: "inv-2051",
    account: "Signal Foundry",
    owner: "billing@example.com",
    region: "Global",
    status: "Overdue",
    total: 18800,
    updated: "Jul 10, 2026",
  },
  {
    id: "inv-2052",
    account: "Sandbox Group",
    owner: "qa@example.com",
    region: "North America",
    status: "Paid",
    total: 980,
    updated: "Jul 12, 2026",
  },
  {
    id: "inv-2053",
    account: "Internal Tools",
    owner: "platform@example.com",
    region: "Europe",
    status: "Open",
    total: 6400,
    updated: "Jul 13, 2026",
  },
];

const statusClasses: Record<InvoiceStatus, string> = {
  Paid: "border-success/30 bg-success/10 text-success",
  Open: "border-info/30 bg-info/10 text-info",
  Overdue: "border-destructive/30 bg-destructive/10 text-destructive",
  Review: "border-warning/40 bg-warning/15 text-warning-foreground",
};

function StatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <span
      className={`inline-flex h-7 items-center rounded-md border px-2.5 text-xs font-medium ${statusClasses[status]}`}
    >
      {status}
    </span>
  );
}

const invoiceColumns: DataTableColumnDef<Invoice>[] = [
  {
    accessorKey: "account",
    header: "Account",
    cell: ({ row }) => (
      <div className="grid gap-0.5">
        <span className="text-foreground font-medium">
          {row.original.account}
        </span>
        <span className="text-muted-foreground text-xs">{row.original.id}</span>
      </div>
    ),
  },
  {
    accessorKey: "owner",
    header: "Owner",
  },
  {
    accessorKey: "region",
    header: "Region",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ getValue }) =>
      new Intl.NumberFormat("en-US", {
        currency: "USD",
        style: "currency",
      }).format(getValue<number>()),
  },
  {
    accessorKey: "updated",
    header: "Updated",
  },
];

function StoryFrame({
  children,
  description,
  title,
}: {
  children: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <Stack className="max-w-6xl" gap="4">
      <Stack gap="1">
        <Text weight="semibold">{title}</Text>
        <Text size="sm" tone="muted">
          {description}
        </Text>
      </Stack>
      {children}
    </Stack>
  );
}

function StoryShell({
  children,
  density = "default",
  dir = "ltr",
  theme = "light",
  themeConfig,
}: {
  children: ReactNode;
  density?: DataTableDensity;
  dir?: "ltr" | "rtl";
  theme?: DethinkTheme;
  themeConfig?: DethinkThemeConfig;
}) {
  return (
    <DethinkProvider
      className="bg-background text-foreground min-h-[32rem] p-6"
      density={density}
      dir={dir}
      theme={theme}
      themeConfig={themeConfig}
    >
      {children}
    </DethinkProvider>
  );
}

export const Base: Story = {
  render: ({ density = "default" }) => (
    <StoryShell density={density}>
      <StoryFrame
        title="Invoices"
        description="Semantic table rendering with sortable TanStack columns."
      >
        <DataTable
          aria-label="Invoice data"
          columns={invoiceColumns}
          data={invoices}
          density={density}
          getRowId={(row) => row.id}
        />
      </StoryFrame>
    </StoryShell>
  ),
};

export const FilteringAndPagination: Story = {
  args: {
    density: "compact",
  },
  render: ({ density = "default" }) => (
    <StoryShell density={density}>
      <StoryFrame
        title="Filtering and pagination"
        description="Global search, column filters, and page controls are labeled native controls."
      >
        <DataTable
          aria-label="Filterable invoice data"
          columns={invoiceColumns}
          data={invoices}
          defaultPagination={{ pageIndex: 0, pageSize: 3 }}
          density={density}
          enableColumnFilters
          enableGlobalFilter
          enablePagination
          getRowId={(row) => row.id}
          pageSizeOptions={[3, 6]}
        />
      </StoryFrame>
    </StoryShell>
  ),
};

export const SelectionVisibilityAndActions: Story = {
  render: ({ density = "default" }) => (
    <StoryShell density={density}>
      <StoryFrame
        title="Selection, visibility, and row actions"
        description="Selection state, column toggles, and row actions compose with existing controls."
      >
        <DataTable
          aria-label="Selectable invoice data"
          columns={invoiceColumns}
          data={invoices}
          density={density}
          enableColumnVisibility
          getRowId={(row) => row.id}
          renderRowActions={(row) => (
            <Button size="sm" variant="outline">
              Review {row.original.id}
            </Button>
          )}
          selectionMode="multiple"
        />
      </StoryFrame>
    </StoryShell>
  ),
};

export const States: Story = {
  render: ({ density = "default" }) => (
    <StoryShell density={density}>
      <StoryFrame
        title="Loading, empty, and error states"
        description="State rows preserve the table context and expose status or alert semantics."
      >
        <Stack gap="4">
          <DataTable
            aria-label="Loading invoice data"
            columns={invoiceColumns}
            data={invoices}
            density={density}
            loading
            loadingContent="Refreshing invoices"
          />
          <DataTable
            aria-label="Empty invoice data"
            columns={invoiceColumns}
            data={[]}
            density={density}
            emptyContent="No invoices match the current filters."
          />
          <DataTable
            aria-label="Errored invoice data"
            columns={invoiceColumns}
            data={invoices}
            density={density}
            error="Invoices could not be loaded."
          />
        </Stack>
      </StoryFrame>
    </StoryShell>
  ),
};

export const ManualServerMode: Story = {
  args: {
    density: "compact",
  },
  render: ({ density = "default" }) => (
    <StoryShell density={density}>
      <StoryFrame
        title="Manual server mode"
        description="Manual flags expose server-owned sorting, filtering, and pagination without local row-model changes."
      >
        <DataTable
          aria-label="Server-owned invoice data"
          columns={invoiceColumns}
          data={invoices.slice(0, 3)}
          defaultSorting={[{ id: "updated", desc: true }]}
          density={density}
          enableGlobalFilter
          enablePagination
          getRowId={(row) => row.id}
          manualFiltering
          manualPagination
          manualSorting
          pageCount={8}
          rowCount={48}
        />
      </StoryFrame>
    </StoryShell>
  ),
};

export const Rtl: Story = {
  render: ({ density = "default" }) => (
    <StoryShell density={density} dir="rtl">
      <StoryFrame
        title="RTL"
        description="Logical spacing, table overflow, and controls inherit provider direction."
      >
        <DataTable
          aria-label="RTL invoice data"
          columns={invoiceColumns}
          data={invoices}
          density={density}
          enableColumnVisibility
          enableGlobalFilter
          getRowId={(row) => row.id}
          selectionMode="multiple"
        />
      </StoryFrame>
    </StoryShell>
  ),
};

const dataTableTheme = defineDethinkTheme({
  colorSchemes: {
    light: {
      background: "oklch(0.98 0.015 210)",
      foreground: "oklch(0.18 0.045 245)",
      muted: "oklch(0.92 0.035 220)",
      mutedForeground: "oklch(0.42 0.06 245)",
      border: "oklch(0.78 0.045 225)",
      input: "oklch(0.84 0.04 225)",
      ring: "oklch(0.58 0.18 250)",
      primary: "oklch(0.52 0.18 250)",
      primaryForeground: "oklch(0.99 0.01 250)",
      destructive: "oklch(0.6 0.2 25)",
      destructiveForeground: "oklch(0.99 0.01 25)",
      success: "oklch(0.55 0.15 150)",
      successForeground: "oklch(0.99 0.01 150)",
      warning: "oklch(0.76 0.15 82)",
      warningForeground: "oklch(0.2 0.04 82)",
      info: "oklch(0.58 0.16 245)",
      infoForeground: "oklch(0.99 0.01 245)",
    },
  },
  density: {
    comfortable: {
      control: "3rem",
      gap: "0.875rem",
    },
  },
  radii: {
    sm: "0.5rem",
    md: "0.625rem",
    lg: "0.75rem",
  },
});

export const ThemeOverrides: Story = {
  args: {
    density: "comfortable",
  },
  render: ({ density = "default" }) => (
    <StoryShell density={density} themeConfig={dataTableTheme}>
      <StoryFrame
        title="Theme overrides"
        description="DataTable picks up provider color, radius, focus, density, and status tokens."
      >
        <DataTable
          aria-label="Themed invoice data"
          columns={invoiceColumns}
          data={invoices}
          density={density}
          enableColumnFilters
          enableColumnVisibility
          enableGlobalFilter
          enablePagination
          getRowId={(row) => row.id}
          renderRowActions={(row) => (
            <Button size="sm" variant="solid">
              Open {row.original.id}
            </Button>
          )}
          selectionMode="multiple"
        />
      </StoryFrame>
    </StoryShell>
  ),
};

export const DarkMode: Story = {
  args: {
    density: "compact",
  },
  render: ({ density = "default" }) => (
    <StoryShell density={density} theme="dark">
      <StoryFrame
        title="Dark mode"
        description="DataTable uses the provider dark color scheme for controls, status badges, selection, and pagination."
      >
        <DataTable
          aria-label="Dark mode invoice data"
          columns={invoiceColumns}
          data={invoices}
          defaultPagination={{ pageIndex: 0, pageSize: 3 }}
          density={density}
          enableColumnFilters
          enableColumnVisibility
          enableGlobalFilter
          enablePagination
          getRowId={(row) => row.id}
          pageSizeOptions={[3, 6]}
          renderRowActions={(row) => (
            <Button size="sm" variant="outline">
              Open {row.original.id}
            </Button>
          )}
          selectionMode="multiple"
        />
      </StoryFrame>
    </StoryShell>
  ),
};
