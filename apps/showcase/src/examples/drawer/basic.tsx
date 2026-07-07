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

export function DrawerBasic() {
  return (
    <div className="flex justify-center">
      <Drawer direction="right">
        <DrawerTrigger>Open cart</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Your cart</DrawerTitle>
            <DrawerDescription>
              Review items before checkout.
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-[var(--dt-space-6)] py-[var(--dt-space-3)] text-sm text-foreground">
            Two dashboard seats and one report export credit.
          </div>
          <DrawerFooter>
            <DrawerClose variant="outline">Cancel</DrawerClose>
            <DrawerClose>Checkout</DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
