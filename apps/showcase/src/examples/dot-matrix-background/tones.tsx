"use client";

import { DotMatrixBackground } from "@dethink/components";

export function DotMatrixBackgroundTones() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <DotMatrixBackground
        className="border-border h-48 rounded-lg border"
        density="dense"
        seed={3}
        speed="fast"
        tone="foreground"
      >
        <div className="flex h-48 items-end p-4">
          <span className="text-muted-foreground text-xs font-medium">
            tone=&quot;foreground&quot; · dense · fast
          </span>
        </div>
      </DotMatrixBackground>
      <DotMatrixBackground
        className="border-border h-48 rounded-lg border"
        seed={5}
        tone="muted"
      >
        <div className="flex h-48 items-end p-4">
          <span className="text-muted-foreground text-xs font-medium">
            tone=&quot;muted&quot; · normal
          </span>
        </div>
      </DotMatrixBackground>
      <DotMatrixBackground
        className="border-border h-48 rounded-lg border"
        density="sparse"
        intensity="bold"
        seed={9}
        speed="slow"
        tone="primary"
      >
        <div className="flex h-48 items-end p-4">
          <span className="text-muted-foreground text-xs font-medium">
            tone=&quot;primary&quot; · sparse · bold · slow
          </span>
        </div>
      </DotMatrixBackground>
    </div>
  );
}
