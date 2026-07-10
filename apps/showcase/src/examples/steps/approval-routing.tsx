"use client";

import { useState } from "react";
import {
  Badge,
  Button,
  Steps,
  type BadgeTone,
  type StepItemData,
  type StepStatus,
} from "@dethink/components";
import {
  ArrowRight,
  Check,
  FileCheck2,
  MessageSquareWarning,
  RotateCcw,
  Send,
  UsersRound,
} from "lucide-react";

type ApprovalMeta = {
  owner: string;
  initials: string;
  role: string;
  due: string;
  note: string;
  checklist: string[];
};

const approvalItems: StepItemData<ApprovalMeta>[] = [
  {
    id: "intake",
    label: "Intake",
    data: {
      owner: "Mina Shah",
      initials: "MS",
      role: "Campaign operations",
      due: "Complete",
      note: "The campaign brief and target audience are locked for review.",
      checklist: ["Brief attached", "Audience defined", "Launch date set"],
    },
  },
  {
    id: "legal",
    label: "Legal",
    data: {
      owner: "Jon Bell",
      initials: "JB",
      role: "Commercial counsel",
      due: "Complete",
      note: "Claims, regional terms, and customer consent language are approved.",
      checklist: ["Claims verified", "Terms linked", "Consent copy approved"],
    },
  },
  {
    id: "security",
    label: "Security",
    data: {
      owner: "Arun Rao",
      initials: "AR",
      role: "Product security",
      due: "Today, 16:00",
      note: "Confirm that the audience export excludes restricted account fields.",
      checklist: [
        "Data classification reviewed",
        "Export scope verified",
        "Retention window documented",
      ],
    },
  },
  {
    id: "finance",
    label: "Budget",
    data: {
      owner: "Leah Kim",
      initials: "LK",
      role: "Growth finance",
      due: "Tomorrow",
      note: "Approve the regional media split and the 8% contingency reserve.",
      checklist: ["Media plan reconciled", "FX buffer added", "PO reserved"],
    },
  },
  {
    id: "launch",
    label: "Launch",
    data: {
      owner: "Noah Webb",
      initials: "NW",
      role: "Lifecycle marketing",
      due: "Friday, 09:00",
      note: "Schedule the approved campaign and monitor the first delivery cohort.",
      checklist: [
        "Segments synced",
        "Suppression list fresh",
        "Alerts enabled",
      ],
    },
  },
];

const statusTone: Record<StepStatus, BadgeTone> = {
  complete: "primary",
  current: "primary",
  upcoming: "neutral",
  error: "destructive",
  skipped: "neutral",
};

const statusLabel: Record<StepStatus, string> = {
  complete: "Approved",
  current: "Active",
  upcoming: "Queued",
  error: "Changes",
  skipped: "Skipped",
};

