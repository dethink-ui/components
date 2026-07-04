"use client";

import {
  DethinkProvider,
  MultiSelect,
  MultiSelectItem,
} from "@dethink/components";

export function MultiSelectThemeAndWrapping() {
  return (
    <DethinkProvider theme="dark" density="compact" dir="rtl">
      <div className="mx-auto max-w-72 rounded-lg border border-border bg-background p-4">
        <MultiSelect
          defaultValue={[
            "operations",
            "finance",
            "revops",
            "customer-success",
          ]}
          label="فرق التقارير"
          name="reportTeams"
        >
          <MultiSelectItem value="operations">Operations</MultiSelectItem>
          <MultiSelectItem value="finance">Finance</MultiSelectItem>
          <MultiSelectItem value="revops">RevOps</MultiSelectItem>
          <MultiSelectItem value="customer-success">Customer success</MultiSelectItem>
        </MultiSelect>
      </div>
    </DethinkProvider>
  );
}
