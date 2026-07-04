"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuLink,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@dethink/components";
import { FileBarChart, FolderKanban, Inbox, PanelLeftOpen } from "lucide-react";

const collapsedItems = [
  { href: "/inbox", icon: Inbox, label: "Inbox" },
  { href: "/projects", icon: FolderKanban, label: "Projects" },
  { href: "/reports", icon: FileBarChart, label: "Reports" },
];

export function SidebarCollapsed() {
  return (
    <SidebarProvider defaultCollapsed motion="subtle">
      <div className="flex h-72 overflow-hidden rounded-lg border border-border bg-background">
        <Sidebar aria-label="Collapsed navigation" variant="bordered">
          <div className="px-2 py-2">
            <SidebarTrigger>
              <PanelLeftOpen aria-hidden="true" />
            </SidebarTrigger>
          </div>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Rail</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {collapsedItems.map((item, index) => {
                    const Icon = item.icon;

                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuLink
                          current={index === 0}
                          href={item.href}
                          icon={<Icon aria-hidden="true" />}
                        >
                          {item.label}
                        </SidebarMenuLink>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarRail />
        </Sidebar>
        <SidebarInset className="p-5 text-sm text-muted-foreground">
          Collapsed labels remain in the accessibility tree while visual space
          stays compact.
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
