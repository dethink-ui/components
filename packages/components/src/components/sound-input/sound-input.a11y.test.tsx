import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it, vi } from "vitest";
import { DethinkProvider } from "../../foundation/dethink-provider";
import { SoundInput, type SoundInputSize, type SoundInputVariant } from ".";

expect.extend(toHaveNoViolations);

const variants: SoundInputVariant[] = [
  "solid",
  "soft",
  "outline",
  "ghost",
  "destructive",
];
const sizes: SoundInputSize[] = ["xs", "sm", "md", "lg", "xl"];

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

describe("SoundInput accessibility", () => {
  it("has no axe violations for baseline variants, sizes, and states", async () => {
    mockGetUserMedia();

    const { container } = render(
      <DethinkProvider theme="light">
        <main aria-label="SoundInput accessibility smoke">
          <div>
            {variants.map((variant) => (
              <SoundInput
                key={variant}
                labels={{ idle: `${variant} voice input` }}
                variant={variant}
              />
            ))}
          </div>
          <div>
            {sizes.map((size) => (
              <SoundInput
                key={size}
                labels={{ idle: `${size} voice input` }}
                size={size}
              />
            ))}
          </div>
          <div>
            <SoundInput disabled labels={{ idle: "Disabled voice input" }} />
            <SoundInput motion="none" labels={{ idle: "Reduced motion" }} />
            <SoundInput muted labels={{ idle: "Muted voice input" }} />
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
        <SoundInput />
      </DethinkProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Start voice input" }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Stop voice input" })),
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });
});
