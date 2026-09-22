import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { VoiceInput } from ".";

describe("VoiceInput SSR", () => {
  it("renders stable native button markup on the server", () => {
    const html = renderToString(<VoiceInput />);

    expect(html).toContain('data-slot="voice-input"');
    expect(html).toContain('data-state="idle"');
    expect(html).toContain('aria-label="Start voice input"');
  });

  it("hydrates without touching browser media APIs or warning", async () => {
    const getUserMedia = vi.fn();
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const container = document.createElement("div");

    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { getUserMedia },
    });

    container.innerHTML = renderToString(<VoiceInput />);

    await act(async () => {
      hydrateRoot(container, <VoiceInput />);
    });

    expect(getUserMedia).not.toHaveBeenCalled();
    expect(
      consoleError.mock.calls.some(([message]) =>
        String(message).toLowerCase().includes("hydration"),
      ),
    ).toBe(false);

    consoleError.mockRestore();
  });
});
