"use client";

import {
  BottomBar,
  BottomBarContent,
  BottomBarHeader,
  BottomBarTrigger,
} from "@dethink/components";

export function BottomBarBasic() {
  return (
    <BottomBar size="sm" className="rounded-xl border">
      <BottomBarHeader>
        <strong className="text-sm">Workspace notes</strong>
        <BottomBarTrigger className="ms-auto" />
      </BottomBarHeader>
      <BottomBarContent aria-label="Workspace notes">
        <label className="grid gap-2 text-sm">
          Notes
          <textarea
            aria-label="Notes"
            className="border-border bg-background focus-visible:outline-ring min-h-24 rounded-md border p-2 focus-visible:outline-2"
            placeholder="Your markup, your workflow…"
          />
        </label>
      </BottomBarContent>
    </BottomBar>
  );
}
