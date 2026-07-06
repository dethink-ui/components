"use client";

import {
  CommandPalette,
  type CommandPaletteCommand,
} from "@dethink/components";
import {
  Archive,
  ExternalLink,
  Settings2,
  Trash2,
  UserPlus,
} from "lucide-react";

const commands: CommandPaletteCommand[] = [
  {
    description: "Send an invite to this workspace",
    group: "Actions",
    icon: <UserPlus aria-hidden="true" className="size-4" />,
    key: "invite",
    keywords: ["people", "member"],
    label: "Invite teammate",
    shortcut: "G I",
  },
  {
    description: "Move the current project to the archive",
    group: "Actions",
    icon: <Archive aria-hidden="true" className="size-4" />,
    key: "archive-project",
    label: "Archive project",
  },
  {
    group: "Navigation",
    href: "#settings",
    icon: <Settings2 aria-hidden="true" className="size-4" />,
    key: "settings",
    label: "Open settings",
    shortcut: "G S",
    type: "link",
  },
  {
    group: "Navigation",
    href: "https://dethink.dev",
    icon: <ExternalLink aria-hidden="true" className="size-4" />,
    key: "docs",
    label: "Open docs",
    target: "_blank",
    type: "link",
  },
  {
    group: "Danger",
    icon: <Trash2 aria-hidden="true" className="size-4" />,
    key: "delete-workspace",
    label: "Delete workspace",
    destructive: true,
    disabled: true,
    disabledReason: "Owner access required",
  },
];

export function CommandPaletteBasic() {
  return (
    <CommandPalette
      label="Workspace commands"
      description="Search actions, links, and guarded destructive commands."
      commands={commands}
      placeholder="Type a command..."
    />
  );
}
