import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import {
  VoiceInput,
  getVoiceInputMotionState,
  voiceInputClassNames,
  type VoiceInputMotion,
  type VoiceInputProps,
  type VoiceInputSize,
  type VoiceInputState,
  type VoiceInputVariant,
} from ".";

const variants: VoiceInputVariant[] = [
  "solid",
  "soft",
  "outline",
  "ghost",
  "destructive",
];
const sizes: VoiceInputSize[] = ["xs", "sm", "md", "lg", "xl"];
const motions: VoiceInputMotion[] = ["none", "subtle", "standard"];
const states: VoiceInputState[] = [
  "idle",
  "permission-request",
  "permission-denied",
  "recording",
  "muted",
  "unsupported",
];

const validProps = {
  onStream: vi.fn(),
} satisfies VoiceInputProps;

const ariaLabelProps = {
  // @ts-expect-error VoiceInput owns its accessible name through state labels.
  "aria-label": "Start voice input",
} satisfies VoiceInputProps;

void validProps;
void ariaLabelProps;

class FakeAudioTrack extends EventTarget {
  enabled = true;
  kind = "audio";
  readyState = "live";
  stop = vi.fn(() => {
    this.readyState = "ended";
  });
}

class FakeMediaStream {
  track = new FakeAudioTrack();

  getTracks() {
    return [this.track] as unknown as MediaStreamTrack[];
  }

  getAudioTracks() {
    return [this.track] as unknown as MediaStreamTrack[];
  }
}

function mockGetUserMedia(stream = new FakeMediaStream()) {
  const getUserMedia = vi
    .fn()
    .mockResolvedValue(stream as unknown as MediaStream);

  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: { getUserMedia },
  });

  return { getUserMedia, stream };
}

function mockGetUserMediaError(error: unknown) {
  const getUserMedia = vi.fn().mockRejectedValue(error);

  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: { getUserMedia },
  });

  return getUserMedia;
}

function mockUnsupportedMedia() {
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: undefined,
  });
}

