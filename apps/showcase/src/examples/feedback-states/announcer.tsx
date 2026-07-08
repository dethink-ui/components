"use client";

import { useState } from "react";
import { Button, LiveRegionProvider, useAnnouncer } from "@dethink/components";

function AnnouncerControls() {
  const announcer = useAnnouncer();
  const [count, setCount] = useState(0);
  const [politePreview, setPolitePreview] = useState(
    "No result announcement sent.",
  );
  const [assertivePreview, setAssertivePreview] = useState(
    "No failure announcement sent.",
  );

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={() => {
            const next = count + 1;
            const message = `${next} filtered ${next === 1 ? "result" : "results"} available`;

            setCount(next);
            setPolitePreview(message);
            announcer.announcePolite(message, {
              coalesceKey: "results",
              debounceMs: 150,
            });
          }}
        >
          Announce results
        </Button>
        <Button
          variant="destructive"
          onClick={() => {
            const message = "Connection lost";

            setAssertivePreview(message);
            announcer.announceAssertive(message);
          }}
        >
          Announce failure
        </Button>
      </div>
      <dl className="grid gap-2 sm:grid-cols-2">
        <div className="border-border bg-background/80 rounded-md border p-3 text-sm shadow-sm">
          <dt className="text-muted-foreground text-xs font-semibold tracking-[0.14em] uppercase">
            Polite
          </dt>
          <dd className="text-foreground mt-1 font-medium">{politePreview}</dd>
        </div>
        <div className="border-border bg-background/80 rounded-md border p-3 text-sm shadow-sm">
          <dt className="text-muted-foreground text-xs font-semibold tracking-[0.14em] uppercase">
            Assertive
          </dt>
          <dd className="text-foreground mt-1 font-medium">
            {assertivePreview}
          </dd>
        </div>
      </dl>
    </div>
  );
}

export function FeedbackAnnouncer() {
  return (
    <LiveRegionProvider>
      <AnnouncerControls />
    </LiveRegionProvider>
  );
}
