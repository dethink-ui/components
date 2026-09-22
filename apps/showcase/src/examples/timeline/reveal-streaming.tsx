"use client";

import { useState } from "react";
import { Button, Timeline, type TimelineItemData } from "@dethink/components";

const runEvents: TimelineItemData[] = [
  {
    id: "queued",
    title: "Run queued",
    description: "Agent run accepted and scheduled.",
    dateLabel: "12:04:01",
    status: "complete",
  },
  {
    id: "plan",
    title: "Plan drafted",
    description: "Task broken into three tool calls.",
    dateLabel: "12:04:07",
    status: "complete",
  },
  {
    id: "search",
    title: "Search executed",
    description: "Indexed 42 documents, 6 strong matches.",
    dateLabel: "12:04:18",
    status: "complete",
  },
  {
    id: "draft",
    title: "Draft generated",
    description: "Summary produced from the top matches.",
    dateLabel: "12:04:31",
    status: "current",
  },
  {
    id: "review",
    title: "Awaiting review",
    description: "Draft handed off for human approval.",
    dateLabel: "12:04:32",
    status: "upcoming",
  },
];

/**
 * Growing the items array appends points live: only the new items animate in,
 * so a streaming source — an agent run, a deploy log, a support thread — can
 * push events onto the timeline one at a time.
 */
export function TimelineRevealStreaming() {
  const [count, setCount] = useState(2);
  const done = count >= runEvents.length;

  return (
    <div className="space-y-4">
      <div className="flex justify-center gap-2">
        <Button
          size="sm"
          disabled={done}
          onClick={() => setCount((current) => current + 1)}
        >
          Log next event
        </Button>
        <Button size="sm" variant="outline" onClick={() => setCount(2)}>
          Reset
        </Button>
      </div>
      <Timeline
        interactive={false}
        aria-label="Agent run events"
        items={runEvents.slice(0, count)}
        presentation="flow"
        reveal="stagger"
      />
    </div>
  );
}