describe("VoiceInput", () => {
  it("renders a native button with safe defaults", () => {
    render(<VoiceInput />);

    const button = screen.getByRole("button", { name: "Start voice input" });

    expect(button.tagName).toBe("BUTTON");
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveAttribute("data-slot", "voice-input");
    expect(button).toHaveAttribute("data-state", "idle");
    expect(button).toHaveAttribute("data-motion-state", "idle");
    expect(button).toHaveAttribute("data-variant", "soft");
    expect(button).toHaveAttribute("data-size", "md");
    expect(button).toHaveAttribute("data-motion", "standard");
    expect(button).not.toHaveAttribute("aria-pressed");
    expect(
      button.querySelector('[data-slot="voice-input-icon-wrap"]'),
    ).toHaveAttribute("aria-hidden", "true");
    expect(
      button.querySelector('[data-slot="voice-input-waveform"]'),
    ).toHaveAttribute("aria-hidden", "true");
  });

  it.each(variants)("renders the %s variant attribute", (variant) => {
    render(<VoiceInput variant={variant} />);

    expect(screen.getByRole("button")).toHaveAttribute("data-variant", variant);
  });

  it.each(sizes)("renders the %s size attribute", (size) => {
    render(<VoiceInput size={size} />);

    expect(screen.getByRole("button")).toHaveAttribute("data-size", size);
  });

  it.each(motions)("renders the %s motion attribute", (motion) => {
    render(<VoiceInput motion={motion} />);

    const button = screen.getByRole("button");

    expect(button).toHaveAttribute("data-motion", motion);

    if (motion === "none") {
      expect(button).toHaveAttribute("data-reduced-motion", "true");
    }
  });

  it("requests microphone access on first activation and exposes the stream", async () => {
    const user = userEvent.setup();
    const onStream = vi.fn();
    const onStateChange = vi.fn();
    const { getUserMedia, stream } = mockGetUserMedia();

    render(<VoiceInput onStateChange={onStateChange} onStream={onStream} />);

    const button = screen.getByRole("button", { name: "Start voice input" });

    await user.click(button);

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Stop voice input" })),
    );

    expect(getUserMedia).toHaveBeenCalledWith({ audio: true, video: false });
    expect(onStream).toHaveBeenCalledWith(stream);
    expect(button).toHaveAttribute("data-state", "recording");
    expect(button).toHaveAttribute("data-motion-state", "active");
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(onStateChange).toHaveBeenCalledWith("permission-request");
    expect(onStateChange).toHaveBeenCalledWith("recording");
  });

  it("stops owned tracks on second activation", async () => {
    const user = userEvent.setup();
    const onStop = vi.fn();
    const { stream } = mockGetUserMedia();

    render(<VoiceInput onStop={onStop} />);

    const button = screen.getByRole("button", { name: "Start voice input" });

    await user.click(button);
    await screen.findByRole("button", { name: "Stop voice input" });

    await user.click(button);

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Start voice input" })),
    );

    expect(stream.track.stop).toHaveBeenCalledTimes(1);
    expect(onStop).toHaveBeenCalledWith(stream, "user");
    expect(button).toHaveAttribute("data-state", "idle");
  });

  it("enters permission-denied state when the browser rejects access", async () => {
    const user = userEvent.setup();
    const error = new DOMException("Denied", "NotAllowedError");
    const onError = vi.fn();
    const getUserMedia = mockGetUserMediaError(error);

    render(<VoiceInput onError={onError} />);

    const button = screen.getByRole("button", { name: "Start voice input" });

    await user.click(button);

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Microphone permission denied" }),
      ),
    );

    expect(getUserMedia).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(error, "permission-denied");
    expect(button).toHaveAttribute("data-state", "permission-denied");
  });

  it("enters unsupported state when media devices are unavailable", async () => {
    const user = userEvent.setup();
    const onError = vi.fn();

    mockUnsupportedMedia();

    render(<VoiceInput onError={onError} />);

    const button = screen.getByRole("button", { name: "Start voice input" });

    await user.click(button);

    expect(
      screen.getByRole("button", { name: "Microphone unavailable" }),
    ).toHaveAttribute("data-state", "unsupported");
    expect(onError).toHaveBeenCalledWith(expect.any(Error), "unsupported");
  });

  it("disables and reenables audio tracks through the muted prop", async () => {
    const user = userEvent.setup();
    const { stream } = mockGetUserMedia();
    const { rerender } = render(<VoiceInput muted />);

    const button = screen.getByRole("button", { name: "Start voice input" });

    await user.click(button);
    await screen.findByRole("button", { name: "Voice input muted" });

    expect(stream.track.enabled).toBe(false);
    expect(button).toHaveAttribute("data-state", "muted");
    expect(button).toHaveAttribute("data-muted", "true");

    rerender(<VoiceInput muted={false} />);

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Stop voice input" })),
    );

    expect(stream.track.enabled).toBe(true);
    expect(button).toHaveAttribute("data-state", "recording");
  });

  it("stops the stream when an owned track ends", async () => {
    const user = userEvent.setup();
    const onStop = vi.fn();
    const { stream } = mockGetUserMedia();

    render(<VoiceInput onStop={onStop} />);

    await user.click(screen.getByRole("button", { name: "Start voice input" }));
    await screen.findByRole("button", { name: "Stop voice input" });

    stream.track.dispatchEvent(new Event("ended"));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Start voice input" })),
    );

    expect(stream.track.stop).toHaveBeenCalledTimes(1);
    expect(onStop).toHaveBeenCalledWith(stream, "track-ended");
  });

  it("stops the active stream on unmount", async () => {
    const user = userEvent.setup();
    const onStop = vi.fn();
    const { stream } = mockGetUserMedia();
    const { unmount } = render(<VoiceInput onStop={onStop} />);

    await user.click(screen.getByRole("button", { name: "Start voice input" }));
    await screen.findByRole("button", { name: "Stop voice input" });

    unmount();

    expect(stream.track.stop).toHaveBeenCalledTimes(1);
    expect(onStop).toHaveBeenCalledWith(stream, "unmount");
  });

  it("does not request media when disabled", async () => {
    const user = userEvent.setup();
    const { getUserMedia } = mockGetUserMedia();

    render(<VoiceInput disabled />);

    const button = screen.getByRole("button", { name: "Start voice input" });

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("data-disabled", "true");

    await user.click(button);

    expect(getUserMedia).not.toHaveBeenCalled();
  });

  it("supports custom state labels", () => {
    render(<VoiceInput labels={{ idle: "Dictate message" }} />);

    expect(
      screen.getByRole("button", { name: "Dictate message" }),
    ).toBeInTheDocument();
  });

  it("composes class names and forwards refs", () => {
    const ref = createRef<HTMLButtonElement>();

    expect(
      voiceInputClassNames({
        className: "custom-class",
        size: "sm",
        variant: "outline",
      }),
    ).toContain("custom-class");

    render(<VoiceInput ref={ref} className="custom-class" />);

    expect(screen.getByRole("button")).toHaveClass("custom-class");
    expect(ref.current).toBe(screen.getByRole("button"));
  });

  it.each(states)("maps %s to the expected motion state", (state) => {
    expect(getVoiceInputMotionState(state)).toBe(
      state === "recording" || state === "muted" ? "active" : "idle",
    );
  });
});
