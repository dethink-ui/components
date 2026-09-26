"use client";
import {
  Inspector,
  InspectorNumber,
  InspectorProperty,
  InspectorSection,
  InspectorSwitch,
  InspectorText,
  type InspectorValue,
} from "@dethink/components";
import { useState } from "react";

export function InspectorBasic() {
  const [value, setValue] = useState<InspectorValue>({
    title: "Quarterly revenue",
    refresh: 15,
    showLegend: true,
  });

  return (
    <Inspector
      aria-label="Widget settings"
      role="region"
      className="border-border bg-background mx-auto w-full max-w-xs rounded-lg border"
      value={value}
      onValueChange={(next) => setValue(next)}
    >
      <InspectorSection title="Widget">
        <InspectorProperty path="title" label="Title">
          <InspectorText
            validate={(text) => (text.trim() ? null : "Add a title.")}
          />
        </InspectorProperty>
        <InspectorProperty
          path="refresh"
          label="Refresh"
          description="How often the widget reloads."
        >
          <InspectorNumber min={1} max={120} unit="min" />
        </InspectorProperty>
        <InspectorProperty path="showLegend" label="Legend">
          <InspectorSwitch />
        </InspectorProperty>
      </InspectorSection>
    </Inspector>
  );
}
