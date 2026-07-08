"use client";

import { RevealButton } from "@dethink/components";
import { Bell, Bookmark, Search, Settings, Trash2 } from "lucide-react";

export function RevealButtonBasic() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <RevealButton icon={<Search />} label="Search" />
      <RevealButton icon={<Bell />} label="Notifications" variant="soft" />
      <RevealButton icon={<Settings />} label="Settings" variant="outline" />
      <RevealButton icon={<Bookmark />} label="Bookmark" variant="ghost" />
      <RevealButton icon={<Trash2 />} label="Delete" variant="destructive" />
    </div>
  );
}
