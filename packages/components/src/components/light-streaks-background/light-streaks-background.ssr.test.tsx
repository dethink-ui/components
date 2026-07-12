import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { LightStreaksBackground } from ".";

describe("LightStreaksBackground SSR", () => {
  it("renders the static resting frame on the server without motion styles", () => {
    const html = renderToString(
      <LightStreaksBackground>
        <h1>Server-rendered hero</h1>
      </LightStreaksBackground>,
    );

    expect(html).toContain('data-slot="light-streaks-background"');
    expect(html).toContain('data-slot="light-streaks-background-layer"');
    expect(html).toContain('data-slot="light-streaks-background-streak"');
    expect(html).toContain('data-slot="light-streaks-background-content"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain("Server-rendered hero");
    expect(html).not.toContain("opacity:0");
    expect(html).not.toContain("transform:");
  });

  it("renders deterministic markup across repeated server renders", () => {
    const first = renderToString(
      <LightStreaksBackground density="dense" seed={7} tone="primary" />,
    );
    const second = renderToString(
      <LightStreaksBackground density="dense" seed={7} tone="primary" />,
    );

    expect(first).toBe(second);
  });

  it("renders different markup for different seeds", () => {
    const first = renderToString(<LightStreaksBackground seed={7} />);
    const second = renderToString(<LightStreaksBackground seed={8} />);

    expect(first).not.toBe(second);
  });

  it("renders the deterministic static streak for animate={false}", () => {
    const html = renderToString(<LightStreaksBackground animate={false} />);

    expect(html).toContain('data-reduced-motion="true"');
    expect(html).toContain('data-slot="light-streaks-background-streak"');
    expect(html).not.toContain("transform:");
  });

  it("hydrates without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const container = document.createElement("div");
    container.innerHTML = renderToString(
      <LightStreaksBackground>
        <h1>Hydrated hero</h1>
      </LightStreaksBackground>,
    );

    await act(async () => {
      hydrateRoot(
        container,
        <LightStreaksBackground>
          <h1>Hydrated hero</h1>
        </LightStreaksBackground>,
      );
    });

    expect(
      consoleError.mock.calls.some(([message]) =>
        String(message).toLowerCase().includes("hydration"),
      ),
    ).toBe(false);

    consoleError.mockRestore();
  });

  it("hydrates the static animate={false} frame without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const container = document.createElement("div");
    container.innerHTML = renderToString(
      <LightStreaksBackground animate={false} seed={4}>
        <h1>Static hero</h1>
      </LightStreaksBackground>,
    );

    await act(async () => {
      hydrateRoot(
        container,
        <LightStreaksBackground animate={false} seed={4}>
          <h1>Static hero</h1>
        </LightStreaksBackground>,
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
