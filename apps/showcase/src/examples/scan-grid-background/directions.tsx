"use client";

import { ScanGridBackground } from "@dethink/components";

export function ScanGridBackgroundDirections() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <ScanGridBackground
        className="border-border h-48 rounded-lg border"
        speed="fast"
        tone="primary"
      >
        <div className="flex h-48 items-end p-4">
          <span className="text-muted-foreground text-xs font-medium">
            direction=&quot;vertical&quot; · fast
          </span>
        </div>
      </ScanGridBackground>
      <ScanGridBackground
        className="border-border h-48 rounded-lg border"
        density="dense"
        direction="horizontal"
        intensity="bold"
        speed="slow"
        tone="foreground"
      >
        <div className="flex h-48 items-end p-4">
          <span className="text-muted-foreground text-xs font-medium">
            direction=&quot;horizontal&quot; · dense · bold · slow
          </span>
        </div>
      </ScanGridBackground>
    </div>
  );
}
