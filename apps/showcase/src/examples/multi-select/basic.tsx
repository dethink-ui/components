"use client";

import { MultiSelect, MultiSelectItem } from "@dethink/components";

export function MultiSelectBasic() {
  return (
    <div className="mx-auto max-w-sm">
      <MultiSelect
        description="Search and select every team that should receive updates."
        label="Recipient teams"
        name="recipientTeams"
        placeholder="Choose teams"
      >
        <MultiSelectItem value="operations">Operations</MultiSelectItem>
        <MultiSelectItem value="finance">Finance</MultiSelectItem>
        <MultiSelectItem value="revops">RevOps</MultiSelectItem>
        <MultiSelectItem value="customer-success">
          Customer success
        </MultiSelectItem>
      </MultiSelect>
    </div>
  );
}
