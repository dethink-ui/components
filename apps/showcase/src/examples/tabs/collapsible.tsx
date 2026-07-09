"use client";

import {
  Compass,
  Inbox,
  PieChart,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { Tabs } from "@dethink/components";

type RailTab = {
  value: string;
  label: string;
  icon: LucideIcon;
  title: string;
  body: string;
};

const tabs: RailTab[] = [
  {
    value: "explore",
    label: "Explore",
    icon: Compass,
    title: "Explore",
    body: "Only the active tab keeps its label. Hover any collapsed tab to reveal its name, then click to expand it.",
  },
  {
    value: "inbox",
    label: "Inbox",
    icon: Inbox,
    title: "Inbox",
    body: "Selecting a tab expands it and lets the previously active tab settle back to an icon.",
  },
  {
    value: "reports",
    label: "Reports",
    icon: PieChart,
    title: "Reports",
    body: "The active pill glides between tabs while each label expands or collapses along the same motion.",
  },
  {
    value: "settings",
    label: "Settings",
    icon: Settings,
    title: "Settings",
    body: "Labels stay in the DOM while collapsed, so each tab keeps an accessible name for screen readers.",
  },
];

export function TabsCollapsible() {
  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div className="grid content-start gap-3">
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          Horizontal
        </p>
        <Tabs collapsible defaultValue="explore">
          <Tabs.List aria-label="Workspace rail">
            {tabs.map((tab) => {
              const Icon = tab.icon;

              return (
                <Tabs.Trigger
                  key={tab.value}
                  value={tab.value}
                  icon={<Icon aria-hidden />}
                >
                  {tab.label}
                </Tabs.Trigger>
              );
            })}
          </Tabs.List>
          {tabs.map((tab) => (
            <Tabs.Panel key={tab.value} value={tab.value}>
              <div className="border-border bg-background mt-2 rounded-lg border p-4">
                <h4 className="text-foreground text-sm font-semibold">
                  {tab.title}
                </h4>
                <p className="text-muted-foreground mt-1 text-sm leading-6">
                  {tab.body}
                </p>
              </div>
            </Tabs.Panel>
          ))}
        </Tabs>
      </div>

      <div className="grid content-start gap-3">
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          Vertical
        </p>
        <Tabs
          collapsible
          orientation="vertical"
          defaultValue="explore"
          className="grid grid-flow-col items-start justify-start gap-5"
        >
          <Tabs.List aria-label="Workspace rail (vertical)">
            {tabs.map((tab) => {
              const Icon = tab.icon;

              return (
                <Tabs.Trigger
                  key={tab.value}
                  value={tab.value}
                  icon={<Icon aria-hidden />}
                >
                  {tab.label}
                </Tabs.Trigger>
              );
            })}
          </Tabs.List>
          <div className="min-w-0">
            {tabs.map((tab) => (
              <Tabs.Panel key={tab.value} value={tab.value}>
                <div className="border-border bg-background rounded-lg border p-4">
                  <h4 className="text-foreground text-sm font-semibold">
                    {tab.title}
                  </h4>
                  <p className="text-muted-foreground mt-1 text-sm leading-6">
                    {tab.body}
                  </p>
                </div>
              </Tabs.Panel>
            ))}
          </div>
        </Tabs>
      </div>
    </div>
  );
}
