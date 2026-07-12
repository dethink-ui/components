"use client";

import { Badge, Button, StarfieldBackground } from "@dethink/components";

export function StarfieldBackgroundBasic() {
  return (
    <StarfieldBackground
      className="border-border h-[24rem] rounded-lg border"
      tone="foreground"
    >
      <div className="flex h-[24rem] flex-col items-center justify-center gap-4 px-6 text-center">
        <Badge tone="primary" variant="soft">
          Launch window open
        </Badge>
        <h2 className="text-foreground max-w-xl text-3xl font-semibold tracking-tight">
          Built for what ships next
        </h2>
        <p className="text-muted-foreground max-w-md text-sm leading-6">
          Three star layers drift at different speeds and lean gently toward
          your cursor — an expansive surface with calm parallax depth.
        </p>
        <div className="flex gap-3">
          <Button>Reserve access</Button>
          <Button variant="outline">See the roadmap</Button>
        </div>
      </div>
    </StarfieldBackground>
  );
}
