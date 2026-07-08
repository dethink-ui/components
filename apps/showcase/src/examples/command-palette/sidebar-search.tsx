"use client";

import {
  CommandPalette,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupTrigger,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuLink,
  SidebarProvider,
  SidebarRail,
  type CommandPaletteCommand,
} from "@dethink/components";
import { Activity, FolderKanban, Gauge, Settings2 } from "lucide-react";

const searchCommands: CommandPaletteCommand[] = [
  {
    description: "Production metrics and SLOs",
    group: "Resources",
    icon: <Gauge aria-hidden="true" className="size-4" />,
    key: "observability",
    label: "Observability overview",
    keywords: ["metrics", "slo"],
  },
  {
    description: "Active work by team and milestone",
    group: "Resources",
    icon: <FolderKanban aria-hidden="true" className="size-4" />,
    key: "projects",
    label: "Project index",
  },
  {
    description: "Audit events for this workspace",
    group: "Resources",
    icon: <Activity aria-hidden="true" className="size-4" />,
    key: "audit-log",
    label: "Audit log",
  },
  {
    group: "Actions",
    icon: <Settings2 aria-hidden="true" className="size-4" />,
    key: "preferences",
    label: "Open preferences",
    shortcut: "G P",
  },
];

export function CommandPaletteSidebarSearch() {
  return (
    <SidebarProvider variant="floating" motion="subtle">
      <div className="border-border bg-muted/30 flex h-[30rem] overflow-hidden rounded-lg border">
        <Sidebar aria-label="Operations workspace">
          <SidebarHeader>
            <CommandPalette
              controlSize="sm"
              label="Search workspace"
              commands={searchCommands}
              limit={4}
              placeholder="Search..."
            />
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup collapsible defaultOpen>
              <SidebarGroupTrigger>Operations</SidebarGroupTrigger>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuLink
                      current
                      href="#overview"
                      icon={<Gauge aria-hidden="true" />}
                    >
                      Overview
                    </SidebarMenuLink>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuLink
                      href="#projects"
                      icon={<FolderKanban aria-hidden="true" />}
                    >
                      Projects
                    </SidebarMenuLink>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuLink
                      href="#audit"
                      icon={<Activity aria-hidden="true" />}
                    >
                      Audit log
                    </SidebarMenuLink>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarRail />
        </Sidebar>
        <SidebarInset className="grid content-start gap-3 p-5">
          <div className="text-foreground text-sm font-semibold">
            Search remains scoped to the workspace.
          </div>
          <p className="text-muted-foreground max-w-md text-sm leading-6">
            Inline command search can live beside persistent navigation without
            becoming a form control.
          </p>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
