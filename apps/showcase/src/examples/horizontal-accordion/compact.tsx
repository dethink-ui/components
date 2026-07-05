"use client";

import { HorizontalAccordion } from "@dethink/components";

const sections = ["Inbox", "Today", "Archive"];

export function HorizontalAccordionCompact() {
  return (
    <div className="mx-auto max-w-sm">
      <HorizontalAccordion
        aria-label="Compact layout demo"
        className="rounded-lg border border-border"
        defaultValue="Inbox"
        height={300}
      >
        {sections.map((section) => (
          <HorizontalAccordion.Item key={section} value={section}>
            <HorizontalAccordion.Blade>
              <HorizontalAccordion.BladeLabel>
                {section}
              </HorizontalAccordion.BladeLabel>
            </HorizontalAccordion.Blade>
            <HorizontalAccordion.Panel>
              <div className="flex h-full items-center bg-background p-6">
                <p className="text-sm text-muted-foreground">
                  Below the compact breakpoint the panel moves above a
                  horizontal blade tray, so {section} stays reachable on
                  narrow containers.
                </p>
              </div>
            </HorizontalAccordion.Panel>
          </HorizontalAccordion.Item>
        ))}
      </HorizontalAccordion>
    </div>
  );
}
