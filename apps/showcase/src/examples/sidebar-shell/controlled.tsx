"use client";

import { useState } from "react";
import {
  Badge,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuLink,
  SidebarShell,
  SidebarShellFooter,
  SidebarShellHeader,
  SidebarShellMain,
  SidebarTrigger,
} from "@dethink/components";
import { Inbox, ListChecks, Timer } from "lucide-react";

export function SidebarShellControlled() {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <SidebarShell
      motion="subtle"
      aria-label="Controlled shell demo"
      collapsed={collapsed}
      onCollapsedChange={setCollapsed}
      className="border-border h-[24rem] rounded-xl border"
    >
      <Sidebar aria-label="Queue navigation">
        <SidebarHeader>
          <div className="flex min-w-0 items-center gap-2">
            <span
              aria-hidden="true"
              className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-md text-sm font-semibold"
            >
              T
            </span>
            <span className="text-foreground truncate text-sm font-semibold group-data-[collapsed=true]:sr-only">
              Triage
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuLink
                current
                badge="14"
                href="#inbox"
                icon={<Inbox aria-hidden="true" />}
              >
                Inbox
              </SidebarMenuLink>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuLink
                href="#assigned"
                icon={<ListChecks aria-hidden="true" />}
              >
                Assigned
              </SidebarMenuLink>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuLink
                href="#snoozed"
                icon={<Timer aria-hidden="true" />}
              >
                Snoozed
              </SidebarMenuLink>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarShellHeader>
        <SidebarTrigger />
        <div className="text-foreground truncate text-sm font-semibold">
          Inbox
        </div>
        <Badge className="ml-auto" size="xs" tone="primary" variant="soft">
          {collapsed ? "Rail" : "Expanded"}
        </Badge>
      </SidebarShellHeader>
      <SidebarShellMain>
        <div className="border-border bg-muted/30 text-muted-foreground rounded-lg border p-4 text-sm leading-6">
          The shell starts on the compact icon rail. Collapse state lives in
          your component, so you can persist it, sync it with a server
          preference, or drive it from anywhere — the trigger, the edge rail,
          and every region stay in agreement.
        </div>
      </SidebarShellMain>
      <SidebarShellFooter>
        <span className="truncate">
          Navigation is {collapsed ? "collapsed to the icon rail" : "expanded"}.
        </span>
      </SidebarShellFooter>
    </SidebarShell>
  );
}
