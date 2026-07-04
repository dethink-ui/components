"use client";

import {
  Checkbox,
  Field,
  FieldControl,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@dethink/components";

export function FormFieldGroup() {
  return (
    <div className="mx-auto max-w-sm">
      <FieldSet>
        <FieldLegend>Notification channels</FieldLegend>
        <FieldGroup>
          <Field id="ffg-email" orientation="horizontal">
            <FieldControl asChild>
              <Checkbox name="channels" value="email" defaultChecked />
            </FieldControl>
            <FieldLabel>Email</FieldLabel>
          </Field>
          <Field id="ffg-slack" orientation="horizontal">
            <FieldControl asChild>
              <Checkbox name="channels" value="slack" />
            </FieldControl>
            <FieldLabel>Slack</FieldLabel>
          </Field>
          <Field id="ffg-sms" orientation="horizontal" disabled>
            <FieldControl asChild>
              <Checkbox name="channels" value="sms" />
            </FieldControl>
            <FieldLabel>SMS (requires verified phone)</FieldLabel>
          </Field>
        </FieldGroup>
      </FieldSet>
    </div>
  );
}
