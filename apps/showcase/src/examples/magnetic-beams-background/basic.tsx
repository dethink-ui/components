"use client";

import { Badge, Button, MagneticBeamsBackground } from "@dethink/components";

export function MagneticBeamsBackgroundBasic() {
  return (
    <MagneticBeamsBackground
      className="border-border h-[24rem] rounded-lg border"
      tone="primary"
    >
      <div className="flex h-[24rem] flex-col items-center justify-center gap-4 px-6 text-center">
        <Badge tone="primary" variant="soft">
          Move your pointer
        </Badge>
        <h2 className="text-foreground max-w-xl text-3xl font-semibold tracking-tight">
          A hero that leans in when you do
        </h2>
        <p className="text-muted-foreground max-w-md text-sm leading-6">
          The beams spring toward your pointer while it hovers, then pick their
          traversal back up from wherever they are when it leaves.
        </p>
        <div className="flex gap-3">
          <Button>Get started</Button>
          <Button variant="outline">View docs</Button>
        </div>
      </div>
    </MagneticBeamsBackground>
  );
}
