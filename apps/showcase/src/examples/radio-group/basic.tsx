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

export function RadioGroupBasic() {
  return (
    <div className="mx-auto max-w-sm">
      <FieldSet>
        <FieldLegend>Deploy frequency</FieldLegend>
        <RadioGroup name="frequency" defaultValue="on-merge">
          <FieldGroup>
            <Field id="freq-on-merge" orientation="horizontal">
              <FieldControl asChild>
                <RadioGroupItem value="on-merge" />
              </FieldControl>
              <FieldLabel>Deploy on every merge</FieldLabel>
            </Field>
            <Field id="freq-daily" orientation="horizontal">
              <FieldControl asChild>
                <RadioGroupItem value="daily" />
              </FieldControl>
              <FieldLabel>Once a day</FieldLabel>
            </Field>
            <Field id="freq-manual" orientation="horizontal">
              <FieldControl asChild>
                <RadioGroupItem value="manual" />
              </FieldControl>
              <FieldLabel>Manual releases only</FieldLabel>
            </Field>
          </FieldGroup>
        </RadioGroup>
      </FieldSet>
    </div>
  );
}
