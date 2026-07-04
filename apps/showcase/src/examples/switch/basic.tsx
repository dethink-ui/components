"use client";

import {
  Field,
  FieldContent,
  FieldControl,
  FieldDescription,
  FieldLabel,
  Switch,
} from "@dethink/components";

export function SwitchBasic() {
  return (
    <div className="mx-auto max-w-sm space-y-4">
      <Field id="sw-autosave" orientation="horizontal">
        <FieldControl asChild>
          <Switch name="autosave" defaultChecked />
        </FieldControl>
        <FieldLabel>Autosave</FieldLabel>
      </Field>
      <Field id="sw-usage" orientation="horizontal">
        <FieldControl asChild>
          <Switch name="usage" />
        </FieldControl>
        <FieldContent>
          <FieldLabel>Share usage data</FieldLabel>
          <FieldDescription>
            Anonymous metrics that help prioritize fixes.
          </FieldDescription>
        </FieldContent>
      </Field>
    </div>
  );
}
