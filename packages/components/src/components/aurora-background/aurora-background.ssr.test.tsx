import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { AuroraBackground } from ".";

describe("AuroraBackground SSR", () => {
  it("renders the static resting frame on the server without motion styles", () => {
    const html = renderToString(
      <AuroraBackground>
        <h1>Server-rendered hero</h1>
      </AuroraBackground>,
    );

    expect(html).toContain('data-slot="aurora-background"');
    expect(html).toContain('data-slot="aurora-background-layer"');
    expect(html).toContain('data-slot="aurora-background-ribbon"');
    expect(html).toContain('data-slot="aurora-background-content"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain("Server-rendered hero");
    expect(html).not.toContain("opacity:0");
    expect(html).not.toContain("transform:");
  });

  it("renders deterministic markup across repeated server renders", () => {
    const first = renderToString(
      <AuroraBackground density="dense" seed={7} tone="muted" />,
    );
    const second = renderToString(
      <AuroraBackground density="dense" seed={7} tone="muted" />,
    );

    expect(first).toBe(second);
  });

  it("renders different markup for different seeds", () => {
    const first = renderToString(<AuroraBackground seed={7} />);
    const second = renderToString(<AuroraBackground seed={8} />);

    expect(first).not.toBe(second);
  });

  it("renders the deterministic static ribbons for animate={false}", () => {
    const html = renderToString(<AuroraBackground animate={false} />);

    expect(html).toContain('data-reduced-motion="true"');
    expect(html).toContain('data-slot="aurora-background-ribbon"');
    expect(html).not.toContain("transform:");
  });

  it("hydrates without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const container = document.createElement("div");
    container.innerHTML = renderToString(
      <AuroraBackground>
        <h1>Hydrated hero</h1>
      </AuroraBackground>,
    );

    await act(async () => {
      hydrateRoot(
        container,
        <AuroraBackground>
          <h1>Hydrated hero</h1>
        </AuroraBackground>,
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
      <AuroraBackground animate={false} seed={4}>
        <h1>Static hero</h1>
      </AuroraBackground>,
    );

    await act(async () => {
      hydrateRoot(
        container,
        <AuroraBackground animate={false} seed={4}>
          <h1>Static hero</h1>
        </AuroraBackground>,
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
