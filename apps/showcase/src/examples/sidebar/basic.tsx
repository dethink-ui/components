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
  SidebarTrigger,
} from "@dethink/components";
import { BarChart3, LayoutDashboard } from "lucide-react";

export function SidebarBasic() {
  return (
    <SidebarProvider motion="subtle">
      <div className="border-border bg-background flex h-80 overflow-hidden rounded-lg border">
        <Sidebar aria-label="Product navigation">
          <SidebarHeader>
            <div className="flex min-w-0 items-center justify-between gap-2">
              <div className="min-w-0 group-data-[collapsed=true]/sidebar:hidden">
                <div className="text-foreground truncate text-sm font-semibold">
                  Dethink Cloud
                </div>
                <div className="text-muted-foreground truncate text-xs">
                  Operations
                </div>
              </div>
              <SidebarTrigger />
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
        </Sidebar>
        <SidebarInset className="p-6">
          <div className="border-border bg-muted/30 text-muted-foreground rounded-md border p-4 text-sm">
            Main content keeps its own layout. Sidebar only owns navigation.
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
