"use client";

import {
  Checkbox,
  Field,
  FieldContent,
  FieldControl,
  FieldDescription,
  FieldLabel,
} from "@dethink/components";

export function CheckboxBasic() {
  return (
    <div className="mx-auto max-w-sm space-y-4">
      <Field id="cb-updates" orientation="horizontal">
        <FieldControl asChild>
          <Checkbox name="updates" value="yes" defaultChecked />
        </FieldControl>
        <FieldLabel>Receive product updates</FieldLabel>
      </Field>
      <Field id="cb-summary" orientation="horizontal">
        <FieldControl asChild>
          <Checkbox name="summary" value="enabled" />
        </FieldControl>
        <FieldContent>
          <FieldLabel>Weekly summary</FieldLabel>
          <FieldDescription>
            An adoption and reliability digest every Monday.
          </FieldDescription>
        </FieldContent>
      </Field>
    </div>
  );
}
