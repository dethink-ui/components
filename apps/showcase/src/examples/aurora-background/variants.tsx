"use client";

import { AuroraBackground } from "@dethink/components";

export function AuroraBackgroundVariants() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <AuroraBackground
        className="border-border h-48 rounded-lg border"
        density="dense"
        seed={3}
        speed="fast"
        tone="primary"
      >
        <div className="flex h-48 items-end p-4">
          <span className="text-muted-foreground text-xs font-medium">
            tone=&quot;primary&quot; · dense · fast
          </span>
        </div>
      </AuroraBackground>
      <AuroraBackground
        className="border-border h-48 rounded-lg border"
        intensity="bold"
        seed={7}
        speed="slow"
        tone="primary"
      >
        <div className="flex h-48 items-end p-4">
          <span className="text-muted-foreground text-xs font-medium">
            intensity=&quot;bold&quot; · slow drift
          </span>
        </div>
      </AuroraBackground>
      <AuroraBackground
        className="border-border h-48 rounded-lg border"
        seed={5}
        tone="muted"
      >
        <div className="flex h-48 items-end p-4">
          <span className="text-muted-foreground text-xs font-medium">
            tone=&quot;muted&quot; · quiet ambient wash
          </span>
        </div>
      </AuroraBackground>
      <AuroraBackground
        className="border-border h-48 rounded-lg border"
        density="sparse"
        intensity="faint"
        seed={9}
        tone="foreground"
      >
        <div className="flex h-48 items-end p-4">
          <span className="text-muted-foreground text-xs font-medium">
            tone=&quot;foreground&quot; · sparse · faint
          </span>
        </div>
      </AuroraBackground>
    </div>
  );
}
