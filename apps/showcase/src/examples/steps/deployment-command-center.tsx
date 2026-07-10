"use client";

import { useState } from "react";
import { Badge, Button, Steps, type StepItemData } from "@dethink/components";
import {
  Activity,
  CheckCircle2,
  CircleDot,
  CloudCog,
  Gauge,
  GitCommitHorizontal,
  RefreshCw,
  RotateCcw,
  ServerCog,
  ShieldCheck,
} from "lucide-react";

type DeploymentStepMeta = {
  detail: string;
};

const baseDeploymentItems: StepItemData<DeploymentStepMeta>[] = [
  {
    id: "build",
    label: "Build",
    description: "Image signed",
    status: "complete",
    data: { detail: "sha256:8af3 · 182 MB" },
  },
  {
    id: "tests",
    label: "Tests",
    description: "428 checks",
    status: "complete",
    data: { detail: "Unit, integration, and policy suites passed" },
  },
  {
    id: "verify",
    label: "Health gate",
    description: "Observe baseline",
    data: { detail: "Compare error rate and latency against production" },
  },
  {
    id: "canary",
    label: "Canary",
    description: "10% traffic",
    data: { detail: "Route a small cohort to the new release" },
  },
  {
    id: "observe",
    label: "Observation",
    description: "15 minute hold",
    optional: true,
    data: { detail: "Watch SLOs before global promotion" },
  },
  {
    id: "rollout",
    label: "Global",
    description: "100% traffic",
    data: { detail: "Complete the production rollout" },
  },
];

const metrics = [
  { label: "Error rate", value: "1.8%", baseline: "0.7%" },
  { label: "p95 latency", value: "486 ms", baseline: "320 ms" },
  { label: "Healthy pods", value: "11 / 12", baseline: "12 / 12" },
];

