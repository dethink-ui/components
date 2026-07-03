import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  Container,
  DethinkProvider,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemLabel,
  DropdownMenuItemShortcut,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Link,
  Stack,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  Text,
  defineDethinkTheme,
  type TableDensity,
} from "@dethink/components";

const meta = {
  title: "Components/Table",
  component: Table,
  args: {
    density: "default",
  },
  argTypes: {
    density: {
      control: "inline-radio",
      options: ["compact", "default", "comfortable"],
    },
  },
} satisfies Meta<typeof Table>;

export default meta;

type Story = StoryObj<typeof meta>;

const workspaces = [
  {
    change: "+12%",
    env: "Production",
    owner: "ops@example.com",
    requests: "2,410,480",
    status: "Healthy",
  },
  {
    change: "+4%",
    env: "Staging",
    owner: "platform@example.com",
    requests: "481,210",
    status: "Review",
  },
  {
    change: "-2%",
    env: "Sandbox",
    owner: "qa@example.com",
    requests: "98,420",
    status: "Idle",
  },
] as const;

const invoices = [
  {
    amount: "$12,400.00",
    due: "Jul 15, 2026",
    invoice: "INV-2048",
    owner: "Acme Operations",
    status: "Paid",
  },
  {
    amount: "$8,750.00",
    due: "Jul 22, 2026",
    invoice: "INV-2049",
    owner: "Dethink Labs",
    status: "Pending",
  },
  {
    amount: "$3,120.00",
    due: "Aug 01, 2026",
    invoice: "INV-2050",
    owner: "Northstar Systems",
    status: "Review",
  },
] as const;

const permissions = [
  {
    admin: true,
    billing: true,
    group: "Owners",
    members: "4",
    reports: true,
  },
  {
    admin: false,
    billing: true,
    group: "Finance",
    members: "8",
    reports: true,
  },
  {
    admin: false,
    billing: false,
    group: "Viewers",
    members: "34",
    reports: true,
  },
] as const;

const modernTableTheme = defineDethinkTheme({
  colorSchemes: {
    light: {
      background: "oklch(0.985 0.012 165)",
      foreground: "oklch(0.19 0.04 172)",
      muted: "oklch(0.93 0.035 165)",
      mutedForeground: "oklch(0.38 0.055 190)",
      border: "oklch(0.82 0.04 170)",
      input: "oklch(0.86 0.035 170)",
      ring: "oklch(0.58 0.16 185)",
      primary: "oklch(0.53 0.16 185)",
      primaryForeground: "oklch(0.99 0.01 180)",
      destructive: "oklch(0.6 0.2 25)",
      destructiveForeground: "oklch(0.99 0.01 25)",
      success: "oklch(0.55 0.15 145)",
      successForeground: "oklch(0.99 0.01 145)",
      warning: "oklch(0.75 0.16 80)",
      warningForeground: "oklch(0.2 0.04 80)",
      info: "oklch(0.58 0.15 250)",
      infoForeground: "oklch(0.99 0.01 250)",
    },
    dark: {
      background: "oklch(0.18 0.04 172)",
      foreground: "oklch(0.96 0.015 165)",
      muted: "oklch(0.27 0.045 172)",
      mutedForeground: "oklch(0.75 0.04 178)",
      border: "oklch(0.36 0.045 172)",
      input: "oklch(0.32 0.045 172)",
      ring: "oklch(0.72 0.13 185)",
      primary: "oklch(0.72 0.13 185)",
      primaryForeground: "oklch(0.16 0.04 172)",
      success: "oklch(0.7 0.14 145)",
      successForeground: "oklch(0.13 0.035 145)",
      warning: "oklch(0.8 0.15 80)",
      warningForeground: "oklch(0.16 0.035 80)",
      info: "oklch(0.75 0.13 250)",
      infoForeground: "oklch(0.14 0.035 250)",
    },
  },
  fonts: {
    body: "Inter, ui-sans-serif, system-ui, sans-serif",
    heading: "Avenir Next, Inter, ui-sans-serif, system-ui, sans-serif",
    mono: "JetBrains Mono, ui-monospace, SFMono-Regular, monospace",
  },
  radii: {
    sm: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
  },
  density: {
    comfortable: {
      control: "3rem",
      gap: "0.875rem",
    },
  },
});

