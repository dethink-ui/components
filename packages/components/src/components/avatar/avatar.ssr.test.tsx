import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { Avatar } from ".";

function BotIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16">
      <path d="M5 6.5h6M6.25 9h.01M9.75 9h.01M4 12.5h8a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.5V2.5h-1V4h-3V2.5h-1V4H4a2 2 0 0 0-2 2v4.5a2 2 0 0 0 2 2Z" />
    </svg>
  );
}

describe("Avatar SSR", () => {
  it("renders deterministic image markup on the server", () => {
    const html = renderToString(
      <Avatar
        alt="Customer success lead"
        name="Ada Lovelace"
        src="/avatars/ada.png"
      />,
    );

    expect(html).toContain('data-slot="avatar"');
    expect(html).toContain('data-state="image"');
    expect(html).toContain('data-slot="avatar-image"');
    expect(html).toContain('alt="Customer success lead"');
    expect(html).toContain('src="/avatars/ada.png"');
  });

  it("renders deterministic fallback initials on the server", () => {
    const html = renderToString(<Avatar name="Parvesh Malhotra" />);

    expect(html).toContain('data-slot="avatar"');
    expect(html).toContain('data-state="fallback"');
    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="Parvesh Malhotra"');
    expect(html).toContain("PM");
  });

  it("renders deterministic fallback icons on the server", () => {
    const html = renderToString(
      <Avatar fallbackIcon={<BotIcon />} name="AI reviewer" />,
    );

    expect(html).toContain('data-slot="avatar-icon"');
    expect(html).toContain('aria-label="AI reviewer"');
    expect(html).not.toContain('data-slot="avatar-initials"');
  });

  it("hydrates without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const container = document.createElement("div");
    container.innerHTML = renderToString(
      <Avatar name="Hydrate User" src="/avatars/hydrate.png" />,
    );

    await act(async () => {
      hydrateRoot(
        container,
        <Avatar name="Hydrate User" src="/avatars/hydrate.png" />,
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
