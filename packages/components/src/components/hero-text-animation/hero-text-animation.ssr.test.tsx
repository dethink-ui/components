import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { HeroTextAnimation } from ".";

describe("HeroTextAnimation SSR", () => {
  it("renders final readable text on the server without hidden motion styles", () => {
    const html = renderToString(
      <HeroTextAnimation text="Build production-ready landing pages faster." />,
    );

    expect(html).toContain('data-slot="hero-text-animation"');
    expect(html).toContain("Build production-ready landing pages faster.");
    expect(html).not.toContain("opacity:0");
    expect(html).not.toContain("transform:");
    expect(html).not.toContain("translate");
  });

  it("hydrates without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const container = document.createElement("div");
    container.innerHTML = renderToString(
      <HeroTextAnimation text="Hydrate production hero text." />,
    );

    await act(async () => {
      hydrateRoot(
        container,
        <HeroTextAnimation text="Hydrate production hero text." />,
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
