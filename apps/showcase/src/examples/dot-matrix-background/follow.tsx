"use client";

import { Badge, DotMatrixBackground } from "@dethink/components";

export function DotMatrixBackgroundFollow() {
  return (
    <DotMatrixBackground
      className="border-border h-64 rounded-lg border"
      density="dense"
      mode="follow"
      tone="primary"
    >
      <div className="flex h-64 flex-col items-center justify-center gap-3 px-6 text-center">
        <Badge tone="primary" variant="soft">
          Move your pointer
        </Badge>
        <h2 className="text-foreground text-2xl font-semibold tracking-tight">
          Keep the signal in sight
        </h2>
        <p className="text-muted-foreground max-w-md text-sm leading-6">
          A brighter patch of aligned dots follows the mouse while all content
          remains visible and interactive.
        </p>
      </div>
    </DotMatrixBackground>
  );
}
