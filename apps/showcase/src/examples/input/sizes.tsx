"use client";

import { Input } from "@dethink/components";

export function InputSizes() {
  return (
    <div className="w-full max-w-sm space-y-3">
      <Input
        controlSize="sm"
        placeholder='controlSize="sm"'
        aria-label="Small input"
      />
      <Input
        controlSize="md"
        placeholder='controlSize="md"'
        aria-label="Medium input"
      />
      <Input
        controlSize="lg"
        placeholder='controlSize="lg"'
        aria-label="Large input"
      />
    </div>
  );
}
