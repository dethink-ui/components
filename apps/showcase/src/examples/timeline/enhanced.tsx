"use client";

import { useState } from "react";
import {
  Button,
  Timeline,
  TimelineFeed,
  type TimelineItemData,
} from "@dethink/components";

type RunData = { day: string; author: string; commit: string };
const history: TimelineItemData<RunData>[] = [
  {
    id: "plan",
    title: "Release approved",
    dateLabel: "Sep 21 · 16:20",
    status: "complete",
    data: { day: "September 21", author: "Dana", commit: "a92b641" },
    description: "Review complete. Production rollout scheduled.",
  },
  {
    id: "build",
    title: "Build verified",
    dateLabel: "Sep 22 · 09:02",
    status: "complete",
    data: { day: "September 22", author: "Miguel", commit: "f642257" },
    description: "All checks passed across the release targets.",
  },
  {
    id: "canary",
    title: "Canary needs attention",
    dateLabel: "Sep 22 · 09:06",
    status: "warning",
    data: { day: "September 22", author: "Priya", commit: "f642257" },
    description: "Latency is above the rollout threshold.",
  },
  {
    id: "rollout",
    title: "Production rollout",
    dateLabel: "Sep 22 · 09:12",
    status: "current",
    data: { day: "September 22", author: "Dana", commit: "f642257" },
    description: "Monitoring the first production region.",
  },
];

export function TimelineGroupedDetails() {
  return (
    <Timeline
      aria-label="Grouped release activity"
      items={history}
      interactive={false}
      getGroup={(item) =>
        item.data ? { id: item.data.day, label: item.data.day } : null
      }
      renderDetails={(item) => (
        <div className="space-y-2">
          <p>Owner: {item.data?.author}</p>
          <p>
            Commit: <code>{item.data?.commit}</code>
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              void navigator.clipboard.writeText(item.data?.commit ?? "");
            }}
          >
            Copy commit
          </Button>
        </div>
      )}
    />
  );
}

const initialFeed: TimelineItemData[] = Array.from(
  { length: 8 },
  (_, index) => ({
    id: `event-${index}`,
    title: `Check ${index + 1} completed`,
    description: "Release checks recorded and ready for review.",
    dateLabel: `09:${String(index).padStart(2, "0")}`,
    status: "complete",
  }),
);
export function TimelineLiveFeed() {
  const [items, setItems] = useState(initialFeed);
  return (
    <div className="w-full space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          onClick={() =>
            setItems((current) => [
              ...current,
              {
                id: `event-${current.length}`,
                title: `Check ${current.length + 1} completed`,
                description: "A new result arrived from the release agent.",
                dateLabel: "Just now",
                status: "complete",
              },
            ])
          }
        >
          Add event
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            setItems((current) => [
              {
                id: `older-${current.length}`,
                title: "Earlier release note",
                description:
                  "An older event loaded without adding to the unread count.",
                dateLabel: "Earlier",
                status: "neutral",
              },
              ...current,
            ])
          }
        >
          Load earlier example
        </Button>
      </div>
      <TimelineFeed
        aria-label="Live release activity"
        items={items}
        interactive={false}
        reveal="stagger"
      />
    </div>
  );
}

export function TimelineCards() {
  return (
    <Timeline
      aria-label="Release cards"
      items={history.slice(1, 3)}
      variant="cards"
      interactive={false}
    />
  );
}
