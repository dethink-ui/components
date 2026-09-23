"use client";

import { useState } from "react";
import {
  ButtonGroup,
  ButtonGroupSeparator,
  IconButton,
} from "@dethink/components";
import { Minus, Plus, Maximize2, MousePointer2 } from "lucide-react";

export function ButtonGroupCanvasControls() {
  const [zoom, setZoom] = useState(100);
  return (
    <div className="border-border bg-background mx-auto w-full max-w-lg overflow-hidden rounded-2xl border shadow-sm">
      <div className="border-border flex items-center justify-between gap-3 border-b px-5 py-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <MousePointer2 className="text-primary size-4" aria-hidden="true" />{" "}
          Studio canvas
        </div>
        <span className="text-muted-foreground text-xs">Preview</span>
      </div>
      <div className="bg-muted/40 relative flex h-72 items-center justify-center overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 [background-image:radial-gradient(var(--dt-color-muted-foreground)_1px,transparent_1px)] [background-size:16px_16px] opacity-30"
        />
        <div
          aria-hidden="true"
          data-canvas-preview
          className="border-border bg-background w-44 shrink-0 rounded-xl border p-4 shadow-lg motion-safe:transition-transform motion-safe:duration-200"
          style={{ transform: `scale(${zoom / 100})` }}
        >
          <div className="bg-primary/10 mb-4 flex h-20 items-center justify-center rounded-lg">
            <span className="bg-primary size-10 rounded-full" />
          </div>
          <div className="bg-foreground/70 mb-2 h-2 w-3/4 rounded-full" />
          <div className="bg-muted-foreground/30 h-1.5 w-full rounded-full" />
          <div className="bg-muted-foreground/20 mt-2 h-1.5 w-2/3 rounded-full" />
        </div>
        <ButtonGroup
          aria-label="Canvas zoom controls"
          orientation="vertical"
          className="absolute top-4 right-4 shadow-sm"
        >
          <IconButton
            variant="outline"
            size="sm"
            aria-label="Zoom in"
            disabled={zoom === 150}
            onClick={() => setZoom((value) => Math.min(150, value + 25))}
          >
            <Plus />
          </IconButton>
          <IconButton
            variant="outline"
            size="sm"
            aria-label="Zoom out"
            disabled={zoom === 50}
            onClick={() => setZoom((value) => Math.max(50, value - 25))}
          >
            <Minus />
          </IconButton>
          <ButtonGroupSeparator />
          <IconButton
            variant="outline"
            size="sm"
            aria-label="Reset zoom"
            onClick={() => setZoom(100)}
          >
            <Maximize2 />
          </IconButton>
        </ButtonGroup>
      </div>
      <div className="border-border flex items-center justify-between gap-4 border-t px-5 py-4 text-xs">
        <span className="text-muted-foreground">
          A closer look, one step at a time.
        </span>
        <output
          aria-live="polite"
          aria-label="Canvas zoom"
          className="shrink-0 font-medium tabular-nums"
        >
          {zoom}%
        </output>
      </div>
    </div>
  );
}
