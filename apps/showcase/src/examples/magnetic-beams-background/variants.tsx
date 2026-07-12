"use client";

import { MagneticBeamsBackground } from "@dethink/components";

export function MagneticBeamsBackgroundVariants() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <MagneticBeamsBackground
        className="border-border h-48 rounded-lg border"
        density="dense"
        seed={3}
        speed="fast"
        tone="foreground"
      >
        <div className="flex h-48 items-end p-4">
          <span className="text-muted-foreground text-xs font-medium">
            tone=&quot;foreground&quot; · dense · fast · magnetic
          </span>
        </div>
      </MagneticBeamsBackground>
      <MagneticBeamsBackground
        className="border-border h-48 rounded-lg border"
        mode="follow"
        seed={7}
        tone="primary"
      >
        <div className="flex h-48 items-end p-4">
          <span className="text-muted-foreground text-xs font-medium">
            mode=&quot;follow&quot; · beams travel to the pointer at loop speed
          </span>
        </div>
      </MagneticBeamsBackground>
      <MagneticBeamsBackground
        className="border-border h-48 rounded-lg border"
        interactive={false}
        seed={5}
        tone="muted"
      >
        <div className="flex h-48 items-end p-4">
          <span className="text-muted-foreground text-xs font-medium">
            interactive=&#123;false&#125; · plain traversal
          </span>
        </div>
      </MagneticBeamsBackground>
      <MagneticBeamsBackground
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
      </MagneticBeamsBackground>
    </div>
  );
}
