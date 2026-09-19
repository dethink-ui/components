"use client";

import { useId, useState } from "react";
import {
  ArrowRight,
  Check,
  CheckCheck,
  GitBranch,
  Rocket,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Field,
  FieldControl,
  FieldLabel,
  Progress,
  ProgressCircle,
  Tabs,
  Textarea,
  Timeline,
  type TimelineItemData,
} from "@dethink/components";
import type { RecipePreviewProps } from "@/lib/recipe-presentation";

const checks = [
  {
    id: "build",
    title: "Production build is passing",
    detail: "All 248 checks passed on the release branch.",
    owner: "Mira Patel",
    group: "Engineering",
    done: true,
  },
  {
    id: "rollback",
    title: "Rollback plan is documented",
    detail: "Previous release tagged and recovery steps reviewed.",
    owner: "Theo Park",
    group: "Engineering",
    done: true,
  },
  {
    id: "keyboard",
    title: "Keyboard and screen-reader review",
    detail: "Complete the final acceptance pass on the new flow.",
    owner: "Avery Chen",
    group: "Experience",
    done: false,
  },
  {
    id: "responsive",
    title: "Small-screen layouts are verified",
    detail: "Core journeys checked from 390px to desktop.",
    owner: "Avery Chen",
    group: "Experience",
    done: true,
  },
  {
    id: "notes",
    title: "Release notes are ready",
    detail: "Share the highlights with customer-facing teams.",
    owner: "Mira Patel",
    group: "Go live",
    done: false,
  },
  {
    id: "coverage",
    title: "On-call coverage is confirmed",
    detail: "Theo is covering the first hour after launch.",
    owner: "Theo Park",
    group: "Go live",
    done: true,
  },
];
const initialCompleted = checks
  .filter((item) => item.done)
  .map((item) => item.id);
const baseActivity: TimelineItemData[] = [
  {
    id: "branch",
    title: "Release branch created",
    description: "Mira prepared release/2.8 from the stable build.",
    dateLabel: "09:10",
    status: "complete",
  },
  {
    id: "tests",
    title: "Automated checks passed",
    description: "248 checks completed with no regressions.",
    dateLabel: "09:24",
    status: "complete",
  },
  {
    id: "review",
    title: "Final review started",
    description: "Experience and launch owners are checking their items.",
    dateLabel: "10:00",
    status: "current",
  },
];

