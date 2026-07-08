"use client";

import { AsyncSelect, DethinkProvider } from "@dethink/components";

const ownerItems = [
  { label: "Ari Chen", value: "ari" },
  { label: "Mira Patel", value: "mira" },
  { label: "Noah Smith", value: "noah" },
  { label: "Sana Iqbal", value: "sana" },
];

export function AsyncSelectThemeAndWrapping() {
  return (
    <DethinkProvider theme="dark" density="compact" dir="rtl">
      <div className="border-border bg-background mx-auto max-w-72 rounded-lg border p-4">
        <AsyncSelect
          selectionMode="multiple"
          defaultValue={["ari", "mira", "sana"] as string[]}
          items={ownerItems}
          label="مالكو الحساب"
          name="accountOwners"
        />
      </div>
    </DethinkProvider>
  );
}
