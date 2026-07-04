"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@dethink/components";
import { Menu } from "lucide-react";

const sections = [
  { href: "#dashboard", label: "Dashboard", current: true },
  { href: "#deployments", label: "Deployments", current: false },
  { href: "#monitoring", label: "Monitoring", current: false },
  { href: "#team", label: "Team", current: false },
];

export function NavigationMenuAppTopbar() {
  return (
    <header className="flex items-center justify-between gap-4 rounded-md border border-border bg-muted/30 px-4 py-2">
      <span className="text-sm font-semibold text-foreground">Acme Cloud</span>

      {/* Desktop: persistent quiet nav. */}
      <NavigationMenu
        aria-label="Dashboard"
        variant="quiet"
        size="sm"
        className="max-md:hidden"
      >
        <NavigationMenuList>
          {sections.map((section) => (
            <NavigationMenuItem key={section.href}>
              <NavigationMenuLink current={section.current} href={section.href}>
                {section.label}
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>

      {/* Mobile: the same links hand off to a Dialog. NavigationMenu stays a
          navigation primitive — the Dialog owns the overlay behavior. */}
      <div className="md:hidden">
        <Dialog>
          <DialogTrigger aria-label="Open navigation" size="icon" variant="outline">
            <Menu aria-hidden="true" className="size-4" />
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Navigate</DialogTitle>
            <div className="px-[var(--dt-space-6)] pb-[var(--dt-space-6)]">
              <NavigationMenu
                aria-label="Dashboard"
                orientation="vertical"
                variant="quiet"
              >
                <NavigationMenuList>
                  {sections.map((section) => (
                    <NavigationMenuItem key={section.href}>
                      <NavigationMenuLink
                        current={section.current}
                        href={section.href}
                      >
                        {section.label}
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <span className="text-sm text-muted-foreground max-md:hidden">
        workspace: prod
      </span>
    </header>
  );
}