export function StepsDeploymentCommandCenter() {
  const [current, setCurrent] = useState("verify");
  const [recovered, setRecovered] = useState(false);
  const [observationSkipped, setObservationSkipped] = useState(false);
  const [announcement, setAnnouncement] = useState(
    "Health gate blocked by elevated latency.",
  );

  const items = baseDeploymentItems.map((item) => {
    if (item.id === "verify" && !recovered) {
      return { ...item, status: "error" as const };
    }

    if (item.id === "observe" && observationSkipped) {
      return { ...item, status: "skipped" as const };
    }

    if (["canary", "observe", "rollout"].includes(item.id) && !recovered) {
      return { ...item, disabled: true };
    }

    return item;
  });

  const currentItem = items.find((item) => item.id === current);
  const isCanary = current === "canary";
  const isObservation = current === "observe";
  const isGlobal = current === "rollout";

  function reset() {
    setCurrent("verify");
    setRecovered(false);
    setObservationSkipped(false);
    setAnnouncement("Health gate blocked by elevated latency.");
  }

  return (
    <div className="border-border bg-background overflow-hidden rounded-2xl border shadow-sm">
      <header className="border-border bg-muted/25 flex flex-wrap items-start justify-between gap-4 border-b px-5 py-4 sm:px-6">
        <div className="flex items-start gap-3">
          <span className="bg-primary/10 text-primary grid size-10 shrink-0 place-items-center rounded-xl">
            <CloudCog aria-hidden="true" className="size-5" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-heading text-base font-semibold">
                checkout-api
              </h3>
              <Badge size="xs" variant="outline">
                production
              </Badge>
              <Badge
                size="xs"
                tone={recovered ? "success" : "destructive"}
                variant="soft"
                leadingIcon={
                  recovered ? (
                    <CheckCircle2 aria-hidden="true" />
                  ) : (
                    <CircleDot aria-hidden="true" />
                  )
                }
              >
                {recovered ? "Healthy" : "Gate blocked"}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1 text-sm">
              Release 2026.07.09 · commit 9d42f7a
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          leftIcon={<RotateCcw aria-hidden="true" />}
          onClick={reset}
        >
          Reset incident
        </Button>
      </header>

      <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(15rem,0.72fr)_minmax(0,1.28fr)]">
        <Steps<DeploymentStepMeta>
          interactive
          showProgress
          aria-label="Production deployment"
          orientation="vertical"
          items={items}
          value={current}
          onValueChange={(value) => {
            setCurrent(value);
            setAnnouncement(`Opened ${value} deployment stage.`);
          }}
          formatProgress={(percentage) => `${Math.round(percentage)}% rollout`}
        />

        <section
          aria-labelledby="deployment-stage-title"
          className="border-border bg-muted/25 min-w-0 rounded-xl border p-4 sm:p-5"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-primary text-xs font-semibold tracking-[0.12em] uppercase">
                Active stage
              </p>
              <h4
                id="deployment-stage-title"
                className="font-heading mt-1 text-xl font-semibold"
              >
                {currentItem?.label}
              </h4>
              <p className="text-muted-foreground mt-1 text-sm">
                {currentItem?.data?.detail}
              </p>
            </div>
            <Badge
              tone={
                !recovered && current === "verify"
                  ? "destructive"
                  : isGlobal
                    ? "success"
                    : "primary"
              }
              variant="soft"
            >
              {!recovered && current === "verify"
                ? "Action required"
                : isGlobal
                  ? "Ready to complete"
                  : "In progress"}
            </Badge>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="border-border bg-background rounded-lg border p-3"
              >
                <p className="text-muted-foreground text-xs">{metric.label}</p>
                <p className="mt-1 text-lg font-semibold tabular-nums">
                  {recovered ? metric.baseline : metric.value}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  baseline {metric.baseline}
                </p>
              </div>
            ))}
          </div>

          <div className="border-border bg-background mt-4 rounded-lg border p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              {current === "verify" ? (
                <Activity aria-hidden="true" className="text-primary size-4" />
              ) : current === "canary" ? (
                <Gauge aria-hidden="true" className="text-primary size-4" />
              ) : current === "rollout" ? (
                <ServerCog aria-hidden="true" className="text-primary size-4" />
              ) : (
                <GitCommitHorizontal
                  aria-hidden="true"
                  className="text-primary size-4"
                />
              )}
              Operator action
            </div>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              {!recovered && current === "verify"
                ? "A cold cache caused the latency spike. Retry the health gate after the warm-up window."
                : current === "verify"
                  ? "Metrics returned to baseline. The canary destination is now enabled."
                  : isCanary
                    ? "Canary metrics are stable. Continue to the observation hold or explicitly skip it."
                    : isObservation
                      ? "Hold traffic at 10% while the final SLO window completes."
                      : isGlobal
                        ? "All gates passed. Promote the release to every production pod."
                        : "Review the completed stage or choose another enabled destination."}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {!recovered && current === "verify" ? (
                <Button
                  size="sm"
                  leftIcon={<RefreshCw aria-hidden="true" />}
                  onClick={() => {
                    setRecovered(true);
                    setAnnouncement(
                      "Health gate recovered. Canary stage enabled.",
                    );
                  }}
                >
                  Retry health gate
                </Button>
              ) : current === "verify" ? (
                <Button
                  size="sm"
                  rightIcon={<Gauge aria-hidden="true" />}
                  onClick={() => {
                    setCurrent("canary");
                    setAnnouncement(
                      "Canary deployment started at 10% traffic.",
                    );
                  }}
                >
                  Start canary
                </Button>
              ) : isCanary ? (
                <>
                  <Button
                    size="sm"
                    onClick={() => {
                      setCurrent("observe");
                      setObservationSkipped(false);
                      setAnnouncement("Observation hold started.");
                    }}
                  >
                    Begin observation
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setObservationSkipped(true);
                      setCurrent("rollout");
                      setAnnouncement(
                        "Optional observation skipped. Global stage opened.",
                      );
                    }}
                  >
                    Skip optional hold
                  </Button>
                </>
              ) : isObservation ? (
                <Button
                  size="sm"
                  rightIcon={<ServerCog aria-hidden="true" />}
                  onClick={() => {
                    setCurrent("rollout");
                    setAnnouncement(
                      "Observation complete. Global stage opened.",
                    );
                  }}
                >
                  Complete hold
                </Button>
              ) : isGlobal ? (
                <Button
                  size="sm"
                  leftIcon={<ShieldCheck aria-hidden="true" />}
                  onClick={() =>
                    setAnnouncement("Global rollout approved and queued.")
                  }
                >
                  Promote globally
                </Button>
              ) : null}
            </div>
          </div>

          <p aria-live="polite" className="text-muted-foreground mt-4 text-sm">
            {announcement}
          </p>
        </section>
      </div>
    </div>
  );
}
