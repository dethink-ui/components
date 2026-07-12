"use client";

import { AuroraBackground } from "@dethink/components";

export function AuroraBackgroundStatic() {
  return (
    <AuroraBackground
      animate={false}
      className="border-border h-56 rounded-lg border"
      tone="primary"
    >
      <div className="flex h-56 flex-col items-center justify-center gap-2 px-6 text-center">
        <h3 className="text-foreground text-xl font-semibold">
          Designed at rest
        </h3>
        <p className="text-muted-foreground max-w-sm text-sm leading-6">
          animate={"{false}"} renders the same frame reduced-motion users see:
          every ribbon frozen at its seeded offset with layered opacities, no
          loops mounted.
        </p>
      </div>
    </AuroraBackground>
  );
}
