"use client";

import { Combobox, ComboboxItem } from "@dethink/components";

const environments = [
  { value: "production", label: "Production" },
  { value: "staging", label: "Staging" },
  { value: "sandbox", label: "Sandbox" },
];

export function ComboboxStates() {
  return (
    <div className="mx-auto grid max-w-md gap-5 sm:grid-cols-2">
      <Combobox label="Required" required items={environments}>
        {(item) => (
          <ComboboxItem key={item.value} value={item.value}>
            {item.label}
          </ComboboxItem>
        )}
      </Combobox>
      <Combobox label="Disabled" disabled defaultValue="staging" items={environments}>
        {(item) => (
          <ComboboxItem key={item.value} value={item.value}>
            {item.label}
          </ComboboxItem>
        )}
      </Combobox>
      <Combobox label="Read-only" readOnly defaultValue="production" items={environments}>
        {(item) => (
          <ComboboxItem key={item.value} value={item.value}>
            {item.label}
          </ComboboxItem>
        )}
      </Combobox>
      <Combobox
        label="Invalid"
        invalid
        errorMessage="You do not have access to this environment."
        defaultValue="production"
        items={environments}
      >
        {(item) => (
          <ComboboxItem key={item.value} value={item.value}>
            {item.label}
          </ComboboxItem>
        )}
      </Combobox>
    </div>
  );
}
