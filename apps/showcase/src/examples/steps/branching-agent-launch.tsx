"use client";

import { useState } from "react";
import { Badge, Button, Steps, type StepItemData } from "@dethink/components";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  BrainCircuit,
  CheckCircle2,
  KeyRound,
  LockKeyhole,
  Rocket,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";

type RolloutPolicy = "guarded" | "sandbox";

type AgentStepMeta = {
  eyebrow: string;
  panelTitle: string;
  panelDescription: string;
};

const sharedItems: StepItemData<AgentStepMeta>[] = [
  {
    id: "objective",
    label: "Objective",
    description: "Define the job.",
    icon: <Sparkles aria-hidden="true" className="size-4" />,
    data: {
      eyebrow: "Agent brief",
      panelTitle: "Resolve billing questions",
      panelDescription:
        "The agent can explain invoices, retrieve account context, and draft a response for the support team.",
    },
  },
  {
    id: "context",
    label: "Knowledge",
    description: "Connect sources.",
    icon: <BrainCircuit aria-hidden="true" className="size-4" />,
    data: {
      eyebrow: "Grounding",
      panelTitle: "Three trusted sources connected",
      panelDescription:
        "Billing policy, invoice events, and the customer profile are available to the agent at run time.",
    },
  },
  {
    id: "policy",
    label: "Policy",
    description: "Choose guardrails.",
    icon: <ShieldCheck aria-hidden="true" className="size-4" />,
    data: {
      eyebrow: "Decision point",
      panelTitle: "How should this agent be released?",
      panelDescription:
        "The answer changes only the next and future steps. Policy remains current while the branch is replaced.",
    },
  },
];

const guardedBranch: StepItemData<AgentStepMeta>[] = [
  {
    id: "security",
    label: "Security",
    description: "Review tool access.",
    icon: <LockKeyhole aria-hidden="true" className="size-4" />,
    data: {
      eyebrow: "Guarded rollout",
      panelTitle: "Review sensitive tool access",
      panelDescription:
        "Security confirms that invoice lookup is read-only and that payment changes always require a person.",
    },
  },
  {
    id: "approval",
    label: "Approval",
    description: "Human sign-off.",
    icon: <KeyRound aria-hidden="true" className="size-4" />,
    data: {
      eyebrow: "Guarded rollout",
      panelTitle: "Support lead approval",
      panelDescription:
        "A support lead reviews the dry-run transcript before the agent can answer live conversations.",
    },
  },
  {
    id: "launch",
    label: "Launch",
    description: "Release gradually.",
    icon: <Rocket aria-hidden="true" className="size-4" />,
    data: {
      eyebrow: "Ready",
      panelTitle: "Launch to 10% of billing conversations",
      panelDescription:
        "Monitor handoff rate and answer quality before increasing traffic.",
    },
  },
];

const sandboxBranch: StepItemData<AgentStepMeta>[] = [
  {
    id: "dry-run",
    label: "Dry run",
    description: "Test with fixtures.",
    icon: <Wrench aria-hidden="true" className="size-4" />,
    data: {
      eyebrow: "Sandbox path",
      panelTitle: "Run the evaluation set",
      panelDescription:
        "The agent answers 50 synthetic billing cases without access to live customer conversations.",
    },
  },
  {
    id: "launch",
    label: "Launch",
    description: "Enable sandbox.",
    icon: <Rocket aria-hidden="true" className="size-4" />,
    data: {
      eyebrow: "Ready",
      panelTitle: "Open the team sandbox",
      panelDescription:
        "Invite the support team to test prompts and flag responses before a guarded production rollout.",
    },
  },
];

function getItems(policy: RolloutPolicy) {
  return [
    ...sharedItems,
    ...(policy === "guarded" ? guardedBranch : sandboxBranch),
  ];
}

