"use client";

import { RevealButton } from "@dethink/components";
import { Archive, Copy, Download, Pencil, Share2 } from "lucide-react";

export function RevealButtonRecipeToolbar() {
  return (
    <div className="border-border bg-muted/30 mx-auto flex w-full max-w-2xl items-center justify-between gap-4 rounded-md border p-3">
      <div className="min-w-0">
        <p className="text-foreground truncate text-sm font-medium">
          Customer insight report
        </p>
        <p className="text-muted-foreground text-sm">Draft updated just now</p>
      </div>
      <div
        aria-label="Report actions"
        className="flex shrink-0 items-center gap-1"
        role="toolbar"
      >
        <RevealButton icon={<Pencil />} label="Edit" variant="ghost" />
        <RevealButton icon={<Copy />} label="Duplicate" variant="ghost" />
        <RevealButton icon={<Share2 />} label="Share" variant="ghost" />
        <RevealButton icon={<Download />} label="Export" variant="outline" />
        <RevealButton
          icon={<Archive />}
          label="Archive"
          variant="destructive"
        />
      </div>
    </div>
  );
}
