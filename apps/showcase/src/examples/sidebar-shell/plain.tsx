"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuLink,
  SidebarShell,
  SidebarShellHeader,
  SidebarTrigger,
  SidebarShellMain,
} from "@dethink/components";
import { BookOpen, FileText, Home } from "lucide-react";

export function SidebarShellPlain() {
  return (
    <SidebarShell
      aria-label="Plain shell demo"
      chrome="plain"
      motion="subtle"
      className="border-border h-[24rem] rounded-lg border"
    >
      <Sidebar aria-label="Docs navigation">
        <SidebarHeader>
          <div className="flex min-w-0 items-center gap-2 group-data-[collapsed=true]:justify-center">
            <BookOpen
              aria-hidden="true"
              className="text-primary size-4 shrink-0"
            />
            <span className="text-foreground truncate text-sm font-semibold group-data-[collapsed=true]:sr-only">
              Field Guide
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuLink href="#home" icon={<Home aria-hidden="true" />}>
                Getting started
              </SidebarMenuLink>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuLink
                current
                href="#writing"
                icon={<FileText aria-hidden="true" />}
              >
                Writing pages
              </SidebarMenuLink>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuLink
                href="#reference"
                icon={<BookOpen aria-hidden="true" />}
              >
                Reference
              </SidebarMenuLink>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarShellHeader>
        <SidebarTrigger />
        <div className="text-foreground truncate text-sm font-semibold">
          Writing pages
        </div>
      </SidebarShellHeader>
      <SidebarShellMain>
        <div className="max-w-prose space-y-3 text-sm leading-6">
          <p className="text-foreground">
            Plain chrome removes the workbench framing: no inset gap, no
            floating panels, just neutral edge-to-edge geometry.
          </p>
          <p className="text-muted-foreground">
            Use it for documentation sites, settings areas, or anywhere the
            shell should disappear behind the content. The footer region is
            optional — this example simply leaves it out.
          </p>
        </div>
      </SidebarShellMain>
    </SidebarShell>
  );
}
