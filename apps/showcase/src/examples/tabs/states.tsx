"use client";

import { Tabs } from "@dethink/components";

export function TabsStates() {
  return (
    <Tabs
      activationMode="manual"
      defaultValue="active"
      motionPreset="none"
      className="max-w-2xl"
    >
      <Tabs.List aria-label="State examples">
        <Tabs.Trigger value="active">Active</Tabs.Trigger>
        <Tabs.Trigger value="disabled" disabled>
          Disabled
        </Tabs.Trigger>
        <Tabs.Trigger value="manual">Manual activation</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Panel value="active">
        <p className="text-muted-foreground text-sm leading-6">
          The active layer is static here because motionPreset is none.
        </p>
      </Tabs.Panel>
      <Tabs.Panel forceMount value="disabled">
        <p className="text-muted-foreground text-sm leading-6">
          Disabled tabs stay visible but are skipped by keyboard navigation.
        </p>
      </Tabs.Panel>
      <Tabs.Panel value="manual">
        <p className="text-muted-foreground text-sm leading-6">
          Arrow keys move focus; Enter or Space activates the focused tab.
        </p>
      </Tabs.Panel>
    </Tabs>
  );
}
