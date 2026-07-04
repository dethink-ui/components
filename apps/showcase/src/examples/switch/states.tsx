"use client";

import { Field, FieldControl, FieldLabel, Switch } from "@dethink/components";

export function SwitchStates() {
  return (
    <div className="mx-auto grid max-w-md gap-4 sm:grid-cols-2">
      <Field id="sw-on" orientation="horizontal">
        <FieldControl asChild>
          <Switch defaultChecked />
        </FieldControl>
        <FieldLabel>On</FieldLabel>
      </Field>
      <Field id="sw-off" orientation="horizontal">
        <FieldControl asChild>
          <Switch />
        </FieldControl>
        <FieldLabel>Off</FieldLabel>
      </Field>
      <Field id="sw-disabled" orientation="horizontal">
        <FieldControl asChild>
          <Switch disabled defaultChecked />
        </FieldControl>
        <FieldLabel>Disabled</FieldLabel>
      </Field>
      <Field id="sw-invalid" orientation="horizontal">
        <FieldControl asChild>
          <Switch invalid />
        </FieldControl>
        <FieldLabel>Invalid</FieldLabel>
      </Field>
      <Field id="sw-sm" orientation="horizontal">
        <FieldControl asChild>
          <Switch controlSize="sm" defaultChecked />
        </FieldControl>
        <FieldLabel>Small</FieldLabel>
      </Field>
      <Field id="sw-lg" orientation="horizontal">
        <FieldControl asChild>
          <Switch controlSize="lg" defaultChecked />
        </FieldControl>
        <FieldLabel>Large</FieldLabel>
      </Field>
    </div>
  );
}
