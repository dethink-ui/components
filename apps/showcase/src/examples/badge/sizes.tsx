"use client";

import { Badge, type BadgeSize } from "@dethink/components";

const sizes: BadgeSize[] = ["xs", "sm", "md", "lg"];

export function BadgeSizes() {
  return (
    <div className="flex flex-wrap items-center gap-[var(--dt-space-3)]">
      {sizes.map((size) => (
        <div key={size} className="grid justify-items-center gap-2">
          <Badge size={size} tone="primary" variant="soft">
            {size.toUpperCase()}
          </Badge>
          <span className="text-muted-foreground text-xs">{size}</span>
        </div>
      ))}
    </div>
  );
}
