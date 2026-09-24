"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowDown,
  ArrowRight,
  Bot,
  Check,
  FileText,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  AvatarGroup,
  Badge,
  Button,
  Card,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  IconButton,
  LiveRegion,
  Progress,
  Steps,
  Tabs,
} from "@dethink/components";
import { formaAgents, type FormaAgentId } from "./forma-ai-data";

type RunPhase = "idle" | "running" | "review" | "complete";

export function FormaAgentLab({ motionEnabled }: { motionEnabled: boolean }) {
  const [agentId, setAgentId] = useState<FormaAgentId>("research");
  const [phase, setPhase] = useState<RunPhase>("idle");
  const [stage, setStage] = useState(0);
  const agent = formaAgents.find((item) => item.id === agentId)!;
  useEffect(() => {
    if (phase !== "running") return;
    const timer = window.setTimeout(() => {
      if (stage < 2) setStage((current) => current + 1);
      else setPhase("review");
    }, 650);
    return () => window.clearTimeout(timer);
  }, [phase, stage, agentId]);

  function reset() {
    setPhase("idle");
    setStage(0);
  }
  const ready = phase === "review" || phase === "complete";
  const status =
    phase === "idle"
      ? "Choose a sample and see what happens."
      : phase === "running"
        ? agent.stages[stage]
        : phase === "review"
          ? "Ready for your review. You make the final call."
          : "Approved. Sample run complete — nothing was sent.";
  const progress =
    phase === "idle"
      ? 0
      : phase === "complete"
        ? 100
        : phase === "review"
          ? 75
          : (stage + 1) * 20;
  return (
    <Card
      className="sc-forma-canvas bg-background border-border rounded-2xl p-4 shadow-sm sm:p-6"
      shadow="none"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-[9px] font-semibold tracking-[0.13em] uppercase">
            Built around your business
          </p>
          <h2 className="mt-2 text-2xl font-medium tracking-[-0.05em] sm:text-3xl">
            See an idea become impact.
          </h2>
          <p className="text-muted-foreground mt-2 text-xs leading-5">
            A glimpse of agents, tools and people working together.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            leftIcon={<Play />}
            disabled={phase === "running" || phase === "review"}
            variant="soft"
            onClick={() => {
              setStage(0);
              setPhase("running");
            }}
            className="text-xs"
          >
            {phase === "complete"
              ? "Run again"
              : phase === "running"
                ? "Running sample"
                : "Run sample"}
          </Button>
          <IconButton
            aria-label="Reset sample"
            variant="outline"
            onClick={reset}
          >
            <RotateCcw aria-hidden="true" />
          </IconButton>
        </div>
      </div>
      <Tabs
        value={agentId}
        onValueChange={(value) => {
          setAgentId(value as FormaAgentId);
          reset();
        }}
        variant="line"
        motionPreset={motionEnabled ? "subtle" : "none"}
        className="mt-5"
      >
        <Tabs.List
          aria-label="Agent workflow scenarios"
          className="max-w-full flex-wrap"
        >
          {formaAgents.map((item) => (
            <Tabs.Trigger key={item.id} value={item.id} className="text-xs">
              {item.name}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        {formaAgents.map((item) => (
          <Tabs.Panel key={item.id} value={item.id} className="pt-5">
            <div
              aria-label={`${item.name} workflow`}
              role="group"
              className="grid items-stretch gap-2 md:grid-cols-[minmax(0,1fr)_1.5rem_minmax(0,1fr)_1.5rem_minmax(0,1fr)]"
            >
              <Card
                as="section"
                aria-label="Workflow input"
                className="bg-background/95 rounded-xl p-4"
                shadow="none"
              >
                <p className="flex items-center gap-2 text-[10px] font-semibold">
                  <span className="bg-primary text-primary-foreground flex size-4 items-center justify-center rounded-full text-[8px]">
                    1
                  </span>
                  Input
                </p>
                <span className="text-primary bg-primary/10 mt-5 mb-4 flex size-11 items-center justify-center rounded-xl">
                  <FileText aria-hidden="true" className="size-5" />
                </span>
                <h3 className="text-sm font-medium">A new possibility</h3>
                <p className="text-muted-foreground mt-2 min-h-16 text-xs leading-5">
                  {item.input}
                </p>
                <div className="border-border bg-muted/40 mt-auto rounded-lg border p-2.5 text-[10px]">
                  {item.source}
                </div>
              </Card>
              <div
                aria-hidden="true"
                className="text-primary/60 flex items-center justify-center"
              >
                <ArrowRight className="hidden size-5 md:block" />
                <ArrowDown className="size-4 md:hidden" />
              </div>
              <Card
                as="section"
                aria-label="Agent processing"
                className="border-primary/25 bg-background/95 rounded-xl p-4"
                shadow="none"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="flex items-center gap-2 text-[10px] font-semibold">
                    <span className="bg-primary text-primary-foreground flex size-4 items-center justify-center rounded-full text-[8px]">
                      2
                    </span>
                    {item.name} agent
                  </p>
                  <Badge
                    size="xs"
                    tone={ready ? "success" : "primary"}
                    variant="soft"
                  >
                    {phase === "running"
                      ? "Working"
                      : ready
                        ? "Prepared"
                        : "Ready"}
                  </Badge>
                </div>
                <div className="my-5 flex items-center gap-3">
                  <motion.div
                    data-forma-agent-mark
                    animate={
                      motionEnabled && phase === "running"
                        ? { scale: [1, 1.08, 1], rotate: [0, -5, 0] }
                        : { scale: 1, rotate: 0 }
                    }
                    transition={
                      motionEnabled
                        ? {
                            duration: 1.3,
                            repeat: phase === "running" ? Infinity : 0,
                          }
                        : { duration: 0 }
                    }
                    className="text-primary bg-primary/10 flex size-12 shrink-0 items-center justify-center rounded-[40%]"
                  >
                    <Bot aria-hidden="true" className="size-6" />
                  </motion.div>
                  <p className="text-xs font-medium">
                    Context in.
                    <br />
                    <span className="text-muted-foreground">Clarity out.</span>
                  </p>
                </div>
                <Steps
                  aria-label="Preparation steps"
                  orientation="vertical"
                  size="sm"
                  interactive={false}
                  motionPreset={motionEnabled ? "subtle" : "none"}
                  value={phase === "idle" || ready ? undefined : `${stage}`}
                  items={item.stages.map((label, index) => ({
                    id: `${index}`,
                    label,
                    status:
                      ready || (phase === "running" && index < stage)
                        ? "complete"
                        : "upcoming",
                  }))}
                  className="text-xs [&_[data-slot=steps-label]]:text-[10px]"
                />
              </Card>
              <div
                aria-hidden="true"
                className="text-primary/60 flex items-center justify-center"
              >
                <ArrowRight className="hidden size-5 md:block" />
                <ArrowDown className="size-4 md:hidden" />
              </div>
              <Card
                as="section"
                aria-label="Workflow output"
                className="bg-background/95 rounded-xl p-4"
                shadow="none"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="flex items-center gap-2 text-[10px] font-semibold">
                    <span className="bg-primary text-primary-foreground flex size-4 items-center justify-center rounded-full text-[8px]">
                      3
                    </span>
                    Your next step
                  </p>
                  {phase === "complete" && (
                    <Badge tone="success" size="xs">
                      Approved
                    </Badge>
                  )}
                </div>
                <span className="text-primary bg-primary/10 mt-5 mb-4 flex size-11 items-center justify-center rounded-xl">
                  <ShieldCheck aria-hidden="true" className="size-5" />
                </span>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={ready ? "ready" : "waiting"}
                    initial={{
                      opacity: motionEnabled ? 0 : 1,
                      y: motionEnabled ? 5 : 0,
                    }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: motionEnabled ? 0 : 1, y: 0 }}
                    transition={{ duration: motionEnabled ? 0.18 : 0 }}
                  >
                    <h3 className="text-sm font-medium">
                      {ready
                        ? item.outputTitle
                        : "Good work starts with a clear brief."}
                    </h3>
                    <p className="text-muted-foreground mt-2 text-xs leading-5">
                      {ready
                        ? "The draft is prepared. Read the output and sample context before approving."
                        : "Run the sample to follow an idea from input to a reviewable outcome."}
                    </p>
                  </motion.div>
                </AnimatePresence>
                <Dialog>
                  <DialogTrigger
                    isDisabled={!ready}
                    variant="outline"
                    className="mt-5 h-auto! w-full justify-between px-3 py-2.5 text-[11px]"
                  >
                    {phase === "complete"
                      ? "View approved output"
                      : "Review output"}
                    <ArrowRight aria-hidden="true" className="size-3" />
                  </DialogTrigger>
                  <DialogContent className="sc-forma-theme" size="md">
                    <DialogHeader>
                      <Badge tone="primary" size="sm" className="w-fit">
                        {item.name} sample
                      </Badge>
                      <DialogTitle>{item.outputTitle}</DialogTitle>
                      <DialogDescription>
                        A deterministic example, prepared locally. This is not a
                        live AI response.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-5 px-6 pb-5">
                      <p className="text-sm leading-7">{item.output}</p>
                      <div>
                        <h3 className="mb-2 text-xs font-semibold">
                          Sample context
                        </h3>
                        <ul className="text-muted-foreground space-y-2 text-xs">
                          {item.evidence.map((source) => (
                            <li
                              key={source}
                              className="flex items-center gap-2"
                            >
                              <FileText aria-hidden="true" className="size-3" />
                              {source}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <p className="bg-muted rounded-lg p-3 text-xs leading-5">
                        {item.boundary}
                      </p>
                    </div>
                    <DialogFooter>
                      <DialogClose variant="outline">Back to lab</DialogClose>
                      {phase === "review" && (
                        <DialogClose onPress={() => setPhase("complete")}>
                          Approve sample output
                        </DialogClose>
                      )}
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </Card>
            </div>
          </Tabs.Panel>
        ))}
      </Tabs>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-2">
          <span aria-hidden="true" className="text-primary">
            {phase === "complete" ? (
              <Check className="size-3.5" />
            ) : (
              <Sparkles className="size-3.5" />
            )}
          </span>
          <p
            className="text-muted-foreground text-[11px]"
            data-forma-run-status
          >
            {status}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AvatarGroup
            label="Sample review team"
            members={[
              { id: "design", name: "Design" },
              { id: "engineering", name: "Engineering" },
              { id: "you", name: "You" },
            ]}
            size="xs"
            motion="none"
            max={3}
            reveal="names"
          />
          <span className="text-muted-foreground text-[9px]">
            People stay in the loop
          </span>
        </div>
      </div>
      <Progress
        value={progress}
        aria-label="Sample workflow progress"
        size="sm"
        className="mt-4"
      />
      <LiveRegion>{phase === "idle" ? "" : status}</LiveRegion>
    </Card>
  );
}
