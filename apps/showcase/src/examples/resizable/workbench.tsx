"use client";

import { useState } from "react";
import { ResizableWorkspace, Badge } from "@dethink/components";

const sources = [
  {
    title: "Customer interviews",
    kind: "Research · 12 conversations",
    detail:
      "Teams switch between five tools to answer one customer question. Context is lost at every handoff.",
    count: "12 interviews",
  },
  {
    title: "Usage patterns",
    kind: "Analytics · last 30 days",
    detail:
      "Returning users spend most of their time in the review queue. Faster context switching is more valuable than another dashboard.",
    count: "30-day window",
  },
  {
    title: "Product principles",
    kind: "Strategy · working document",
    detail:
      "Make the next action clear. Keep evidence close to the decision. Let people arrange their workspace around the task.",
    count: "3 principles",
  },
];

export function ResizableWorkbench() {
  const [selected, setSelected] = useState(0);
  const [draft, setDraft] = useState(
    "Give every decision its context.\n\nBring customer evidence, discussion and a working draft into one adaptable workspace.",
  );
  const [showEvidence, setShowEvidence] = useState(true);
  return (
    <div className="w-full space-y-4 p-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-muted-foreground text-xs tracking-widest uppercase">
            Fieldnotes / Research studio
          </p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight">
            Room to think.
          </h3>
          <p className="text-muted-foreground mt-1 text-sm">
            Keep the evidence close. Give the draft more space.
          </p>
        </div>
        <Badge variant="soft">Working session</Badge>
      </div>
      <ResizableWorkspace
        id="research-studio"
        label="Product discovery"
        storageKey="dethink-research-layout-v1"
        compactAt={560}
        className="h-[34rem] data-[compact]:h-auto"
        panes={[
          {
            id: "sources",
            title: "Sources",
            description: "A small library of signals",
            defaultSize: "25%",
            minSize: "18%",
            collapsible: true,
            footer: <span>{sources.length} sources · private workspace</span>,
            children: (
              <div className="space-y-2">
                {sources.map((source, index) => (
                  <button
                    type="button"
                    key={source.title}
                    aria-pressed={selected === index}
                    onClick={() => setSelected(index)}
                    className="border-border hover:bg-muted aria-pressed:border-primary/40 aria-pressed:bg-primary/5 focus-visible:outline-ring w-full rounded-lg border border-transparent p-3 text-start focus-visible:outline-2"
                  >
                    <span className="text-muted-foreground mb-3 block font-mono text-[10px]">
                      0{index + 1} / SOURCE
                    </span>
                    <span className="block text-sm font-medium">
                      {source.title}
                    </span>
                    <span className="text-muted-foreground mt-1 block text-xs leading-relaxed">
                      {source.kind}
                    </span>
                  </button>
                ))}
                <p className="text-muted-foreground border-border mt-5 border-t pt-4 text-xs leading-relaxed">
                  Select a source to bring its evidence into the conversation.
                </p>
              </div>
            ),
          },
          {
            id: "conversation",
            title: "Synthesis",
            description: "From signals to a point of view",
            defaultSize: "40%",
            minSize: "25%",
            footer: <span>Grounded in your selected source</span>,
            children: (
              <div className="space-y-6">
                <div className="bg-muted ms-6 rounded-xl rounded-tr-sm p-4 text-sm leading-relaxed">
                  What would make this workspace meaningfully better for our
                  customers?
                </div>
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md text-xs">
                      F
                    </span>
                    <span className="text-xs font-medium">Fieldnotes</span>
                    <span className="text-muted-foreground text-xs">
                      Research assistant
                    </span>
                  </div>
                  <p className="text-sm leading-7">
                    Start with continuity. People should be able to move from
                    evidence to a decision without rebuilding their context.
                  </p>
                  <button
                    type="button"
                    aria-expanded={showEvidence}
                    onClick={() => setShowEvidence(!showEvidence)}
                    className="text-primary my-3 rounded text-xs underline underline-offset-4 focus-visible:outline-2"
                  >
                    {showEvidence ? "Hide evidence" : "Show evidence"}
                  </button>
                  {showEvidence && (
                    <blockquote className="border-primary/40 bg-muted/40 rounded-r-lg border-s-2 p-4">
                      <p className="text-sm leading-relaxed">
                        {sources[selected].detail}
                      </p>
                      <footer className="text-muted-foreground mt-3 text-xs">
                        {sources[selected].title} · {sources[selected].count}
                      </footer>
                    </blockquote>
                  )}
                  <p className="text-muted-foreground mt-4 text-xs leading-relaxed">
                    Try widening the draft, hiding Sources, or focusing a pane.
                    Your draft stays where you left it.
                  </p>
                </div>
              </div>
            ),
          },
          {
            id: "draft",
            title: "Working draft",
            description: "Make the next step concrete",
            defaultSize: "35%",
            minSize: "22%",
            footer: (
              <span className="tabular-nums">
                {draft.trim().split(/\s+/).filter(Boolean).length} words · kept
                in this session
              </span>
            ),
            children: (
              <div className="flex h-full min-h-52 flex-col">
                <label
                  htmlFor="research-draft"
                  className="text-muted-foreground mb-3 text-xs font-medium tracking-wider uppercase"
                >
                  Opportunity statement
                </label>
                <textarea
                  id="research-draft"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  className="focus-visible:ring-ring min-h-40 flex-1 resize-none rounded-lg bg-transparent p-1 text-sm leading-7 outline-none focus-visible:ring-2"
                />
                <p className="text-muted-foreground border-border mt-4 border-t pt-3 text-xs">
                  Draft content is not stored across reloads. Only your pane
                  layout is remembered.
                </p>
              </div>
            ),
          },
        ]}
      />
      <p className="text-muted-foreground text-xs">
        Drag a divider or focus it and use arrow keys. Hide, focus and restore
        without losing your place.
      </p>
    </div>
  );
}
