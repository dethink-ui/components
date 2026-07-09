"use client";

import { useState } from "react";
import { Button, SoundInput } from "@dethink/components";
import { SoundInputDemoMedia } from "@/examples/_shared/sound-input-demo-media";

export function SoundInputStates() {
  const [muted, setMuted] = useState(true);

  return (
    <div className="grid w-full gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <p className="text-muted-foreground text-sm font-medium">Recording</p>
        <SoundInputDemoMedia>
          <SoundInput labels={{ idle: "Start demo recording" }} />
        </SoundInputDemoMedia>
      </div>
      <div className="space-y-2">
        <p className="text-muted-foreground text-sm font-medium">Muted</p>
        <div className="flex items-center gap-2">
          <SoundInputDemoMedia>
            <SoundInput
              muted={muted}
              labels={{ idle: "Start muted recording" }}
            />
          </SoundInputDemoMedia>
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
        <SoundInputDemoMedia mode="denied">
          <SoundInput labels={{ idle: "Try denied microphone" }} />
        </SoundInputDemoMedia>
      </div>
      <div className="space-y-2">
        <p className="text-muted-foreground text-sm font-medium">Unsupported</p>
        <SoundInputDemoMedia mode="unsupported">
          <SoundInput labels={{ idle: "Try unsupported microphone" }} />
        </SoundInputDemoMedia>
      </div>
      <div className="space-y-2">
        <p className="text-muted-foreground text-sm font-medium">Disabled</p>
        <SoundInput disabled labels={{ idle: "Voice input unavailable" }} />
      </div>
      <div className="space-y-2">
        <p className="text-muted-foreground text-sm font-medium">
          Reduced motion
        </p>
        <SoundInputDemoMedia>
          <SoundInput motion="none" labels={{ idle: "Start without motion" }} />
        </SoundInputDemoMedia>
      </div>
    </div>
  );
}
