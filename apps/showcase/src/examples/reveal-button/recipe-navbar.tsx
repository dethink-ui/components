"use client";

import { RevealButton } from "@dethink/components";
import {
  Bell,
  Command,
  LayoutDashboard,
  Plus,
  Search,
  Settings,
  ShieldCheck,
} from "lucide-react";

const navigationItems = [
  { href: "#overview", label: "Overview", current: true },
  { href: "#pipelines", label: "Pipelines", current: false },
  { href: "#incidents", label: "Incidents", current: false },
  { href: "#reports", label: "Reports", current: false },
];

export function RevealButtonRecipeNavbar() {
  return (
    <header className="border-border bg-background mx-auto w-full max-w-5xl rounded-md border shadow-sm">
      <div className="flex min-h-16 items-center gap-4 px-4 sm:px-5">
        <a
          href="#overview"
          aria-labelledby="reveal-navbar-brand-title reveal-navbar-brand-subtitle"
          className="focus-visible:ring-ring focus-visible:ring-offset-background flex min-w-0 shrink-0 items-center gap-3 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          <span
            aria-hidden="true"
            className="bg-primary text-primary-foreground grid size-10 shrink-0 place-items-center rounded-md shadow-sm"
          >
            <ShieldCheck className="size-5" />
          </span>
          <span className="min-w-0 max-sm:hidden">
            <span
              id="reveal-navbar-brand-title"
              className="font-heading text-foreground block truncate text-sm font-semibold"
            >
              Northstar Ops
            </span>
            <span
              id="reveal-navbar-brand-subtitle"
              className="text-muted-foreground block truncate text-xs"
            >
              Production control
            </span>
          </span>
        </a>

        <nav aria-label="Workspace" className="hidden min-w-0 flex-1 md:block">
          <ul className="flex items-center justify-center gap-1">
            {navigationItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  aria-current={item.current ? "page" : undefined}
                  className="text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring focus-visible:ring-offset-background aria-[current=page]:bg-muted aria-[current=page]:text-foreground inline-flex h-9 items-center rounded-md px-3 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div
          aria-label="Workspace actions"
          className="ml-auto flex shrink-0 items-center gap-1"
          role="toolbar"
        >
          <RevealButton icon={<Search />} label="Search" variant="ghost" />
          <RevealButton
            icon={<Command />}
            label="Command menu"
            variant="outline"
          />
          <RevealButton icon={<Bell />} label="Notifications" variant="soft" />
          <RevealButton
            className="max-sm:hidden"
            icon={<Settings />}
            label="Settings"
            variant="ghost"
          />
          <RevealButton
            className="max-sm:hidden"
            icon={<LayoutDashboard />}
            label="Dashboards"
            variant="ghost"
          />
          <RevealButton icon={<Plus />} label="New run" variant="solid" />
        </div>
      </div>
    </header>
  );
}
