"use client";

import {
  Badge,
  Button,
  IconButton,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuLink,
  SidebarRail,
  SidebarShell,
  SidebarShellFooter,
  SidebarShellHeader,
  SidebarShellMain,
} from "@dethink/components";
import {
  Bell,
  FolderKanban,
  LayoutDashboard,
  LifeBuoy,
  Plus,
  Users,
} from "lucide-react";

export function SidebarShellBasic() {
  return (
    <SidebarShell
      aria-label="Workbench shell demo"
      className="border-border h-[30rem] rounded-xl border"
    >
      <Sidebar aria-label="Product navigation">
        <SidebarHeader>
          <div className="flex min-w-0 items-center gap-2">
            <span
              aria-hidden="true"
              className="bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-md text-sm font-semibold"
            >
              D
            </span>
            <div className="min-w-0 group-data-[collapsed=true]:sr-only">
              <div className="text-foreground truncate text-sm font-semibold">
                Dethink Cloud
              </div>
              <div className="text-muted-foreground truncate text-xs">
                Operations
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
                    badge="8"
                    href="#projects"
                    icon={<FolderKanban aria-hidden="true" />}
                  >
                    Projects
                  </SidebarMenuLink>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuLink
                    href="#customers"
                    icon={<Users aria-hidden="true" />}
                  >
                    Customers
                  </SidebarMenuLink>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Support</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuLink
                    href="#help"
                    icon={<LifeBuoy aria-hidden="true" />}
                  >
                    Help center
                  </SidebarMenuLink>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
      <SidebarShellHeader>
        <div className="min-w-0">
          <div className="text-foreground truncate text-sm font-semibold">
            Overview
          </div>
          <div className="text-muted-foreground truncate text-xs">
            Everything shipping this week
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <IconButton aria-label="Notifications" size="sm" variant="ghost">
            <Bell aria-hidden="true" />
          </IconButton>
          <Button size="sm" leftIcon={<Plus aria-hidden="true" />}>
            New project
          </Button>
        </div>
      </SidebarShellHeader>
      <SidebarShellMain>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Active projects", value: "24" },
            { label: "Open reviews", value: "7" },
            { label: "Deploys today", value: "132" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="border-border bg-background rounded-lg border p-4"
            >
              <div className="text-muted-foreground text-xs">{stat.label}</div>
              <div className="text-foreground mt-1 text-2xl font-semibold">
                {stat.value}
              </div>
            </div>
          ))}
        </div>
        <div className="border-border bg-muted/30 text-muted-foreground mt-4 rounded-lg border p-4 text-sm">
          The main region is the only scroll container. Header and footer stay
          pinned while this canvas scrolls.
        </div>
      </SidebarShellMain>
      <SidebarShellFooter>
        <span className="truncate">All systems operational</span>
        <Badge className="ml-auto" size="xs" tone="neutral" variant="soft">
          v2.4.0
        </Badge>
      </SidebarShellFooter>
    </SidebarShell>
  );
}
