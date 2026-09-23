"use client";

import { useRef, useState } from "react";
import {
  ArrowUpRight,
  Bookmark,
  Check,
  Clock3,
  Sparkles,
  Undo2,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardStackAnimated,
  CardTitle,
} from "@dethink/components";

const findings = [
  {
    title: "Make the first step obvious",
    category: "Activation",
    summary:
      "New members may need a clearer route from an empty workspace to their first useful result.",
    evidence:
      "Four of six sample interviews mentioned uncertainty after creating a workspace.",
    uncertainty:
      "Small, fictional sample. Validate with real onboarding sessions.",
    action: "Prototype a first-project checklist",
    confidence: "Directional signal",
  },
  {
    title: "Keep the source in sight",
    category: "Trust",
    summary:
      "A concise answer becomes more useful when readers can inspect the evidence behind it.",
    evidence: "Three sample reviewers asked where a recommendation came from.",
    uncertainty:
      "Interview feedback does not establish whether citations improve task success.",
    action: "Test an evidence drawer",
    confidence: "Needs validation",
  },
  {
    title: "Let decisions be reversible",
    category: "Workflow",
    summary:
      "A lightweight undo can make a review queue feel safer without adding a confirmation to every action.",
    evidence:
      "Two sample reviewers deferred a decision because they feared losing the item.",
    uncertainty:
      "Validate recovery expectations before applying this to destructive actions.",
    action: "Test save, defer, and undo",
    confidence: "Working hypothesis",
  },
];

export function CardStackBriefing() {
  const evidence = useRef<HTMLDetailsElement>(null);
  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="text-primary flex items-center gap-2 font-medium">
          <Sparkles className="size-4" aria-hidden="true" /> Research briefing
        </span>
        <span className="text-muted-foreground">
          Fictional sample · 3 findings
        </span>
      </div>
      <CardStackAnimated
        swipe
        aria-label="Research briefing"
        getCardLabel={(index) => findings[index]?.title ?? ""}
      >
        {findings.map((finding, index) => (
          <Card key={finding.title} className="overflow-hidden">
            <div
              className="bg-primary/10 border-border flex h-24 items-end justify-between border-b px-6 pb-4"
              aria-hidden="true"
            >
              <span className="text-primary/40 text-5xl font-light tracking-tighter">
                0{index + 1}
              </span>
              <span className="text-primary text-xs font-medium tracking-widest uppercase">
                {finding.category}
              </span>
            </div>
            <CardHeader>
              <p className="text-muted-foreground text-xs">
                {finding.confidence}
              </p>
              <CardTitle>{finding.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-6">
              <p>{finding.summary}</p>
              <a
                href={`#briefing-evidence-${index}`}
                onClick={() => {
                  if (evidence.current) evidence.current.open = true;
                }}
                className="text-primary inline-flex items-center gap-1 underline underline-offset-4"
              >
                Inspect sample evidence{" "}
                <ArrowUpRight className="size-3.5" aria-hidden="true" />
              </a>
              <p className="text-muted-foreground border-border border-t pt-3 text-xs leading-5">
                {finding.uncertainty}
              </p>
            </CardContent>
          </Card>
        ))}
      </CardStackAnimated>
      <details className="border-border rounded-lg border p-4 text-sm" open>
        <summary className="cursor-pointer font-medium">
          Evidence notebook
        </summary>
        <div className="mt-4 space-y-4">
          {findings.map((finding, index) => (
            <section
              key={finding.title}
              id={`briefing-evidence-${index}`}
              tabIndex={-1}
              className="scroll-mt-24"
            >
              <h4 className="font-medium">
                0{index + 1} · {finding.category}
              </h4>
              <p className="text-muted-foreground mt-1 leading-6">
                {finding.evidence}
              </p>
            </section>
          ))}
        </div>
      </details>
    </div>
  );
}

type Decision = { id: string; outcome: "saved" | "deferred" };