export function ReleaseReadinessRecipe({
  presentation = "embedded",
}: RecipePreviewProps) {
  const checklistId = useId();
  const [completed, setCompleted] = useState(initialCompleted);
  const [approved, setApproved] = useState(false);
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [tab, setTab] = useState("checklist");
  const remaining = checks.length - completed.length;
  const ready = remaining === 0;
  const activity: TimelineItemData[] = approved
    ? [
        ...baseActivity.map((item) => ({
          ...item,
          status: "complete" as const,
        })),
        {
          id: "approved",
          title: "Release approved",
          description:
            note.trim() ||
            "All owners signed off. This release is ready to ship.",
          dateLabel: "Just now",
          status: "complete",
        },
      ]
    : baseActivity;

  function reset() {
    setCompleted(initialCompleted);
    setApproved(false);
    setNote("");
    setTab("checklist");
  }

  return (
    <section
      data-recipe-surface="release-readiness"
      className={`bg-background text-foreground ${presentation === "full-page" ? "min-h-[calc(100dvh-7rem)]" : "border-border overflow-hidden rounded-xl border"}`}
    >
      <header className="border-border flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          <span className="bg-primary text-primary-foreground grid size-9 place-items-center rounded-xl">
            <Rocket className="size-4" aria-hidden />
          </span>
          <span className="text-base font-semibold tracking-tight">
            Launchpad
          </span>
          <span className="text-muted-foreground hidden text-sm sm:inline">
            / Release room
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline">Sample workspace</Badge>
          <Avatar name="Mira Patel" size="sm" />
        </div>
      </header>

      <div className="space-y-7 p-5 sm:p-8 lg:p-10">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div className="space-y-3">
            <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">
              Every detail, ready.
            </p>
            <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              A better way to ship.
            </h2>
            <p className="text-muted-foreground max-w-xl text-sm leading-6">
              One shared checklist. Clear ownership. A little more confidence
              before the next release.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<RotateCcw />}
            onClick={reset}
          >
            Reset demo
          </Button>
        </div>

        <div className="border-primary/20 bg-primary/5 grid items-center gap-6 rounded-2xl border p-6 sm:grid-cols-[1fr_auto]">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge tone="primary" variant="solid">
                v2.8
              </Badge>
              <span className="text-muted-foreground inline-flex items-center gap-1.5 font-mono text-xs">
                <GitBranch className="size-3.5" aria-hidden />
                release/2.8
              </span>
            </div>
            <div>
              <h3 className="text-xl font-semibold">
                The collaboration release
              </h3>
              <p className="text-muted-foreground mt-1 text-sm">
                Shared views, smarter handoffs, and a calmer workspace.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div
                className="flex -space-x-2"
                role="img"
                aria-label="Release owners: Mira, Theo, and Avery"
              >
                {["Mira Patel", "Theo Park", "Avery Chen"].map((name) => (
                  <Avatar
                    key={name}
                    name={name}
                    size="sm"
                    decorative
                    className="ring-background ring-2"
                  />
                ))}
              </div>
              <span className="text-muted-foreground text-xs">
                3 owners · Friday release window
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4 sm:pr-4">
            <div className="relative grid size-24 place-items-center">
              <ProgressCircle
                aria-label="Release readiness"
                value={completed.length}
                max={checks.length}
                className="absolute inset-0 size-24"
                size="lg"
                tone={ready ? "success" : "primary"}
              />
              <span className="text-xl font-semibold tabular-nums">
                {Math.round((completed.length / checks.length) * 100)}
                <span className="text-muted-foreground text-xs">%</span>
              </span>
            </div>
            <div>
              <p className="font-medium">
                {approved
                  ? "Signed off"
                  : ready
                    ? "Ready for review"
                    : "Almost there"}
              </p>
              <p className="text-muted-foreground mt-1 text-xs" role="status">
                {completed.length} of {checks.length} checks complete
              </p>
            </div>
          </div>
        </div>

        <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_280px]">
          <Tabs
            value={tab}
            onValueChange={setTab}
            variant="line"
            motionPreset="subtle"
          >
            <Tabs.List aria-label="Release views">
              <Tabs.Trigger value="checklist">Release checklist</Tabs.Trigger>
              <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Panel value="checklist" className="pt-5">
              <div className="space-y-6">
                {["Engineering", "Experience", "Go live"].map((group) => (
                  <fieldset key={group} className="min-w-0">
                    <legend className="mb-3 text-xs font-semibold tracking-wider uppercase">
                      {group}
                    </legend>
                    <div className="divide-border border-border divide-y rounded-xl border">
                      {checks
                        .filter((item) => item.group === group)
                        .map((item) => {
                          const done = completed.includes(item.id);
                          return (
                            <label
                              key={item.id}
                              htmlFor={`${checklistId}-${item.id}`}
                              className={`flex cursor-pointer items-start gap-3 p-4 motion-safe:transition-colors ${done ? "bg-muted/25" : "bg-background"}`}
                            >
                              <Checkbox
                                id={`${checklistId}-${item.id}`}
                                aria-label={item.title}
                                className="mt-0.5"
                                checked={done}
                                disabled={approved}
                                onCheckedChange={(checked) =>
                                  setCompleted((current) =>
                                    checked
                                      ? [...current, item.id]
                                      : current.filter((id) => id !== item.id),
                                  )
                                }
                              />
                              <span className="min-w-0 flex-1">
                                <span
                                  className={`block text-sm font-medium ${done ? "text-muted-foreground" : "text-foreground"}`}
                                >
                                  {item.title}
                                </span>
                                <span className="text-muted-foreground mt-1 block text-xs leading-5">
                                  {item.detail}
                                </span>
                              </span>
                              <Avatar
                                name={item.owner}
                                size="xs"
                                className="hidden sm:inline-flex"
                              />
                            </label>
                          );
                        })}
                    </div>
                  </fieldset>
                ))}
              </div>
            </Tabs.Panel>
            <Tabs.Panel value="activity" className="pt-5">
              <Timeline
                aria-label="Release activity"
                items={activity}
                presentation="flow"
                orientation="vertical"
                layout="stacked"
                mode="events"
                reveal="none"
              />
            </Tabs.Panel>
          </Tabs>

          <aside className="space-y-4">
            <Card className="gap-5 p-5" shadow="none">
              <div className="flex items-center justify-between">
                <ShieldCheck className="text-primary size-5" aria-hidden />
                <Badge
                  tone={approved ? "success" : ready ? "primary" : "warning"}
                >
                  {approved ? "Approved" : ready ? "Ready" : "In review"}
                </Badge>
              </div>
              <div>
                <h3 className="font-semibold">A clear path to launch</h3>
                <p className="text-muted-foreground mt-2 text-sm leading-6">
                  {approved
                    ? "Everyone is aligned. Your approval is recorded in the activity feed."
                    : ready
                      ? "All checks are complete. Review the release and record your approval."
                      : `${remaining} ${remaining === 1 ? "check needs" : "checks need"} a final look before sign-off.`}
                </p>
              </div>
              <Progress
                aria-label="Completed release checks"
                value={completed.length}
                max={checks.length}
                size="sm"
                tone={ready ? "success" : "primary"}
              />
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger
                  className="w-full"
                  isDisabled={!ready || approved}
                >
                  {approved ? (
                    <>
                      <CheckCheck className="size-4" aria-hidden /> Release
                      approved
                    </>
                  ) : (
                    <>
                      Review release{" "}
                      <ArrowRight className="size-4" aria-hidden />
                    </>
                  )}
                </DialogTrigger>
                <DialogContent dismissible showCloseButton size="sm">
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      setApproved(true);
                      setOpen(false);
                    }}
                  >
                    <DialogHeader>
                      <DialogTitle>Approve v2.8</DialogTitle>
                      <DialogDescription>
                        All six checks are complete. Record your sign-off for
                        the team.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 px-6 py-3">
                      <div className="bg-success/10 flex items-center gap-2 rounded-lg p-3 text-sm">
                        <Check className="size-4" aria-hidden />
                        All release checks passed
                      </div>
                      <Field>
                        <FieldLabel>Approval note (optional)</FieldLabel>
                        <FieldControl asChild>
                          <Textarea
                            name="approval-note"
                            maxLength={300}
                            value={note}
                            onChange={(event) => setNote(event.target.value)}
                            placeholder="Anything the team should know?"
                          />
                        </FieldControl>
                      </Field>
                      <p className="text-muted-foreground text-xs">
                        This demo records an approval; it does not deploy
                        software.
                      </p>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setOpen(false)}>
                        Keep reviewing
                      </Button>
                      <Button type="submit">Approve release</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </Card>
            <div className="border-border rounded-xl border border-dashed p-5">
              <p className="text-xs font-semibold">
                Good releases are a team sport.
              </p>
              <p className="text-muted-foreground mt-2 text-xs leading-5">
                {approved
                  ? "Your sign-off is in the activity feed. Reset the demo to explore the flow again."
                  : ready
                    ? "Every owner has completed their checks. You can now record the final sign-off."
                    : "Each check has an owner. Complete the remaining items to try the approval flow."}
              </p>
            </div>
          </aside>
        </div>
        <p className="text-muted-foreground border-border border-t pt-5 text-xs">
          Interactive demo · Changes reset on refresh.
        </p>
      </div>
    </section>
  );
}
