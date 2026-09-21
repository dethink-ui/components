"use client";

import { Spinner } from "@dethink/components";

const sizes = ["xs", "sm", "md", "lg", "xl"] as const;
const loaders = [
  {
    variant: "bouncing-dot",
    title: "Bouncing dot",
    description: "Grows on the way up, shrinks on the way down.",
    status: "Preparing your workspace…",
  },
  {
    variant: "moving-rings",
    title: "Moving rings",
    description: "Two concentric arcs, moving in opposite directions.",
    status: "Syncing your records…",
  },
] as const;

export function FeedbackLoaders() {
  return (
    <div
      role="group"
      aria-label="Loader variants"
      className="grid w-full gap-4 sm:grid-cols-2"
    >
      {loaders.map(({ variant, title, description, status }) => (
        <div key={variant} className="border-border rounded-lg border p-5">
          <h3 className="text-sm font-medium">{title}</h3>
          <p className="text-muted-foreground mt-1 text-sm">{description}</p>
          <div className="mt-6 grid grid-cols-5 items-end gap-2">
            {sizes.map((size) => (
              <div key={size} className="grid justify-items-center gap-3">
                <div className="flex size-10 items-center justify-center">
                  <Spinner variant={variant} size={size} tone="primary" />
                </div>
                <span className="text-muted-foreground text-xs">{size}</span>
              </div>
            ))}
          </div>
          <div
            className="border-border mt-5 flex items-center gap-2 border-t pt-4 text-sm"
            role="status"
          >
            <Spinner variant={variant} size="sm" />
            {status}
          </div>
        </div>
      ))}
    </div>
  );
}
