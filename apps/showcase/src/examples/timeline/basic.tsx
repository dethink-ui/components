"use client";

import { Timeline, type TimelineItemData } from "@dethink/components";

const milestones: TimelineItemData[] = [
  {
    id: "research",
    title: "Research complete",
    description: "User needs and interaction model approved.",
    datetime: "2026-01-12T09:00:00Z",
    dateLabel: "Jan 12",
    status: "complete",
  },
  {
    id: "beta",
    title: "Private beta",
    description: "First teams using the component in dashboards.",
    datetime: "2026-03-18T10:00:00Z",
    dateLabel: "Mar 18",
    status: "current",
  },
  {
    id: "ga",
    title: "General availability",
    description: "Registry item, docs, and release notes ship.",
    datetime: "2026-05-05T10:00:00Z",
    dateLabel: "May 5",
    status: "upcoming",
  },
];

export function TimelineBasic() {
  return <Timeline aria-label="Release milestones" items={milestones} />;
}
