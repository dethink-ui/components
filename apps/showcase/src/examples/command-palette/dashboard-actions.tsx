"use client";

import { useState } from "react";
import {
  CommandPalette,
  type CommandPaletteCommand,
} from "@dethink/components";
import { Bell, Download, RefreshCw, ShieldAlert } from "lucide-react";

export function CommandPaletteDashboardActions() {
  const [status, setStatus] = useState("Waiting for an action.");

  const commands: CommandPaletteCommand[] = [
    {
      action: () => setStatus("Queued a dashboard refresh."),
      description: "Refresh all visible KPI cards",
      group: "Dashboard",
      icon: <RefreshCw aria-hidden="true" className="size-4" />,
      key: "refresh",
      label: "Refresh metrics",
      shortcut: "R",
    },
    {
      action: () => setStatus("Export started."),
      description: "Download the current dashboard as CSV",
      group: "Dashboard",
      icon: <Download aria-hidden="true" className="size-4" />,
      key: "export",
      label: "Export report",
      shortcut: "E",
    },
    {
      action: () => setStatus("Notification rule opened."),
      description: "Create a threshold alert",
      group: "Automation",
      icon: <Bell aria-hidden="true" className="size-4" />,
      key: "alert",
      label: "Create alert",
    },
    {
      destructive: true,
      disabled: true,
      disabledReason: "Requires incident commander role",
      group: "Incident",
      icon: <ShieldAlert aria-hidden="true" className="size-4" />,
      key: "freeze",
      label: "Freeze deploys",
    },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_16rem]">
      <CommandPalette
        label="Dashboard actions"
        description="Run contextual commands against the active dashboard."
        commands={commands}
        onCommandRun={(command) => {
          if (!command.action) {
            setStatus(`Ran ${String(command.textValue ?? command.key)}.`);
          }
        }}
      />
      <div className="border-border bg-muted/40 rounded-md border p-4">
        <div className="text-foreground text-sm font-semibold">Action log</div>
        <output className="text-muted-foreground mt-2 block text-sm leading-6">
          {status}
        </output>
      </div>
    </div>
  );
}
