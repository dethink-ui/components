"use client";

import { Input } from "@dethink/components";

export function InputStates() {
  return (
    <div className="w-full max-w-sm space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="state-invalid" className="text-sm font-medium">
          Workspace URL
        </label>
        <Input
          id="state-invalid"
          defaultValue="dethink components!"
          invalid
          aria-describedby="state-invalid-hint"
        />
        <p id="state-invalid-hint" className="text-destructive text-xs">
          Only lowercase letters and hyphens are allowed.
        </p>
      </div>
      <Input disabled placeholder="Disabled" aria-label="Disabled input" />
      <Input
        readOnly
        defaultValue="team_7f2a91"
        aria-label="Workspace ID (read-only)"
      />
    </div>
  );
}
