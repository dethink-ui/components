"use client";

import { useState } from "react";
import { Timeline, type TimelineItemData } from "@dethink/components";

type DeployPayload = { sha: string; author: string };

const deploys: TimelineItemData<DeployPayload>[] = [
  {
    id: "d-2214",
    title: "v1.4.2 → production",
    description: "Hotfix for date parsing in Safari.",
    datetime: "2026-07-04T08:41:00Z",
    dateLabel: "Today 08:41",
    status: "complete",
    data: { sha: "f642257", author: "Dana" },
  },
  {
    id: "d-2213",
    title: "v1.4.1 → production",
    description: "Rolled back after checkout error spike.",
    datetime: "2026-07-03T16:20:00Z",
    dateLabel: "Yesterday 16:20",
    status: "error",
    data: { sha: "38385e3", author: "Miguel" },
  },
  {
    id: "d-2212",
    title: "v1.4.1 → canary",
    description: "Latency regression flagged on p99.",
    datetime: "2026-07-03T14:05:00Z",
    dateLabel: "Yesterday 14:05",
    status: "warning",
    data: { sha: "38385e3", author: "Miguel" },
  },
  {
    id: "d-2211",
    title: "v1.4.0 → production",
    description: "Date suite components released.",
    datetime: "2026-07-01T11:32:00Z",
    dateLabel: "Jul 1 11:32",
    status: "complete",
    data: { sha: "17f7ab3", author: "Priya" },
  },
];

/**
 * An interactive deployment history: statuses carry the health of each
 * rollout, and selecting an event surfaces its payload — commit and author —
 * in a details panel driven by the controlled selection.
 */
export function TimelineRecipeDeployHistory() {
  const [selectedId, setSelectedId] = useState<string | null>("d-2213");
  const selected = deploys.find((deploy) => deploy.id === selectedId);

  return (
    <div className="space-y-4">
      <Timeline
        aria-label="Deployment history"
        items={deploys}
        selectedId={selectedId}
        onSelectedIdChange={setSelectedId}
      />
      <div
        aria-live="polite"
        className="border-border mx-auto max-w-md rounded-lg border px-4 py-3 text-sm"
      >
        {selected ? (
          <>
            <p className="font-medium">{selected.title}</p>
            <p className="text-muted-foreground mt-0.5">
              Commit <span className="font-mono">{selected.data?.sha}</span> ·
              deployed by {selected.data?.author}
            </p>
          </>
        ) : (
          <p className="text-muted-foreground">
            Select a deployment for details.
          </p>
        )}
      </div>
    </div>
  );
}
