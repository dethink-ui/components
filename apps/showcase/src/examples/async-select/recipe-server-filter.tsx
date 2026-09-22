"use client";

import { useMemo, useState } from "react";
import { AsyncSelect, Form, Stack } from "@dethink/components";

const modelItems = [
  { label: "Fast summarizer", value: "fast-summarizer" },
  { label: "Reasoning planner", value: "reasoning-planner" },
  { label: "Vision analyst", value: "vision-analyst" },
  { label: "Customer support bot", value: "support-bot" },
];

export function AsyncSelectRecipeServerFilter() {
  const [query, setQuery] = useState("");
  const items = useMemo(
    () =>
      query.trim().length < 3
        ? []
        : modelItems.filter((item) =>
            item.label.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
          ),
    [query],
  );

  return (
    <Form action="/models" method="get" className="mx-auto max-w-sm">
      <Stack gap="4">
        <AsyncSelect
          inputValue={query}
          items={items}
          label="Model"
          minQueryLength={3}
          minQueryMessage="Type three characters before querying the server."
          name="model"
          onInputValueChange={setQuery}
          placeholder="Search models"
        />
        <AsyncSelect
          defaultValue="ari"
          items={[{ label: "Ari Chen", value: "ari" }]}
          label="Fallback owner"
          name="fallbackOwner"
        />
      </Stack>
    </Form>
  );
}
