"use client";

import { useState } from "react";
import {
  CommandPalette,
  CommandPaletteContent,
  CommandPaletteDialog,
  CommandPaletteTrigger,
  type CommandPaletteCommand,
} from "@dethink/components";
import { FolderPlus, PanelTopOpen, Search, Settings2 } from "lucide-react";

export function CommandPaletteGlobalLauncher() {
  const [lastRun, setLastRun] = useState("No command run yet.");

  const commands: CommandPaletteCommand[] = [
    {
      action: () => setLastRun("Created a project draft."),
      group: "Create",
      icon: <FolderPlus aria-hidden="true" className="size-4" />,
      key: "create-project",
      label: "Create project",
      shortcut: "⌘N",
    },
    {
      action: () => setLastRun("Opened the command center."),
      group: "Navigate",
      icon: <PanelTopOpen aria-hidden="true" className="size-4" />,
      key: "command-center",
      label: "Open command center",
      shortcut: "G C",
    },
    {
      action: () => setLastRun("Opened workspace settings."),
      group: "Navigate",
      icon: <Settings2 aria-hidden="true" className="size-4" />,
      key: "settings",
      label: "Open settings",
      shortcut: "G S",
    },
  ];

  return (
    <div className="grid gap-4">
      <CommandPaletteDialog closeOnRun motionPreset="standard">
        <CommandPaletteTrigger variant="outline">
          <Search aria-hidden="true" className="size-4" />
          Open launcher
        </CommandPaletteTrigger>
        <CommandPaletteContent
          title="Command menu"
          description="Run workspace commands from anywhere."
        >
          <CommandPalette
            label="Global command menu"
            commands={commands}
            placeholder="Search commands..."
          />
        </CommandPaletteContent>
      </CommandPaletteDialog>

      <output className="border-border bg-muted/40 text-muted-foreground rounded-md border px-3 py-2 text-sm">
        {lastRun}
      </output>
    </div>
  );
}
