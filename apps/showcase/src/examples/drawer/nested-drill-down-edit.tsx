"use client";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@dethink/components";

export function DrawerNestedDrillDownEdit() {
  return (
    <div className="flex justify-center">
      <Drawer direction="right">
        <DrawerTrigger>Open record</DrawerTrigger>
        <DrawerContent
          dismissible
          showCloseButton
          closeButtonLabel="Close record"
        >
          <DrawerHeader>
            <DrawerTitle>Record</DrawerTitle>
            <DrawerDescription>
              Opening the nested edit drawer recedes this one — the same spring
              primitives as drag-to-dismiss, not a separate animation path.
            </DrawerDescription>
          </DrawerHeader>
          <div className="text-foreground px-[var(--dt-space-6)] py-[var(--dt-space-3)] text-sm">
            Status: <span className="font-medium">In review</span>
          </div>
          <Drawer direction="right">
            <DrawerTrigger className="ms-[var(--dt-space-6)]" variant="outline">
              Edit status
            </DrawerTrigger>
            <DrawerContent
              dismissible
              showCloseButton
              closeButtonLabel="Close status editor"
            >
              <DrawerHeader>
                <DrawerTitle>Edit status</DrawerTitle>
                <DrawerDescription>
                  A drawer opened from inside another drawer.
                </DrawerDescription>
              </DrawerHeader>
              <DrawerFooter>
                <DrawerClose>Done</DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
