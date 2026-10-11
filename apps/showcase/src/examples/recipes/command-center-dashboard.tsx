"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import {
  Activity,
  Bell,
  Command,
  FileText,
  Gauge,
  LayoutDashboard,
  PanelLeftOpen,
  Radio,
  Search,
  Settings2,
  ShieldAlert,
  Timer,
  Users,
} from "lucide-react";
import {
  AreaChart,
  BarChart,
  BarList,
  Breadcrumb,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CommandPalette,
  CommandPaletteContent,
  CommandPaletteDialog,
  CommandPaletteTrigger,
  DataTable,
  DateRangePicker,
  KpiGroup,
  MultiSelect,
  MultiSelectItem,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuLink,
  SidebarMobile,
  SidebarMobileTrigger,
  SidebarProvider,
  SidebarTrigger,
  StatTile,
  type CommandPaletteCommand,
  type DataTableColumnDef,
  type StatTileProps,
  cn,
} from "@dethink/components";
import type { RecipePreviewProps } from "@/lib/recipe-presentation";

// ----------------------------------------------------------------------------
// Decorative layers (token-only, aria-hidden, non-interactive)
// ----------------------------------------------------------------------------

const insetWashStyle: CSSProperties = {
  backgroundImage: [
    "radial-gradient(58% 45% at 0% 0%, color-mix(in oklab, var(--dt-color-primary) 13%, transparent), transparent 70%)",
    "radial-gradient(52% 42% at 100% 0%, color-mix(in oklab, var(--dt-color-warning) 12%, transparent), transparent 72%)",
    "radial-gradient(70% 60% at 88% 108%, color-mix(in oklab, var(--dt-color-info) 10%, transparent), transparent 74%)",
    "linear-gradient(to bottom, color-mix(in oklab, var(--dt-color-foreground) 3%, transparent), transparent 32%)",
  ].join(", "),
};

const insetGridStyle: CSSProperties = {
  backgroundImage:
    "linear-gradient(to right, color-mix(in oklab, var(--dt-color-foreground) 5%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--dt-color-foreground) 5%, transparent) 1px, transparent 1px)",
  backgroundSize: "40px 40px",
  maskImage: "radial-gradient(92% 60% at 18% 0%, black, transparent 74%)",
  WebkitMaskImage: "radial-gradient(92% 60% at 18% 0%, black, transparent 74%)",
};

// ----------------------------------------------------------------------------
// Domain data
// ----------------------------------------------------------------------------

type Incident = {
  id: string;
  title: string;
  service: string;
  owner: string;
  severity: "sev1" | "sev2" | "sev3";
  status: "open" | "investigating" | "resolved";
};

const incidents: Incident[] = [
  {
    id: "INC-1042",
    title: "Checkout webhook retries",
    service: "Billing",
    owner: "Maya Chen",
    severity: "sev2",
    status: "investigating",
  },
  {
    id: "INC-1041",
    title: "Delayed export jobs",
    service: "Reports",
    owner: "Jon Alvarez",
    severity: "sev3",
    status: "open",
  },
  {
    id: "INC-1039",
    title: "Elevated API errors",
    service: "Gateway",
    owner: "Priya Rao",
    severity: "sev1",
    status: "open",
  },
  {
    id: "INC-1035",
    title: "Invite email backlog",
    service: "Identity",
    owner: "Sam Ortiz",
    severity: "sev3",
    status: "resolved",
  },
];

const ownerTint: Record<string, string> = {
  "Maya Chen": "var(--dt-color-primary)",
  "Jon Alvarez": "var(--dt-color-info)",
  "Priya Rao": "var(--dt-color-warning)",
  "Sam Ortiz": "var(--dt-color-success)",
};

const severityMeta: Record<
  Incident["severity"],
  { label: string; cls: string }
