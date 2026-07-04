"use client";

import { IconButton } from "@dethink/components";
import { RefreshCw, Upload } from "lucide-react";

const sizes = ["xs", "sm", "md", "lg", "xl"] as const;

export function IconButtonStates() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-2">
        {sizes.map((size) => (
          <IconButton key={size} aria-label={`Upload (${size})`} size={size} variant="soft">
            <Upload />
          </IconButton>
        ))}
      </div>
      <div className="flex items-center justify-center gap-2">
        <IconButton aria-label="Refreshing" loading variant="outline">
          <RefreshCw />
        </IconButton>
        <IconButton aria-label="Refresh" disabled variant="outline">
          <RefreshCw />
        </IconButton>
      </div>
    </div>
  );
}
