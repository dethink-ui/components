"use client";

import { Tabs, type TabsMotionPreset } from "@dethink/components";

const presets: { preset: TabsMotionPreset; label: string; note: string }[] = [
  {
    preset: "subtle",
    label: "Subtle",
    note: "Short, near-linear glide. Best for dense, utilitarian surfaces.",
  },
  {
    preset: "standard",
    label: "Standard",
    note: "The default. A little spring on the active layer, calm content lift.",
  },
  {
    preset: "expressive",
    label: "Expressive",
    note: "More bounce and travel for marketing or onboarding moments.",
  },
];

const steps = [
  ["plan", "Plan", "Draft scope, owners, and the rollout window."],
  ["build", "Build", "Wire the vertical slice with tests and docs together."],
  ["ship", "Ship", "Flip the flag, watch the dashboards, and announce."],
];

export function TabsMotion() {
  return (
    <div className="grid gap-8 md:grid-cols-3">
      {presets.map(({ preset, label, note }) => (
        <div key={preset} className="grid content-start gap-3">
          <div>
            <p className="text-foreground text-sm font-semibold">{label}</p>
            <p className="text-muted-foreground mt-1 text-xs leading-5">
              {note}
            </p>
          </div>
          <Tabs defaultValue="plan" motionPreset={preset} size="sm">
            <Tabs.List aria-label={`${label} motion example`}>
              {steps.map(([value, stepLabel]) => (
                <Tabs.Trigger key={value} value={value}>
                  {stepLabel}
                </Tabs.Trigger>
              ))}
            </Tabs.List>
            {steps.map(([value, stepLabel, body]) => (
              <Tabs.Panel key={value} value={value}>
                <div className="border-border bg-background mt-1 rounded-lg border p-4">
                  <h4 className="text-foreground text-sm font-semibold">
                    {stepLabel}
                  </h4>
                  <p className="text-muted-foreground mt-1 text-sm leading-6">
                    {body}
                  </p>
                </div>
              </Tabs.Panel>
            ))}
          </Tabs>
        </div>
      ))}
    </div>
  );
}
