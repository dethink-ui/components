"use client";

import {
  Check,
  Circle,
  CircleAlert,
  ShieldCheck,
  Wrench,
  X,
} from "lucide-react";
import { useLayoutEffect, useRef, type ReactNode } from "react";
import { cn } from "../../utils/cn";
import { Button } from "../button";
import {
  Accordion,
  AccordionItem,
  AccordionBlade,
  AccordionBladeText,
  AccordionBladeIcon,
  AccordionContent,
} from "../accordion";
import { TypingIndicator } from "./typing-indicator";
import { chatRunLabel, isChatRunning } from "./chat-state";
import { useChatAction } from "./use-chat-action";
import type {
  ChatActionResult,
  ChatActivityItem,
  ChatApproval,
  ChatRun,
} from "./types";

export interface ToolCallCardProps {
  activity: ChatActivityItem;
  onApproval?: (decision: ChatApproval) => ChatActionResult;
  children?: ReactNode;
  className?: string;
}
export function ToolCallCard({
  activity,
  onApproval,
  children,
  className,
}: ToolCallCardProps) {
  const { pending, error, notice, perform } = useChatAction();
  const needsApproval = activity.status === "needs-input" && !activity.decision;
  const card = useRef<HTMLDivElement>(null);
  const restoreFocus = useRef(false);
  useLayoutEffect(() => {
    if (!needsApproval && restoreFocus.current) {
      if (
        document.activeElement === document.body ||
        card.current?.contains(document.activeElement)
      )
        card.current?.focus({ preventScroll: true });
      restoreFocus.current = false;
    }
  }, [needsApproval]);
  return (
    <div
      ref={card}
      tabIndex={-1}
      data-slot="tool-call-card"
      data-state={activity.status}
      className={cn(
        "border-border bg-muted/20 rounded-xl border p-3 text-sm",
        needsApproval && "border-primary/30 bg-primary/5",
        className,
      )}
    >
      <div className="flex items-start gap-2.5">
        <span aria-hidden="true" className="text-muted-foreground mt-0.5">
          {activity.status === "completed" ? (
            <Check className="text-success size-4" />
          ) : activity.status === "error" ? (
            <CircleAlert className="text-destructive size-4" />
          ) : activity.status === "cancelled" ? (
            <X className="size-4" />
          ) : needsApproval ? (
            <ShieldCheck className="text-primary size-4" />
          ) : (
            <Wrench className="size-4" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-medium">{activity.label}</p>
          <p className="text-muted-foreground mt-0.5 text-xs">
            {activity.decision === "approved"
              ? "Approved"
              : activity.decision === "denied"
                ? "Denied"
                : {
                    pending: "Queued",
                    running: "Working…",
                    "needs-input": "Needs your approval",
                    completed: "Completed",
                    error: "Failed",
                    cancelled: "Cancelled",
                  }[activity.status]}
          </p>
          {activity.summary && (
            <p className="text-muted-foreground mt-2 text-xs leading-5">
              {activity.summary}
            </p>
          )}
        </div>
      </div>
      {activity.error && (
        <p className="text-destructive mt-2 text-xs">{activity.error}</p>
      )}
      {needsApproval && onApproval && activity.approvalId && (
        <div className="mt-3 flex flex-wrap gap-2">
          {[true, false].map((approved) => (
            <Button
              key={String(approved)}
              size="sm"
              variant={approved ? "solid" : "outline"}
              disabled={pending || (!!notice && !activity.error)}
              onClick={() => {
                restoreFocus.current = true;
                void perform(
                  () =>
                    onApproval({
                      runId: activity.runId,
                      activityId: activity.id,
                      approvalId: activity.approvalId!,
                      approved,
                    }),
                  "Decision sent · awaiting acknowledgement",
                );
              }}
            >
              {pending ? "Sending…" : approved ? "Approve" : "Deny"}
            </Button>
          ))}
        </div>
      )}
      {needsApproval && !onApproval && (
        <p className="text-muted-foreground mt-2 text-xs">
          Waiting for an approval decision.
        </p>
      )}
      {children && <div className="mt-3 min-w-0">{children}</div>}
      <p role="status" className="text-muted-foreground mt-1 text-xs">
        {needsApproval && !activity.error ? notice : ""}
      </p>
      {error && (
        <p role="alert" className="text-destructive mt-1 text-xs">
          {error}
        </p>
      )}
    </div>
  );
}
export interface ChatActivityProps {
  run: ChatRun;
  items?: readonly ChatActivityItem[];
  onApproval?: ToolCallCardProps["onApproval"];
  renderResult?: (activity: ChatActivityItem) => ReactNode;
  className?: string;
}
const noActivity: readonly ChatActivityItem[] = [];
export function ChatActivity({
  run,
  items = noActivity,
  onApproval,
  renderResult,
  className,
}: ChatActivityProps) {
  const relevant = items.filter((item) => item.runId === run.id);
  const label = chatRunLabel(run, relevant);
  const approvals = relevant.filter(
    (item) => item.kind === "approval" || !!item.approvalId,
  );
  const awaitingApproval = approvals.some(
    (item) => item.status === "needs-input" && !item.decision,
  );
  if (run.status === "idle") return null;
  return (
    <div
      data-slot="chat-activity"
      data-state={run.status}
      className={cn("my-5 min-w-0", className)}
    >
      {relevant.length ? (
        <Accordion type="single" collapsible motionPreset="subtle">
          <AccordionItem value="activity" className="border-0">
            <AccordionBlade className="min-h-9 justify-start gap-2 rounded-lg py-1.5 text-sm hover:no-underline">
              <AccordionBladeText>
                {isChatRunning(run) ? (
                  <TypingIndicator
                    label={label}
                    active={run.status !== "stopping" && !awaitingApproval}
                  />
                ) : (
                  <span className="text-muted-foreground inline-flex items-center gap-2 text-xs">
                    {run.status === "error" ? (
                      <CircleAlert className="size-3.5" aria-hidden="true" />
                    ) : run.status === "stopped" ? (
                      <X className="size-3.5" aria-hidden="true" />
                    ) : (
                      <Check className="size-3.5" aria-hidden="true" />
                    )}
                    {label} · {relevant.length}{" "}
                    {relevant.length === 1 ? "step" : "steps"}
                  </span>
                )}
              </AccordionBladeText>
              <AccordionBladeIcon />
            </AccordionBlade>
            <AccordionContent className="pt-3 pb-0">
              <ol className="border-border ms-1 space-y-3 border-s ps-4">
                {relevant
                  .filter((item) => !approvals.includes(item))
                  .map((item) => (
                    <li key={item.id}>
                      {item.kind === "tool" || item.kind === "approval" ? (
                        <ToolCallCard activity={item} onApproval={onApproval}>
                          {renderResult?.(item)}
                        </ToolCallCard>
                      ) : (
                        <div className="text-muted-foreground flex items-start gap-2 text-xs leading-5">
                          <span aria-hidden="true">
                            {item.status === "completed" ? (
                              <Check className="mt-0.5 size-3.5" />
                            ) : (
                              <Circle className="mt-0.5 size-3.5" />
                            )}
                          </span>
                          <div>
                            <p>
                              {item.label}{" "}
                              <span className="sr-only">{item.status}</span>
                            </p>
                            {item.summary && (
                              <p className="mt-1">{item.summary}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
              </ol>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ) : (
        <TypingIndicator label={label} active={isChatRunning(run)} />
      )}
      {approvals.map((item) => (
        <ToolCallCard
          key={item.id}
          activity={item}
          onApproval={onApproval}
          className="mt-3"
        >
          {renderResult?.(item)}
        </ToolCallCard>
      ))}
    </div>
  );
}
