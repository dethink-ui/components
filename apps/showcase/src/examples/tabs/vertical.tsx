"use client";

import { Tabs } from "@dethink/components";

const sections = [
  ["profile", "Profile", "Name, title, avatar, and public contact details."],
  ["access", "Access", "Workspace roles, groups, and invite controls."],
  ["notifications", "Notifications", "Email, Slack, and digest preferences."],
];

export function TabsVertical() {
  return (
    <Tabs
      defaultValue="profile"
      orientation="vertical"
      variant="line"
      className="grid gap-5 md:grid-cols-[12rem_minmax(0,1fr)]"
    >
      <Tabs.List aria-label="Profile settings">
        {sections.map(([value, label]) => (
          <Tabs.Trigger key={value} value={value}>
            {label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      <div className="min-w-0">
        {sections.map(([value, label, body]) => (
          <Tabs.Panel key={value} value={value}>
            <div className="border-border rounded-lg border p-5">
              <h3 className="text-foreground text-base font-semibold">
                {label}
              </h3>
              <p className="text-muted-foreground mt-2 text-sm leading-6">
                {body}
              </p>
            </div>
          </Tabs.Panel>
        ))}
      </div>
    </Tabs>
  );
}
