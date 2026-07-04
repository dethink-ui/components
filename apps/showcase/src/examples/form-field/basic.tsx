"use client";

import {
  Field,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldLabel,
  Input,
} from "@dethink/components";

export function FormFieldBasic() {
  return (
    <div className="mx-auto grid max-w-md gap-6">
      <Field id="ff-handle">
        <FieldLabel>Handle</FieldLabel>
        <FieldControl asChild>
          <Input placeholder="acme-corp" />
        </FieldControl>
        <FieldDescription>
          Lowercase letters, numbers, and hyphens only.
        </FieldDescription>
      </Field>
      <Field id="ff-api-key" invalid>
        <FieldLabel>API key</FieldLabel>
        <FieldControl asChild>
          <Input defaultValue="sk_live_…" />
        </FieldControl>
        <FieldError>This key was revoked on June 2.</FieldError>
      </Field>
    </div>
  );
}
