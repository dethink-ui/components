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
  drawerBackgroundWrapperClassNames,
} from "@dethink/components";
import { Clock, MapPin, Users } from "lucide-react";

export function DrawerSchedulerEventDetail() {
  return (
    <div
      className={drawerBackgroundWrapperClassNames({
        className: "flex justify-center rounded-lg border border-border bg-background p-6",
      })}
      data-drawer-background-wrapper=""
    >
      <Drawer backgroundScale direction="right">
        <DrawerTrigger>Open event</DrawerTrigger>
        <DrawerContent dismissible>
          <DrawerHandle aria-label="Drag to dismiss" />
          <DrawerHeader>
            <DrawerTitle>Quarterly planning review</DrawerTitle>
            <DrawerDescription>
              Selected from the scheduler grid. Drag the handle down, or use
              Escape/outside click, to dismiss.
            </DrawerDescription>
          </DrawerHeader>
          <div className="grid gap-[var(--dt-space-3)] px-[var(--dt-space-6)] py-[var(--dt-space-2)] text-sm text-foreground">
            <div className="flex items-center gap-[var(--dt-space-2)]">
              <Clock aria-hidden="true" className="size-4 text-muted-foreground" />
              Tue, Mar 10 · 10:00–11:00 AM
            </div>
            <div className="flex items-center gap-[var(--dt-space-2)]">
              <MapPin aria-hidden="true" className="size-4 text-muted-foreground" />
              Conference room B / video link
            </div>
            <div className="flex items-center gap-[var(--dt-space-2)]">
              <Users aria-hidden="true" className="size-4 text-muted-foreground" />
              6 attendees
            </div>
          </div>
          <DrawerFooter>
            <DrawerClose variant="outline">Close</DrawerClose>
            <DrawerClose>Join call</DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
