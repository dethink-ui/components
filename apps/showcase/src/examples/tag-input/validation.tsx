"use client";

import { TagInput } from "@dethink/components";

export function TagInputValidation() {
  return (
    <div className="mx-auto max-w-sm">
      <TagInput
        defaultValue={["#finance"]}
        description="Tags must start with # and stay short."
        label="Campaign tags"
        maxTagLength={16}
        name="campaignTags"
        validateTag={(value) =>
          value.startsWith("#") ? null : "Tags must start with #."
        }
      />
    </div>
  );
}
