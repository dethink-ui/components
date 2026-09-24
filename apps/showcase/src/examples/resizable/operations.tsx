"use client";

import { useState } from "react";
import {
  ResizableWorkspace,
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
  ResizablePanelHeader,
  ResizablePanelBody,
  Badge,
} from "@dethink/components";

const runs = [
  "Daily account sync",
  "Invoice reconciliation",
  "Customer health digest",
  "Archive completed work",
];
export function ResizableOperations() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(runs[0]);
  const [paused, setPaused] = useState(false);
  return (
    <ResizableWorkspace
      id="operations-desk"
      label="Operations desk"
      compactAt={560}
      className="h-[32rem] data-[compact]:h-auto"
      panes={[
        {
          id: "queue",
          title: "Run queue",
          defaultSize: "32%",
          minSize: "22%",
          collapsible: true,
          footer: <span>{runs.length} workflows</span>,
          children: (
            <div>
              <label
                htmlFor="run-filter"
                className="text-muted-foreground mb-2 block text-xs"
              >
                Find a workflow
              </label>
              <input
                id="run-filter"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search runs…"
                className="border-border focus-visible:ring-ring bg-background mb-4 w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2"
              />
              <div className="space-y-1">
                {runs
                  .filter((run) =>
                    run.toLowerCase().includes(query.toLowerCase()),
                  )
                  .map((run, index) => (
                    <button
                      type="button"
                      key={run}
                      aria-pressed={selected === run}
                      onClick={() => setSelected(run)}
                      className="hover:bg-muted aria-pressed:bg-muted focus-visible:outline-ring w-full rounded-md p-3 text-start focus-visible:outline-2"
                    >
                      <span className="text-muted-foreground block font-mono text-[10px]">
                        RUN / 00{index + 1}
                      </span>
                      <span className="mt-1 block text-sm font-medium">
                        {run}
                      </span>
                    </button>
                  ))}
              </div>
              {!runs.some((run) =>
                run.toLowerCase().includes(query.toLowerCase()),
              ) && (
                <p className="text-muted-foreground py-5 text-sm">
                  No matching workflows.
                </p>
              )}
            </div>
          ),
        },
        {
          id: "detail",
          title: "Run details",
          description: selected,
          defaultSize: "68%",
          minSize: "35%",
          actions: (
            <button
              type="button"
              onClick={() => setPaused(!paused)}
              className="text-primary min-h-8 rounded px-2 text-xs font-medium focus-visible:outline-2"
            >
              {paused ? "Resume" : "Pause"}
            </button>
          ),
          children: (
            <div className="h-full min-h-52">
              <ResizablePanelGroup orientation="vertical">
                <ResizablePanel
                  id="run-summary"
                  defaultSize="60%"
                  minSize="30%"
                >
                  <ResizablePanelHeader>
                    <span>{selected}</span>
                    <Badge variant="soft">
                      {paused ? "Paused" : "Healthy"}
                    </Badge>
                  </ResizablePanelHeader>
                  <ResizablePanelBody>
                    <p className="text-muted-foreground text-xs tracking-wider uppercase">
                      Execution overview
                    </p>
                    <p className="mt-3 text-3xl font-semibold tabular-nums">
                      1,284{" "}
                      <span className="text-muted-foreground text-sm font-normal">
                        records processed
                      </span>
                    </p>
                    <ol className="mt-5 space-y-3 text-sm">
                      {[
                        "Fetch source records",
                        "Validate and reconcile",
                        "Publish updated accounts",
                      ].map((step, index) => (
                        <li key={step} className="flex gap-3">
                          <span className="text-primary font-mono text-xs">
                            0{index + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </ResizablePanelBody>
                </ResizablePanel>
                <ResizableHandle aria-label="Execution overview" />
                <ResizablePanel id="run-events" minSize="20%">
                  <ResizablePanelHeader>Event stream</ResizablePanelHeader>
                  <ResizablePanelBody>
                    <div className="space-y-2 font-mono text-[11px] leading-relaxed">
                      <p className="text-muted-foreground">
                        09:41:00 · Connected to source
                      </p>
                      <p className="text-muted-foreground">
                        09:41:02 · Validation complete
                      </p>
                      <p className="text-primary">
                        09:41:04 ·{" "}
                        {paused
                          ? "Execution paused by operator"
                          : "All records synchronized"}
                      </p>
                    </div>
                  </ResizablePanelBody>
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          ),
        },
      ]}
    />
  );
}
