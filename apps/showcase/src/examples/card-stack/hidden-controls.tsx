"use client";

import { useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardStack,
  CardTitle,
} from "@dethink/components";

const updates = [
  {
    title: "Draft",
    detail: "Start here",
    body: "Sketch the release notes and gather the changelog entries.",
  },
  {
    title: "Review",
    detail: "In progress",
    body: "Loop in design and engineering leads for a final pass.",
  },
  {
    title: "Publish",
    detail: "Last step",
    body: "Ship the announcement and notify the changelog subscribers.",
  },
];

export function CardStackHiddenControls() {
  const [activeIndex, setActiveIndex] = useState(0);
  const isLast = activeIndex === updates.length - 1;

  return (
    <div className="space-y-4">
      <CardStack
        aria-label="Release checklist"
        activeIndex={activeIndex}
        loop={false}
        onActiveIndexChange={setActiveIndex}
        showPreviousControl={false}
      >
        {updates.map((update) => (
          <Card key={update.title}>
            <CardHeader>
              <CardTitle>{update.title}</CardTitle>
              <CardDescription>{update.detail}</CardDescription>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm">
              {update.body}
            </CardContent>
          </Card>
        ))}
      </CardStack>
      <div className="flex justify-center gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={activeIndex === 0}
          onClick={() => setActiveIndex((index) => index - 1)}
        >
          Back
        </Button>
        <Button
          size="sm"
          disabled={isLast}
          onClick={() => setActiveIndex((index) => index + 1)}
        >
          {isLast ? "Done" : "Continue"}
        </Button>
      </div>
    </div>
  );
}
