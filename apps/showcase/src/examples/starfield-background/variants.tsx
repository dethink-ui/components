"use client";

import { StarfieldBackground } from "@dethink/components";

export function StarfieldBackgroundVariants() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <StarfieldBackground
        className="border-border h-48 rounded-lg border"
        density="dense"
        intensity="bold"
        seed={3}
        speed="fast"
        tone="primary"
      >
        <div className="flex h-48 items-end p-4">
          <span className="text-muted-foreground text-xs font-medium">
            tone=&quot;primary&quot; · dense · bold · fast
          </span>
        </div>
      </StarfieldBackground>
      <StarfieldBackground
        className="border-border h-48 rounded-lg border"
        interactive={false}
        seed={5}
        tone="muted"
      >
        <div className="flex h-48 items-end p-4">
          <span className="text-muted-foreground text-xs font-medium">
            interactive={"{false}"} · drift only
          </span>
        </div>
      </StarfieldBackground>
      <StarfieldBackground
        className="border-border h-48 rounded-lg border"
        density="sparse"
        seed={9}
        speed="slow"
        tone="foreground"
      >
        <div className="flex h-48 items-end p-4">
          <span className="text-muted-foreground text-xs font-medium">
            tone=&quot;foreground&quot; · sparse · slow
          </span>
        </div>
      </StarfieldBackground>
    </div>
  );
}
