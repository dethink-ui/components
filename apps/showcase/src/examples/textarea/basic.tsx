"use client";

import {
  Field,
  FieldContent,
  FieldControl,
  FieldDescription,
  FieldLabel,
  Textarea,
} from "@dethink/components";

export function TextareaBasic() {
  return (
    <div className="mx-auto max-w-sm">
      <Field id="ta-feedback">
        <FieldContent>
          <FieldLabel>Feedback</FieldLabel>
          <FieldDescription>
            What should the next release improve?
          </FieldDescription>
        </FieldContent>
        <FieldControl asChild>
          <Textarea name="feedback" rows={4} placeholder="Tell us anything…" />
        </FieldControl>
      </Field>
    </div>
  );
}
