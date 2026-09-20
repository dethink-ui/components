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
  SidebarTrigger,
} from "@dethink/components";
import { Activity, Gauge, Settings2, Sparkles } from "lucide-react";

export function SidebarRecipeAiWorkspace() {
  return (
    <SidebarProvider variant="floating" motion="subtle">
      <div className="border-border bg-muted/30 flex h-[28rem] overflow-hidden rounded-lg border">
        <Sidebar aria-label="AI workspace navigation">
          <SidebarHeader>
            <div className="flex min-w-0 items-center justify-between gap-2">
              <div className="min-w-0 group-data-[collapsed=true]/sidebar:hidden">
                <div className="text-foreground truncate text-sm font-semibold">
                  Assist Studio
                </div>
                <div className="text-muted-foreground truncate text-xs">
                  Model operations
                </div>
              </div>
              <SidebarTrigger />
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
              <span className="text-muted-foreground truncate text-sm">
                Team quota
              </span>
              <SidebarMenuAction aria-label="Open quota settings">
                <Settings2 aria-hidden="true" />
              </SidebarMenuAction>
            </div>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="border-border bg-background rounded-md border p-4">
              <div className="text-foreground text-sm font-semibold">
                38 active runs
              </div>
              <p className="text-muted-foreground mt-2 text-sm">
                Navigation state stays visible while the workspace updates.
              </p>
            </div>
            <div className="border-border bg-background rounded-md border p-4">
              <div className="text-foreground text-sm font-semibold">
                92% eval pass rate
              </div>
              <p className="text-muted-foreground mt-2 text-sm">
                Badges and descriptions fit dense AI-native surfaces.
              </p>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
