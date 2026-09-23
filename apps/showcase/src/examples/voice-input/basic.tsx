"use client";

import { useState } from "react";
import { type VoiceInputState } from "@dethink/components";
import { VoiceInputDemoMedia } from "@/examples/_shared/voice-input-demo-media";

export function VoiceInputBasic() {
  const [state, setState] = useState<VoiceInputState>("idle");

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <VoiceInputDemoMedia
        onStateChange={setState}
        onStream={() => setState("recording")}
        onStop={() => setState("idle")}
      />
      <p aria-live="polite" className="text-muted-foreground text-sm">
        {state === "idle"
          ? "Ready for voice input"
          : state === "recording"
            ? "Live stream handed to the app"
            : state === "muted"
              ? "Stream is open, audio tracks are muted"
              : state === "permission-denied"
                ? "Permission was denied"
                : state === "unsupported"
                  ? "Microphone APIs are unavailable"
                  : "Requesting microphone permission"}
      </p>
    </div>
  );
}
