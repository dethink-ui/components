"use client";

import { useEffect, useState } from "react";
import { AsyncSelect } from "@dethink/components";

export function AsyncSelectStates() {
  const [failed, setFailed] = useState(true);
  const [retrying, setRetrying] = useState(false);
  useEffect(() => {
    if (!retrying) return;
    const timer = setTimeout(() => {
      setFailed(false);
      setRetrying(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [retrying]);
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
          error={failed && !retrying ? "Customer lookup failed." : undefined}
          loading={retrying}
          inputValue="acme"
          items={failed ? [] : [{ value: "acme", label: "Acme Operations" }]}
          label="Errored customer"
          onRetry={() => setRetrying(true)}
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
