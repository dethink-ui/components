import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { DotMatrixBackground } from ".";

describe("DotMatrixBackground SSR", () => {
  it("renders the static resting frame on the server without motion styles", () => {
    const html = renderToString(
      <DotMatrixBackground>
        <h1>Server-rendered hero</h1>
      </DotMatrixBackground>,
    );

    expect(html).toContain('data-slot="dot-matrix-background"');
    expect(html).toContain('data-slot="dot-matrix-background-layer"');
    expect(html).toContain('data-slot="dot-matrix-background-pulse"');
    expect(html).toContain('data-slot="dot-matrix-background-content"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain("Server-rendered hero");
    expect(html).not.toContain("opacity:0");
    expect(html).not.toContain("transform:");
    expect(html).not.toContain("translate");
  });

  it("renders deterministic markup across repeated server renders", () => {
    const first = renderToString(
      <DotMatrixBackground density="dense" seed={7} tone="primary" />,
    );
    const second = renderToString(
      <DotMatrixBackground density="dense" seed={7} tone="primary" />,
    );

    expect(first).toBe(second);
  });

  it("renders different markup for different seeds", () => {
    const first = renderToString(<DotMatrixBackground seed={7} />);
    const second = renderToString(<DotMatrixBackground seed={8} />);

    expect(first).not.toBe(second);
  });

  it("renders the deterministic static highlight for animate={false}", () => {
    const html = renderToString(<DotMatrixBackground animate={false} />);

    expect(html).toContain('data-reduced-motion="true"');
    expect(html).toContain('data-slot="dot-matrix-background-pulse"');
    expect(html).not.toContain("transform:");
  });

  it("renders the static resting frame for follow mode on the server", () => {
    const html = renderToString(<DotMatrixBackground mode="follow" />);

    expect(html).toContain('data-mode="follow"');
    expect(html).toContain('data-slot="dot-matrix-background-pulse"');
    expect(html).not.toContain('data-slot="dot-matrix-background-follow"');
  });

  it("hydrates without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const container = document.createElement("div");
    container.innerHTML = renderToString(
      <DotMatrixBackground>
        <h1>Hydrated hero</h1>
      </DotMatrixBackground>,
    );

    await act(async () => {
      hydrateRoot(
        container,
        <DotMatrixBackground>
          <h1>Hydrated hero</h1>
        </DotMatrixBackground>,
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
      <DotMatrixBackground animate={false} seed={4}>
        <h1>Static hero</h1>
      </DotMatrixBackground>,
    );

    await act(async () => {
      hydrateRoot(
        container,
        <DotMatrixBackground animate={false} seed={4}>
          <h1>Static hero</h1>
        </DotMatrixBackground>,
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
