"use client";

import { SoundInput, type SoundInputSize } from "@dethink/components";
import { SoundInputDemoMedia } from "@/examples/_shared/sound-input-demo-media";

const sizes: SoundInputSize[] = ["xs", "sm", "md", "lg", "xl"];

export function SoundInputSizes() {
  return (
    <SoundInputDemoMedia>
      <div className="gap-density-gap flex flex-wrap items-center justify-center">
        {sizes.map((size) => (
          <SoundInput
            key={size}
            labels={{ idle: `${size} voice input` }}
            size={size}
            variant="outline"
          />
        ))}
      </div>
    </SoundInputDemoMedia>
  );
}
