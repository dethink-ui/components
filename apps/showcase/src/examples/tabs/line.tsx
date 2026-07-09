"use client";

import { Tabs } from "@dethink/components";

const reports = [
  ["summary", "Summary", "Revenue, retention, and usage movement."],
  ["traffic", "Traffic", "Acquisition sources and product entry points."],
  ["conversion", "Conversion", "Trial, activation, and expansion funnels."],
];

export function TabsLine() {
  return (
    <Tabs defaultValue="summary" variant="line" className="max-w-2xl">
      <Tabs.List aria-label="Report views">
        {reports.map(([value, label]) => (
          <Tabs.Trigger key={value} value={value}>
            {label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {reports.map(([value, label, body]) => (
        <Tabs.Panel key={value} value={value} className="pt-4">
          <h3 className="text-foreground text-sm font-semibold">{label}</h3>
          <p className="text-muted-foreground mt-2 text-sm leading-6">{body}</p>
        </Tabs.Panel>
      ))}
    </Tabs>
  );
}
