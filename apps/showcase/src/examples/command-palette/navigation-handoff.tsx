"use client";

import {
  CommandPalette,
  CommandPaletteContent,
  CommandPaletteDialog,
  CommandPaletteTrigger,
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  type CommandPaletteCommand,
} from "@dethink/components";
import { Search } from "lucide-react";

const sections = [
  { current: true, href: "#overview", label: "Overview" },
  { current: false, href: "#projects", label: "Projects" },
  { current: false, href: "#reports", label: "Reports" },
  { current: false, href: "#team", label: "Team" },
];

const commands: CommandPaletteCommand[] = [
  {
    group: "Navigate",
    href: "#overview",
    key: "overview",
    label: "Open overview",
    type: "link",
  },
  {
    group: "Navigate",
    href: "#projects",
    key: "projects",
    label: "Open projects",
    type: "link",
  },
  {
    group: "Navigate",
    href: "#reports",
    key: "reports",
    label: "Open reports",
    type: "link",
  },
  {
    group: "Actions",
    key: "invite",
    label: "Invite teammate",
    shortcut: "G I",
  },
];

export function CommandPaletteNavigationHandoff() {
  return (
    <header className="border-border bg-muted/30 flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3">
      <span className="text-foreground text-sm font-semibold">Atlas Ops</span>
      <NavigationMenu aria-label="Workspace sections" variant="quiet" size="sm">
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
      <CommandPaletteDialog closeOnRun>
        <CommandPaletteTrigger variant="outline" size="sm">
          <Search aria-hidden="true" className="size-4" />
          Search
        </CommandPaletteTrigger>
        <CommandPaletteContent title="Workspace command menu">
          <CommandPalette
            label="Workspace command menu"
            commands={commands}
            placeholder="Search sections and actions..."
          />
        </CommandPaletteContent>
      </CommandPaletteDialog>
    </header>
  );
}
