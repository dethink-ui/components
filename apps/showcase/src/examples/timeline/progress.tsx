"use client";

import { Timeline, type TimelineItemData } from "@dethink/components";

const steps: TimelineItemData[] = [
  {
    id: "queued",
    title: "Queued",
    description: "Waiting for a build slot.",
    status: "complete",
  },
  {
    id: "building",
    title: "Building",
    description: "Compiling and running checks.",
    status: "current",
  },
  {
    id: "deploying",
    title: "Deploying",
    description: "Rolling out to the edge.",
    status: "upcoming",
  },
  {
    id: "live",
    title: "Live",
    description: "Serving production traffic.",
    status: "upcoming",
  },
];

export function TimelineProgress() {
  return (
    <Timeline
      interactive={false}
      aria-label="Deployment progress"
      mode="progress"
      scale="auto"
      layout="stacked"
      items={steps}
    />
  );
}
