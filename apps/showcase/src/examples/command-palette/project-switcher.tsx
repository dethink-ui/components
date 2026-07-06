"use client";

import { useState } from "react";
import {
  CommandPalette,
  type CommandPaletteCommand,
} from "@dethink/components";
import { Boxes, FolderGit2, Layers3, Search } from "lucide-react";

const rootCommands: CommandPaletteCommand[] = [
  {
    group: "Browse",
    icon: <FolderGit2 aria-hidden="true" className="size-4" />,
    key: "projects",
    label: "Projects",
    page: "projects",
    shortcut: "G P",
    type: "page",
  },
  {
    group: "Browse",
    icon: <Boxes aria-hidden="true" className="size-4" />,
    key: "resources",
    label: "Resources",
    page: "resources",
    shortcut: "G R",
    type: "page",
  },
  {
    group: "Search",
    icon: <Search aria-hidden="true" className="size-4" />,
    key: "global-search",
    label: "Search all records",
    shortcut: "⌘K",
  },
];

export function CommandPaletteProjectSwitcher() {
  const [lastSelection, setLastSelection] = useState("No resource selected.");

  return (
    <div className="grid gap-4">
      <CommandPalette
        label="Switch workspace context"
        description={lastSelection}
        motionPreset="expressive"
        commands={rootCommands}
        recentCommands={[
          {
            description: "Recently opened project",
            key: "recent-alpha",
            label: "Alpha rollout",
            action: () => setLastSelection("Opened Alpha rollout."),
          },
        ]}
        suggestedCommands={[
          {
            description: "Suggested resource",
            key: "suggested-runbook",
            label: "Payments runbook",
            action: () => setLastSelection("Opened Payments runbook."),
          },
        ]}
        pages={[
          {
            commands: [
              {
                action: () => setLastSelection("Opened Alpha rollout."),
                icon: <Layers3 aria-hidden="true" className="size-4" />,
                key: "alpha",
                label: "Alpha rollout",
              },
              {
                action: () => setLastSelection("Opened Beta migration."),
                icon: <Layers3 aria-hidden="true" className="size-4" />,
                key: "beta",
                label: "Beta migration",
              },
            ],
            description: "Choose an active project.",
            id: "projects",
            title: "Projects",
          },
          {
            commands: [
              {
                action: () => setLastSelection("Opened API gateway."),
                key: "api-gateway",
                label: "API gateway",
              },
              {
                action: () => setLastSelection("Opened billing ledger."),
                key: "billing-ledger",
                label: "Billing ledger",
              },
            ],
            description: "Jump to operational resources.",
            id: "resources",
            title: "Resources",
          },
        ]}
      />
    </div>
  );
}
