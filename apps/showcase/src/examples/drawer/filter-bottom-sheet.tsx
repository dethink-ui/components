"use client";

import { useState } from "react";
import {
  Checkbox,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHandle,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  Field,
  FieldControl,
  FieldLabel,
} from "@dethink/components";

const statuses = ["Open", "In review", "Blocked", "Done"];

export function DrawerFilterBottomSheet() {
  const [activeSnapPoint, setActiveSnapPoint] = useState(0.5);

  return (
    <div className="flex justify-center">
      <Drawer
        activeSnapPoint={activeSnapPoint}
        direction="bottom"
        onActiveSnapPointChange={setActiveSnapPoint}
        snapPoints={[0.35, 0.65, 1]}
      >
        <DrawerTrigger>Filter issues</DrawerTrigger>
        <DrawerContent>
          <DrawerHandle aria-label="Drag to resize filters" />
          <DrawerHeader>
            <DrawerTitle>Filters</DrawerTitle>
            <DrawerDescription>
              Drag the handle between 35%, 65%, and fully open, or flick down
              fast to dismiss.
            </DrawerDescription>
          </DrawerHeader>
          <div className="grid gap-[var(--dt-space-3)] px-[var(--dt-space-6)] py-[var(--dt-space-2)]">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Status
            </p>
            {statuses.map((status) => (
              <Field id={`status-${status}`} key={status} orientation="horizontal">
                <FieldControl asChild>
                  <Checkbox defaultChecked={status === "Open"} name="status" value={status} />
                </FieldControl>
                <FieldLabel>{status}</FieldLabel>
              </Field>
            ))}
          </div>
          <DrawerFooter>
            <span className="text-sm text-muted-foreground">
              Snap point: {activeSnapPoint}
            </span>
            <DrawerClose>Apply filters</DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
