"use client";

import { useState } from "react";
import {
  FieldDescription,
  MultiSelect,
  MultiSelectItem,
  Stack,
} from "@dethink/components";

export function MultiSelectControlled() {
  const [value, setValue] = useState(["finance"]);

  return (
    <div className="mx-auto max-w-sm">
      <Stack gap="3">
        <MultiSelect
          label="Default audiences"
          value={value}
          onValueChange={setValue}
        >
          <MultiSelectItem value="operations">Operations</MultiSelectItem>
          <MultiSelectItem value="finance">Finance</MultiSelectItem>
          <MultiSelectItem value="revops">RevOps</MultiSelectItem>
        </MultiSelect>
        <FieldDescription>
          Selected audiences: {value.join(", ") || "none"}
        </FieldDescription>
      </Stack>
    </div>
  );
}
