"use client";

import { Select, SelectItem } from "@dethink/components";

const models = [
  { value: "fast", label: "Fast", note: "Lowest latency" },
  { value: "balanced", label: "Balanced", note: "Default quality" },
  { value: "reasoning", label: "Reasoning", note: "Deep analysis" },
  { value: "legacy", label: "Legacy", note: "Deprecated" },
];

export function SelectOptions() {
  return (
    <div className="mx-auto max-w-xs">
      <Select
        label="Model"
        defaultValue="balanced"
        items={models}
        disabledKeys={["legacy"]}
      >
        {(item) => (
          <SelectItem key={item.value} value={item.value} textValue={item.label}>
            <span className="flex w-full items-baseline justify-between gap-3">
              {item.label}
              <span className="text-xs text-muted-foreground">{item.note}</span>
            </span>
          </SelectItem>
        )}
      </Select>
    </div>
  );
}
