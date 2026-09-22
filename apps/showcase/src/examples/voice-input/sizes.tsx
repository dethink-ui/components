"use client";

import { type VoiceInputSize } from "@dethink/components";
import { VoiceInputDemoMedia } from "@/examples/_shared/voice-input-demo-media";

const sizes: VoiceInputSize[] = ["xs", "sm", "md", "lg", "xl"];

export function VoiceInputSizes() {
  return (
    <div className="gap-density-gap flex flex-wrap items-center justify-center">
      {sizes.map((size) => (
        <VoiceInputDemoMedia
          key={size}
          labels={{ idle: `${size} voice input` }}
          size={size}
          variant="outline"
        />
      ))}
    </div>
  );
}
