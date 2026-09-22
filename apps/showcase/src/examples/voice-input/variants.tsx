"use client";

import { type VoiceInputVariant } from "@dethink/components";
import { VoiceInputDemoMedia } from "@/examples/_shared/voice-input-demo-media";

const variants: VoiceInputVariant[] = [
  "solid",
  "soft",
  "outline",
  "ghost",
  "destructive",
];

export function VoiceInputVariants() {
  return (
    <div className="gap-density-gap flex flex-wrap items-center justify-center">
      {variants.map((variant) => (
        <VoiceInputDemoMedia
          key={variant}
          labels={{ idle: `${variant} voice input` }}
          variant={variant}
        />
      ))}
    </div>
  );
}
