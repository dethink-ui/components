"use client";

import { Input } from "@dethink/components";

export function InputBasic() {
  return (
    <div className="w-full max-w-sm space-y-1.5">
      <label htmlFor="basic-email" className="text-sm font-medium">
        Email
      </label>
      <Input
        id="basic-email"
        type="email"
        placeholder="you@company.com"
        autoComplete="email"
      />
      <p className="text-xs text-muted-foreground">
        We only use this for account notifications.
      </p>
    </div>
  );
}
