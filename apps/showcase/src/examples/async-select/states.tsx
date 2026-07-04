"use client";

import { AsyncSelect } from "@dethink/components";

export function AsyncSelectStates() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <AsyncSelect
        inputValue="ac"
        items={[]}
        label="Loading customer"
        loading
        loadingMessage="Finding customers..."
      />
      <AsyncSelect
        inputValue="missing"
        items={[]}
        label="Empty customer"
        emptyMessage="No customer found."
      />
      <AsyncSelect
        error="Customer lookup failed."
        inputValue="acme"
        items={[]}
        label="Errored customer"
        onRetry={() => undefined}
        retryLabel="Try again"
      />
    </div>
  );
}
