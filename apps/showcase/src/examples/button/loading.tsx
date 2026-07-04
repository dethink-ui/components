"use client";

import { useState } from "react";
import { Button } from "@dethink/components";

export function ButtonLoading() {
  const [saving, setSaving] = useState(false);

  function save() {
    setSaving(true);
    setTimeout(() => setSaving(false), 1500);
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Button loading={saving} onClick={save}>
        {saving ? "Saving…" : "Save changes"}
      </Button>
      <Button variant="soft" loading>
        Processing
      </Button>
      <Button variant="outline" disabled>
        Disabled
      </Button>
    </div>
  );
}
