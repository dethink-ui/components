"use client";

import { AsyncSelect } from "@dethink/components";

export function AsyncSelectStates() {
  return (
    <div className="space-y-4">
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
      <div className="grid gap-4 md:grid-cols-3">
        <AsyncSelect
          errorMessage="Choose an account before saving."
          invalid
          items={[]}
          label="Required account"
          required
        />
        <AsyncSelect
          readOnly
          defaultValue="acme"
          items={[{ label: "Acme Operations", value: "acme" }]}
          label="Inherited account"
        />
        <AsyncSelect
          disabled
          defaultValue="dethink"
          items={[{ label: "Dethink Labs", value: "dethink" }]}
          label="Locked account"
        />
      </div>
    </div>
  );
}
