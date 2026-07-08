"use client";

import type { ReactNode } from "react";
import { Button, HorizontalAccordion, Link } from "@dethink/components";

function CompassIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="18"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      width="18"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="m14.8 9.2-1.9 4.7-3.7 1.9 1.9-4.7 3.7-1.9Z" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="18"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      width="18"
    >
      <path d="M4 19V5M4 19h16M8 15v-4m4 4V8m4 7v-6" />
    </svg>
  );
}

function LayersIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="18"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      width="18"
    >
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 13 9 5 9-5" />
    </svg>
  );
}

const sections = [
  {
    value: "overview",
    label: "Overview",
    icon: <CompassIcon />,
    kicker: "Start here",
    title: "One expanded section at a time",
    body: "Every section stays visible as a compact blade while the active section expands to fill the remaining width of the band.",
    chips: ["Fixed height", "Always visible", "Single active"],
  },
  {
    value: "metrics",
    label: "Metrics",
    icon: <ChartIcon />,
    kicker: "Analytics",
    title: "Panels keep their state",
    body: "Inactive panels stay mounted by default, so charts, filters, and form inputs survive switching between sections.",
    chips: ["Mounted panels", "Controlled or not", "Keyboard ready"],
  },
  {
    value: "integrations",
    label: "Integrations",
    icon: <LayersIcon />,
    kicker: "Ecosystem",
    title: "Motion-powered choreography",
    body: "The active highlight glides between blades as a shared layout element, and panel content eases in after the expansion starts.",
    chips: ["Shared layout", "Reduced motion", "Tokenized"],
  },
];

function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="border-border bg-muted text-muted-foreground rounded-full border px-2.5 py-0.5 text-xs font-medium">
      {children}
    </span>
  );
}

export function HorizontalAccordionBasic() {
  return (
    <HorizontalAccordion
      aria-label="Product sections"
      className="border-border rounded-lg border"
      compactBreakpoint={480}
      defaultValue="overview"
      height={320}
    >
      {sections.map((section) => (
        <HorizontalAccordion.Item key={section.value} value={section.value}>
          <HorizontalAccordion.Blade>
            <HorizontalAccordion.BladeIcon>
              {section.icon}
            </HorizontalAccordion.BladeIcon>
            <HorizontalAccordion.BladeLabel>
              {section.label}
            </HorizontalAccordion.BladeLabel>
          </HorizontalAccordion.Blade>
          <HorizontalAccordion.Panel>
            <div className="bg-background flex h-full flex-col justify-center gap-4 p-8">
              <div className="space-y-2">
                <p className="text-primary text-xs font-semibold tracking-[0.14em] uppercase">
                  {section.kicker}
                </p>
                <h3 className="text-foreground text-xl font-semibold">
                  {section.title}
                </h3>
                <p className="text-muted-foreground max-w-md text-sm leading-6">
                  {section.body}{" "}
                  <Link href="#basic" variant="muted" underline="always">
                    Read the guide
                  </Link>
                  .
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {section.chips.map((chip) => (
                  <Chip key={chip}>{chip}</Chip>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <Button size="sm" variant="soft">
                  Explore {section.label.toLowerCase()}
                </Button>
                <Link href="#basic" variant="muted">
                  View changelog
                </Link>
              </div>
            </div>
          </HorizontalAccordion.Panel>
        </HorizontalAccordion.Item>
      ))}
    </HorizontalAccordion>
  );
}
