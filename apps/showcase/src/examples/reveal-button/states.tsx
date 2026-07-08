"use client";

import { RevealButton } from "@dethink/components";
import { RefreshCw, Save, Search, Settings } from "lucide-react";

export function RevealButtonStates() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <RevealButton icon={<Search />} label="Hover or focus" />
      <RevealButton
        className="ring-2 ring-ring ring-offset-2 ring-offset-background"
        icon={<Settings />}
        label="Focused"
        variant="outline"
      />
      <RevealButton
        icon={<Save />}
        label="Always visible"
        labelVisibility="always"
        variant="soft"
      />
      <RevealButton disabled icon={<RefreshCw />} label="Disabled" variant="outline" />
      <RevealButton icon={<RefreshCw />} label="Loading" loading variant="outline" />
      <RevealButton icon={<RefreshCw />} label="No motion" motion="none" />
    </div>
  );
}
