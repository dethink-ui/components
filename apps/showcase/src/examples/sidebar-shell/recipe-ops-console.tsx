"use client";

import {
  Badge,
  Button,
  IconButton,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupTrigger,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuItem,
  SidebarMenuLink,
  SidebarRail,
  SidebarShell,
  SidebarShellFooter,
  SidebarShellHeader,
  SidebarShellMain,
} from "@dethink/components";
import {
  Activity,
  Bell,
  Bot,
  Gauge,
  Radar,
  Settings2,
  Sparkles,
  Workflow,
} from "lucide-react";

const fleetStats = [
  { label: "Active agents", value: "38", delta: "+4 this hour" },
  { label: "Eval pass rate", value: "92%", delta: "+1.5 pts" },
  { label: "P95 latency", value: "840ms", delta: "-60ms" },
];

const fleetEvents = [
  {
    id: "run-4821",
    title: "Escalation triaged by support-agent",
    time: "2m ago",
    tone: "bg-success",
  },
  {
    id: "run-4820",
    title: "Retry budget reached on billing-sync",
    time: "11m ago",
    tone: "bg-warning",
  },
  {
    id: "run-4819",
    title: "New eval suite promoted to production",
    time: "26m ago",
    tone: "bg-info",
  },
];

export function SidebarShellRecipeOpsConsole() {
  return (
    <SidebarShell
      aria-label="AI operations console"
      motion="expressive"
      className="border-border h-[34rem] rounded-xl border"
    >
      <Sidebar aria-label="Console navigation">
        <SidebarHeader>
          <div className="flex min-w-0 items-center gap-2">
            <span
              aria-hidden="true"
              className="from-primary to-primary/70 text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-md bg-gradient-to-br"
            >
              <Sparkles className="size-4" />
            </span>
            <div className="min-w-0 group-data-[collapsed=true]:sr-only">
              <div className="text-foreground truncate text-sm font-semibold">
                Assist Studio
              </div>
              <div className="text-muted-foreground truncate text-xs">
                Fleet operations
              </div>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup collapsible defaultOpen>
            <SidebarGroupTrigger>Monitors</SidebarGroupTrigger>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuLink
                    current
                    badge="Live"
                    description="Streaming run telemetry"
                    href="#fleet"
                    icon={<Radar aria-hidden="true" />}
                  >
                    Fleet overview
                  </SidebarMenuLink>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuLink
                    href="#agents"
                    icon={<Bot aria-hidden="true" />}
                  >
                    Agents
                  </SidebarMenuLink>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuLink
                    badge="3"
                    href="#evaluations"
                    icon={<Activity aria-hidden="true" />}
                  >
                    Evaluations
                  </SidebarMenuLink>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup collapsible defaultOpen={false}>
            <SidebarGroupTrigger>Automation</SidebarGroupTrigger>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuLink
                    href="#workflows"
                    icon={<Workflow aria-hidden="true" />}
                  >
                    Workflows
                  </SidebarMenuLink>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuLink
                    disabled
                    href="#budgets"
                    icon={<Gauge aria-hidden="true" />}
                  >
                    Cost budgets
                  </SidebarMenuLink>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
            <span className="text-muted-foreground truncate text-sm group-data-[collapsed=true]:sr-only">
              Team quota · 64%
            </span>
            <SidebarMenuAction aria-label="Open quota settings">
              <Settings2 aria-hidden="true" />
            </SidebarMenuAction>
          </div>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarShellHeader>
        <div className="flex min-w-0 items-center gap-2">
          <span className="text-foreground truncate text-sm font-semibold">
            Fleet overview
          </span>
          <Badge size="xs" tone="success" variant="soft">
            Production
          </Badge>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <IconButton aria-label="Notifications" size="sm" variant="ghost">
            <Bell aria-hidden="true" />
          </IconButton>
          <Button
            size="sm"
            variant="soft"
            leftIcon={<Sparkles aria-hidden="true" />}
          >
            Launch agent
          </Button>
        </div>
      </SidebarShellHeader>
      <SidebarShellMain>
        <div className="grid gap-4 lg:grid-cols-3">
          {fleetStats.map((stat) => (
            <div
              key={stat.label}
              className="border-border bg-background rounded-lg border p-4"
            >
              <div className="text-muted-foreground text-xs">{stat.label}</div>
              <div className="text-foreground mt-1 text-2xl font-semibold">
                {stat.value}
              </div>
              <div className="text-muted-foreground mt-1 text-xs">
                {stat.delta}
              </div>
            </div>
          ))}
        </div>
        <div className="border-border bg-background mt-4 rounded-lg border">
          <div className="border-border flex items-center justify-between border-b px-4 py-3">
            <span className="text-foreground text-sm font-semibold">
              Recent activity
            </span>
            <Badge size="xs" tone="info" variant="outline">
              Auto-refresh
            </Badge>
          </div>
          <ul className="divide-border divide-y">
            {fleetEvents.map((event) => (
              <li
                key={event.id}
                className="flex items-center gap-3 px-4 py-3 text-sm"
              >
                <span
                  aria-hidden="true"
                  className={`size-2 shrink-0 rounded-full ${event.tone}`}
                />
                <span className="text-foreground min-w-0 flex-1 truncate">
                  {event.title}
                </span>
                <span className="text-muted-foreground shrink-0 text-xs">
                  {event.time}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </SidebarShellMain>
      <SidebarShellFooter>
        <span
          aria-hidden="true"
          className="bg-success size-2 shrink-0 rounded-full"
        />
        <span className="truncate">All systems operational</span>
        <span className="text-muted-foreground/70 ml-auto shrink-0 text-xs">
          us-east · 840ms p95
        </span>
      </SidebarShellFooter>
    </SidebarShell>
  );
}
