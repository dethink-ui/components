import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { useState, type ReactNode } from "react";
import {
  Button,
  DethinkProvider,
  Field,
  FieldControl,
  FieldLabel,
  SoundInput,
  Textarea,
  type SoundInputMotion,
  type SoundInputSize,
  type SoundInputState,
  type SoundInputVariant,
} from "@dethink/components";

const meta = {
  title: "Components/SoundInput",
  component: SoundInput,
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
} satisfies Meta<typeof SoundInput>;

export default meta;

type Story = StoryObj<typeof meta>;
type DemoMediaMode = "granted" | "denied" | "unsupported";

const variants: SoundInputVariant[] = [
  "solid",
  "soft",
  "outline",
  "ghost",
  "destructive",
];
const sizes: SoundInputSize[] = ["xs", "sm", "md", "lg", "xl"];
const motions: SoundInputMotion[] = ["none", "subtle", "standard"];

class StoryAudioTrack extends EventTarget {
  enabled = true;
  kind = "audio";
  readyState: MediaStreamTrackState = "live";

  stop() {
    this.readyState = "ended";
    this.dispatchEvent(new Event("ended"));
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

function installStoryMedia(mode: DemoMediaMode) {
  if (mode === "unsupported") {
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: undefined,
    });
    return;
  }

  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: {
      getUserMedia:
        mode === "denied"
          ? async () => {
              throw new DOMException("Permission denied", "NotAllowedError");
            }
          : async () => new StoryMediaStream() as unknown as MediaStream,
    },
  });
}

function WithDemoMedia({
  children,
  mode = "granted",
}: {
  children: ReactNode;
  mode?: DemoMediaMode;
}) {
  const install = () => {
    installStoryMedia(mode);
  };

  return (
    <span
      className="inline-flex"
      onKeyDownCapture={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          install();
        }
      }}
      onPointerDownCapture={install}
    >
      {children}
    </span>
  );
}

function ComposerExample() {
  const [state, setState] = useState<SoundInputState>("idle");
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
            <WithDemoMedia>
              <SoundInput
                muted={muted}
                variant="solid"
                onStateChange={setState}
                onStop={() => setState("idle")}
              />
            </WithDemoMedia>
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
      <WithDemoMedia>
        <SoundInput {...args} />
      </WithDemoMedia>
    </DethinkProvider>
  ),
};

export const Variants: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <WithDemoMedia>
        <div className="gap-density-gap flex flex-wrap items-center">
          {variants.map((variant) => (
            <SoundInput
              key={variant}
              labels={{ idle: `${variant} voice input` }}
              variant={variant}
            />
          ))}
        </div>
      </WithDemoMedia>
    </DethinkProvider>
  ),
};

export const Sizes: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <WithDemoMedia>
        <div className="gap-density-gap flex flex-wrap items-center">
          {sizes.map((size) => (
            <SoundInput
              key={size}
              labels={{ idle: `${size} voice input` }}
              size={size}
              variant="outline"
            />
          ))}
        </div>
      </WithDemoMedia>
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
        <WithDemoMedia>
          <SoundInput labels={{ idle: "Start recording" }} />
        </WithDemoMedia>
        <WithDemoMedia>
          <SoundInput muted labels={{ idle: "Start muted recording" }} />
        </WithDemoMedia>
        <WithDemoMedia mode="denied">
          <SoundInput labels={{ idle: "Denied microphone" }} />
        </WithDemoMedia>
        <WithDemoMedia mode="unsupported">
          <SoundInput labels={{ idle: "Unsupported microphone" }} />
        </WithDemoMedia>
        <SoundInput disabled labels={{ idle: "Disabled microphone" }} />
        <WithDemoMedia>
          <SoundInput
            motion="none"
            labels={{ idle: "Reduced motion microphone" }}
          />
        </WithDemoMedia>
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
      <WithDemoMedia>
        <div className="gap-density-gap flex flex-wrap items-center">
          {motions.map((motion) => (
            <SoundInput
              key={motion}
              labels={{ idle: `${motion} motion` }}
              motion={motion}
              variant="outline"
            />
          ))}
        </div>
      </WithDemoMedia>
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
        <WithDemoMedia>
          <div className="gap-density-gap flex flex-wrap items-center">
            {variants.map((variant) => (
              <SoundInput
                key={variant}
                labels={{ idle: `Dark ${variant}` }}
                variant={variant}
              />
            ))}
          </div>
        </WithDemoMedia>
      </DethinkProvider>
      <DethinkProvider
        theme="light"
        density="comfortable"
        dir="rtl"
        className="border-border rounded-lg border p-6"
      >
        <WithDemoMedia>
          <div className="gap-density-gap flex flex-wrap items-center">
            <SoundInput labels={{ idle: "RTL soft" }} />
            <SoundInput labels={{ idle: "RTL outline" }} variant="outline" />
            <SoundInput labels={{ idle: "RTL solid" }} variant="solid" />
          </div>
        </WithDemoMedia>
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
      <WithDemoMedia>
        <SoundInput />
      </WithDemoMedia>
    </DethinkProvider>
  ),
  play: async ({ canvasElement }) => {
    installStoryMedia("granted");

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
