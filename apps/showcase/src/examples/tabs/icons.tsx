"use client";

import {
  Activity,
  Bell,
  CreditCard,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Tabs } from "@dethink/components";

type IconTab = {
  value: string;
  label: string;
  icon: LucideIcon;
  count?: number;
  title: string;
  body: string;
};

const tabs: IconTab[] = [
  {
    value: "activity",
    label: "Activity",
    icon: Activity,
    title: "Live activity",
    body: "Deploys, incidents, and audit events stream into one timeline.",
  },
  {
    value: "members",
    label: "Members",
    icon: Users,
    count: 12,
    title: "Members",
    body: "Twelve teammates share this workspace across three roles.",
  },
  {
    value: "billing",
    label: "Billing",
    icon: CreditCard,
    title: "Billing",
    body: "The Scale plan renews on the first with usage-based overages.",
  },
  {
    value: "alerts",
    label: "Alerts",
    icon: Bell,
    count: 3,
    title: "Alerts",
    body: "Three alert rules are watching latency, error rate, and spend.",
  },
];

export function TabsIcons() {
  return (
    <Tabs defaultValue="activity" size="lg" className="max-w-3xl">
      <Tabs.List aria-label="Workspace areas">
        {tabs.map((tab) => {
          const Icon = tab.icon;

          return (
            <Tabs.Trigger
              key={tab.value}
              value={tab.value}
              icon={<Icon aria-hidden />}
            >
              {tab.label}
              {tab.count ? (
                <span className="bg-muted text-muted-foreground group-data-[selected=true]:bg-primary-foreground/20 group-data-[selected=true]:text-primary-foreground inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold tabular-nums">
                  {tab.count}
                </span>
              ) : null}
            </Tabs.Trigger>
          );
        })}
      </Tabs.List>
      {tabs.map((tab) => (
        <Tabs.Panel key={tab.value} value={tab.value}>
          <div className="border-border bg-background mt-2 rounded-lg border p-5">
            <h3 className="text-foreground text-base font-semibold">
              {tab.title}
            </h3>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              {tab.body}
            </p>
          </div>
        </Tabs.Panel>
      ))}
    </Tabs>
  );
}
