"use client";

import { Combobox, ComboboxItem } from "@dethink/components";

export function ComboboxBasic() {
  return (
    <div className="mx-auto max-w-xs">
      <Combobox
        label="Assignee"
        placeholder="Type to filter people"
        description="Filtering matches as you type."
        name="assignee"
      >
        <ComboboxItem value="amara">Amara Okafor</ComboboxItem>
        <ComboboxItem value="jonas">Jonas Weber</ComboboxItem>
        <ComboboxItem value="mei">Mei Tanaka</ComboboxItem>
        <ComboboxItem value="ravi">Ravi Sharma</ComboboxItem>
        <ComboboxItem value="sofia">Sofía Delgado</ComboboxItem>
      </Combobox>
    </div>
  );
}
