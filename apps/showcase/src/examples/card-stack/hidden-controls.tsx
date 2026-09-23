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
  const [complete, setComplete] = useState(false);
  const isLast = activeIndex === updates.length - 1;

  return (
    <div className="space-y-4">
      <CardStack
        aria-label="Release checklist"
        activeIndex={activeIndex}
        loop={false}
        onActiveIndexChange={setActiveIndex}
        showControls={false}
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
          disabled={activeIndex === 0 || complete}
          onClick={() => setActiveIndex((index) => index - 1)}
        >
          Back
        </Button>
        <Button
          size="sm"
          disabled={complete}
          onClick={() =>
            isLast ? setComplete(true) : setActiveIndex((index) => index + 1)
          }
        >
          {complete ? "Completed" : isLast ? "Finish walkthrough" : "Continue"}
        </Button>
      </div>
      <div className="text-muted-foreground text-center text-sm" role="status">
        {complete
          ? "Walkthrough complete. Nothing has been published."
          : `Step ${activeIndex + 1} of ${updates.length}`}
      </div>
      {complete ? (
        <div className="text-center">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setComplete(false);
              setActiveIndex(0);
            }}
          >
            Start again
          </Button>
        </div>
      ) : null}
    </div>
  );
}
