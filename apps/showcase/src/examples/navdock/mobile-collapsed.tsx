"use client";

import { useMemo, useState } from "react";
import { CollapseDock, NavDock, type NavDockItemData } from "@dethink/components";
import {
  Bell,
  LayoutGrid,
  Menu,
  MessageCircle,
  Search,
  Settings2,
  Sparkles,
} from "lucide-react";

const iconProps = {
  "aria-hidden": true,
  absoluteStrokeWidth: true,
  strokeWidth: 2.1,
};

const mobileSections = [
  {
    value: "home",
    title: "Home",
    icon: <LayoutGrid {...iconProps} />,
  },
  {
    value: "search",
    title: "Search",
    icon: <Search {...iconProps} />,
  },
  {
    value: "assist",
    title: "Assist",
    icon: <Sparkles {...iconProps} />,
  },
  {
    value: "messages",
    title: "Messages",
    icon: <MessageCircle {...iconProps} />,
  },
  {
    value: "alerts",
    title: "Alerts",
    icon: <Bell {...iconProps} />,
  },
  {
    value: "settings",
    title: "Settings",
    icon: <Settings2 {...iconProps} />,
  },
];

export function NavDockMobileCollapsed() {
  const [currentPanel, setCurrentPanel] = useState("home");
  const items = useMemo<NavDockItemData[]>(
    () =>
      mobileSections.map((section) => ({
        icon: section.icon,
        onAction: () => setCurrentPanel(section.value),
        title: section.title,
        value: section.value,
      })),
    [],
  );

  return (
    <div className="mx-auto grid min-h-[32rem] max-w-sm overflow-hidden rounded-[2rem] border border-border bg-background p-5 shadow-sm">
      <div className="relative overflow-hidden rounded-[1.5rem] border border-border bg-muted/25 p-5">
        <NavDock
          aria-label="Mobile workspace dock"
          currentValue={currentPanel}
          motion="expressive"
          placement="bottom"
          position="absolute"
          showTitle="never"
          size="sm"
          variant="glass"
        >
          <CollapseDock
            collapseLabel="Close workspace dock"
            defaultCollapsed
            items={items}
            triggerIcon={<Menu {...iconProps} />}
            triggerLabel="Open workspace dock"
          />
        </NavDock>

        <div className="grid min-h-[24rem] content-start">
          <div className="rounded-lg border border-border bg-background/90 p-4">
            <div className="text-sm font-semibold text-foreground">
              Current panel
            </div>
            <p className="mt-1 text-sm capitalize text-muted-foreground">
              {currentPanel}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
