"use client";

import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuLink,
  SidebarMobileTrigger,
  SidebarProvider,
} from "@dethink/components";
import { Activity, Home, Menu, Settings, X } from "lucide-react";
import { useState } from "react";

const mobileLinks = [
  { href: "#overview", icon: Home, label: "Overview" },
  { href: "#incidents", icon: Activity, label: "Incidents" },
  { href: "#settings", icon: Settings, label: "Settings" },
];

export function SidebarMobileDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <SidebarProvider mobileOpen={open} onMobileOpenChange={setOpen}>
      <div className="overflow-hidden rounded-lg border border-border bg-background">
        <div className="flex items-center justify-between gap-4 p-6">
          <div className="flex min-w-0 items-center gap-3">
            <span
              aria-hidden="true"
              className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-muted-foreground"
            >
              <Home className="size-4" />
            </span>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-foreground">
                Mobile workspace
              </div>
              <div className="text-xs text-muted-foreground">
                Open the menu and choose a workspace link.
              </div>
            </div>
          </div>
          <SidebarMobileTrigger
            aria-controls="sidebar-mobile-menu-preview"
            className="size-9"
            closeLabel="Close menu"
            openLabel="Open menu"
          >
            {open ? (
              <X aria-hidden="true" className="size-4" />
            ) : (
              <Menu aria-hidden="true" className="size-4" />
            )}
          </SidebarMobileTrigger>
        </div>

        <div
          hidden={!open}
          id="sidebar-mobile-menu-preview"
          data-state={open ? "open" : "closed"}
          className="border-t border-border bg-muted/30 p-3 data-[state=open]:motion-safe:animate-sidebar-menu-open data-[state=open]:motion-reduce:animate-none"
        >
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Workspace</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {mobileLinks.map((item, index) => {
                    const Icon = item.icon;

                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuLink
                          current={index === 0}
                          href={item.href}
                          icon={<Icon aria-hidden="true" />}
                          onClick={() => setOpen(false)}
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
        </div>
      </div>
    </SidebarProvider>
  );
}