export function StepsBranchingAgentLaunch() {
  const [policy, setPolicy] = useState<RolloutPolicy>("guarded");
  const [current, setCurrent] = useState("policy");
  const [launched, setLaunched] = useState(false);
  const items = getItems(policy);
  const currentIndex = items.findIndex((item) => item.id === current);
  const currentItem = items[currentIndex];
  const isFirst = currentIndex <= 0;
  const isLast = currentIndex === items.length - 1;

  function selectPolicy(nextPolicy: RolloutPolicy) {
    setPolicy(nextPolicy);
    setLaunched(false);
  }

  function selectStep(nextValue: string) {
    setCurrent(nextValue);
    setLaunched(false);
  }

  function goBack() {
    const previous = items[currentIndex - 1];
    if (previous) {
      selectStep(previous.id);
    }
  }

  function goForward() {
    const next = items[currentIndex + 1];
    if (next) {
      selectStep(next.id);
      return;
    }

    setLaunched(true);
  }

  return (
    <div className="border-border bg-background overflow-hidden rounded-2xl border shadow-sm">
      <header className="border-border bg-muted/25 flex flex-wrap items-start justify-between gap-4 border-b px-5 py-4 sm:px-6">
        <div className="flex min-w-0 items-start gap-3">
          <span className="bg-primary/10 text-primary grid size-10 shrink-0 place-items-center rounded-xl">
            <Bot aria-hidden="true" className="size-5" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-heading text-base font-semibold">
                Billing copilot
              </h3>
              <Badge
                size="xs"
                tone={launched ? "success" : "primary"}
                variant="soft"
                leadingIcon={
                  launched ? (
                    <CheckCircle2 aria-hidden="true" />
                  ) : (
                    <Sparkles aria-hidden="true" />
                  )
                }
              >
                {launched ? "Queued" : "Draft"}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1 text-sm">
              Configure a grounded support agent, then choose its release path.
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          leftIcon={<RotateCcw aria-hidden="true" />}
          onClick={() => {
            setPolicy("guarded");
            setCurrent("policy");
            setLaunched(false);
          }}
        >
          Reset
        </Button>
      </header>

      <div className="grid gap-6 p-5 sm:p-6">
        <Steps<AgentStepMeta>
          interactive
          showProgress
          aria-label="Agent launch progress"
          items={items}
          motionPreset="expressive"
          value={current}
          onValueChange={selectStep}
          formatProgress={(percentage, context) =>
            `${context.currentIndex + 1} of ${context.count} · ${Math.round(percentage)}%`
          }
        />

        <section
          aria-labelledby="agent-step-panel-title"
          className="border-border bg-muted/30 rounded-xl border p-4 sm:p-5"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="max-w-2xl">
              <p className="text-primary text-xs font-semibold tracking-[0.12em] uppercase">
                {currentItem?.data?.eyebrow}
              </p>
              <h4
                id="agent-step-panel-title"
                className="font-heading mt-1 text-lg font-semibold"
              >
                {currentItem?.data?.panelTitle}
              </h4>
              <p className="text-muted-foreground mt-2 text-sm leading-6">
                {currentItem?.data?.panelDescription}
              </p>
            </div>
            <Badge size="sm" variant="outline">
              {policy === "guarded" ? "Production guardrails" : "Sandbox only"}
            </Badge>
          </div>

          {current === "policy" ? (
            <div
              role="group"
              aria-label="Agent rollout policy"
              className="mt-5 grid gap-3 sm:grid-cols-2"
            >
              <button
                type="button"
                aria-pressed={policy === "guarded"}
                className="border-border bg-background focus-visible:ring-ring aria-pressed:border-primary aria-pressed:bg-primary/5 rounded-lg border p-4 text-start transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                onClick={() => selectPolicy("guarded")}
              >
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <ShieldCheck
                    aria-hidden="true"
                    className="text-primary size-4"
                  />
                  Guarded production
                </span>
                <span className="text-muted-foreground mt-1.5 block text-xs leading-5">
                  Add security review and human approval before a gradual
                  launch.
                </span>
              </button>
              <button
                type="button"
                aria-pressed={policy === "sandbox"}
                className="border-border bg-background focus-visible:ring-ring aria-pressed:border-primary aria-pressed:bg-primary/5 rounded-lg border p-4 text-start transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                onClick={() => selectPolicy("sandbox")}
              >
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <Wrench aria-hidden="true" className="text-primary size-4" />
                  Team sandbox
                </span>
                <span className="text-muted-foreground mt-1.5 block text-xs leading-5">
                  Replace approvals with a fixture-based dry run and sandbox
                  launch.
                </span>
              </button>
            </div>
          ) : current !== "policy" ? (
            <Button
              className="mt-5"
              size="sm"
              variant="soft"
              onClick={() => selectStep("policy")}
            >
              Edit rollout policy
            </Button>
          ) : null}
        </section>
      </div>

      <footer className="border-border bg-muted/20 flex flex-wrap items-center justify-between gap-3 border-t px-5 py-4 sm:px-6">
        <p aria-live="polite" className="text-muted-foreground text-sm">
          {launched
            ? policy === "guarded"
              ? "Guarded rollout queued for review."
              : "Team sandbox is ready to open."
            : "Panels and workflow controls remain consumer-owned."}
        </p>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={isFirst}
            leftIcon={<ArrowLeft aria-hidden="true" />}
            onClick={goBack}
          >
            Back
          </Button>
          <Button
            size="sm"
            rightIcon={
              isLast ? (
                <Rocket aria-hidden="true" />
              ) : (
                <ArrowRight aria-hidden="true" />
              )
            }
            onClick={goForward}
          >
            {isLast ? "Queue launch" : "Continue"}
          </Button>
        </div>
      </footer>
    </div>
  );
}
