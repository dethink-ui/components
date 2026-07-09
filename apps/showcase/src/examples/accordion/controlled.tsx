"use client";

import { useState } from "react";
import { Accordion, type AccordionValue } from "@dethink/components";

const items = [
  {
    value: "import",
    label: "Import",
    body: "Connect CSV, warehouse, or API sources before mapping fields.",
  },
  {
    value: "review",
    label: "Review",
    body: "Check warnings, missing owners, and invalid dates before syncing.",
  },
  {
    value: "sync",
    label: "Sync",
    body: "Run the final job and keep progress inside the opened blade.",
  },
];

export function AccordionControlled() {
  const [value, setValue] = useState<AccordionValue>("review");

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <button
            key={item.value}
            className="border-border text-foreground data-[active=true]:bg-muted rounded-md border px-3 py-1 text-sm"
            data-active={value === item.value}
            onClick={() => setValue(item.value)}
            type="button"
          >
            {item.label}
          </button>
        ))}
        <button
          className="border-border text-muted-foreground rounded-md border px-3 py-1 text-sm"
          onClick={() => setValue(undefined)}
          type="button"
        >
          Close all
        </button>
      </div>
      <Accordion
        aria-label="Import workflow"
        className="max-w-2xl"
        onValueChange={setValue}
        value={value}
      >
        {items.map((item) => (
          <Accordion.Item key={item.value} value={item.value}>
            <Accordion.Blade>
              <Accordion.BladeText>{item.label}</Accordion.BladeText>
            </Accordion.Blade>
            <Accordion.Content forceMount>
              <p className="text-muted-foreground">{item.body}</p>
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  );
}
