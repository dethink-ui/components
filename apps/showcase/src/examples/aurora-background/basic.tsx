"use client";

import { Badge, Button, AuroraBackground } from "@dethink/components";

export function AuroraBackgroundBasic() {
  return (
    <AuroraBackground
      className="border-border h-[24rem] rounded-lg border"
      tone="primary"
    >
      <div className="flex h-[24rem] flex-col items-center justify-center gap-4 px-6 text-center">
        <Badge tone="primary" variant="soft">
          Northern lights included
        </Badge>
        <h2 className="text-foreground max-w-xl text-3xl font-semibold tracking-tight">
          Soft light for bold launches
        </h2>
        <p className="text-muted-foreground max-w-md text-sm leading-6">
          Flowing ribbons of blurred, hue-shifted gradient light drift and
          breathe behind your hero — every hue derived from one tone token.
        </p>
        <div className="flex gap-3">
          <Button>Get started</Button>
          <Button variant="outline">View docs</Button>
        </div>
      </div>
    </AuroraBackground>
  );
}
