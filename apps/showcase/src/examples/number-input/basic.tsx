"use client";

import {
  Field,
  FieldControl,
  FieldDescription,
  FieldLabel,
  NumberInput,
} from "@dethink/components";

export function NumberInputBasic() {
  return (
    <div className="mx-auto max-w-xs">
      <Field id="ni-seats">
        <FieldLabel>Seats</FieldLabel>
        <FieldControl asChild>
          <NumberInput
            name="seats"
            type="number"
            min={1}
            max={500}
            step={1}
            defaultValue={5}
          />
        </FieldControl>
        <FieldDescription>Between 1 and 500 seats.</FieldDescription>
      </Field>
    </div>
  );
}
