"use client";

import { useState } from "react";
import { Combobox, ComboboxItem } from "@dethink/components";

export function ComboboxCustomValue() {
  const [label, setLabel] = useState<string | null>("bug");

  return (
    <div className="mx-auto max-w-xs space-y-2">
      <Combobox
        label="Label"
        description="Pick an existing label or type a new one."
        allowsCustomValue
        formValue="text"
        defaultInputValue="bug"
        onValueChange={setLabel}
        onInputValueChange={(text) => setLabel(text || null)}
      >
        <ComboboxItem value="bug">bug</ComboboxItem>
        <ComboboxItem value="enhancement">enhancement</ComboboxItem>
        <ComboboxItem value="documentation">documentation</ComboboxItem>
        <ComboboxItem value="good-first-issue">good first issue</ComboboxItem>
      </Combobox>
      <p className="text-muted-foreground text-sm">
        Will apply: {label ?? "nothing"}
      </p>
    </div>
  );
}
