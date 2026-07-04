"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupTrigger,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuItem,
  SidebarMenuLink,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@dethink/components";
import {
  Activity,
  Gauge,
  PanelLeftClose,
  Settings2,
  Sparkles,
} from "lucide-react";

export function SidebarRecipeAiWorkspace() {
  return (
    <SidebarProvider variant="floating" motion="expressive">
      <div className="flex h-[28rem] overflow-hidden rounded-lg border border-border bg-muted/30">
        <Sidebar aria-label="AI workspace navigation">
          <SidebarHeader>
            <div className="flex min-w-0 items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-foreground">
                  Assist Studio
                </div>
                <div className="truncate text-xs text-muted-foreground">
                  Model operations
                </div>
              </div>
              <SidebarTrigger>
                <PanelLeftClose aria-hidden="true" />
              </SidebarTrigger>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup collapsible defaultOpen>
              <SidebarGroupTrigger>Workflows</SidebarGroupTrigger>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuLink
                      current
                      badge="Live"
                      description="Streaming review queue"
                      href="#runs"
                      icon={<Sparkles aria-hidden="true" />}
                    >
                      Agent runs
                    </SidebarMenuLink>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuLink
                      href="#evaluations"
                      icon={<Activity aria-hidden="true" />}
                    >
                      Evaluations
                    </SidebarMenuLink>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuLink
                      disabled
                      href="#billing"
                      icon={<Gauge aria-hidden="true" />}
                    >
                      Cost controls
                    </SidebarMenuLink>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-sm text-muted-foreground">
                Team quota
              </span>
              <SidebarMenuAction aria-label="Open quota settings">
                <Settings2 aria-hidden="true" />
              </SidebarMenuAction>
            </div>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>
        <SidebarInset className="p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-md border border-border bg-background p-4">
              <div className="text-sm font-semibold text-foreground">
                38 active runs
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Navigation state stays visible while the workspace updates.
              </p>
            </div>
            <div className="rounded-md border border-border bg-background p-4">
              <div className="text-sm font-semibold text-foreground">
                92% eval pass rate
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Badges and descriptions fit dense AI-native surfaces.
              </p>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
