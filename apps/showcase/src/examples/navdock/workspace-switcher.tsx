"use client";

import { useMemo, useState } from "react";
import { NavDock, type NavDockItemData } from "@dethink/components";
import {
  Activity,
  Gauge,
  PanelsTopLeft,
  Settings2,
  Sparkles,
} from "lucide-react";

const iconProps = {
  "aria-hidden": true,
  absoluteStrokeWidth: true,
  strokeWidth: 2.1,
};

const sections = [
  {
    value: "overview",
    title: "Overview",
    icon: <PanelsTopLeft {...iconProps} />,
    metric: "42 active workspaces",
    description: "Workspace health, activity, and recent owner changes.",
  },
  {
    value: "runs",
    title: "Runs",
    icon: <Sparkles {...iconProps} />,
    metric: "18 queued runs",
    description: "In-page action items switch local panels without navigation.",
  },
  {
    value: "activity",
    title: "Activity",
    icon: <Activity {...iconProps} />,
    metric: "7 alerts today",
    description: "The current panel is still announced with aria-current.",
  },
  {
    value: "usage",
    title: "Usage",
    icon: <Gauge {...iconProps} />,
    metric: "81% quota used",
    description: "Badges and descriptions belong in the content, not the dock.",
  },
  {
    value: "settings",
    title: "Settings",
    icon: <Settings2 {...iconProps} />,
    metric: "Team managed",
    description: "Local sections can keep the dock icon-first and compact.",
  },
];

export function NavDockWorkspaceSwitcher() {
  const [currentPanel, setCurrentPanel] = useState("overview");
  const currentSection =
    sections.find((section) => section.value === currentPanel) ?? sections[0];
  const items = useMemo<NavDockItemData[]>(
    () =>
      sections.map((section) => ({
        icon: section.icon,
        onAction: () => setCurrentPanel(section.value),
        title: section.title,
        value: section.value,
      })),
    [],
  );

  return (
    <div className="border-border bg-background grid gap-6 rounded-md border p-5">
      <div className="flex justify-center">
        <NavDock
          aria-label="Workspace section navigation"
          currentValue={currentPanel}
          items={items}
          showTitle="hover"
          variant="default"
        />
      </div>

      <div className="border-border bg-muted/30 rounded-md border p-4">
        <div className="text-foreground text-sm font-semibold">
          {currentSection.metric}
        </div>
        <p className="text-muted-foreground mt-2 text-sm leading-6">
          {currentSection.description}
        </p>
      </div>
    </div>
  );
}
