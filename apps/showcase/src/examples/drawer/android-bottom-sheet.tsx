"use client";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
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
          dimension="min(36rem, 90dvh)"
          className="inset-x-[max(var(--dt-space-4),calc((100vw-450px)/2))] overflow-hidden"
        >
          <DrawerHandle aria-label="Drag to dismiss quick actions" />
          <DrawerHeader>
            <DrawerTitle>Quick actions</DrawerTitle>
            <DrawerDescription>Shortcuts for your workspace.</DrawerDescription>
          </DrawerHeader>
          <nav
            aria-label="Quick actions"
            className="grid min-h-0 flex-1 content-start gap-[var(--dt-space-3)] overflow-y-auto overscroll-contain px-[var(--dt-space-3)] py-[var(--dt-space-3)]"
          >
            <ul className="grid gap-[var(--dt-space-1)]">
              {quickLinks.map(({ description, href, icon: Icon, label }) => (
                <li key={label}>
                  <a
                    className="text-foreground hover:bg-muted focus-visible:ring-ring focus-visible:ring-offset-background flex items-center gap-[var(--dt-space-3)] rounded-md px-[var(--dt-space-3)] py-[var(--dt-space-2)] text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                    href={href}
                  >
                    <span className="border-border/70 bg-muted/60 text-foreground flex size-10 shrink-0 items-center justify-center rounded-md border">
                      <Icon aria-hidden="true" className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium">{label}</span>
                      <span className="text-muted-foreground block text-xs">
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
                  className="border-border bg-background text-foreground hover:bg-muted focus-visible:ring-ring focus-visible:ring-offset-background flex items-center justify-center gap-[var(--dt-space-2)] rounded-md border px-[var(--dt-space-3)] py-[var(--dt-space-2)] text-sm font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                  href={href}
                  key={label}
                >
                  <Icon
                    aria-hidden="true"
                    className="text-muted-foreground size-4"
                  />
                  {label}
                </a>
              ))}
            </div>
          </nav>
          <DrawerFooter>
            <DrawerClose className="w-full" variant="ghost">
              Cancel
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
