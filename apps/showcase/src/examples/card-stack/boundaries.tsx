"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardStack,
  CardTitle,
} from "@dethink/components";

const steps = [
  { title: "1. Install", body: "npx shadcn@latest add @dethink/card-stack" },
  { title: "2. Compose", body: "Pass Card children straight into CardStack." },
  { title: "3. Ship", body: "Theme everything through the CSS variables." },
];

export function CardStackBoundaries() {
  return (
    <CardStack
      aria-label="Getting started steps"
      loop={false}
      stackOffset={14}
      previousLabel="Previous step"
      nextLabel="Next step"
    >
      {steps.map((step) => (
        <Card key={step.title}>
          <CardHeader>
            <CardTitle>{step.title}</CardTitle>
            <CardDescription>Setup walkthrough</CardDescription>
          </CardHeader>
          <CardContent className="font-mono text-sm text-muted-foreground">
            {step.body}
          </CardContent>
        </Card>
      ))}
    </CardStack>
  );
}
