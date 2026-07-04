"use client";

import { Select, SelectItem } from "@dethink/components";

export function SelectBasic() {
  return (
    <div className="mx-auto max-w-xs">
      <Select
        label="Region"
        placeholder="Choose a region"
        description="Data is stored in the selected region."
        name="region"
      >
        <SelectItem value="us-east">US East (N. Virginia)</SelectItem>
        <SelectItem value="eu-west">EU West (Ireland)</SelectItem>
        <SelectItem value="ap-south">AP South (Mumbai)</SelectItem>
      </Select>
    </div>
  );
}
