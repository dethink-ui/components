import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import {
  Bell,
  Blocks,
  Bot,
  Boxes,
  CircleGauge,
  CloudCog,
  Focus,
  Search,
  Settings,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import {
  Button,
  DethinkProvider,
  IconButton,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuItem,
  SidebarMenuLink,
  SidebarRail,
  SidebarShell,
  SidebarShellFooter,
  SidebarShellHeader,
  SidebarShellMain,
  SidebarShellNavigation,
  type SidebarShellProps,
} from "@dethink/components";

const meta = {
  title: "Components/SidebarShell",
  component: SidebarShell,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    chrome: "workbench",
    defaultCollapsed: false,
    motion: "standard",
    side: "left",
  },
  argTypes: {
    chrome: {
      control: "inline-radio",
      options: ["workbench", "plain"],
    },
    motion: {
      control: "inline-radio",
      options: ["none", "subtle", "standard", "expressive"],
    },
    side: {
      control: "inline-radio",
      options: ["left", "right"],
    },
  },
} satisfies Meta<typeof SidebarShell>;

export default meta;

type Story = StoryObj<typeof meta>;

type NavigationItem = {
  badge?: string;
  current?: boolean;
  href: string;
  icon: LucideIcon;
  label: string;
};

const navigationItems: NavigationItem[] = [
  {
    current: true,
    href: "/overview",
    icon: CircleGauge,
    label: "Overview",
  },
  {
    badge: "3",
    href: "/incidents",
    icon: ShieldCheck,
    label: "Incidents",
  },
  {
    href: "/deployments",
    icon: CloudCog,
    label: "Deployments",
  },
  {
    href: "/automations",
    icon: Bot,
    label: "Automations",
  },
];

const metrics = [
  { label: "Open incidents", value: "23", change: "+12%" },
  { label: "Deployments", value: "18", change: "+8%" },
  { label: "Success rate", value: "99.2%", change: "+1.3%" },
  { label: "Mean recovery", value: "42m", change: "-5m" },
];

const activity = [
  ["Payment gateway latency", "Investigating", "12m ago", "A. Chen"],
  ["Web checkout deploy", "Successful", "35m ago", "R. Patel"],
  ["Search service errors", "Investigating", "1h ago", "M. Ruiz"],
  ["User profile deploy", "Successful", "2h ago", "J. Kim"],
];