> = {
  sev1: {
    label: "SEV1",
    cls: "bg-destructive/15 text-foreground ring-destructive/25",
  },
  sev2: { label: "SEV2", cls: "bg-warning/15 text-foreground ring-warning/25" },
  sev3: { label: "SEV3", cls: "bg-info/15 text-foreground ring-info/25" },
};

const statusMeta: Record<Incident["status"], { label: string; dot: string }> = {
  open: { label: "Open", dot: "bg-destructive" },
  investigating: {
    label: "Investigating",
    dot: "bg-warning motion-safe:animate-pulse",
  },
  resolved: { label: "Resolved", dot: "bg-success" },
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

const columns: DataTableColumnDef<Incident>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => (
      <span className="text-muted-foreground font-mono text-xs">
        {row.original.id}
      </span>
    ),
  },
  {
    accessorKey: "title",
    header: "Incident",
    cell: ({ row }) => (
      <span className="text-foreground font-medium">{row.original.title}</span>
    ),
  },
  { accessorKey: "service", header: "Service" },
  {
    accessorKey: "owner",
    header: "Owner",
    cell: ({ row }) => {
      const name = row.original.owner;
      return (
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="border-border/60 text-foreground/80 grid size-6 shrink-0 place-items-center rounded-full border text-[0.6rem] font-semibold"
            style={{
              backgroundColor: `color-mix(in oklab, ${
                ownerTint[name] ?? "var(--dt-color-primary)"
              } 18%, var(--dt-color-background))`,
            }}
          >
            {initials(name)}
          </span>
          <span className="text-foreground/90 truncate text-sm">{name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "severity",
    header: "Severity",
    cell: ({ row }) => {
      const meta = severityMeta[row.original.severity];
      return (
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.7rem] font-semibold ring-1 ring-inset ${meta.cls}`}
        >
          {meta.label}
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const meta = statusMeta[row.original.status];
      return (
        <span className="text-foreground/90 inline-flex items-center gap-2 text-sm">
          <span
            aria-hidden="true"
            className={`size-2 shrink-0 rounded-full ${meta.dot}`}
          />
          {meta.label}
        </span>
      );
    },
  },
];

// ----------------------------------------------------------------------------
// KPI tiles
// ----------------------------------------------------------------------------

const kpis: StatTileProps[] = [
  {
    label: "Open incidents",
    value: 14,
    // More open incidents is worse, so a rise reads as negative.
    delta: { value: 27.3, positiveDirection: "down" },
    comparison: "vs yesterday",
    trend: [6, 8, 5, 9, 7, 11, 10, 14],
  },
  {
    label: "Mean time to resolve",
    value: "22m",
    delta: { value: -26.7, positiveDirection: "down" },
    comparison: "vs last week",
    trend: [38, 34, 40, 29, 31, 26, 24, 22],
  },
  {
    label: "SLO attainment",
    value: "99.93%",
    delta: {
      value: 0.04,
      formatValue: (magnitude) => `${magnitude.toFixed(2)} pts`,
    },
    comparison: "vs 30-day target",
    trend: [99.88, 99.9, 99.89, 99.92, 99.91, 99.93, 99.92, 99.93],
  },
  {
    label: "Runbooks ready",
    value: 42,
    delta: 13.5,
    comparison: "vs last month",
    trend: [30, 33, 35, 34, 37, 39, 40, 42],
  },
];

// ----------------------------------------------------------------------------
// Chart data
// ----------------------------------------------------------------------------

const hours = Array.from({ length: 12 }, (_, i) =>
  i === 11 ? "Now" : `-${11 - i}h`,
);

// p95 latency per region, in milliseconds.
const latency = hours.map((hour, i) => ({
  hour,
  usEast: [182, 176, 190, 205, 238, 262, 251, 229, 214, 221, 246, 233][i],
  euWest: [148, 151, 146, 160, 172, 169, 181, 177, 170, 166, 174, 171][i],
  apSouth: [211, 204, 219, 226, 231, 244, 239, 252, 247, 236, 241, 229][i],
}));

const load = hours.map((hour, i) => ({
  hour,
  opened: [3, 5, 4, 7, 6, 9, 8, 11, 7, 10, 12, 9][i],
  resolved: [4, 4, 5, 5, 7, 6, 8, 8, 9, 8, 9, 11][i],
}));

const alertsByService = [
  { label: "Gateway", value: 128, href: "#gateway" },
  { label: "Billing", value: 74, href: "#billing" },
  { label: "Reports", value: 41, href: "#reports" },
  { label: "Identity", value: 23, href: "#identity" },
  { label: "Search", value: 12, href: "#search" },
  { label: "Notifications", value: 9, href: "#notifications" },
];

const severityBreakdown = [
  { label: "SEV1", count: 2, solid: "bg-destructive", dot: "bg-destructive" },
  { label: "SEV2", count: 5, solid: "bg-warning", dot: "bg-warning" },
  { label: "SEV3", count: 7, solid: "bg-info", dot: "bg-info" },
];
const severityTotal = severityBreakdown.reduce((sum, s) => sum + s.count, 0);

// ----------------------------------------------------------------------------
// Responders
// ----------------------------------------------------------------------------

const responders = [
  {
    name: "Maya Chen",
    role: "Incident commander",
    status: "online",
    tint: "var(--dt-color-primary)",
  },
  {
    name: "Priya Rao",
    role: "On call · Gateway",
    status: "busy",
    tint: "var(--dt-color-warning)",
  },
  {
    name: "Sam Ortiz",
    role: "Comms lead",
    status: "online",
    tint: "var(--dt-color-success)",
  },
];

const responderStatusDot: Record<string, string> = {
  online: "bg-success",
  busy: "bg-warning",
  away: "bg-muted-foreground",
};

// ----------------------------------------------------------------------------

export function CommandCenterDashboardRecipe({
  presentation = "embedded",
}: RecipePreviewProps) {
  const [lastCommand, setLastCommand] = useState("No command run yet.");
  const fullPage = presentation === "full-page";

  const commands: CommandPaletteCommand[] = [
    {
      action: () => setLastCommand("Opened incident commander handoff."),
      group: "Incident response",
      icon: <ShieldAlert aria-hidden="true" className="size-4" />,
      key: "handoff",
      label: "Open commander handoff",
      shortcut: "G H",
    },
    {
      action: () => setLastCommand("Created a status update draft."),
      group: "Incident response",
      icon: <FileText aria-hidden="true" className="size-4" />,
      key: "status-update",
      label: "Draft status update",
      shortcut: "G U",
    },
    {
      action: () => setLastCommand("Opened notification preferences."),
      group: "Workspace",
      icon: <Bell aria-hidden="true" className="size-4" />,
      key: "notifications",
      label: "Notification preferences",
    },
  ];

  return (
    <SidebarProvider variant="floating" motion="expressive">
      <div
        data-recipe-surface="command-center-dashboard"
        className={cn(
          "border-border bg-muted/30 flex w-full min-w-0 border",
          fullPage
            ? "min-h-[calc(100dvh-7rem)] overflow-clip rounded-none border-x-0 border-t-0"
            : "min-h-[42rem] overflow-hidden rounded-xl",
        )}
      >
        <Sidebar
          aria-label="Command center navigation"
          className={
            fullPage
              ? "sticky top-[calc(var(--site-header-height)+4rem)] z-20 h-[calc(100dvh-var(--site-header-height)-4.5rem)] self-start max-md:hidden"
              : "z-20"
          }
        >
          <SidebarHeader>
            <div className="flex min-w-0 items-center justify-between gap-2 group-data-[collapsed=true]/sidebar:flex-col">
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className="bg-primary/10 text-primary ring-primary/20 grid size-9 shrink-0 place-items-center rounded-lg ring-1"
                >
                  <ShieldAlert className="size-4.5" />
                </span>
                <div className="min-w-0 group-data-[collapsed=true]/sidebar:hidden">
                  <div className="text-foreground truncate text-sm font-semibold">
                    Northstar Ops
                  </div>
                  <div className="text-muted-foreground truncate text-xs">
                    Incident command
                  </div>
                </div>
              </div>
              <SidebarTrigger className="shrink-0" />
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Workspace</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuLink
                      current
                      href="#overview"
                      icon={<LayoutDashboard aria-hidden="true" />}
                    >
                      Overview
                    </SidebarMenuLink>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuLink
                      badge="14"
                      href="#incidents"
                      icon={<ShieldAlert aria-hidden="true" />}
                    >
                      Incidents
                    </SidebarMenuLink>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuLink
                      badge="3"
                      href="#team"
                      icon={<Users aria-hidden="true" />}
                    >
                      Responders
                    </SidebarMenuLink>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuLink
                      href="#slo"
                      icon={<Gauge aria-hidden="true" />}
                    >
                      Service levels
                    </SidebarMenuLink>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>On call</SidebarGroupLabel>
              <SidebarGroupContent>
                <ul className="space-y-1.5 px-1 py-1">
                  {responders.map((person) => (
                    <li
                      key={person.name}
                      className="flex items-center gap-2.5 rounded-md px-1.5 py-1 group-data-[collapsed=true]/sidebar:justify-center group-data-[collapsed=true]/sidebar:px-0"
                      title={`${person.name} · ${person.role} · ${person.status}`}
                    >
                      <span className="relative shrink-0">
                        <span
                          aria-hidden="true"
                          className="border-border/60 text-foreground/80 grid size-7 place-items-center rounded-full border text-[0.6rem] font-semibold"
                          style={{
                            backgroundColor: `color-mix(in oklab, ${person.tint} 18%, var(--dt-color-background))`,
                          }}
                        >
                          {initials(person.name)}
                        </span>
                        <span
                          aria-hidden="true"
                          className={`border-background absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2 ${
                            responderStatusDot[person.status]
                          }`}
                        />
                      </span>
                      <span className="min-w-0 flex-1 group-data-[collapsed=true]/sidebar:sr-only">
                        <span className="text-foreground block truncate text-xs font-medium">
                          {person.name}
                        </span>
                        <span className="text-muted-foreground block truncate text-[0.7rem]">
                          {person.role}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="border-border border-t">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton icon={<Settings2 aria-hidden="true" />}>
                  Settings
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        {fullPage ? (
          <SidebarMobile
            label="Command center navigation"
            className="w-[min(20rem,calc(100vw-2rem))] md:hidden"
          >
            <SidebarHeader className="pr-14">
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className="bg-primary/10 text-primary ring-primary/20 grid size-9 shrink-0 place-items-center rounded-lg ring-1"
                >
                  <ShieldAlert className="size-4.5" />
                </span>
                <div className="min-w-0">
                  <div className="text-foreground truncate text-sm font-semibold">
                    Northstar Ops
                  </div>
                  <div className="text-muted-foreground truncate text-xs">
                    Incident command
                  </div>
                </div>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Workspace</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuLink
                        current
                        href="#overview"
                        icon={<LayoutDashboard aria-hidden="true" />}
                      >
                        Overview
                      </SidebarMenuLink>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuLink
                        badge="14"
                        href="#incidents"
                        icon={<ShieldAlert aria-hidden="true" />}
                      >
                        Incidents
                      </SidebarMenuLink>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuLink
                        badge="3"
                        href="#team"
                        icon={<Users aria-hidden="true" />}
                      >
                        Responders
                      </SidebarMenuLink>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuLink
                        href="#slo"
                        icon={<Gauge aria-hidden="true" />}
                      >
                        Service levels
                      </SidebarMenuLink>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </SidebarMobile>
        ) : null}

        <SidebarInset className="relative min-w-0 overflow-hidden p-4 sm:p-6">
          <span
            aria-hidden="true"
            style={insetWashStyle}
            className="pointer-events-none absolute inset-0"
          />
          <span
            aria-hidden="true"
            style={insetGridStyle}
            className="pointer-events-none absolute inset-0"
          />

          <div className="relative space-y-5">
            {fullPage ? (
              <SidebarMobileTrigger className="md:hidden">
                <PanelLeftOpen aria-hidden="true" className="size-4" />
              </SidebarMobileTrigger>
            ) : null}

            {/* Header / toolbar */}
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="space-y-2">
                <span className="text-muted-foreground inline-flex items-center gap-2 text-[0.7rem] font-semibold tracking-[0.18em] uppercase">
                  <span className="relative flex size-2">
                    <span
                      aria-hidden="true"
                      className="bg-success/60 absolute inline-flex size-full rounded-full motion-safe:animate-ping"
                    />
                    <span
                      aria-hidden="true"
                      className="bg-success relative inline-flex size-2 rounded-full"
                    />
                  </span>
                  Live operations
                </span>
                <Breadcrumb
                  size="sm"
                  items={[
                    { key: "home", label: "Home", href: "/" },
                    { key: "ops", label: "Operations", href: "#ops" },
                    { key: "incidents", label: "Incidents" },
                  ]}
                />
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="font-heading text-2xl font-semibold tracking-tight">
                    Command center
                  </h2>
                  <span className="bg-warning/15 text-foreground ring-warning/25 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset">
                    <Radio
                      className="text-warning size-3.5"
                      aria-hidden="true"
                    />
                    All systems degraded
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div
                  role="group"
                  className="flex -space-x-2"
                  aria-label={`${responders.length} responders on call`}
                >
                  {responders.map((person) => (
                    <span
                      key={person.name}
                      aria-hidden="true"
                      title={person.name}
                      className="border-background text-foreground/80 grid size-8 place-items-center rounded-full border-2 text-[0.65rem] font-semibold shadow-sm"
                      style={{
                        backgroundColor: `color-mix(in oklab, ${person.tint} 16%, var(--dt-color-background))`,
                      }}
                    >
                      {initials(person.name)}
                    </span>
                  ))}
                </div>
                <CommandPaletteDialog closeOnRun motionPreset="standard">
                  <CommandPaletteTrigger variant="outline">
                    <Search className="size-4" aria-hidden="true" />
                    Command
                  </CommandPaletteTrigger>
                  <CommandPaletteContent
                    title="Command center"
                    description="Run incident response actions."
                  >
                    <CommandPalette
                      label="Incident commands"
                      commands={commands}
                      placeholder="Search actions..."
                    />
                  </CommandPaletteContent>
                </CommandPaletteDialog>
              </div>
            </div>

            <output className="border-border bg-background/70 text-muted-foreground flex items-center gap-2 rounded-md border px-3 py-2 text-sm shadow-sm backdrop-blur">
              <Command
                className="text-primary size-4 shrink-0"
                aria-hidden="true"
              />
              {lastCommand}
            </output>

            {/* KPI row */}
            <section aria-label="Key metrics">
              <KpiGroup>
                {kpis.map((kpi) => (
                  <StatTile
                    key={String(kpi.label)}
                    {...kpi}
                    className="bg-background/80 backdrop-blur-sm"
                  />
                ))}
              </KpiGroup>
            </section>

            {/* Latency and alert sources */}
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
              <Card shadow="sm" className="ring-border/60 min-w-0 ring-1">
                <CardHeader>
                  <CardTitle
                    id="latency-title"
                    className="flex items-center gap-2 text-base"
                  >
                    <Gauge className="text-primary size-4" aria-hidden="true" />
                    API latency
                  </CardTitle>
                  <CardDescription>p95 by region · last 12h</CardDescription>
                </CardHeader>
                <CardContent>
                  <AreaChart
                    aria-labelledby="latency-title"
                    data={latency}
                    index="hour"
                    indexLabel="Hour"
                    height={220}
                    includeZero={false}
                    formatValue={(value) => `${Math.round(value)} ms`}
                    series={[
                      { key: "usEast", label: "us-east" },
                      { key: "euWest", label: "eu-west" },
                      { key: "apSouth", label: "ap-south" },
                    ]}
                  />
                </CardContent>
              </Card>

              <Card shadow="sm" className="ring-border/60 min-w-0 ring-1">
                <CardHeader>
                  <CardTitle
                    id="alerts-title"
                    className="flex items-center gap-2 text-base"
                  >
                    <Bell className="text-warning size-4" aria-hidden="true" />
                    Alert sources
                  </CardTitle>
                  <CardDescription>
                    Alerts fired by service · 24h
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BarList
                    aria-labelledby="alerts-title"
                    data={alertsByService}
                    limit={5}
                    labelHeader="Service"
                    valueHeader="Alerts"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Incident load / severity band */}
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
              <Card shadow="sm" className="ring-border/60 min-w-0 ring-1">
                <CardHeader>
                  <CardTitle
                    id="load-title"
                    className="flex items-center gap-2 text-base"
                  >
                    <Activity
                      className="text-primary size-4"
                      aria-hidden="true"
                    />
                    Incident load
                  </CardTitle>
                  <CardDescription>
                    Opened and resolved per hour · last 12h
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BarChart
                    aria-labelledby="load-title"
                    data={load}
                    index="hour"
                    indexLabel="Hour"
                    height={200}
                    series={[
                      { key: "opened", label: "Opened" },
                      { key: "resolved", label: "Resolved" },
                    ]}
                  />
                </CardContent>
              </Card>

              <Card shadow="sm" className="ring-border/60 min-w-0 ring-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ShieldAlert
                      className="text-warning size-4"
                      aria-hidden="true"
                    />
                    Severity mix
                  </CardTitle>
                  <CardDescription>{severityTotal} active</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div
                    aria-hidden="true"
                    className="bg-muted/50 flex h-2.5 w-full overflow-hidden rounded-full"
                  >
                    {severityBreakdown.map((seg) => (
                      <span
                        key={seg.label}
                        className={`h-full ${seg.solid}`}
                        style={{
                          width: `${(seg.count / severityTotal) * 100}%`,
                        }}
                      />
                    ))}
                  </div>
                  <ul className="space-y-1.5">
                    {severityBreakdown.map((seg) => (
                      <li
                        key={seg.label}
                        className="flex items-center gap-2 text-sm"
                      >
                        <span
                          aria-hidden="true"
                          className={`size-2 shrink-0 rounded-full ${seg.dot}`}
                        />
                        <span className="text-foreground/90 flex-1">
                          {seg.label}
                        </span>
                        <span className="text-muted-foreground tabular-nums">
                          {seg.count}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card shadow="sm" className="ring-border/60 ring-1">
              <CardHeader>
                <CardTitle className="text-base">Filters</CardTitle>
                <CardDescription>
                  Date, service, and status controls stay visible above the
                  operational table.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 lg:grid-cols-2">
                <DateRangePicker label="Incident window" />
                <MultiSelect label="Services" placeholder="Choose services">
                  <MultiSelectItem value="billing">Billing</MultiSelectItem>
                  <MultiSelectItem value="gateway">Gateway</MultiSelectItem>
                  <MultiSelectItem value="reports">Reports</MultiSelectItem>
                  <MultiSelectItem value="identity">Identity</MultiSelectItem>
                </MultiSelect>
              </CardContent>
            </Card>

            {/* Incident table */}
            <Card shadow="sm" className="ring-border/60 ring-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Timer className="text-primary size-4" aria-hidden="true" />
                  Active incidents
                </CardTitle>
                <CardDescription>
                  Sort, filter, and paginate the same data table used in app
                  surfaces.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={columns}
                  data={incidents}
                  getRowId={(row) => row.id}
                  enableGlobalFilter
                  globalFilterPlaceholder="Filter incidents..."
                  enablePagination
                  defaultPagination={{ pageIndex: 0, pageSize: 4 }}
                />
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
