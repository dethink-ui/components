"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuLink,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@dethink/components";
import { BarChart3, LayoutDashboard, PanelLeftClose } from "lucide-react";

export function SidebarBasic() {
  return (
    <SidebarProvider>
      <div className="flex h-80 overflow-hidden rounded-lg border border-border bg-background">
        <Sidebar aria-label="Product navigation">
          <SidebarHeader>
            <div className="flex min-w-0 items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-foreground">
                  Dethink Cloud
                </div>
                <div className="truncate text-xs text-muted-foreground">
                  Operations
                </div>
              </div>
              <SidebarTrigger>
                <PanelLeftClose aria-hidden="true" />
              </SidebarTrigger>
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
                      href="/overview"
                      icon={<LayoutDashboard aria-hidden="true" />}
                    >
                      Overview
                    </SidebarMenuLink>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuLink
                      badge="12"
                      href="/analytics"
                      icon={<BarChart3 aria-hidden="true" />}
                      shortcut="G A"
                    >
                      Analytics
                    </SidebarMenuLink>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarRail />
        </Sidebar>
        <SidebarInset className="p-6">
          <div className="rounded-md border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
            Main content keeps its own layout. Sidebar only owns navigation.
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
