"use client";

import { useMemo, useState } from "react";
import { AsyncSelect } from "@dethink/components";

const accountItems = [
  { label: "Acme Operations", value: "acme" },
  { label: "Dethink Labs", value: "dethink" },
  { label: "Northstar Systems", value: "northstar" },
  { label: "Signal Foundry", value: "signal" },
];

export function AsyncSelectBasic() {
  const [query, setQuery] = useState("");
  const items = useMemo(
    () =>
      accountItems.filter((item) =>
        item.label.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
      ),
    [query],
  );

  return (
    <div className="mx-auto max-w-sm">
      <AsyncSelect
        inputValue={query}
        items={items}
        label="Account"
        name="account"
        onInputValueChange={setQuery}
        placeholder="Search accounts"
      />
    </div>
  );
}
