"use client";

import { Badge, Button, LightStreaksBackground } from "@dethink/components";

export function LightStreaksBackgroundBasic() {
  return (
    <LightStreaksBackground
      className="border-border bg-foreground/[0.03] dark:bg-background h-[24rem] rounded-lg border"
      tone="primary"
    >
      <div className="flex h-[24rem] flex-col items-center justify-center gap-4 px-6 text-center">
        <Badge tone="primary" variant="soft">
          Launching soon
        </Badge>
        <h2 className="text-foreground max-w-xl text-3xl font-semibold tracking-tight">
          Make launch day feel like launch day
        </h2>
        <p className="text-muted-foreground max-w-md text-sm leading-6">
          Blurred diagonal streaks sweep through on staggered seeded loops —
          depth and motion without patterned geometry.
        </p>
        <div className="flex gap-3">
          <Button>Join the waitlist</Button>
          <Button variant="outline">Read the story</Button>
        </div>
      </div>
    </LightStreaksBackground>
  );
}
