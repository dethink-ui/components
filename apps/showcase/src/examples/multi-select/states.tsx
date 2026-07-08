"use client";

import { MultiSelect, MultiSelectItem, Stack } from "@dethink/components";

export function MultiSelectStates() {
  return (
    <div className="mx-auto max-w-sm">
      <Stack gap="4">
        <MultiSelect
          disabledKeys={["finance"]}
          errorMessage="Choose at least one active owner."
          invalid
          label="Active owners"
          required
        >
          <MultiSelectItem value="operations">Operations</MultiSelectItem>
          <MultiSelectItem value="finance">Finance</MultiSelectItem>
          <MultiSelectItem value="revops">RevOps</MultiSelectItem>
        </MultiSelect>
        <MultiSelect
          readOnly
          defaultValue={["operations", "revops"]}
          label="Inherited visibility"
        >
          <MultiSelectItem value="operations">Operations</MultiSelectItem>
          <MultiSelectItem value="revops">RevOps</MultiSelectItem>
        </MultiSelect>
        <MultiSelect disabled defaultValue={["finance"]} label="Locked teams">
          <MultiSelectItem value="finance">Finance</MultiSelectItem>
        </MultiSelect>
      </Stack>
    </div>
  );
}
