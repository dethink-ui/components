"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@dethink/components";

export function NavigationMenuDashboard() {
  return (
    <div className="space-y-4">
      <header className="border-border bg-muted/30 flex items-center justify-between gap-4 rounded-md border px-4 py-2">
        <span className="text-foreground text-sm font-semibold">Insights</span>
        <NavigationMenu aria-label="Workspace areas" size="sm" variant="quiet">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink href="#home">Home</NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink current href="#reports">
                Reports
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="#alerts">Alerts</NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </header>

      <div className="grid gap-4 md:grid-cols-[12rem_minmax(0,1fr)]">
        <NavigationMenu
          aria-label="Report sections"
          orientation="vertical"
          size="sm"
          variant="quiet"
        >
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink current="location" href="#revenue">
                Revenue
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="#retention">
                Retention
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="#usage">Usage</NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <Card>
          <CardHeader>
            <CardTitle>Revenue report</CardTitle>
            <CardDescription>Updated from pipeline run #428.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Two NavigationMenu instances compose the shell: a quiet topbar for
              workspace areas and a vertical section list for the active report.
              A full application shell with a collapsible sidebar stays out of
              scope for NavigationMenu — that is the future Sidebar component.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
