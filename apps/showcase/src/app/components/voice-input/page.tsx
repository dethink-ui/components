import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { VoiceInputBasic } from "@/examples/voice-input/basic";
import { VoiceInputRecipeAiComposer } from "@/examples/voice-input/recipe-ai-composer";
import { VoiceInputRecipeVoiceMemo } from "@/examples/voice-input/recipe-voice-memo";
import { VoiceInputSizes } from "@/examples/voice-input/sizes";
import { VoiceInputStates } from "@/examples/voice-input/states";
import { VoiceInputVariants } from "@/examples/voice-input/variants";
import { voiceInputProps } from "@/lib/props/voice-input";

export const metadata: Metadata = {
  title: "VoiceInput",
  description: "Capture microphone audio and show its input level.",
};

export default function VoiceInputPage() {
  return (
    <DocsPage
      name="VoiceInput"
      description="Capture microphone audio and show its input level."
    >
      <InstallationSection
        registryName="voice-input"
        importCode={`import { VoiceInput } from "@dethink/components";

export function Example() {
  return <VoiceInput onStream={(stream) => startTranscription(stream)} />;
}`}
      />

      <DocsSection
        id="examples"
        title="Examples"
        description="Try the examples, then open the code to use them in your app. The docs examples use local fake streams so they can be exercised without granting microphone access."
      >
        <div className="space-y-10">
          <ExampleBlock
            file="voice-input/basic.tsx"
            title="Basic"
            description="Activation requests a stream, calls onStream, and a second activation stops the owned tracks."
          >
            <VoiceInputBasic />
          </ExampleBlock>
          <ExampleBlock
            file="voice-input/variants.tsx"
            title="Variants"
            description="VoiceInput follows the same action hierarchy as Button and RevealButton."
          >
            <VoiceInputVariants />
          </ExampleBlock>
          <ExampleBlock
            file="voice-input/sizes.tsx"
            title="Sizes"
            description="The control stays circular at every size. A small sunlight ring responds to audio inside the button."
          >
            <VoiceInputSizes />
          </ExampleBlock>
          <ExampleBlock
            file="voice-input/states.tsx"
            title="States"
            description="Recording, muted, denied, unsupported, disabled, and reduced-motion states all keep native button semantics."
          >
            <VoiceInputStates />
          </ExampleBlock>
        </div>
      </DocsSection>

      <DocsSection
        id="recipes"
        title="Recipes"
        description="Production-shaped compositions that wire VoiceInput into app-owned workflows. The voice memo recipe uses your real microphone so the waveform reacts to live sound; the others run on local fake streams."
      >
        <div className="space-y-10">
          <ExampleBlock
            file="voice-input/recipe-voice-memo.tsx"
            title="Record, pause, and keep a memo"
            description="Use your real microphone to record up to one minute, pause and resume, play back, download, or discard a take. Audio stays on this device."
            wide
          >
            <VoiceInputRecipeVoiceMemo />
          </ExampleBlock>
          <ExampleBlock
            file="voice-input/recipe-ai-composer.tsx"
            title="AI composer"
            description="The app owns transcription or streaming work. VoiceInput only owns permission, stream lifecycle, and visual state."
            wide
          >
            <VoiceInputRecipeAiComposer />
          </ExampleBlock>
        </div>
      </DocsSection>

      <DocsSection
        id="lifecycle"
        title="Control the microphone"
        description="VoiceInput owns the stream it acquires. The native ref still points to the button; controllerRef exposes stop() and cancel(). Both release active tracks. Cancel also invalidates a pending permission request: a late stream is stopped without calling onStream. It cannot dismiss the browser permission dialog."
      >
        <p className="text-muted-foreground max-w-prose text-sm leading-6">
          Activate again while permission is pending to cancel. Disabling or
          unmounting also releases the microphone. Mute disables audio tracks
          without releasing access. Use onStateChange for visible status and
          onError for recovery guidance. Errors distinguish denied permission,
          missing devices, busy devices, unsupported settings, unsupported APIs,
          and other failures. The waveform stays still when audio analysis is
          unavailable; it never invents speech.
        </p>
      </DocsSection>

      <DocsSection
        id="recording"
        title="Record with useVoiceRecorder"
        description="Pass recorder.start to onStream and call recorder.stop(reason) from onStop. Set onRelease to controllerRef.current?.stop() to keep the microphone button synchronized when the recorder stops itself."
      >
        <div className="text-muted-foreground max-w-prose space-y-3 text-sm leading-6">
          <p>
            The hook returns state, elapsedMs, recording, error, start(stream),
            stop(reason?), pause(), resume(), and discard(). States are idle,
            recording, paused, finalizing, ready, and error. A recording
            contains blob, url, mimeType, durationMs, and reason. onRecording
            receives the completed take once. Copy the Blob if your app needs to
            retain it; the playback URL is revoked on the next take, discard, or
            unmount.
          </p>
          <p>
            Options include maxDurationMs, mimeType, onRecording, onError, and
            onRelease. Format and duration settings apply to the next take. Omit
            mimeType for browser negotiation. Pause excludes time and audio from
            the take but keeps the microphone open. Duration limits use browser
            timers and are best effort in background tabs, not a sample-accurate
            media trim. Recording errors release the handed-in tracks.
          </p>
          <p>
            Recording and playback format support varies by browser. Feature
            detection is performed on activation; unsupported recording does not
            leave the microphone running. No audio is uploaded. Your application
            owns transcription, persistence, file validation, and any consent
            required before sending recordings to a service.
          </p>
        </div>
      </DocsSection>

      <DocsSection
        id="accessibility"
        title="Accessibility and appearance"
        description="VoiceInput is a native button: Tab to focus, Enter or Space to start, stop, or cancel. Use state labels to localize its accessible name. Keep a visible status alongside it; decorative waveform rays are hidden from assistive technology."
      >
        <p className="text-muted-foreground max-w-prose text-sm leading-6">
          Reduced motion and motion=&quot;none&quot; use static levels.
          Recording timers should use aria-live=&quot;off&quot;; announce state
          changes in a separate polite status region. The component inherits
          semantic color, focus, and density tokens, supports RTL, and exposes
          --voice-input-size and --voice-input-icon-size for layout
          customization. Check keyboard navigation, browser permission denial,
          microphone unplugging, and local playback on your supported devices;
          automated media adapters cannot replace real-device checks.
        </p>
      </DocsSection>

      <DocsSection
        id="migration"
        title="Pre-launch rename"
        description="SoundInput is now VoiceInput. Update imports and type names, the registry item to voice-input, the docs route to /components/voice-input, and any sound-input data-slot or CSS custom-property selectors to voice-input. No legacy alias is exported."
      >
        <p className="text-muted-foreground max-w-prose text-sm leading-6">
          Exhaustive state handlers must include device-not-found, device-busy,
          constraints-error, and error. Stop reasons now also include cancel,
          disabled, and error. The recorder adds duration-limit. An onClick
          handler can preventDefault() to suppress activation. Only real
          acquisition failures are classified as device or permission errors;
          synchronous consumer callback failures release the stream and report
          error. Demo getUserMedia adapters must return owned streams that the
          component may stop.
        </p>
      </DocsSection>

      <DocsSection
        id="props"
        title="Props"
        description="VoiceInputProps extends native button props, except it owns children and accessible names through state labels."
      >
        <PropsTable caption="VoiceInput props" rows={voiceInputProps} />
      </DocsSection>
    </DocsPage>
  );
}
