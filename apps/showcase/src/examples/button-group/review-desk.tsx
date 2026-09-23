"use client";

import { useState } from "react";
import { Button, ButtonGroup, IconButton } from "@dethink/components";
import { ArrowRight, Check, MessageSquare, Layers } from "lucide-react";

const documents = [
  "New onboarding flow",
  "Workspace permissions",
  "Billing overview",
];

export function ButtonGroupReviewDesk() {
  const [index, setIndex] = useState(0);
  const [decisions, setDecisions] = useState<Record<number, string>>({});
  const decision = decisions[index];
  return (
    <div className="border-border bg-background mx-auto w-full max-w-lg overflow-hidden rounded-2xl border shadow-sm">
      <div className="border-border flex items-center justify-between gap-3 border-b px-5 py-4">
        <span className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
          <Layers className="size-4" aria-hidden="true" /> Design review
        </span>
        <span className="text-muted-foreground text-xs tabular-nums">
          0{index + 1} / 03
        </span>
      </div>
      <div className="p-5 sm:p-7">
        <div
          aria-hidden="true"
          className="bg-primary/5 border-primary/10 mb-6 flex h-36 items-center justify-center rounded-xl border"
        >
          <div className="flex -space-x-3">
            {["A", "B", "C"].map((letter, i) => (
              <div
                key={letter}
                className={`border-background flex size-16 items-center justify-center rounded-2xl border-4 text-lg font-semibold shadow-sm ${i === index ? "bg-primary text-primary-foreground relative z-10" : "bg-muted text-muted-foreground"}`}
              >
                {letter}
              </div>
            ))}
          </div>
        </div>
        <p className="text-muted-foreground text-[10px] font-medium tracking-[0.16em] uppercase">
          Ready for your eyes
        </p>
        <h3 className="mt-2 text-xl font-semibold tracking-tight">
          {documents[index]}
        </h3>
        <p className="text-muted-foreground mt-2 text-sm leading-6">
          A few considered details. One clear next step.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <ButtonGroup aria-label="Review decision">
            <Button
              size="sm"
              leftIcon={<Check />}
              disabled={decision === "Approved"}
              onClick={() =>
                setDecisions((previous) => ({
                  ...previous,
                  [index]: "Approved",
                }))
              }
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<MessageSquare />}
              disabled={decision === "Changes requested"}
              onClick={() =>
                setDecisions((previous) => ({
                  ...previous,
                  [index]: "Changes requested",
                }))
              }
            >
              Changes
            </Button>
          </ButtonGroup>
          <IconButton
            size="sm"
            variant="outline"
            aria-label="Next document"
            onClick={() =>
              setIndex((previous) => (previous + 1) % documents.length)
            }
          >
            <ArrowRight />
          </IconButton>
        </div>
        <p role="status" className="text-muted-foreground mt-4 min-h-5 text-xs">
          {decision
            ? `${documents[index]}: ${decision}.`
            : "Choose a decision, or move to the next document."}
        </p>
      </div>
    </div>
  );
}
