"use client";

import { useState } from "react";
import { FieldDescription, Stack, TagInput } from "@dethink/components";

export function TagInputControlled() {
  const [tags, setTags] = useState(["finance"]);

  return (
    <div className="mx-auto max-w-sm">
      <Stack gap="3">
        <TagInput
          label="Notification tags"
          name="notificationTags"
          onValueChange={setTags}
          value={tags}
        />
        <FieldDescription>
          Serialized tags: {tags.join(", ") || "none"}
        </FieldDescription>
      </Stack>
    </div>
  );
}
