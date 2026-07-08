"use client";

import { useState } from "react";
import {
  Field,
  FieldContent,
  FieldControl,
  FieldDescription,
  FieldLabel,
  Switch,
} from "@dethink/components";

/**
 * Dependent toggles: children only apply while the parent is on, so they
 * disable (and visually recede) rather than silently doing nothing.
 */
export function SwitchRecipeSettings() {
  const [notifications, setNotifications] = useState(true);
  const [mentions, setMentions] = useState(true);
  const [digest, setDigest] = useState(false);

  return (
    <div className="mx-auto max-w-sm space-y-4">
      <Field id="ns-all" orientation="horizontal">
        <FieldControl asChild>
          <Switch checked={notifications} onCheckedChange={setNotifications} />
        </FieldControl>
        <FieldContent>
          <FieldLabel className="font-medium">Notifications</FieldLabel>
          <FieldDescription>Master switch for all channels.</FieldDescription>
        </FieldContent>
      </Field>
      <div
        className={`border-border space-y-4 border-l pl-6 transition-opacity ${
          notifications ? "" : "opacity-50"
        }`}
      >
        <Field id="ns-mentions" orientation="horizontal">
          <FieldControl asChild>
            <Switch
              checked={mentions}
              onCheckedChange={setMentions}
              disabled={!notifications}
            />
          </FieldControl>
          <FieldLabel>Mentions and replies</FieldLabel>
        </Field>
        <Field id="ns-digest" orientation="horizontal">
          <FieldControl asChild>
            <Switch
              checked={digest}
              onCheckedChange={setDigest}
              disabled={!notifications}
            />
          </FieldControl>
          <FieldLabel>Daily digest email</FieldLabel>
        </Field>
      </div>
    </div>
  );
}
