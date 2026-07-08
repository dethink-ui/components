"use client";

import { useState } from "react";
import { Combobox, ComboboxItem } from "@dethink/components";

const commands = [
  {
    value: "new-project",
    label: "Create new project…",
    shortcut: "⌘N",
    group: "Actions",
  },
  {
    value: "invite",
    label: "Invite teammate…",
    shortcut: "⌘I",
    group: "Actions",
  },
  {
    value: "toggle-theme",
    label: "Toggle color scheme",
    shortcut: "⌘⇧L",
    group: "Actions",
  },
  {
    value: "goto-dashboard",
    label: "Go to dashboard",
    shortcut: "G D",
    group: "Navigate",
  },
  {
    value: "goto-billing",
    label: "Go to billing",
    shortcut: "G B",
    group: "Navigate",
  },
  {
    value: "goto-settings",
    label: "Go to settings",
    shortcut: "G S",
    group: "Navigate",
  },
];

/**
 * A command palette is just a Combobox wearing different content: filtering,
 * keyboard navigation, and announcement come built in. Selecting a command
 * runs it and resets the input so the palette is ready for the next run.
 */
export function ComboboxRecipeCommandPalette() {
  const [inputValue, setInputValue] = useState("");
  const [lastCommand, setLastCommand] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-sm space-y-3">
      <Combobox
        aria-label="Command palette"
        placeholder="Type a command or search…"
        menuTrigger="focus"
        items={commands}
        inputValue={inputValue}
        onInputValueChange={setInputValue}
        value={null}
        onValueChange={(value) => {
          if (!value) {
            return;
          }
          const command = commands.find((entry) => entry.value === value);
          setLastCommand(command?.label ?? value);
          setInputValue("");
        }}
      >
        {(command) => (
          <ComboboxItem
            key={command.value}
            value={command.value}
            textValue={command.label}
          >
            <span className="flex w-full items-center justify-between gap-4">
              <span className="flex items-baseline gap-2">
                <span className="text-muted-foreground text-xs tracking-wide uppercase">
                  {command.group}
                </span>
                {command.label}
              </span>
              <kbd className="border-border bg-muted text-muted-foreground rounded border px-1.5 font-mono text-xs">
                {command.shortcut}
              </kbd>
            </span>
          </ComboboxItem>
        )}
      </Combobox>
      <p aria-live="polite" className="text-muted-foreground text-sm">
        {lastCommand ? `Ran: ${lastCommand}` : "No command run yet."}
      </p>
    </div>
  );
}
