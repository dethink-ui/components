"use client";

import { Stack, TagInput } from "@dethink/components";

export function TagInputStates() {
  return (
    <div className="mx-auto max-w-sm">
      <Stack gap="4">
        <TagInput
          errorMessage="Add at least one recipient tag."
          invalid
          label="Recipient tags"
          required
        />
        <TagInput
          readOnly
          defaultValue={["finance", "renewal"]}
          label="Inherited labels"
        />
        <TagInput disabled defaultValue={["locked"]} label="Locked labels" />
      </Stack>
    </div>
  );
}
