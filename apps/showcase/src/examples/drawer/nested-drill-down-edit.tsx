"use client";

import { useState } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  RadioGroup,
  RadioGroupItem,
} from "@dethink/components";

export function DrawerNestedDrillDownEdit() {
  const [status, setStatus] = useState("In review");
  const [draft, setDraft] = useState(status);
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
              Review this record and update its progress.
            </DrawerDescription>
          </DrawerHeader>
          <div
            className="text-foreground px-[var(--dt-space-6)] py-[var(--dt-space-3)] text-sm"
            role="status"
          >
            Status: <span className="font-medium">{status}</span>
          </div>
          <Drawer direction="right">
            <DrawerTrigger
              className="mx-[var(--dt-space-6)] self-start"
              variant="outline"
              onPress={() => setDraft(status)}
            >
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
                  Choose the next stage for this record.
                </DrawerDescription>
              </DrawerHeader>
              <div className="min-h-0 flex-1 overflow-y-auto p-6">
                <RadioGroup
                  aria-label="Record status"
                  value={draft}
                  onValueChange={setDraft}
                  className="grid gap-3"
                >
                  {["Open", "In review", "Blocked", "Done"].map((value) => (
                    <label
                      key={value}
                      className="border-border has-[:checked]:border-primary has-[:checked]:bg-primary/5 flex cursor-pointer items-center gap-3 rounded-lg border p-4"
                    >
                      <RadioGroupItem value={value} />
                      {value}
                    </label>
                  ))}
                </RadioGroup>
              </div>
              <DrawerFooter>
                <DrawerClose variant="outline">Back</DrawerClose>
                <DrawerClose variant="solid" onPress={() => setStatus(draft)}>
                  Save changes
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
