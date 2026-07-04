"use client";

import { Select, SelectItem } from "@dethink/components";

const sizes = ["sm", "md", "lg"] as const;

export function SelectSizes() {
  return (
    <div className="mx-auto grid max-w-md gap-4">
      {sizes.map((size) => (
        <Select
          key={size}
          controlSize={size}
          label={`Size ${size}`}
          defaultValue="staging"
        >
          <SelectItem value="production">Production</SelectItem>
          <SelectItem value="staging">Staging</SelectItem>
          <SelectItem value="sandbox">Sandbox</SelectItem>
        </Select>
      ))}
    </div>
  );
}
