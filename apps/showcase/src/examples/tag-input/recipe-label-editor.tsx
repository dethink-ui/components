"use client";

import { Form, Stack, TagInput } from "@dethink/components";

export function TagInputRecipeLabelEditor() {
  return (
    <Form action="/cases" method="post" className="mx-auto max-w-md">
      <div className="border-border bg-muted/20 rounded-lg border p-4">
        <Stack gap="4">
          <TagInput
            defaultValue={["finance", "renewal", "priority"]}
            description="Paste comma-separated values to add several labels at once."
            label="Case labels"
            name="caseLabels"
            maxTags={8}
            maxTagLength={24}
          />
          <TagInput
            defaultValue={["ops@example.com"]}
            label="Notification recipients"
            name="recipients"
            validateTag={(value) =>
              value.includes("@") ? null : "Use an email address."
            }
          />
        </Stack>
      </div>
    </Form>
  );
}
