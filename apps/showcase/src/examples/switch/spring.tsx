"use client";

import { Switch } from "@dethink/components";

export function SwitchSpring() {
  return (
    <div className="grid w-full max-w-md gap-6 sm:grid-cols-2">
      <label
        htmlFor="switch-spring-standard"
        className="flex items-center gap-3 text-sm"
      >
        <Switch id="switch-spring-standard" />
        Standard motion
      </label>
      <label
        htmlFor="switch-spring-motion"
        className="flex items-center gap-3 text-sm"
      >
        <Switch id="switch-spring-motion" spring />
        Spring motion
      </label>
      <label
        htmlFor="switch-spring-small"
        className="flex items-center gap-3 text-sm"
      >
        <Switch
          id="switch-spring-small"
          spring
          controlSize="sm"
          defaultChecked
        />
        Small spring
      </label>
      <label
        htmlFor="switch-spring-large"
        className="flex items-center gap-3 text-sm"
      >
        <Switch
          id="switch-spring-large"
          spring
          controlSize="lg"
          defaultChecked
        />
        Large spring
      </label>
      <label
        htmlFor="switch-spring-disabled"
        className="flex items-center gap-3 text-sm"
      >
        <Switch id="switch-spring-disabled" spring disabled defaultChecked />
        Disabled spring
      </label>
      <label
        htmlFor="switch-spring-rtl"
        className="flex items-center gap-3 text-sm"
        dir="rtl"
      >
        <Switch id="switch-spring-rtl" spring />
        RTL spring
      </label>
    </div>
  );
}
