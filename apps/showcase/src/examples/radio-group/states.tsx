"use client";

import {
  Field,
  FieldControl,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  RadioGroup,
  RadioGroupItem,
} from "@dethink/components";

export function RadioGroupStates() {
  return (
    <div className="mx-auto grid max-w-lg gap-6 sm:grid-cols-2">
      <FieldSet>
        <FieldLegend>Horizontal</FieldLegend>
        <RadioGroup
          name="priority"
          orientation="horizontal"
          defaultValue="high"
        >
          <FieldGroup className="flex-row gap-4">
            <Field id="pri-low" orientation="horizontal">
              <FieldControl asChild>
                <RadioGroupItem value="low" />
              </FieldControl>
              <FieldLabel>Low</FieldLabel>
            </Field>
            <Field id="pri-high" orientation="horizontal">
              <FieldControl asChild>
                <RadioGroupItem value="high" />
              </FieldControl>
              <FieldLabel>High</FieldLabel>
            </Field>
          </FieldGroup>
        </RadioGroup>
      </FieldSet>
      <FieldSet>
        <FieldLegend>Disabled group</FieldLegend>
        <RadioGroup name="tier" disabled defaultValue="team">
          <FieldGroup>
            <Field id="tier-starter" orientation="horizontal">
              <FieldControl asChild>
                <RadioGroupItem value="starter" />
              </FieldControl>
              <FieldLabel>Starter</FieldLabel>
            </Field>
            <Field id="tier-team" orientation="horizontal">
              <FieldControl asChild>
                <RadioGroupItem value="team" />
              </FieldControl>
              <FieldLabel>Team</FieldLabel>
            </Field>
          </FieldGroup>
        </RadioGroup>
      </FieldSet>
    </div>
  );
}
