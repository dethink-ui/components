"use client";

import { useState, type ReactNode } from "react";
import { RotateCcw } from "lucide-react";

/** Keep replay outside the keyed content so keyboard focus stays on the button. */
export function HeroPreview({
  children,
  label,
  scrollDriven = false,
}: {
  children: ReactNode;
  label: string;
  scrollDriven?: boolean;
}) {
  const [iteration, setIteration] = useState(0);
  return (
    <div data-hero-preview={label} className="min-w-0">
      <div className="border-border bg-muted/30 flex items-center justify-between gap-3 border-b px-4 py-2">
        <span className="text-muted-foreground font-mono text-[10px] tracking-[0.16em] uppercase">
          Live preview
        </span>
        {scrollDriven ? (
          <span className="text-muted-foreground inline-flex min-h-9 items-center text-xs">
            Scroll to animate ↕
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setIteration((value) => value + 1)}
            aria-label={`Replay ${label}`}
            className="text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex min-h-9 items-center gap-2 rounded px-2 text-xs outline-none focus-visible:ring-2"
          >
            <RotateCcw aria-hidden="true" className="size-3.5" /> Replay
          </button>
        )}
      </div>
      <div key={iteration}>{children}</div>
    </div>
  );
}
