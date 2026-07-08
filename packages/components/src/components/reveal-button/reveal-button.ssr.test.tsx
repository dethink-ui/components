import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { RevealButton } from ".";

function PlusIcon() {
  return (
    <svg viewBox="0 0 16 16">
      <path d="M8 3v10M3 8h10" />
    </svg>
  );
}

describe("RevealButton SSR", () => {
  it("renders native button markup on the server", () => {
    const html = renderToString(
      <RevealButton icon={<PlusIcon />} label="Server action" />,
    );

    expect(html).toContain('data-slot="reveal-button"');
    expect(html).toContain('aria-label="Server action"');
  });

  it("hydrates without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const container = document.createElement("div");
    container.innerHTML = renderToString(
      <RevealButton icon={<PlusIcon />} label="Hydrate action" />,
    );

    await act(async () => {
      hydrateRoot(
        container,
        <RevealButton icon={<PlusIcon />} label="Hydrate action" />,
      );
    });

    expect(
      consoleError.mock.calls.some(([message]) =>
        String(message).toLowerCase().includes("hydration"),
      ),
    ).toBe(false);

    consoleError.mockRestore();
  });
});
