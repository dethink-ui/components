"use client";

import { Button, Tabs } from "@dethink/components";

const settings = [
  ["general", "General", "Workspace name, default region, and owner details."],
  ["billing", "Billing", "Plan, seats, invoices, and spend controls."],
  ["security", "Security", "SSO, audit logs, recovery, and session policy."],
  ["models", "AI models", "Default model routing and fallback providers."],
];

export function TabsRecipeSettings() {
  return (
    <Tabs defaultValue="general" className="max-w-4xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <Tabs.List aria-label="Workspace settings sections">
          {settings.map(([value, label]) => (
            <Tabs.Trigger key={value} value={value}>
              {label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        <Button size="sm" variant="outline">
          Save changes
        </Button>
      </div>
      {settings.map(([value, label, body]) => (
        <Tabs.Panel key={value} value={value}>
          <div className="border-border bg-background mt-2 grid gap-4 rounded-lg border p-5">
            <div>
              <h3 className="text-foreground text-base font-semibold">
                {label}
              </h3>
              <p className="text-muted-foreground mt-1 text-sm leading-6">
                {body}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="bg-muted/35 rounded-md p-3">
                <p className="text-sm font-medium">Status</p>
                <p className="text-muted-foreground mt-1 text-sm">
                  Ready for review
                </p>
              </div>
              <div className="bg-muted/35 rounded-md p-3">
                <p className="text-sm font-medium">Owner</p>
                <p className="text-muted-foreground mt-1 text-sm">
                  Platform operations
                </p>
              </div>
            </div>
          </div>
        </Tabs.Panel>
      ))}
    </Tabs>
  );
}
