"use client";

import { useState } from "react";
import { Tabs, type TabsValue } from "@dethink/components";

const steps = [
  ["draft", "Draft", "The launch plan is still editable by contributors."],
  ["review", "Review", "Approvers can compare copy, rollout, and risks."],
  ["publish", "Publish", "Final checks are ready for the release owner."],
];

export function TabsControlled() {
  const [value, setValue] = useState<TabsValue>("review");

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-2">
        {steps.map(([nextValue, label]) => (
          <button
            key={nextValue}
            type="button"
            data-active={value === nextValue ? "true" : undefined}
            className="border-border text-muted-foreground data-[active=true]:bg-muted data-[active=true]:text-foreground rounded-md border px-3 py-1 text-sm"
            onClick={() => setValue(nextValue)}
          >
            {label}
          </button>
        ))}
      </div>
      <Tabs value={value} onValueChange={setValue} className="max-w-2xl">
        <Tabs.List aria-label="Launch steps">
          {steps.map(([nextValue, label]) => (
            <Tabs.Trigger key={nextValue} value={nextValue}>
              {label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        {steps.map(([nextValue, label, body]) => (
          <Tabs.Panel key={nextValue} forceMount value={nextValue}>
            <div className="border-border rounded-lg border p-5">
              <h3 className="text-foreground text-sm font-semibold">{label}</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-6">
                {body}
              </p>
            </div>
          </Tabs.Panel>
        ))}
      </Tabs>
    </div>
  );
}
