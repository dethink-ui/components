import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it, vi } from "vitest";
import { DethinkProvider } from "../../foundation/dethink-provider";
import { VoiceInput, type VoiceInputSize, type VoiceInputVariant } from ".";

expect.extend(toHaveNoViolations);

const variants: VoiceInputVariant[] = [
  "solid",
  "soft",
  "outline",
  "ghost",
  "destructive",
];
const sizes: VoiceInputSize[] = ["xs", "sm", "md", "lg", "xl"];

class FakeAudioTrack extends EventTarget {
  enabled = true;
  stop = vi.fn();
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

function mockGetUserMedia() {
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: {
      getUserMedia: vi
        .fn()
        .mockResolvedValue(new FakeMediaStream() as unknown as MediaStream),
    },
  });
}

describe("VoiceInput accessibility", () => {
  it("has no axe violations for baseline variants, sizes, and states", async () => {
    mockGetUserMedia();

    const { container } = render(
      <DethinkProvider theme="light">
        <main aria-label="VoiceInput accessibility smoke">
          <div>
            {variants.map((variant) => (
              <VoiceInput
                key={variant}
                labels={{ idle: `${variant} voice input` }}
                variant={variant}
              />
            ))}
          </div>
          <div>
            {sizes.map((size) => (
              <VoiceInput
                key={size}
                labels={{ idle: `${size} voice input` }}
                size={size}
              />
            ))}
          </div>
          <div>
            <VoiceInput disabled labels={{ idle: "Disabled voice input" }} />
            <VoiceInput motion="none" labels={{ idle: "Reduced motion" }} />
            <VoiceInput muted labels={{ idle: "Muted voice input" }} />
          </div>
        </main>
      </DethinkProvider>,
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it("has no axe violations while recording", async () => {
    const user = userEvent.setup();

    mockGetUserMedia();

    const { container } = render(
      <DethinkProvider theme="light">
        <VoiceInput />
      </DethinkProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Start voice input" }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Stop voice input" })),
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });
});
