"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuLink,
  SidebarProvider,
  SidebarTrigger,
} from "@dethink/components";
import { FileBarChart, FolderKanban, Inbox } from "lucide-react";

const collapsedItems = [
  { href: "/inbox", icon: Inbox, label: "Inbox" },
  { href: "/projects", icon: FolderKanban, label: "Projects" },
  { href: "/reports", icon: FileBarChart, label: "Reports" },
];

export function SidebarCollapsed() {
  return (
    <SidebarProvider defaultCollapsed motion="subtle">
      <div className="border-border bg-background flex h-72 overflow-hidden rounded-lg border">
        <Sidebar aria-label="Collapsed navigation" variant="bordered">
          <SidebarHeader>
            <SidebarTrigger />
          </SidebarHeader>
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
        </Sidebar>
        <SidebarInset className="text-muted-foreground p-5 text-sm">
          Collapsed labels remain in the accessibility tree while visual space
          stays compact.
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
