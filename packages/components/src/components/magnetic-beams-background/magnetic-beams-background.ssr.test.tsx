import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { MagneticBeamsBackground } from ".";

describe("MagneticBeamsBackground SSR", () => {
  it("renders the static resting frame on the server without motion styles", () => {
    const html = renderToString(
      <MagneticBeamsBackground>
        <h1>Server-rendered hero</h1>
      </MagneticBeamsBackground>,
    );

    expect(html).toContain('data-slot="magnetic-beams-background"');
    expect(html).toContain('data-slot="magnetic-beams-background-layer"');
    expect(html).toContain('data-slot="magnetic-beams-background-content"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain("Server-rendered hero");
    expect(html).not.toContain("opacity:0");
    expect(html).not.toContain("transform:");
    expect(html).not.toContain("translate");
  });

  it("renders deterministic markup across repeated server renders", () => {
    const first = renderToString(
      <MagneticBeamsBackground seed={7} density="dense" tone="primary" />,
    );
    const second = renderToString(
      <MagneticBeamsBackground seed={7} density="dense" tone="primary" />,
    );

    expect(first).toBe(second);
  });

  it("renders different markup for different seeds", () => {
    const first = renderToString(<MagneticBeamsBackground seed={7} />);
    const second = renderToString(<MagneticBeamsBackground seed={8} />);

    expect(first).not.toBe(second);
  });

  it("renders the deterministic static frame for animate={false}", () => {
    const html = renderToString(<MagneticBeamsBackground animate={false} />);

    expect(html).toContain('data-reduced-motion="true"');
    expect(html).toContain('data-slot="magnetic-beams-background-beam"');
    expect(html).not.toContain("transform:");
  });

  it("hydrates without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const container = document.createElement("div");
    container.innerHTML = renderToString(
      <MagneticBeamsBackground>
        <h1>Hydrated hero</h1>
      </MagneticBeamsBackground>,
    );

    await act(async () => {
      hydrateRoot(
        container,
        <MagneticBeamsBackground>
          <h1>Hydrated hero</h1>
        </MagneticBeamsBackground>,
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
      <MagneticBeamsBackground animate={false} seed={4}>
        <h1>Static hero</h1>
      </MagneticBeamsBackground>,
    );

    await act(async () => {
      hydrateRoot(
        container,
        <MagneticBeamsBackground animate={false} seed={4}>
          <h1>Static hero</h1>
        </MagneticBeamsBackground>,
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