export function StepsApprovalRouting() {
  const [current, setCurrent] = useState("security");
  const [approved, setApproved] = useState(() => new Set(["intake", "legal"]));
  const [changesRequested, setChangesRequested] = useState<string>();
  const [announcement, setAnnouncement] = useState(
    "Security review is ready for Arun Rao.",
  );

  const securityApproved = approved.has("security");
  const financeApproved = approved.has("finance");
  const items = approvalItems.map((item) => ({
    ...item,
    disabled:
      (item.id === "finance" && !securityApproved) ||
      (item.id === "launch" && !financeApproved),
    status: approved.has(item.id)
      ? ("complete" as const)
      : changesRequested === item.id
        ? ("error" as const)
        : undefined,
  }));
  const currentItem = items.find((item) => item.id === current);
  const approvedPercentage = (approved.size / items.length) * 100;
  const currentApproved = approved.has(current);

  function reset() {
    setCurrent("security");
    setApproved(new Set(["intake", "legal"]));
    setChangesRequested(undefined);
    setAnnouncement("Security review is ready for Arun Rao.");
  }

  function approveCurrent() {
    const nextApproved = new Set(approved);
    nextApproved.add(current);
    setApproved(nextApproved);
    setChangesRequested(undefined);

    const nextId =
      current === "security"
        ? "finance"
        : current === "finance"
          ? "launch"
          : undefined;

    if (nextId) {
      setCurrent(nextId);
      setAnnouncement(
        `${String(currentItem?.label)} approved. ${String(
          approvalItems.find((item) => item.id === nextId)?.label,
        )} is now active.`,
      );
      return;
    }

    setAnnouncement(`${String(currentItem?.label)} approved.`);
  }

  return (
    <div className="border-border bg-background overflow-hidden rounded-2xl border shadow-sm">
      <header className="border-border bg-muted/25 flex flex-wrap items-start justify-between gap-4 border-b px-5 py-4 sm:px-6">
        <div className="flex items-start gap-3">
          <span className="bg-primary/10 text-primary grid size-10 shrink-0 place-items-center rounded-xl">
            <FileCheck2 aria-hidden="true" className="size-5" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-heading text-base font-semibold">
                Summer launch approvals
              </h3>
              <Badge
                size="xs"
                tone={approved.size === items.length ? "success" : "warning"}
                variant="soft"
                leadingIcon={<UsersRound aria-hidden="true" />}
              >
                {approved.size === items.length
                  ? "Ready to launch"
                  : `${items.length - approved.size} reviews left`}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1 text-sm">
              A typed approval route with gated destinations and rich step
              labels.
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          leftIcon={<RotateCcw aria-hidden="true" />}
          onClick={reset}
        >
          Reset route
        </Button>
      </header>

      <div className="grid gap-6 p-5 sm:p-6">
        <Steps<ApprovalMeta>
          interactive
          showProgress
          aria-label="Campaign approval route"
          items={items}
          progressValue={approvedPercentage}
          value={current}
          onValueChange={(value) => {
            setCurrent(value);
            setAnnouncement(
              `Opened ${String(
                approvalItems.find((item) => item.id === value)?.label,
              )} review.`,
            );
          }}
          formatProgress={(percentage) =>
            `${approved.size} of ${items.length} approved · ${Math.round(percentage)}%`
          }
          renderItem={(item, state) => (
            <span className="flex min-w-0 flex-col gap-1">
              <span className="flex flex-wrap items-center justify-center gap-1.5 text-sm font-semibold sm:justify-start">
                <span>{item.label}</span>
                <Badge
                  size="xs"
                  tone={statusTone[state.status]}
                  variant="subtle"
                >
                  {statusLabel[state.status]}
                </Badge>
              </span>
              <span className="text-muted-foreground text-xs leading-4">
                {item.data?.owner} · {item.data?.due}
              </span>
            </span>
          )}
        />

        <section
          aria-labelledby="approval-panel-title"
          className="border-border bg-muted/25 grid gap-5 rounded-xl border p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_minmax(14rem,0.72fr)]"
        >
          <div className="min-w-0">
            <p className="text-primary text-xs font-semibold tracking-[0.12em] uppercase">
              Current review
            </p>
            <div className="mt-3 flex items-start gap-3">
              <span className="bg-primary text-primary-foreground grid size-10 shrink-0 place-items-center rounded-full text-sm font-semibold">
                {currentItem?.data?.initials}
              </span>
              <div className="min-w-0">
                <h4
                  id="approval-panel-title"
                  className="font-heading text-lg font-semibold"
                >
                  {currentItem?.data?.owner}
                </h4>
                <p className="text-muted-foreground text-sm">
                  {currentItem?.data?.role} · due {currentItem?.data?.due}
                </p>
              </div>
            </div>
            <p className="text-muted-foreground mt-4 text-sm leading-6">
              {currentItem?.data?.note}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <Button
                size="sm"
                disabled={currentApproved}
                leftIcon={<Check aria-hidden="true" />}
                rightIcon={<ArrowRight aria-hidden="true" />}
                onClick={approveCurrent}
              >
                {currentApproved ? "Already approved" : "Approve & continue"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={currentApproved}
                leftIcon={<MessageSquareWarning aria-hidden="true" />}
                onClick={() => {
                  setChangesRequested(current);
                  setAnnouncement(
                    `Changes requested from ${currentItem?.data?.owner}.`,
                  );
                }}
              >
                Request changes
              </Button>
            </div>
          </div>

          <div className="border-border bg-background rounded-lg border p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Send aria-hidden="true" className="text-primary size-4" />
              Review checklist
            </div>
            <ul className="mt-3 space-y-2">
              {currentItem?.data?.checklist.map((check) => (
                <li key={check} className="flex items-start gap-2 text-sm">
                  <Check
                    aria-hidden="true"
                    className="text-success mt-0.5 size-4 shrink-0"
                  />
                  <span>{check}</span>
                </li>
              ))}
            </ul>
            <p className="text-muted-foreground mt-4 text-xs leading-5">
              Budget unlocks after Security approval. Launch unlocks after
              Budget approval.
            </p>
          </div>
        </section>

        <p aria-live="polite" className="text-muted-foreground text-sm">
          {announcement}
        </p>
      </div>
    </div>
  );
}
