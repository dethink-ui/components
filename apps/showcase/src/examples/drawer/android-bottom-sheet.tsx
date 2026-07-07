"use client";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHandle,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@dethink/components";
import {
  Bell,
  CalendarDays,
  Download,
  LifeBuoy,
  Settings2,
  Share2,
} from "lucide-react";

const quickLinks = [
  {
    description: "Send a secure workspace link",
    href: "#",
    icon: Share2,
    label: "Share report",
  },
  {
    description: "Review meetings and reminders",
    href: "#",
    icon: CalendarDays,
    label: "Open schedule",
  },
  {
    description: "Pull a CSV for this view",
    href: "#",
    icon: Download,
    label: "Export data",
  },
  {
    description: "Tune rules and thresholds",
    href: "#",
    icon: Bell,
    label: "Notification rules",
  },
];

const utilityLinks = [
  { href: "#", icon: Settings2, label: "Settings" },
  { href: "#", icon: LifeBuoy, label: "Support" },
];

export function DrawerAndroidBottomSheet() {
  return (
    <div className="flex justify-center">
      <Drawer direction="bottom" motionPreset="expressive">
        <DrawerTrigger variant="outline">Open compact sheet</DrawerTrigger>
        <DrawerContent
          dismissible
          showCloseButton
          closeButtonLabel="Close quick actions"
          dimension={450}
          className="inset-x-[max(var(--dt-space-4),calc((100vw-450px)/2))] overflow-hidden"
        >
          <DrawerHandle aria-label="Drag to dismiss quick actions" />
          <DrawerHeader>
            <DrawerTitle>Quick actions</DrawerTitle>
            <DrawerDescription>
              A compact 450px Android-style sheet for high-frequency links.
            </DrawerDescription>
          </DrawerHeader>
          <nav
            aria-label="Quick actions"
            className="grid gap-[var(--dt-space-3)] px-[var(--dt-space-3)] py-[var(--dt-space-3)]"
          >
            <ul className="grid gap-[var(--dt-space-1)]">
              {quickLinks.map(({ description, href, icon: Icon, label }) => (
                <li key={label}>
                  <a
                    className="flex items-center gap-[var(--dt-space-3)] rounded-md px-[var(--dt-space-3)] py-[var(--dt-space-2)] text-sm text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    href={href}
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-md border border-border/70 bg-muted/60 text-foreground">
                      <Icon aria-hidden="true" className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium">{label}</span>
                      <span className="block text-xs text-muted-foreground">
                        {description}
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            <div className="grid grid-cols-2 gap-[var(--dt-space-2)]">
              {utilityLinks.map(({ href, icon: Icon, label }) => (
                <a
                  className="flex items-center justify-center gap-[var(--dt-space-2)] rounded-md border border-border bg-background px-[var(--dt-space-3)] py-[var(--dt-space-2)] text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  href={href}
                  key={label}
                >
                  <Icon aria-hidden="true" className="size-4 text-muted-foreground" />
                  {label}
                </a>
              ))}
            </div>
          </nav>
          <div className="border-t border-border/60 p-[var(--dt-space-3)]">
            <DrawerClose className="w-full" variant="ghost">
              Cancel
            </DrawerClose>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
