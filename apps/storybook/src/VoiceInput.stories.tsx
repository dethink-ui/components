import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { useState } from "react";
import {
  Button,
  DethinkProvider,
  Field,
  FieldControl,
  FieldLabel,
  VoiceInput,
  Textarea,
  type VoiceInputProps,
  type VoiceInputMotion,
  type VoiceInputSize,
  type VoiceInputState,
  type VoiceInputVariant,
} from "@dethink/components";

const meta = {
  title: "Components/VoiceInput",
  component: VoiceInput,
  args: {
    variant: "soft",
    size: "md",
    motion: "standard",
    muted: false,
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["solid", "soft", "outline", "ghost", "destructive"],
    },
    size: {
      control: "inline-radio",
      options: ["xs", "sm", "md", "lg", "xl"],
    },
    motion: {
      control: "inline-radio",
      options: ["none", "subtle", "standard"],
    },
    muted: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof VoiceInput>;

export default meta;

type Story = StoryObj<typeof meta>;
type DemoMediaMode = "granted" | "denied" | "unsupported";

const variants: VoiceInputVariant[] = [
  "solid",
  "soft",
  "outline",
  "ghost",
  "destructive",
];
const sizes: VoiceInputSize[] = ["xs", "sm", "md", "lg", "xl"];
const motions: VoiceInputMotion[] = ["none", "subtle", "standard"];

class StoryAudioTrack extends EventTarget {
  enabled = true;
  kind = "audio";
  readyState: MediaStreamTrackState = "live";

  stop() {
    this.readyState = "ended";
  }
}

class StoryMediaStream {
  private readonly track = new StoryAudioTrack();

  getTracks() {
    return [this.track] as unknown as MediaStreamTrack[];
  }

  getAudioTracks() {
    return [this.track] as unknown as MediaStreamTrack[];
  }
}

function DemoVoiceInput({
  mode = "granted",
  ...props
}: Omit<VoiceInputProps, "getUserMedia"> & {
  mode?: DemoMediaMode;
}) {
  return (
    <VoiceInput
      {...props}
      getUserMedia={async () => {
        if (mode === "denied")
          throw new DOMException("Permission denied", "NotAllowedError");
        if (mode === "unsupported")
          throw new DOMException("Microphone unavailable", "NotSupportedError");
        return new StoryMediaStream() as unknown as MediaStream;
      }}
    />
  );
}

function ComposerExample() {
  const [state, setState] = useState<VoiceInputState>("idle");
  const [muted, setMuted] = useState(false);

  return (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <form
        className="mx-auto max-w-2xl space-y-4"
        onSubmit={(event) => event.preventDefault()}
      >
        <Field id="storybook-voice-prompt">
          <FieldLabel>Ask the assistant</FieldLabel>
          <FieldControl asChild>
            <Textarea
              rows={4}
              resize="none"
              placeholder="Summarize customer feedback from the last sprint..."
            />
          </FieldControl>
        </Field>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p aria-live="polite" className="text-muted-foreground text-sm">
            {state === "recording"
              ? "Voice stream is live"
              : state === "muted"
                ? "Voice stream is muted"
                : "Type or start voice input"}
          </p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setMuted((value) => !value)}
            >
              {muted ? "Unmute" : "Mute"}
            </Button>
            <DemoVoiceInput
              muted={muted}
              variant="solid"
              onStateChange={setState}
              onStop={() => setState("idle")}
            />
            <Button size="sm">Send</Button>
          </div>
        </div>
      </form>
    </DethinkProvider>
  );
}

export const Base: Story = {
  render: (args) => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <DemoVoiceInput {...args} />
    </DethinkProvider>
  ),
};

export const Variants: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <div className="gap-density-gap flex flex-wrap items-center">
        {variants.map((variant) => (
          <DemoVoiceInput
            key={variant}
            labels={{ idle: `${variant} voice input` }}
            variant={variant}
          />
        ))}
      </div>
    </DethinkProvider>
  ),
};

export const Sizes: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <div className="gap-density-gap flex flex-wrap items-center">
        {sizes.map((size) => (
          <DemoVoiceInput
            key={size}
            labels={{ idle: `${size} voice input` }}
            size={size}
            variant="outline"
          />
        ))}
      </div>
    </DethinkProvider>
  ),
};

export const States: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <div className="gap-density-gap flex flex-wrap items-center">
        <DemoVoiceInput labels={{ idle: "Start recording" }} />
        <DemoVoiceInput muted labels={{ idle: "Start muted recording" }} />
        <DemoVoiceInput mode="denied" labels={{ idle: "Denied microphone" }} />
        <DemoVoiceInput
          mode="unsupported"
          labels={{ idle: "Unsupported microphone" }}
        />
        <VoiceInput disabled labels={{ idle: "Disabled microphone" }} />
        <DemoVoiceInput
          motion="none"
          labels={{ idle: "Reduced motion microphone" }}
        />
      </div>
    </DethinkProvider>
  ),
};

export const MotionPresets: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <div className="gap-density-gap flex flex-wrap items-center">
        {motions.map((motion) => (
          <DemoVoiceInput
            key={motion}
            labels={{ idle: `${motion} motion` }}
            motion={motion}
            variant="outline"
          />
        ))}
      </div>
    </DethinkProvider>
  ),
};

export const ThemeDensityAndRtl: Story = {
  render: () => (
    <div className="grid gap-4 lg:grid-cols-2">
      <DethinkProvider
        theme="dark"
        density="compact"
        className="border-border rounded-lg border p-6"
      >
        <div className="gap-density-gap flex flex-wrap items-center">
          {variants.map((variant) => (
            <DemoVoiceInput
              key={variant}
              labels={{ idle: `Dark ${variant}` }}
              variant={variant}
            />
          ))}
        </div>
      </DethinkProvider>
      <DethinkProvider
        theme="light"
        density="comfortable"
        dir="rtl"
        className="border-border rounded-lg border p-6"
      >
        <div className="gap-density-gap flex flex-wrap items-center">
          <DemoVoiceInput labels={{ idle: "RTL soft" }} />
          <DemoVoiceInput labels={{ idle: "RTL outline" }} variant="outline" />
          <DemoVoiceInput labels={{ idle: "RTL solid" }} variant="solid" />
        </div>
      </DethinkProvider>
    </div>
  ),
};

export const AiComposer: Story = {
  render: () => <ComposerExample />,
};

export const Interaction: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <DemoVoiceInput />
    </DethinkProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Start voice input" });

    await expect(button).toHaveAttribute("data-state", "idle");

    await userEvent.click(button);
    await waitFor(() =>
      expect(button).toHaveAttribute("data-state", "recording"),
    );
    await expect(button).toHaveAttribute("aria-pressed", "true");

    await userEvent.click(button);
    await waitFor(() => expect(button).toHaveAttribute("data-state", "idle"));
  },
};
