"use client";

import { useState } from "react";
import {
  Button,
  HorizontalAccordion,
  type HorizontalAccordionValue,
} from "@dethink/components";

const sections = ["plan", "build", "ship"] as const;

export function HorizontalAccordionControlled() {
  const [value, setValue] = useState<HorizontalAccordionValue>("build");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {sections.map((section) => (
          <Button
            key={section}
            onClick={() => setValue(section)}
            size="sm"
            variant={value === section ? "soft" : "outline"}
          >
            {section}
          </Button>
        ))}
        <Button onClick={() => setValue(undefined)} size="sm" variant="ghost">
          Collapse all
        </Button>
        <span className="text-sm text-muted-foreground">
          Active: {value ?? "none"}
        </span>
      </div>
      <HorizontalAccordion
        aria-label="Delivery phases"
        className="rounded-lg border border-border"
        height={260}
        onValueChange={setValue}
        value={value}
      >
        {sections.map((section) => (
          <HorizontalAccordion.Item key={section} value={section}>
            <HorizontalAccordion.Blade>
              <HorizontalAccordion.BladeLabel className="capitalize">
                {section}
              </HorizontalAccordion.BladeLabel>
            </HorizontalAccordion.Blade>
            <HorizontalAccordion.Panel>
              <div className="flex h-full items-center bg-background p-6">
                <p className="text-sm capitalize text-muted-foreground">
                  {section} phase content driven by external state.
                </p>
              </div>
            </HorizontalAccordion.Panel>
          </HorizontalAccordion.Item>
        ))}
      </HorizontalAccordion>
    </div>
  );
}
