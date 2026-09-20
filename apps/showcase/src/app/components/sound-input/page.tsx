import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { SoundInputBasic } from "@/examples/sound-input/basic";
import { SoundInputRecipeAiComposer } from "@/examples/sound-input/recipe-ai-composer";
import { SoundInputRecipeVoiceMemo } from "@/examples/sound-input/recipe-voice-memo";
import { SoundInputSizes } from "@/examples/sound-input/sizes";
import { SoundInputStates } from "@/examples/sound-input/states";
import { SoundInputVariants } from "@/examples/sound-input/variants";
import { soundInputProps } from "@/lib/props/sound-input";

export const metadata: Metadata = {
  title: "SoundInput",
  description: "Capture microphone audio and show its input level.",
};

export default function SoundInputPage() {
  return (
    <DocsPage
      name="SoundInput"
      description="Capture microphone audio and show its input level."
    >
      <InstallationSection
        registryName="sound-input"
        importCode={`import { SoundInput } from "@dethink/components";

export function Example() {
  return <SoundInput onStream={(stream) => startTranscription(stream)} />;
}`}
      />

      <DocsSection
        id="examples"
        title="Examples"
        description="Try the examples, then open the code to use them in your app. The docs examples use local fake streams so they can be exercised without granting microphone access."
      >
        <div className="space-y-10">
          <ExampleBlock
            file="sound-input/basic.tsx"
            title="Basic"
            description="Activation requests a stream, calls onStream, and a second activation stops the owned tracks."
          >
            <SoundInputBasic />
          </ExampleBlock>
          <ExampleBlock
            file="sound-input/variants.tsx"
            title="Variants"
            description="SoundInput follows the same action hierarchy as Button and RevealButton."
          >
            <SoundInputVariants />
          </ExampleBlock>
          <ExampleBlock
            file="sound-input/sizes.tsx"
            title="Sizes"
            description="The collapsed circle tracks component size; the active pill expands inline from that same height."
          >
            <SoundInputSizes />
          </ExampleBlock>
          <ExampleBlock
            file="sound-input/states.tsx"
            title="States"
            description="Recording, muted, denied, unsupported, disabled, and reduced-motion states all keep native button semantics."
          >
            <SoundInputStates />
          </ExampleBlock>
        </div>
      </DocsSection>

      <DocsSection
        id="recipes"
        title="Recipes"
        description="Production-shaped compositions that wire SoundInput into app-owned workflows. The voice memo recipe uses your real microphone so the waveform reacts to live sound; the others run on local fake streams."
      >
        <div className="space-y-10">
          <ExampleBlock
            file="sound-input/recipe-voice-memo.tsx"
            title="Record and play back"
            description="SoundInput hands the app a live MediaStream. Here the app records it with MediaRecorder and plays the take back inline — grant microphone access to try it."
            wide
          >
            <SoundInputRecipeVoiceMemo />
          </ExampleBlock>
          <ExampleBlock
            file="sound-input/recipe-ai-composer.tsx"
            title="AI composer"
            description="The app owns transcription or streaming work. SoundInput only owns permission, stream lifecycle, and visual state."
            wide
          >
            <SoundInputRecipeAiComposer />
          </ExampleBlock>
        </div>
      </DocsSection>

      <DocsSection
        id="props"
        title="Props"
        description="SoundInputProps extends native button props, except it owns children and accessible names through state labels."
      >
        <PropsTable caption="SoundInput props" rows={soundInputProps} />
      </DocsSection>
    </DocsPage>
  );
}