export function CardStackReviewQueue() {
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [announcement, setAnnouncement] = useState("");
  const completion = useRef<HTMLHeadingElement>(null);
  const deck = useRef<HTMLDivElement>(null);
  const pending = findings.filter(
    (item) => !decisions.some((decision) => decision.id === item.title),
  );
  const saved = decisions.filter(
    (decision) => decision.outcome === "saved",
  ).length;
  function decide(id: string, outcome: Decision["outcome"]) {
    setDecisions((current) => [...current, { id, outcome }]);
    setAnnouncement(`${id} ${outcome}.`);
    if (pending.length === 1)
      requestAnimationFrame(() => completion.current?.focus());
  }
  function restore(all = false) {
    setDecisions((current) => (all ? [] : current.slice(0, -1)));
    setAnnouncement(all ? "Queue restarted." : "Last decision undone.");
    requestAnimationFrame(() => deck.current?.focus());
  }
  return (
    <div className="w-full space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <span className="text-muted-foreground">
          {decisions.length} of {findings.length} reviewed
        </span>
        <Button
          variant="ghost"
          size="sm"
          disabled={!decisions.length}
          onClick={() => restore()}
          leftIcon={<Undo2 className="size-3.5" aria-hidden="true" />}
        >
          Undo last
        </Button>
      </div>
      <div
        className="bg-muted h-1 overflow-hidden rounded-full"
        aria-hidden="true"
      >
        <div
          className="bg-primary h-full motion-safe:transition-[width]"
          style={{ width: `${(decisions.length / findings.length) * 100}%` }}
        />
      </div>
      {pending.length ? (
        <CardStackAnimated
          ref={deck}
          aria-label="Review queue"
          loop={false}
          getCardLabel={(index) => pending[index]?.title ?? ""}
        >
          {pending.map((finding) => (
            <Card key={finding.title}>
              <CardHeader>
                <p className="text-primary text-xs font-medium tracking-widest uppercase">
                  Next experiment · {finding.category}
                </p>
                <CardTitle>{finding.action}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground text-sm leading-6">
                  {finding.summary}
                </p>
                <label className="text-muted-foreground grid gap-2 text-xs">
                  Review note
                  <input
                    className="border-input bg-background text-foreground focus-visible:ring-ring min-w-0 rounded-md border px-3 py-2 text-sm focus-visible:ring-2"
                    placeholder="Add context for your team"
                    value={notes[finding.title] ?? ""}
                    onChange={(event) =>
                      setNotes((current) => ({
                        ...current,
                        [finding.title]: event.target.value,
                      }))
                    }
                  />
                </label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => decide(finding.title, "saved")}
                    leftIcon={
                      <Bookmark className="size-4" aria-hidden="true" />
                    }
                  >
                    Save idea
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => decide(finding.title, "deferred")}
                    leftIcon={<Clock3 className="size-4" aria-hidden="true" />}
                  >
                    Defer
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardStackAnimated>
      ) : (
        <div className="border-border bg-muted/30 flex min-h-72 flex-col items-center justify-center gap-4 rounded-xl border p-6 text-center">
          <span className="bg-primary/10 text-primary grid size-12 place-items-center rounded-full">
            <Check aria-hidden="true" />
          </span>
          <h3 ref={completion} tabIndex={-1} className="text-xl font-semibold">
            Review complete
          </h3>
          <p className="text-muted-foreground text-sm">
            {saved} saved · {decisions.length - saved} deferred. All changes
            stayed in this demo.
          </p>
          <Button variant="outline" onClick={() => restore(true)}>
            Restart queue
          </Button>
        </div>
      )}
      <p className="text-muted-foreground text-xs leading-5">
        Fictional ideas. Decisions are local and reversible. Swiping never saves
        or defers an item.
      </p>
      <p className="sr-only" role="status">
        {announcement}
      </p>
    </div>
  );
}
