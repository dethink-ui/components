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
import { ShoppingCart } from "lucide-react";

const items = [
  {
    name: "Dashboard seat",
    detail: "Pro workspace access",
    quantity: "2",
    price: "$48",
  },
  {
    name: "Report export credit",
    detail: "Monthly compliance bundle",
    quantity: "1",
    price: "$19",
  },
];

export function DrawerBasic() {
  return (
    <div className="flex justify-center">
      <Drawer direction="right">
        <DrawerTrigger variant="outline">
          <ShoppingCart aria-hidden="true" className="size-4" />
          Review cart
        </DrawerTrigger>
        <DrawerContent
          dismissible
          showCloseButton
          closeButtonLabel="Close cart"
        >
          <DrawerHeader>
            <DrawerTitle>Your cart</DrawerTitle>
            <DrawerDescription>
              Review the workspace changes before checkout.
            </DrawerDescription>
          </DrawerHeader>
          <div className="text-foreground grid min-h-0 flex-1 content-start gap-[var(--dt-space-4)] overflow-y-auto overscroll-contain px-[var(--dt-space-6)] py-[var(--dt-space-4)] text-sm">
            <div className="grid gap-[var(--dt-space-3)]">
              {items.map((item) => (
                <div
                  className="border-border/70 bg-muted/30 grid gap-[var(--dt-space-2)] rounded-md border p-[var(--dt-space-3)]"
                  key={item.name}
                >
                  <div className="flex items-start justify-between gap-[var(--dt-space-3)]">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-muted-foreground">{item.detail}</p>
                    </div>
                    <p className="font-semibold">{item.price}</p>
                  </div>
                  <p className="text-muted-foreground text-xs tracking-[0.12em] uppercase">
                    Qty {item.quantity}
                  </p>
                </div>
              ))}
            </div>
            <dl className="border-border/70 grid gap-[var(--dt-space-2)] border-t pt-[var(--dt-space-4)]">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="font-medium">$67</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Tax estimate</dt>
                <dd className="font-medium">$5</dd>
              </div>
              <div className="flex justify-between text-base">
                <dt className="font-medium">Total</dt>
                <dd className="font-semibold">$72</dd>
              </div>
            </dl>
          </div>
          <DrawerFooter>
            <DrawerClose variant="outline">Cancel</DrawerClose>
            <DrawerClose variant="solid">Checkout</DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
