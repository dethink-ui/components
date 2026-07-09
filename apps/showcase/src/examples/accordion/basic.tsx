"use client";

import { Accordion, Button, Link } from "@dethink/components";

function ChevronIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 16 16">
      <path
        d="m5.5 3.5 4 4.5-4 4.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
    </svg>
  );
}

const sections = [
  {
    value: "overview",
    title: "Overview",
    body: "The rounded blade contains both the trigger and the expanded content, so the section reads as one cohesive object.",
  },
  {
    value: "permissions",
    title: "Permissions",
    body: "Put any React content inside the open blade: forms, status lists, controls, or custom product workflows.",
  },
  {
    value: "automation",
    title: "Automation",
    body: "Motion layout and presence choreography keeps opening, closing, icon rotation, and sibling reflow coordinated.",
  },
];

export function AccordionBasic() {
  return (
    <Accordion
      aria-label="Workspace settings"
      className="max-w-2xl"
      defaultValue="overview"
    >
      {sections.map((section) => (
        <Accordion.Item key={section.value} value={section.value}>
          <Accordion.Blade>
            <Accordion.BladeIcon>
              <ChevronIcon />
            </Accordion.BladeIcon>
            <Accordion.BladeText>{section.title}</Accordion.BladeText>
          </Accordion.Blade>
          <Accordion.Content>
            <div className="grid gap-3">
              <p className="text-muted-foreground">{section.body}</p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm">Open section</Button>
                <Button size="sm" variant="outline" asChild>
                  <Link href="#props">View props</Link>
                </Button>
              </div>
            </div>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion>
  );
}
