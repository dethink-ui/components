"use client";

import { Badge, Button, DotMatrixBackground } from "@dethink/components";

export function DotMatrixBackgroundBasic() {
  return (
    <DotMatrixBackground
      className="border-border h-[24rem] rounded-lg border"
      tone="primary"
    >
      <div className="flex h-[24rem] flex-col items-center justify-center gap-4 px-6 text-center">
        <Badge tone="primary" variant="soft">
          AI-native
        </Badge>
        <h2 className="text-foreground max-w-xl text-3xl font-semibold tracking-tight">
          Feel the compute behind every answer
        </h2>
        <p className="text-muted-foreground max-w-md text-sm leading-6">
          Brightness pulses roll through the dot field at seeded origins —
          ambient activity without literal imagery.
        </p>
        <div className="flex gap-3">
          <Button>Try the model</Button>
          <Button variant="outline">Read the docs</Button>
        </div>
      </div>
    </DotMatrixBackground>
  );
}
