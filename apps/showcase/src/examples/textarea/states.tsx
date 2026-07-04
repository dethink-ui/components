"use client";

import { Textarea } from "@dethink/components";

export function TextareaStates() {
  return (
    <div className="mx-auto grid max-w-lg gap-4 sm:grid-cols-2">
      <Textarea aria-label="Small" controlSize="sm" rows={2} placeholder="Small" />
      <Textarea aria-label="Large" controlSize="lg" rows={2} placeholder="Large" />
      <Textarea
        aria-label="Disabled"
        disabled
        rows={2}
        defaultValue="Disabled content"
      />
      <Textarea
        aria-label="Invalid"
        invalid
        rows={2}
        defaultValue="Too short"
      />
      <Textarea
        aria-label="No resize"
        resize="none"
        rows={2}
        placeholder="resize=none"
      />
      <Textarea
        aria-label="Read-only"
        readOnly
        rows={2}
        defaultValue="Read-only content"
      />
    </div>
  );
}
