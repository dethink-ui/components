"use client";

import { useState } from "react";
import {
  Field,
  FieldControl,
  FieldLabel,
  NumberInput,
} from "@dethink/components";

const channels = [
  { id: "search", label: "Search ads" },
  { id: "social", label: "Social" },
  { id: "content", label: "Content" },
] as const;

type Allocation = Record<(typeof channels)[number]["id"], number>;

/**
 * Cross-field validation: each input is fine on its own — the invariant
 * lives across all three, so every field flips invalid together and a live
 * region explains the group-level error.
 */
export function NumberInputRecipeAllocator() {
  const [allocation, setAllocation] = useState<Allocation>({
    search: 50,
    social: 30,
    content: 20,
  });
  const total = channels.reduce(
    (sum, channel) => sum + (allocation[channel.id] || 0),
    0,
  );
  const balanced = total === 100;

  return (
    <div className="mx-auto max-w-sm space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {channels.map((channel) => (
          <Field
            key={channel.id}
            id={`alloc-${channel.id}`}
            invalid={!balanced}
          >
            <FieldLabel className="text-sm">{channel.label}</FieldLabel>
            <FieldControl asChild>
              <NumberInput
                type="number"
                min={0}
                max={100}
                value={allocation[channel.id]}
                onChange={(event) =>
                  setAllocation((current) => ({
                    ...current,
                    [channel.id]: Number(event.target.value) || 0,
                  }))
                }
              />
            </FieldControl>
          </Field>
        ))}
      </div>
      <div className="space-y-1.5">
        <div
          aria-hidden="true"
          className="bg-muted flex h-2 overflow-hidden rounded-full"
        >
          {channels.map((channel, index) => (
            <div
              key={channel.id}
              className={
                index === 0
                  ? "bg-primary"
                  : index === 1
                    ? "bg-info"
                    : "bg-success"
              }
              style={{ width: `${Math.min(allocation[channel.id], 100)}%` }}
            />
          ))}
        </div>
        <p
          aria-live="polite"
          className={`text-sm ${balanced ? "text-muted-foreground" : "text-destructive font-medium"}`}
        >
          {balanced
            ? "Budget fully allocated."
            : `Allocations must total 100% — currently ${total}%.`}
        </p>
      </div>
    </div>
  );
}
