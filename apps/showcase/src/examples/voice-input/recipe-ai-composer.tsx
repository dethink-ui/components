"use client";

import { useState } from "react";
import {
  Button,
  Field,
  FieldControl,
  FieldLabel,
  Textarea,
  type VoiceInputState,
} from "@dethink/components";
import { VoiceInputDemoMedia } from "@/examples/_shared/voice-input-demo-media";

export function VoiceInputRecipeAiComposer() {
  const [state, setState] = useState<VoiceInputState>("idle");
  const [muted, setMuted] = useState(false);

  return (
    <form
      className="border-border bg-background mx-auto max-w-2xl rounded-lg border p-4"
      onSubmit={(event) => event.preventDefault()}
    >
      <Field id="voice-prompt">
        <FieldLabel>Ask the assistant</FieldLabel>
        <FieldControl asChild>
          <Textarea
            rows={4}
            resize="none"
            placeholder="Summarize the deployment blockers from this incident..."
          />
        </FieldControl>
      </Field>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p aria-live="polite" className="text-muted-foreground text-sm">
          {state === "recording"
            ? "Voice stream is live"
            : state === "muted"
              ? "Voice stream is muted"
              : state === "permission-denied"
                ? "Microphone permission denied"
                : "Type or start voice input"}
        </p>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setMuted((value) => !value)}
          >
            {muted ? "Unmute" : "Mute"}
          </Button>
          <VoiceInputDemoMedia
            muted={muted}
            variant="solid"
            onStateChange={setState}
            onStop={() => setState("idle")}
          />
          <Button size="sm">Send</Button>
        </div>
      </div>
    </form>
  );
}
