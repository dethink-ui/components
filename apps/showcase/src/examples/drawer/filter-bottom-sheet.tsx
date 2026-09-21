"use client";

import { useState } from "react";
import {
  Checkbox,
  Button,
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
  const [activeSnapPoint, setActiveSnapPoint] = useState(0.65);
  const [selected, setSelected] = useState(["Open"]);
  const [applied, setApplied] = useState(["Open"]);

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-muted-foreground text-sm" role="status">
        Showing: {applied.length ? applied.join(", ") : "all statuses"}
      </p>
      <Drawer
        activeSnapPoint={activeSnapPoint}
        direction="bottom"
        onActiveSnapPointChange={setActiveSnapPoint}
        snapPoints={[0.35, 0.65, 1]}
        size="xl"
      >
        <DrawerTrigger>Filter issues</DrawerTrigger>
        <DrawerContent
          dismissible
          showCloseButton
          closeButtonLabel="Close filters"
        >
          <DrawerHandle aria-label="Drag to resize filters" />
          <DrawerHeader className="py-3">
            <DrawerTitle>Filters</DrawerTitle>
            <DrawerDescription className="sr-only">
              Choose statuses, then apply your filters. Use the sheet size
              controls to resize.
            </DrawerDescription>
          </DrawerHeader>
          <div className="grid min-h-0 flex-1 content-start gap-3 overflow-y-auto overscroll-contain px-6 py-3">
            <div
              role="group"
              aria-label="Sheet size"
              className="flex flex-wrap gap-2 motion-reduce:hidden"
            >
              {(
                [
                  [0.35, "Compact"],
                  [0.65, "Medium"],
                  [1, "Expanded"],
                ] as const
              ).map(([point, label]) => (
                <Button
                  key={point}
                  size="sm"
                  variant={activeSnapPoint === point ? "solid" : "outline"}
                  aria-pressed={activeSnapPoint === point}
                  onClick={() => setActiveSnapPoint(point)}
                >
                  {label}
                </Button>
              ))}
            </div>
            <p className="text-muted-foreground text-xs tracking-wide uppercase">
              Status
            </p>
            {statuses.map((status) => (
              <Field
                id={`status-${status}`}
                key={status}
                orientation="horizontal"
              >
                <FieldControl asChild>
                  <Checkbox
                    checked={selected.includes(status)}
                    onCheckedChange={(checked) =>
                      setSelected((current) =>
                        checked
                          ? [...current, status]
                          : current.filter((value) => value !== status),
                      )
                    }
                    name="status"
                    value={status}
                  />
                </FieldControl>
                <FieldLabel>{status}</FieldLabel>
              </Field>
            ))}
          </div>
          <DrawerFooter className="flex-row items-center justify-between px-6 py-3">
            <span className="text-muted-foreground text-sm">
              {selected.length} selected
            </span>
            <DrawerClose variant="solid" onPress={() => setApplied(selected)}>
              Apply filters
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
