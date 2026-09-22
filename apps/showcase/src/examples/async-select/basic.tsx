"use client";

import { useEffect, useState } from "react";
import { AsyncSelect, Button } from "@dethink/components";

const accountItems = [
  { label: "Acme Operations", value: "acme" },
  { label: "Dethink Labs", value: "dethink" },
  { label: "Northstar Systems", value: "northstar" },
  { label: "Signal Foundry", value: "signal" },
];

export function AsyncSelectBasic() {
  const [query, setQuery] = useState("");
  const [value, setValue] = useState<string | null>(null);
  const [fail, setFail] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const request = JSON.stringify([query, fail, attempt]);
  const [response, setResponse] = useState<{
    request: string;
    items: typeof accountItems;
    error?: string;
  }>();

  useEffect(() => {
    // The app owns requests. Cancel stale work so older results cannot win.
    // Replace this timer with fetch(url, { signal }) in a real integration.
    const timer = setTimeout(() => {
      setResponse({
        request,
        items: fail
          ? []
          : accountItems.filter((item) =>
              item.label
                .toLocaleLowerCase()
                .includes(query.trim().toLocaleLowerCase()),
            ),
        error: fail ? "Could not load accounts. Try again." : undefined,
      });
    }, 600);
    return () => clearTimeout(timer);
  }, [request, query, fail]);

  const current = response?.request === request ? response : undefined;
  return (
    <div
      data-slot="async-select-demo"
      data-ready={Boolean(current)}
      className="mx-auto w-full max-w-sm space-y-3"
    >
      <AsyncSelect
        inputValue={query}
        value={value}
        onValueChange={setValue}
        selectedItems={accountItems.filter((item) => item.value === value)}
        items={current?.items ?? []}
        loading={!current}
        error={current?.error}
        onRetry={() => {
          setFail(false);
          setAttempt((count) => count + 1);
        }}
        label="Account"
        name="account"
        onInputValueChange={setQuery}
        placeholder="Search accounts"
        description="Results take 600ms. Try a name, an unmatched query, or a connection error."
      />
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          setFail(true);
          setAttempt((count) => count + 1);
        }}
      >
        Simulate connection error
      </Button>
    </div>
  );
}
