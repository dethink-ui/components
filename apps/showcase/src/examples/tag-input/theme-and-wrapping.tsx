"use client";

import { DethinkProvider, TagInput } from "@dethink/components";

export function TagInputThemeAndWrapping() {
  return (
    <DethinkProvider theme="dark" density="compact" dir="rtl">
      <div className="mx-auto max-w-72 rounded-lg border border-border bg-background p-4">
        <TagInput
          defaultValue={[
            "finance",
            "renewal",
            "executive-review",
            "customer-success",
          ]}
          label="وسوم الحساب"
          name="accountTags"
        />
      </div>
    </DethinkProvider>
  );
}
