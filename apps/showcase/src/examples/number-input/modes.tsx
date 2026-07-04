"use client";

import {
  Field,
  FieldControl,
  FieldLabel,
  NumberInput,
} from "@dethink/components";

export function NumberInputModes() {
  return (
    <div className="mx-auto grid max-w-md gap-5 sm:grid-cols-2">
      <Field id="ni-amount">
        <FieldLabel>Amount (decimal keypad)</FieldLabel>
        <FieldControl asChild>
          <NumberInput numberMode="decimal" placeholder="19.99" />
        </FieldControl>
      </Field>
      <Field id="ni-code">
        <FieldLabel>Verification code (numeric keypad)</FieldLabel>
        <FieldControl asChild>
          <NumberInput numberMode="numeric" placeholder="123456" maxLength={6} />
        </FieldControl>
      </Field>
      <Field id="ni-disabled" disabled>
        <FieldLabel>Disabled</FieldLabel>
        <FieldControl asChild>
          <NumberInput type="number" defaultValue={42} />
        </FieldControl>
      </Field>
      <Field id="ni-invalid" invalid>
        <FieldLabel>Invalid</FieldLabel>
        <FieldControl asChild>
          <NumberInput type="number" defaultValue={-3} min={0} />
        </FieldControl>
      </Field>
    </div>
  );
}
