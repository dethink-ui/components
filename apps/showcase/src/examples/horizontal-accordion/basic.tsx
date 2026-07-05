"use client";

import { HorizontalAccordion } from "@dethink/components";

const sections = [
  {
    value: "overview",
    label: "Overview",
    title: "Product overview",
    body: "Every section stays visible as a compact blade while the active section expands to fill the remaining width.",
  },
  {
    value: "metrics",
    label: "Metrics",
    title: "Usage metrics",
    body: "Panels keep their state mounted by default, so charts and forms survive switching sections.",
  },
  {
    value: "integrations",
    label: "Integrations",
    title: "Integrations",
    body: "The active highlight glides between blades as a shared Motion layout element.",
  },
];

export function HorizontalAccordionBasic() {
  return (
    <HorizontalAccordion
      aria-label="Product sections"
      className="rounded-lg border border-border"
      defaultValue="overview"
      height={300}
    >
      {sections.map((section) => (
        <HorizontalAccordion.Item key={section.value} value={section.value}>
          <HorizontalAccordion.Blade>
            <HorizontalAccordion.BladeLabel>
              {section.label}
            </HorizontalAccordion.BladeLabel>
          </HorizontalAccordion.Blade>
          <HorizontalAccordion.Panel>
            <div className="flex h-full flex-col justify-center gap-2 bg-background p-6">
              <h3 className="text-lg font-semibold text-foreground">
                {section.title}
              </h3>
              <p className="max-w-md text-sm text-muted-foreground">
                {section.body}
              </p>
            </div>
          </HorizontalAccordion.Panel>
        </HorizontalAccordion.Item>
      ))}
    </HorizontalAccordion>
  );
}
