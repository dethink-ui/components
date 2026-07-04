"use client";

import { Select, SelectItem } from "@dethink/components";

const plans = [
  { value: "starter", label: "Starter" },
  { value: "team", label: "Team" },
  { value: "scale", label: "Scale" },
];

export function SelectStates() {
  return (
    <div className="mx-auto grid max-w-md gap-5 sm:grid-cols-2">
      <Select label="Required" required placeholder="Pick a plan" items={plans}>
        {(item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        )}
      </Select>
      <Select label="Disabled" disabled defaultValue="team" items={plans}>
        {(item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        )}
      </Select>
      <Select label="Read-only" readOnly defaultValue="scale" items={plans}>
        {(item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        )}
      </Select>
      <Select
        label="Invalid"
        invalid
        errorMessage="Your card was declined for this plan."
        defaultValue="scale"
        items={plans}
      >
        {(item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        )}
      </Select>
    </div>
  );
}
