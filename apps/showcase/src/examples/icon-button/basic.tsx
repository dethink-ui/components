"use client";

import { IconButton } from "@dethink/components";
import { Bell, Bookmark, Search, Settings, Trash2 } from "lucide-react";

export function IconButtonBasic() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <IconButton aria-label="Search">
        <Search />
      </IconButton>
      <IconButton aria-label="Notifications" variant="soft">
        <Bell />
      </IconButton>
      <IconButton aria-label="Settings" variant="outline">
        <Settings />
      </IconButton>
      <IconButton aria-label="Bookmark" variant="ghost">
        <Bookmark />
      </IconButton>
      <IconButton aria-label="Delete" variant="destructive">
        <Trash2 />
      </IconButton>
      <IconButton
        aria-label="Search everywhere"
        shape="circle"
        variant="outline"
      >
        <Search />
      </IconButton>
    </div>
  );
}
