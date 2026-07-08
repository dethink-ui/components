"use client";

import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@dethink/components";

const records = [
  { id: "REC-104", name: "Northwind renewal", owner: "Priya Shah" },
  { id: "REC-118", name: "Acme onboarding", owner: "Marcus Lee" },
  { id: "REC-129", name: "Globex expansion", owner: "Dana Ruiz" },
];

export function DrawerInspectorRail() {
  const [selected, setSelected] = useState(records[0]!);

  return (
    <div className="border-border flex min-h-[22rem] overflow-hidden rounded-lg border">
      <main className="divide-border flex-1 divide-y overflow-y-auto">
        {records.map((record) => (
          <button
            className="hover:bg-muted data-[current=true]:bg-muted flex w-full items-center justify-between px-[var(--dt-space-4)] py-[var(--dt-space-3)] text-left text-sm"
            data-current={record.id === selected.id}
            key={record.id}
            onClick={() => setSelected(record)}
            type="button"
          >
            <span className="text-foreground font-medium">{record.name}</span>
            <span className="text-muted-foreground">{record.owner}</span>
          </button>
        ))}
      </main>
      <Drawer defaultOpen direction="right" modal={false}>
        <DrawerTrigger
          className="border-border self-start rounded-none border-b"
          variant="ghost"
        >
          Toggle inspector
        </DrawerTrigger>
        <DrawerContent size="sm">
          <DrawerHeader>
            <DrawerTitle>{selected.name}</DrawerTitle>
            <DrawerDescription>
              Push-mode drawers shift layout instead of overlaying it, so the
              record list stays reachable via Tab.
            </DrawerDescription>
          </DrawerHeader>
          <dl className="grid gap-[var(--dt-space-2)] px-[var(--dt-space-6)] py-[var(--dt-space-2)] text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">ID</dt>
              <dd className="text-foreground font-medium">{selected.id}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Owner</dt>
              <dd className="text-foreground font-medium">{selected.owner}</dd>
            </div>
          </dl>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
