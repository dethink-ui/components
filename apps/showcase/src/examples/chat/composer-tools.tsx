"use client";

import { useState } from "react";
import { Button, PromptInput } from "@dethink/components";

export function ChatComposerTools() {
  const [draft, setDraft] = useState("");
  const [sent, setSent] = useState("");
  return (
    <div className="mx-auto max-w-xl space-y-3">
      <p className="text-muted-foreground border-border rounded-lg border p-3 text-sm">
        Selected context: “Make the first week count.”
      </p>
      <PromptInput
        conversationId="context"
        value={draft}
        onValueChange={setDraft}
        onSend={({ text }) => setSent(text)}
        actions={
          <Button
            size="xs"
            variant="ghost"
            onClick={() =>
              setDraft(
                (value) =>
                  `${value}${value ? "\n\n" : ""}Context: “Make the first week count.”`,
              )
            }
          >
            Use selected context
          </Button>
        }
        footer="The action slot can also host an explicitly activated SoundInput. No microphone is requested here."
      />
      <p role="status" className="text-muted-foreground text-xs">
        {sent ? `Sample prompt accepted: ${sent}` : ""}
      </p>
    </div>
  );
}
