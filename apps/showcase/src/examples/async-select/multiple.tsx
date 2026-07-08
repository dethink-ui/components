"use client";

import { useState } from "react";
import { AsyncSelect, FieldDescription, Stack } from "@dethink/components";

const ownerItems = [
  { label: "Ari Chen", value: "ari" },
  { label: "Mira Patel", value: "mira" },
  { label: "Noah Smith", value: "noah" },
  { label: "Sana Iqbal", value: "sana" },
];

export function AsyncSelectMultiple() {
  const [query, setQuery] = useState("");
  const [value, setValue] = useState<string[]>(["mira"]);
  const items = ownerItems.filter((item) =>
    item.label.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
  );

  return (
    <div className="mx-auto max-w-sm">
      <Stack gap="3">
        <AsyncSelect
          selectionMode="multiple"
          inputValue={query}
          items={items}
          label="Owners"
          name="owners"
          onInputValueChange={setQuery}
          onValueChange={(nextValue) => setValue(nextValue as string[])}
          selectedItems={ownerItems.filter((item) =>
            value.includes(item.value),
          )}
          value={value}
        />
        <FieldDescription>
          Selected labels stay visible while server results change.
        </FieldDescription>
      </Stack>
    </div>
  );
}
