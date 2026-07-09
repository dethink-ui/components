"use client";

import { SoundInput, type SoundInputVariant } from "@dethink/components";
import { SoundInputDemoMedia } from "@/examples/_shared/sound-input-demo-media";

const variants: SoundInputVariant[] = [
  "solid",
  "soft",
  "outline",
  "ghost",
  "destructive",
];

export function SoundInputVariants() {
  return (
    <SoundInputDemoMedia>
      <div className="gap-density-gap flex flex-wrap items-center justify-center">
        {variants.map((variant) => (
          <SoundInput
            key={variant}
            labels={{ idle: `${variant} voice input` }}
            variant={variant}
          />
        ))}
      </div>
    </SoundInputDemoMedia>
  );
}