function ShellNavigation() {
  return (
    <Sidebar aria-label="Command center navigation">
      <SidebarHeader>
        <div className="flex min-w-0 items-center gap-3">
          <span className="bg-primary text-primary-foreground inline-flex size-8 shrink-0 items-center justify-center rounded-lg">
            <Blocks aria-hidden="true" className="size-4" />
          </span>
          <span className="min-w-0">
            <span className="text-foreground block truncate text-sm font-semibold">
              Dethink Ops
            </span>
            <span className="text-muted-foreground block truncate text-xs">
              Production workspace
            </span>
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuLink
                      current={item.current}
                      href={item.href}
                      icon={<Icon aria-hidden="true" />}
                    >
                      {item.label}
                    </SidebarMenuLink>
                    {item.badge ? (
                      <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                    ) : null}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuLink href="/services" icon={<Boxes />}>
                  Services
                </SidebarMenuLink>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuLink href="/settings" icon={<Settings />}>
                  Settings
                </SidebarMenuLink>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex min-w-0 items-center gap-2">
          <span className="bg-success size-2 shrink-0 rounded-full" />
          <span className="text-muted-foreground truncate text-xs group-data-[collapsed=true]:sr-only">
            All systems operational
          </span>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

function WorkspaceContent() {
  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-sm">Workspace / Overview</p>
          <h1 className="text-foreground mt-1 text-2xl font-semibold tracking-tight">
            Command center
          </h1>
        </div>
        <Button size="sm">Create incident</Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric, index) => (
          <article
            key={metric.label}
            className="border-border bg-background rounded-lg border p-4 shadow-sm"
          >
            <p className="text-muted-foreground text-xs font-medium">
              {metric.label}
            </p>
            <div className="mt-3 flex items-end justify-between gap-3">
              <p dir="ltr" className="text-foreground text-2xl font-semibold">
                {metric.value}
              </p>
              <span
                dir="ltr"
                className={
                  index === 0
                    ? "text-warning text-xs font-medium"
                    : "text-success text-xs font-medium"
                }
              >
                {metric.change}
              </span>
            </div>
            <div className="mt-4 flex h-8 items-end gap-1" aria-hidden="true">
              {[35, 48, 42, 64, 58, 82, 76, 96].map((height, barIndex) => (
                <span
                  key={barIndex}
                  className="bg-primary/55 min-w-0 flex-1 rounded-sm"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </article>
        ))}
      </div>

      <section
        aria-labelledby="recent-activity-heading"
        className="border-border bg-background min-w-0 overflow-hidden rounded-lg border shadow-sm"
      >
        <div className="border-border flex items-center justify-between border-b px-4 py-3">
          <h2
            id="recent-activity-heading"
            className="text-foreground text-sm font-semibold"
          >
            Recent activity
          </h2>
          <span className="text-muted-foreground text-xs">Live</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="text-muted-foreground bg-muted/30 text-xs">
              <tr>
                <th className="px-4 py-2 font-medium" scope="col">
                  Event
                </th>
                <th className="px-4 py-2 font-medium" scope="col">
                  Status
                </th>
                <th className="px-4 py-2 font-medium" scope="col">
                  Time
                </th>
                <th className="px-4 py-2 font-medium" scope="col">
                  Owner
                </th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {activity.map(([event, status, time, owner]) => (
                <tr key={event}>
                  <th
                    className="text-foreground px-4 py-3 font-medium"
                    scope="row"
                  >
                    {event}
                  </th>
                  <td className="px-4 py-3">
                    <span className="bg-muted text-foreground rounded-full px-2 py-1 text-xs">
                      {status}
                    </span>
                  </td>
                  <td className="text-muted-foreground px-4 py-3">{time}</td>
                  <td className="text-muted-foreground px-4 py-3">{owner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function ShellExample(props: SidebarShellProps) {
  return (
    <SidebarShell {...props} className="h-[44rem] max-h-[100dvh]">
      <SidebarShellNavigation>
        <ShellNavigation />
      </SidebarShellNavigation>
      <SidebarShellHeader>
        <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-foreground truncate text-sm font-semibold">
              Command center
            </p>
            <p className="text-muted-foreground truncate text-xs">
              Production workspace
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              aria-label="Search workspace"
              className="hidden sm:inline-flex"
              leftIcon={<Search aria-hidden="true" />}
              size="sm"
              variant="outline"
            >
              Search
            </Button>
            <IconButton aria-label="Focus mode" size="sm" variant="outline">
              <Focus aria-hidden="true" />
            </IconButton>
            <IconButton aria-label="Notifications" size="sm" variant="outline">
              <Bell aria-hidden="true" />
            </IconButton>
          </div>
        </div>
      </SidebarShellHeader>
      <SidebarShellMain>
        <WorkspaceContent />
      </SidebarShellMain>
      <SidebarShellFooter>
        <span className="bg-success size-2 rounded-full" />
        Live operations data updated moments ago
      </SidebarShellFooter>
    </SidebarShell>
  );
}

export const BoundedWorkbench: Story = {
  render: (args) => <ShellExample {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const shell = canvasElement.querySelector('[data-slot="sidebar-shell"]');

    await userEvent.click(
      canvas.getByRole("button", { name: "Collapse sidebar" }),
    );
    await expect(shell).toHaveAttribute("data-collapsed", "true");
    await expect(
      canvas.getByRole("button", { name: "Expand sidebar" }),
    ).toHaveAttribute("aria-expanded", "false");
  },
};

export const ExpressiveCompact: Story = {
  args: {
    defaultCollapsed: true,
    motion: "expressive",
  },
  render: (args) => <ShellExample {...args} />,
};

export const PlainChrome: Story = {
  args: {
    chrome: "plain",
    motion: "subtle",
  },
  render: (args) => <ShellExample {...args} />,
};

export const RightSide: Story = {
  args: {
    motion: "expressive",
    side: "right",
  },
  render: (args) => <ShellExample {...args} />,
};

export const CompactDensityRtl: Story = {
  args: {
    motion: "standard",
    side: "right",
  },
  render: (args) => (
    <DethinkProvider density="compact" dir="rtl">
      <ShellExample {...args} />
    </DethinkProvider>
  ),
};