const segmentRows = [
  {
    account: "Enterprise cloud",
    arr: "$2.8M",
    conversion: "41.2%",
    health: "Live",
    owner: "Growth systems",
    pipeline: "$812K",
    region: "North America",
  },
  {
    account: "AI operations",
    arr: "$1.6M",
    conversion: "36.8%",
    health: "Review",
    owner: "Product led",
    pipeline: "$428K",
    region: "Europe",
  },
  {
    account: "Internal tools",
    arr: "$940K",
    conversion: "28.4%",
    health: "New",
    owner: "Platform",
    pipeline: "$216K",
    region: "Asia Pacific",
  },
  {
    account: "Security audit",
    arr: "$720K",
    conversion: "48.9%",
    health: "Ready",
    owner: "Trust",
    pipeline: "$184K",
    region: "Global",
  },
] as const;

function StatusPill({ children }: { children: string }) {
  return (
    <span className="inline-flex rounded-md border border-border bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
      {children}
    </span>
  );
}

function CheckMark({ checked }: { checked: boolean }) {
  return (
    <span
      className={
        checked
          ? "inline-flex h-6 min-w-10 items-center justify-center rounded-md bg-primary px-2 text-xs text-primary-foreground"
          : "inline-flex h-6 min-w-10 items-center justify-center rounded-md border border-border px-2 text-xs text-muted-foreground"
      }
    >
      {checked ? "Yes" : "No"}
    </span>
  );
}

type ModernStatusTone = "info" | "success" | "warning";

const modernStatusClasses: Record<ModernStatusTone, string> = {
  info: "border-info/30 bg-info/10 text-info",
  success: "border-success/30 bg-success/10 text-success",
  warning: "border-warning/40 bg-warning/15 text-warning-foreground",
};

function ModernStatusPill({
  children,
  tone,
}: {
  children: string;
  tone: ModernStatusTone;
}) {
  return (
    <span
      className={`inline-flex h-7 items-center rounded-md border px-2.5 text-xs font-medium ${modernStatusClasses[tone]}`}
    >
      {children}
    </span>
  );
}

