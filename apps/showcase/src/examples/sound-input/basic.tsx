"use client";

import { useState } from "react";
import { SoundInput, type SoundInputState } from "@dethink/components";
import { SoundInputDemoMedia } from "@/examples/_shared/sound-input-demo-media";

export function SoundInputBasic() {
  const [state, setState] = useState<SoundInputState>("idle");

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <SoundInputDemoMedia>
        <SoundInput
          onStateChange={setState}
          onStream={() => setState("recording")}
          onStop={() => setState("idle")}
        />
      </SoundInputDemoMedia>
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
