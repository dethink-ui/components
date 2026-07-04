"use client";

import { Checkbox, Field, FieldControl, FieldLabel } from "@dethink/components";

export function CheckboxStates() {
  return (
    <div className="mx-auto grid max-w-md gap-4 sm:grid-cols-2">
      <Field id="cb-checked" orientation="horizontal">
        <FieldControl asChild>
          <Checkbox defaultChecked />
        </FieldControl>
        <FieldLabel>Checked</FieldLabel>
      </Field>
      <Field id="cb-indeterminate" orientation="horizontal">
        <FieldControl asChild>
          <Checkbox checked="indeterminate" readOnly />
        </FieldControl>
        <FieldLabel>Indeterminate</FieldLabel>
      </Field>
      <Field id="cb-disabled" orientation="horizontal">
        <FieldControl asChild>
          <Checkbox disabled defaultChecked />
        </FieldControl>
        <FieldLabel>Disabled</FieldLabel>
      </Field>
      <Field id="cb-invalid" orientation="horizontal">
        <FieldControl asChild>
          <Checkbox invalid required />
        </FieldControl>
        <FieldLabel>Invalid, required</FieldLabel>
      </Field>
      <Field id="cb-sm" orientation="horizontal">
        <FieldControl asChild>
          <Checkbox controlSize="sm" defaultChecked />
        </FieldControl>
        <FieldLabel>Small</FieldLabel>
      </Field>
      <Field id="cb-lg" orientation="horizontal">
        <FieldControl asChild>
          <Checkbox controlSize="lg" defaultChecked />
        </FieldControl>
        <FieldLabel>Large</FieldLabel>
      </Field>
    </div>
  );
}
