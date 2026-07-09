"use client";

import { Tabs } from "@dethink/components";

const tabs = [
  {
    value: "overview",
    label: "Overview",
    title: "Workspace overview",
    body: "Track owner, plan, and operational readiness from one compact surface.",
  },
  {
    value: "members",
    label: "Members",
    title: "Members",
    body: "Review admins, pending invites, and role coverage before handing off access.",
  },
  {
    value: "billing",
    label: "Billing",
    title: "Billing",
    body: "Keep billing status, invoices, and plan limits close to workspace settings.",
  },
  {
    value: "security",
    label: "Security",
    title: "Security",
    body: "Confirm SSO, audit retention, and recovery controls before rollout.",
  },
  {
    value: "automation",
    label: "Automation",
    title: "Automation",
    body: "Move from Tab 1 to Tab 5 to see the active background glide across tabs.",
  },
];

export function TabsBasic() {
  return (
    <Tabs defaultValue="overview" className="max-w-3xl">
      <Tabs.List aria-label="Workspace sections">
        {tabs.map((tab) => (
          <Tabs.Trigger key={tab.value} value={tab.value}>
            {tab.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {tabs.map((tab) => (
        <Tabs.Panel key={tab.value} value={tab.value}>
          <div className="border-border bg-background mt-2 rounded-lg border p-5">
            <h3 className="text-foreground text-base font-semibold">
              {tab.title}
            </h3>
            <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-6">
              {tab.body}
            </p>
          </div>
        </Tabs.Panel>
      ))}
    </Tabs>
  );
}
