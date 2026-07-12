import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { StarfieldBackground } from ".";

describe("StarfieldBackground SSR", () => {
  it("renders the static resting frame on the server without motion styles", () => {
    const html = renderToString(
      <StarfieldBackground>
        <h1>Server-rendered hero</h1>
      </StarfieldBackground>,
    );

    expect(html).toContain('data-slot="starfield-background"');
    expect(html).toContain('data-slot="starfield-background-layer"');
    expect(html).toContain('data-slot="starfield-background-star-layer"');
    expect(html).toContain('data-slot="starfield-background-twinkle"');
    expect(html).toContain('data-slot="starfield-background-content"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain("Server-rendered hero");
    expect(html).not.toContain("opacity:0");
    expect(html).not.toContain("transform:");
    expect(html).not.toContain("translate");
  });

  it("renders deterministic markup across repeated server renders", () => {
    const first = renderToString(
      <StarfieldBackground density="dense" seed={7} tone="primary" />,
    );
    const second = renderToString(
      <StarfieldBackground density="dense" seed={7} tone="primary" />,
    );

    expect(first).toBe(second);
  });

  it("renders different markup for different seeds", () => {
    const first = renderToString(<StarfieldBackground seed={7} />);
    const second = renderToString(<StarfieldBackground seed={8} />);

    expect(first).not.toBe(second);
  });

  it("renders the deterministic static field for animate={false}", () => {
    const html = renderToString(<StarfieldBackground animate={false} />);

    expect(html).toContain('data-reduced-motion="true"');
    expect(html).toContain('data-slot="starfield-background-twinkle"');
    expect(html).not.toContain("transform:");
  });

  it("hydrates without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const container = document.createElement("div");
    container.innerHTML = renderToString(
      <StarfieldBackground>
        <h1>Hydrated hero</h1>
      </StarfieldBackground>,
    );

    await act(async () => {
      hydrateRoot(
        container,
        <StarfieldBackground>
          <h1>Hydrated hero</h1>
        </StarfieldBackground>,
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
      <StarfieldBackground animate={false} seed={4}>
        <h1>Static hero</h1>
      </StarfieldBackground>,
    );

    await act(async () => {
      hydrateRoot(
        container,
        <StarfieldBackground animate={false} seed={4}>
          <h1>Static hero</h1>
        </StarfieldBackground>,
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
