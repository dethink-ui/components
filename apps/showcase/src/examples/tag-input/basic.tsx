"use client";

import { TagInput } from "@dethink/components";

export function TagInputBasic() {
  return (
    <div className="mx-auto max-w-sm">
      <TagInput
        description="Press Enter, comma, or Tab to add a label."
        label="Labels"
        name="labels"
        placeholder="Add label"
      />
    </div>
  );
}
