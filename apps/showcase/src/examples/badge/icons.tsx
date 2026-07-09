"use client";

import { ArrowRight, CheckCircle2, Clock3, Sparkles } from "lucide-react";
import { Badge } from "@dethink/components";

export function BadgeIcons() {
  return (
    <div className="flex flex-wrap items-center gap-[var(--dt-space-3)]">
      <Badge icon={<CheckCircle2 />} tone="success">
        Sync complete
      </Badge>
      <Badge icon={<Clock3 />} iconPlacement="trailing" tone="warning">
        Review pending
      </Badge>
      <Badge
        leadingIcon={<Sparkles />}
        trailingIcon={<ArrowRight />}
        tone="info"
        variant="outline"
      >
        AI draft ready
      </Badge>
    </div>
  );
}
