"use client";

import { Timeline, type TimelineItemData } from "@dethink/components";

const milestones: TimelineItemData[] = [
  {
    id: "planning",
    title: "Planning complete",
    dateLabel: "September 21",
    description: "Scope agreed and the release scheduled.",
    status: "complete",
  },
  {
    id: "build",
    title: "Build verified",
    dateLabel: "September 22",
    description: "Tests passed across all release targets.",
    status: "complete",
  },
  {
    id: "rollout",
    title: "Production rollout",
    dateLabel: "September 23",
    description: "Monitoring the first production region.",
    status: "current",
  },
  {
    id: "review",
    title: "Release review",
    dateLabel: "September 24",
    description: "Review reliability and customer feedback.",
    status: "upcoming",
  },
];

export function TimelineHorizontal() {
  return (
    <Timeline
      aria-label="Horizontal release milestones"
      items={milestones}
      presentation="canvas"
      orientation="horizontal"
      layout="rail"
      scale="sequence"
      viewport={{ controlsVisibility: "always" }}
    />
  );
}
