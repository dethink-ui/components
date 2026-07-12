import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { GridBeamsBackground } from ".";

describe("GridBeamsBackground SSR", () => {
  it("renders the static resting frame on the server without motion styles", () => {
    const html = renderToString(
      <GridBeamsBackground>
        <h1>Server-rendered hero</h1>
      </GridBeamsBackground>,
    );

    expect(html).toContain('data-slot="grid-beams-background"');
    expect(html).toContain('data-slot="grid-beams-background-layer"');
    expect(html).toContain('data-slot="grid-beams-background-content"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain("Server-rendered hero");
    expect(html).not.toContain("opacity:0");
    expect(html).not.toContain("transform:");
    expect(html).not.toContain("translate");
  });

  it("renders deterministic markup across repeated server renders", () => {
    const first = renderToString(
      <GridBeamsBackground seed={7} density="dense" tone="primary" />,
    );
    const second = renderToString(
      <GridBeamsBackground seed={7} density="dense" tone="primary" />,
    );

    expect(first).toBe(second);
  });

  it("renders different markup for different seeds", () => {
    const first = renderToString(<GridBeamsBackground seed={7} />);
    const second = renderToString(<GridBeamsBackground seed={8} />);

    expect(first).not.toBe(second);
  });

  it("renders the deterministic static frame for animate={false}", () => {
    const html = renderToString(<GridBeamsBackground animate={false} />);

    expect(html).toContain('data-reduced-motion="true"');
    expect(html).toContain('data-slot="grid-beams-background-beam"');
    expect(html).not.toContain("transform:");
  });

  it("hydrates without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const container = document.createElement("div");
    container.innerHTML = renderToString(
      <GridBeamsBackground>
        <h1>Hydrated hero</h1>
      </GridBeamsBackground>,
    );

    await act(async () => {
      hydrateRoot(
        container,
        <GridBeamsBackground>
          <h1>Hydrated hero</h1>
        </GridBeamsBackground>,
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
      <GridBeamsBackground animate={false} seed={4}>
        <h1>Static hero</h1>
      </GridBeamsBackground>,
    );

    await act(async () => {
      hydrateRoot(
        container,
        <GridBeamsBackground animate={false} seed={4}>
          <h1>Static hero</h1>
        </GridBeamsBackground>,
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
