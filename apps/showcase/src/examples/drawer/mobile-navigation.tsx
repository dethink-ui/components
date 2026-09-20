"use client";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@dethink/components";
import { useState } from "react";
import { Gauge, LayoutDashboard, Settings2, Users } from "lucide-react";

const navLinks = [
  { icon: LayoutDashboard, label: "Overview" },
  { icon: Gauge, label: "Observability" },
  { icon: Users, label: "Team" },
  { icon: Settings2, label: "Settings" },
];

export function DrawerMobileNavigation() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("Overview");
  return (
    <div className="flex flex-col items-center gap-3">
      <p aria-live="polite" className="text-muted-foreground text-sm">
        Current view: {selected}
      </p>
      <Drawer
        direction="left"
        edgeSwipeToOpen
        open={open}
        onOpenChange={setOpen}
      >
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
          <nav
            aria-label="Primary"
            className="px-[var(--dt-space-3)] pb-[var(--dt-space-3)]"
          >
            <ul className="grid gap-[var(--dt-space-1)]">
              {navLinks.map(({ icon: Icon, label }) => (
                <li key={label}>
                  <button
                    className="text-foreground hover:bg-muted flex items-center gap-[var(--dt-space-3)] rounded-md px-[var(--dt-space-3)] py-[var(--dt-space-2)] text-sm font-medium"
                    type="button"
                    aria-current={selected === label ? "page" : undefined}
                    onClick={() => {
                      setSelected(label);
                      setOpen(false);
                    }}
                  >
                    <Icon
                      aria-hidden="true"
                      className="text-muted-foreground size-4"
                    />
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
