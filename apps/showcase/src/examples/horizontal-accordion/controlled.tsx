"use client";

/* eslint-disable jsx-a11y/no-redundant-roles -- Safari needs explicit list roles when list markers are removed. */

import { useState } from "react";
import { Check, Hammer, ListChecks, Rocket } from "lucide-react";
import {
  Button,
  HorizontalAccordion,
  type HorizontalAccordionValue,
} from "@dethink/components";

const phases = [
  {
    value: "plan",
    label: "Plan",
    icon: ListChecks,
    title: "Give the work a clear shape.",
    tasks: [
      "Agree the launch scope",
      "Assign review owners",
      "Set the release date",
    ],
  },
  {
    value: "build",
    label: "Build",
    icon: Hammer,
    title: "Make every detail count.",
    tasks: [
      "Complete the checkout flow",
      "Review keyboard navigation",
      "Verify mobile layouts",
    ],
  },
  {
    value: "ship",
    label: "Ship",
    icon: Rocket,
    title: "Ready for the next chapter.",
    tasks: [
      "Approve the release candidate",
      "Publish the release notes",
      "Check the first orders",
    ],
  },
];

export function HorizontalAccordionControlled() {
  const [value, setValue] = useState<HorizontalAccordionValue>("build");
  const [done, setDone] = useState<string[]>([
    "Agree the launch scope",
    "Complete the checkout flow",
  ]);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {phases.map((phase) => (
          <Button
            aria-pressed={value === phase.value}
            key={phase.value}
            onClick={() => setValue(phase.value)}
            size="sm"
            variant={value === phase.value ? "soft" : "outline"}
          >
            {phase.label}
          </Button>
        ))}
        <Button onClick={() => setValue(undefined)} size="sm" variant="ghost">
          Collapse all
        </Button>
        <span className="text-muted-foreground ms-auto text-xs tabular-nums">
          {done.length} / 9 complete
        </span>
      </div>
      {value === undefined ? (
        <p className="text-muted-foreground text-sm" role="status">
          Choose a phase to continue your launch checklist.
        </p>
      ) : null}
      <HorizontalAccordion
        aria-label="Delivery phases"
        className="border-border bg-background rounded-xl border shadow-sm"
        compactBreakpoint={560}
        height={value === undefined ? 96 : 340}
        onValueChange={setValue}
        value={value}
      >
        {phases.map(
          ({ value: phaseValue, label, icon: Icon, title, tasks }) => (
            <HorizontalAccordion.Item key={phaseValue} value={phaseValue}>
              <HorizontalAccordion.Blade>
                <HorizontalAccordion.BladeIcon>
                  <Icon aria-hidden="true" className="size-4" />
                </HorizontalAccordion.BladeIcon>
                <HorizontalAccordion.BladeLabel>
                  {label}
                </HorizontalAccordion.BladeLabel>
              </HorizontalAccordion.Blade>
              <HorizontalAccordion.Panel className="overflow-y-auto">
                <div className="flex h-full flex-col gap-5 p-6">
                  <div>
                    <p className="text-primary text-xs font-medium tracking-widest uppercase">
                      Launch checklist
                    </p>
                    <h3 className="text-foreground mt-2 text-2xl font-semibold tracking-tight">
                      {title}
                    </h3>
                  </div>
                  <ul className="space-y-3" role="list">
                    {tasks.map((task) => (
                      <li key={task}>
                        <label className="text-foreground flex min-h-8 cursor-pointer items-center gap-3 text-sm">
                          <input
                            checked={done.includes(task)}
                            className="accent-primary size-4 shrink-0"
                            onChange={(event) =>
                              setDone((current) =>
                                event.target.checked
                                  ? [...current, task]
                                  : current.filter((item) => item !== task),
                              )
                            }
                            type="checkbox"
                          />
                          <span
                            className={
                              done.includes(task)
                                ? "text-muted-foreground line-through"
                                : ""
                            }
                          >
                            {task}
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                  <p className="text-muted-foreground mt-auto flex items-center gap-1.5 text-xs">
                    <Check aria-hidden="true" className="size-3.5" />
                    {tasks.filter((task) => done.includes(task)).length} of 3
                    steps complete
                  </p>
                </div>
              </HorizontalAccordion.Panel>
            </HorizontalAccordion.Item>
          ),
        )}
      </HorizontalAccordion>
    </div>
  );
}
