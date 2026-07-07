"use client";

import { useState } from "react";
import {
  Button,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  type DrawerDirection,
} from "@dethink/components";

const directions = [
  { value: "right", label: "Right", axis: "width" },
  { value: "left", label: "Left", axis: "width" },
  { value: "bottom", label: "Bottom", axis: "height" },
  { value: "top", label: "Top", axis: "height" },
] satisfies Array<{ value: DrawerDirection; label: string; axis: string }>;

const sizeModes = [
  {
    value: "preset",
    label: "Preset lg",
    summary: "Uses size=\"lg\" on the active edge.",
  },
  {
    value: "custom",
    label: "Custom",
    summary: "Uses 28rem for side drawers or 68dvh for top and bottom drawers.",
  },
  {
    value: "full",
    label: "Full",
    summary: "Fills the viewport on the drawer axis.",
  },
] as const;

type SizeMode = (typeof sizeModes)[number]["value"];

function isVertical(direction: DrawerDirection) {
  return direction === "top" || direction === "bottom";
}

export function DrawerDirectionalSizing() {
  const [direction, setDirection] = useState<DrawerDirection>("right");
  const [sizeMode, setSizeMode] = useState<SizeMode>("preset");
  const customDimension = isVertical(direction) ? "68dvh" : "28rem";
  const activeDirection = directions.find((item) => item.value === direction)!;
  const activeMode = sizeModes.find((item) => item.value === sizeMode)!;

  return (
    <div className="mx-auto grid w-full max-w-2xl gap-[var(--dt-space-5)] rounded-lg border border-border bg-background p-[var(--dt-space-4)]">
      <div className="grid gap-[var(--dt-space-3)] sm:grid-cols-[1fr_auto] sm:items-start">
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">
            Invoice review drawer
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            Pick an edge and size mode, then open the same drawer content.
          </p>
        </div>
        <Drawer
          dimension={sizeMode === "custom" ? customDimension : undefined}
          direction={direction}
          fullSize={sizeMode === "full"}
          size="lg"
        >
          <DrawerTrigger>Preview drawer</DrawerTrigger>
          <DrawerContent
            dismissible
            showCloseButton
            closeButtonLabel="Close invoice drawer"
          >
            <DrawerHeader>
              <DrawerTitle>Invoice INV-2048</DrawerTitle>
              <DrawerDescription>
                {activeDirection.label} drawer using{" "}
                {activeMode.label.toLowerCase()}.
              </DrawerDescription>
            </DrawerHeader>
            <div className="grid gap-[var(--dt-space-4)] px-[var(--dt-space-6)] py-[var(--dt-space-4)] text-sm">
              <dl className="grid gap-[var(--dt-space-2)]">
                <div className="flex justify-between gap-[var(--dt-space-4)]">
                  <dt className="text-muted-foreground">Axis</dt>
                  <dd className="font-medium text-foreground">
                    {activeDirection.axis}
                  </dd>
                </div>
                <div className="flex justify-between gap-[var(--dt-space-4)]">
                  <dt className="text-muted-foreground">Mode</dt>
                  <dd className="font-medium text-foreground">
                    {activeMode.label}
                  </dd>
                </div>
                <div className="flex justify-between gap-[var(--dt-space-4)]">
                  <dt className="text-muted-foreground">Custom dimension</dt>
                  <dd className="font-medium text-foreground">
                    {customDimension}
                  </dd>
                </div>
              </dl>
              <div className="rounded-md border border-border/70 bg-muted/30 p-[var(--dt-space-3)]">
                <p className="font-medium text-foreground">Acme procurement</p>
                <p className="mt-1 text-muted-foreground">
                  Subscription renewal, usage overage, and support add-on.
                </p>
              </div>
            </div>
            <DrawerFooter>
              <DrawerClose variant="outline">Close</DrawerClose>
              <DrawerClose>Approve invoice</DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>

      <div className="grid gap-[var(--dt-space-3)] sm:grid-cols-2">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Edge
          </p>
          <div
            aria-label="Drawer edge"
            className="flex flex-wrap gap-[var(--dt-space-1)] rounded-md border border-border bg-muted/30 p-[var(--dt-space-1)]"
            role="group"
          >
            {directions.map((item) => (
              <Button
                aria-pressed={direction === item.value}
                key={item.value}
                onClick={() => setDirection(item.value)}
                size="sm"
                type="button"
                variant={direction === item.value ? "solid" : "ghost"}
              >
                {item.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Size
          </p>
          <div
            aria-label="Drawer size mode"
            className="flex flex-wrap gap-[var(--dt-space-1)] rounded-md border border-border bg-muted/30 p-[var(--dt-space-1)]"
            role="group"
          >
            {sizeModes.map((item) => (
              <Button
                aria-pressed={sizeMode === item.value}
                key={item.value}
                onClick={() => setSizeMode(item.value)}
                size="sm"
                type="button"
                variant={sizeMode === item.value ? "solid" : "ghost"}
              >
                {item.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <p className="text-sm leading-6 text-muted-foreground">
        {activeMode.summary}
      </p>
    </div>
  );
}
