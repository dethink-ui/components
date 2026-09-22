"use client";

import { useState } from "react";
import { Button, VoiceInput } from "@dethink/components";
import { VoiceInputDemoMedia } from "@/examples/_shared/voice-input-demo-media";

export function VoiceInputStates() {
  const [muted, setMuted] = useState(true);

  return (
    <div className="grid w-full gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <p className="text-muted-foreground text-sm font-medium">Recording</p>
        <VoiceInputDemoMedia labels={{ idle: "Start demo recording" }} />
      </div>
      <div className="space-y-2">
        <p className="text-muted-foreground text-sm font-medium">Muted</p>
        <div className="flex items-center gap-2">
          <VoiceInputDemoMedia
            muted={muted}
            labels={{ idle: "Start muted recording" }}
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() => setMuted((value) => !value)}
          >
            {muted ? "Unmute" : "Mute"}
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-muted-foreground text-sm font-medium">
          Permission denied
        </p>
        <VoiceInputDemoMedia
          mode="denied"
          labels={{ idle: "Try denied microphone" }}
        />
      </div>
      <div className="space-y-2">
        <p className="text-muted-foreground text-sm font-medium">Unsupported</p>
        <VoiceInputDemoMedia
          mode="unsupported"
          labels={{ idle: "Try unsupported microphone" }}
        />
      </div>
      {(["missing", "busy", "constraints", "pending"] as const).map((mode) => (
        <div key={mode} className="space-y-2">
          <p className="text-muted-foreground text-sm font-medium">
            {mode === "missing"
              ? "No microphone"
              : mode === "busy"
                ? "Microphone in use"
                : mode === "constraints"
                  ? "Unavailable settings"
                  : "Cancelable permission request"}
          </p>
          <VoiceInputDemoMedia
            mode={mode}
            labels={{ idle: `Try ${mode} microphone` }}
          />
        </div>
      ))}
      <div className="space-y-2">
        <p className="text-muted-foreground text-sm font-medium">Disabled</p>
        <VoiceInput disabled labels={{ idle: "Voice input unavailable" }} />
      </div>
      <div className="space-y-2">
        <p className="text-muted-foreground text-sm font-medium">
          Reduced motion
        </p>
        <VoiceInputDemoMedia
          motion="none"
          labels={{ idle: "Start without motion" }}
        />
      </div>
    </div>
  );
}