function WorkspaceTable({ density = "default" }: { density?: TableDensity }) {
  return (
    <Table density={density}>
      <TableCaption>Workspace request volume for the current billing cycle.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Workspace</TableHead>
          <TableHead>Owner</TableHead>
          <TableHead>Status</TableHead>
          <TableHead align="end">Requests</TableHead>
          <TableHead align="end">Change</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {workspaces.map((workspace) => (
          <TableRow key={workspace.env} selected={workspace.env === "Production"}>
            <TableHead scope="row">{workspace.env}</TableHead>
            <TableCell>{workspace.owner}</TableCell>
            <TableCell>
              <StatusPill>{workspace.status}</StatusPill>
            </TableCell>
            <TableCell align="end" numeric>
              {workspace.requests}
            </TableCell>
            <TableCell align="end" numeric>
              {workspace.change}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow hoverable={false}>
          <TableCell colSpan={3}>Total</TableCell>
          <TableCell align="end" numeric>
            2,990,110
          </TableCell>
          <TableCell align="end" numeric>
            +9%
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}

export const Base: Story = {
  render: ({ density }) => (
    <DethinkProvider theme="light" className="p-6">
      <WorkspaceTable density={density} />
    </DethinkProvider>
  ),
};

export const CaptionAndRowHeaders: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Table>
        <TableCaption placement="top">Permission groups by product area.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Group</TableHead>
            <TableHead align="end">Members</TableHead>
            <TableHead align="center">Reports</TableHead>
            <TableHead align="center">Billing</TableHead>
            <TableHead align="center">Admin</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {permissions.map((permission) => (
            <TableRow key={permission.group}>
              <TableHead scope="row">{permission.group}</TableHead>
              <TableCell align="end" numeric>
                {permission.members}
              </TableCell>
              <TableCell align="center">
                <CheckMark checked={permission.reports} />
              </TableCell>
              <TableCell align="center">
                <CheckMark checked={permission.billing} />
              </TableCell>
              <TableCell align="center">
                <CheckMark checked={permission.admin} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </DethinkProvider>
  ),
};

export const ActionsAndSelection: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Table>
        <TableCaption>Open invoices awaiting billing review.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <span className="sr-only">Select</span>
            </TableHead>
            <TableHead>Invoice</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Due</TableHead>
            <TableHead align="end">Amount</TableHead>
            <TableHead align="end">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice, index) => (
            <TableRow key={invoice.invoice} selected={index === 0}>
              <TableCell>
                <Checkbox aria-label={`Select ${invoice.invoice}`} defaultChecked={index === 0} />
              </TableCell>
              <TableHead scope="row">
                <Link href={`#${invoice.invoice}`}>{invoice.invoice}</Link>
              </TableHead>
              <TableCell>{invoice.owner}</TableCell>
              <TableCell>
                <StatusPill>{invoice.status}</StatusPill>
              </TableCell>
              <TableCell>{invoice.due}</TableCell>
              <TableCell align="end" numeric>
                {invoice.amount}
              </TableCell>
              <TableCell align="end">
                <DropdownMenu>
                  <DropdownMenuTrigger size="sm" variant="ghost">
                    Actions
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>
                      <DropdownMenuItemLabel>Open invoice</DropdownMenuItemLabel>
                      <DropdownMenuItemShortcut>O</DropdownMenuItemShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem>Download PDF</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem destructive>Void invoice</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </DethinkProvider>
  )
};

export const DensityAndTheme: Story = {
  render: () => (
    <Stack gap="4">
      <DethinkProvider theme="light" density="compact" className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Compact operations</CardTitle>
            <CardDescription>High-density workspace metrics.</CardDescription>
          </CardHeader>
          <CardContent>
            <WorkspaceTable density="compact" />
          </CardContent>
        </Card>
      </DethinkProvider>
      <DethinkProvider theme="dark" density="comfortable" className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Comfortable reporting</CardTitle>
            <CardDescription>Dark-mode review table.</CardDescription>
          </CardHeader>
          <CardContent>
            <WorkspaceTable density="comfortable" />
          </CardContent>
        </Card>
      </DethinkProvider>
    </Stack>
  ),
};

export const ThemeOverrides: Story = {
  args: {
    density: "comfortable",
  },

  render: ({ density }) => (
    <DethinkProvider
      theme="light"
      density={density}
      themeConfig={modernTableTheme}
      className="min-h-[36rem] bg-background p-6 text-foreground"
    >
      <div className="mx-auto grid max-w-6xl gap-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="grid gap-2">
            <Text as="p" size="sm" tone="muted" weight="medium">
              Revenue operations
            </Text>
            <h2 className="font-heading text-2xl font-semibold leading-tight">
              Regional pipeline health
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              ["Pipeline", "$1.64M"],
              ["Conversion", "38.8%"],
              ["Live segments", "4"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="min-w-32 rounded-lg border border-border bg-muted/70 px-4 py-3"
              >
                <Text as="p" size="xs" tone="muted" weight="medium">
                  {label}
                </Text>
                <Text as="p" className="font-mono" size="lg" weight="semibold">
                  {value}
                </Text>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-background shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
            <div>
              <Text as="p" weight="medium">
                Forecast segments
              </Text>
              <Text as="p" size="sm" tone="muted">
                Owned accounts grouped by motion and readiness.
              </Text>
            </div>
            <Button size="sm" variant="outline">
              Export
            </Button>
          </div>

          <Table
            density={density}
            containerClassName="rounded-b-lg"
            className="min-w-[52rem]"
          >
            <TableCaption className="px-4 pb-4 text-start">
              Pipeline movement across active commercial segments.
            </TableCaption>
            <TableHeader className="bg-muted/80">
              <TableRow hoverable={false}>
                <TableHead className="h-12 ps-4 text-xs font-semibold uppercase tracking-normal">
                  Segment
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-normal">
                  Region
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-normal">
                  Owner
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-normal">
                  Status
                </TableHead>
                <TableHead
                  align="end"
                  className="text-xs font-semibold uppercase tracking-normal"
                >
                  Pipeline
                </TableHead>
                <TableHead
                  align="end"
                  className="text-xs font-semibold uppercase tracking-normal"
                >
                  Conversion
                </TableHead>
                <TableHead
                  align="end"
                  className="pe-4 text-xs font-semibold uppercase tracking-normal"
                >
                  ARR
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {segmentRows.map((segment) => (
                <TableRow
                  key={segment.account}
                  className="data-[hoverable=true]:hover:bg-primary/10"
                  selected={segment.account === "Enterprise cloud"}
                >
                  <TableHead className="ps-4 font-semibold" scope="row">
                    {segment.account}
                  </TableHead>
                  <TableCell>{segment.region}</TableCell>
                  <TableCell className="text-muted-foreground">{segment.owner}</TableCell>
                  <TableCell>
                    <ModernStatusPill
                      tone={
                        segment.health === "Live"
                          ? "success"
                          : segment.health === "Review"
                            ? "warning"
                            : "info"
                      }
                    >
                      {segment.health}
                    </ModernStatusPill>
                  </TableCell>
                  <TableCell align="end" numeric>
                    {segment.pipeline}
                  </TableCell>
                  <TableCell align="end" numeric>
                    {segment.conversion}
                  </TableCell>
                  <TableCell align="end" className="pe-4 font-mono" numeric>
                    {segment.arr}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter className="bg-primary/10">
              <TableRow hoverable={false}>
                <TableCell className="ps-4 font-medium" colSpan={4}>
                  Weighted total
                </TableCell>
                <TableCell align="end" numeric>
                  $1.64M
                </TableCell>
                <TableCell align="end" numeric>
                  38.8%
                </TableCell>
                <TableCell align="end" className="pe-4 font-mono" numeric>
                  $6.06M
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </div>
    </DethinkProvider>
  )
};

export const ResponsiveOverflow: Story = {
  render: () => (
    <DethinkProvider theme="light" className="max-w-md p-6">
      <Table className="min-w-[56rem]">
        <TableCaption>Wide incident summary with horizontal overflow.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Incident</TableHead>
            <TableHead>Region</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Opened</TableHead>
            <TableHead align="end">SLO burn</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {["INC-1024", "INC-1025", "INC-1026"].map((incident, index) => (
            <TableRow key={incident}>
              <TableHead scope="row">{incident}</TableHead>
              <TableCell>{index === 0 ? "us-east-1" : "eu-west-1"}</TableCell>
              <TableCell>API gateway</TableCell>
              <TableCell>Runtime operations</TableCell>
              <TableCell>Jul {10 + index}, 2026</TableCell>
              <TableCell align="end" numeric>
                {(index + 1) * 4}%
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </DethinkProvider>
  ),
};

export const EmptyStateRecipe: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Table>
        <TableCaption>Pending exports</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Export</TableHead>
            <TableHead>Status</TableHead>
            <TableHead align="end">Rows</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow hoverable={false}>
            <TableCell colSpan={3}>
              <Container className="py-8 text-center" size="sm">
                <Text weight="medium">No pending exports</Text>
                <Text tone="muted">Completed exports remain available for 30 days.</Text>
                <Button className="mt-4" size="sm" variant="outline">
                  Create export
                </Button>
              </Container>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </DethinkProvider>
  ),
};

export const RightToLeft: Story = {
  render: () => (
    <DethinkProvider theme="light" dir="rtl" className="p-6">
      <WorkspaceTable />
    </DethinkProvider>
  ),
};
