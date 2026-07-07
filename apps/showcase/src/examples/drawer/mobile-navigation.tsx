"use client";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@dethink/components";
import { Gauge, LayoutDashboard, Settings2, Users } from "lucide-react";

const navLinks = [
  { icon: LayoutDashboard, label: "Overview" },
  { icon: Gauge, label: "Observability" },
  { icon: Users, label: "Team" },
  { icon: Settings2, label: "Settings" },
];

export function DrawerMobileNavigation() {
  return (
    <div className="flex justify-center">
      <Drawer direction="left" edgeSwipeToOpen>
        <DrawerTrigger variant="outline">Open menu</DrawerTrigger>
        <DrawerContent
          dismissible
          closeButtonLabel="Close navigation menu"
          showCloseButton
          size="sm"
        >
          <DrawerHeader>
            <DrawerTitle>Acme Dashboards</DrawerTitle>
            <DrawerDescription>
              Swipe from the left edge, or use the trigger, to open.
            </DrawerDescription>
          </DrawerHeader>
          <nav aria-label="Primary" className="px-[var(--dt-space-3)] pb-[var(--dt-space-3)]">
            <ul className="grid gap-[var(--dt-space-1)]">
              {navLinks.map(({ icon: Icon, label }) => (
                <li key={label}>
                  <a
                    className="flex items-center gap-[var(--dt-space-3)] rounded-md px-[var(--dt-space-3)] py-[var(--dt-space-2)] text-sm font-medium text-foreground hover:bg-muted"
                    href="#"
                  >
                    <Icon aria-hidden="true" className="size-4 text-muted-foreground" />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
