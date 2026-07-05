"use client";

import { useState } from "react";
import {
  Button,
  HorizontalAccordion,
  Link,
  type HorizontalAccordionValue,
} from "@dethink/components";

function ListIcon() {
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
      <path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" />
    </svg>
  );
}

function HammerIcon() {
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
      <path d="m14 5 6 6-2.5 2.5-6-6L14 5ZM11.5 7.5 4 15l2.5 2.5 7.5-7.5" />
    </svg>
  );
}

function RocketIcon() {
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
      <path d="M12 15c4-3 6-7 6-11-4 0-8 2-11 6l-3 1 4 4 4 4 1-3Z" />
      <path d="M7 14c-1.5.5-2.5 3-2.5 5.5C7 19.5 9.5 18.5 10 17" />
    </svg>
  );
}

const phases = [
  {
    value: "plan",
    label: "Plan",
    icon: <ListIcon />,
    title: "Shape the milestone",
    body: "Collect scope, split it into vertical slices, and agree on the seams before any code is written.",
    cta: "Open the roadmap",
  },
  {
    value: "build",
    label: "Build",
    icon: <HammerIcon />,
    title: "Ship thin slices",
    body: "Each slice lands end to end — component, tests, registry metadata, and docs move together.",
    cta: "See open branches",
  },
  {
    value: "ship",
    label: "Ship",
    icon: <RocketIcon />,
    title: "Release with confidence",
    body: "Typecheck, tests, a11y automation, and registry validation gate every release candidate.",
    cta: "Read release notes",
  },
];

export function HorizontalAccordionControlled() {
  const [value, setValue] = useState<HorizontalAccordionValue>("build");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {phases.map((phase) => (
          <Button
            key={phase.value}
            onClick={() => setValue(phase.value)}
            size="sm"
            variant={value === phase.value ? "soft" : "outline"}
          >
            {phase.label}
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
        compactBreakpoint={480}
        height={280}
        onValueChange={setValue}
        value={value}
      >
        {phases.map((phase) => (
          <HorizontalAccordion.Item key={phase.value} value={phase.value}>
            <HorizontalAccordion.Blade>
              <HorizontalAccordion.BladeIcon>
                {phase.icon}
              </HorizontalAccordion.BladeIcon>
              <HorizontalAccordion.BladeLabel>
                {phase.label}
              </HorizontalAccordion.BladeLabel>
            </HorizontalAccordion.Blade>
            <HorizontalAccordion.Panel>
              <div className="flex h-full items-center gap-5 bg-background p-8">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {phase.icon}
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg font-semibold text-foreground">
                    {phase.title}
                  </h3>
                  <p className="max-w-md text-sm leading-6 text-muted-foreground">
                    {phase.body}
                  </p>
                  <Link href="#controlled" underline="hover">
                    {phase.cta} →
                  </Link>
                </div>
              </div>
            </HorizontalAccordion.Panel>
          </HorizontalAccordion.Item>
        ))}
      </HorizontalAccordion>
    </div>
  );
}
