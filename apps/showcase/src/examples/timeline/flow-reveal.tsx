"use client";

import { Timeline, type TimelineItemData } from "@dethink/components";

const milestones: TimelineItemData[] = [
  {
    id: "kickoff",
    title: "Project kickoff",
    description: "Scope agreed and delivery squad assembled.",
    datetime: "2026-02-02T09:00:00Z",
    dateLabel: "Feb 2",
    status: "complete",
  },
  {
    id: "design",
    title: "Design review",
    description: "Flows approved with two accessibility follow-ups.",
    datetime: "2026-03-09T14:00:00Z",
    dateLabel: "Mar 9",
    status: "complete",
  },
  {
    id: "build",
    title: "Build sprint",
    description: "Core screens implemented behind a feature flag.",
    datetime: "2026-04-20T10:00:00Z",
    dateLabel: "Apr 20",
    status: "current",
  },
  {
    id: "launch",
    title: "Launch",
    description: "Flag removed and rollout announced.",
    datetime: "2026-06-01T10:00:00Z",
    dateLabel: "Jun 1",
    status: "upcoming",
  },
];

/**
 * presentation="flow" renders the same events data as a static document-flow
 * list — no pan/zoom viewport — and reveal="stagger" animates the items in
 * one by one as the timeline scrolls into view. Reduced-motion users see
 * every item immediately.
 */
export function TimelineFlowReveal() {
  return (
    <Timeline
      interactive={false}
      aria-label="Project milestones"
      items={milestones}
      presentation="flow"
      reveal="stagger"
      revealOptions={{ trigger: "in-view" }}
    />
  );
}
