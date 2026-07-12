"use client";

import { Accordion } from "@dethink/components";

function DotIcon() {
  return (
    <svg aria-hidden="true" fill="currentColor" viewBox="0 0 16 16">
      <circle cx="8" cy="8" r="3" />
    </svg>
  );
}

const checks = [
  ["Design", "Tokens, radius, dark mode, and density are inherited."],
  ["Behavior", "Each open blade stays open until the user clicks it again."],
  [
    "Quality",
    "Keyboard, axe, SSR, registry, and Storybook checks cover the component.",
  ],
];

export function AccordionMultiple() {
  return (
    <Accordion
      aria-label="Readiness checklist"
      className="max-w-2xl"
      defaultValue={["design", "behavior"]}
      type="multiple"
    >
      {checks.map(([label, body]) => (
        <Accordion.Item key={label} value={label.toLowerCase()}>
          <Accordion.Blade>
            <Accordion.BladeIcon>
              <DotIcon />
            </Accordion.BladeIcon>
            <Accordion.BladeText>{label}</Accordion.BladeText>
          </Accordion.Blade>
          <Accordion.Content>
            <p className="text-muted-foreground">{body}</p>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion>
  );
}
