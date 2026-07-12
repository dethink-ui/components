import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ScanGridBackground } from ".";

describe("ScanGridBackground SSR", () => {
  it("renders the static resting frame on the server without motion styles", () => {
    const html = renderToString(
      <ScanGridBackground>
        <h1>Server-rendered hero</h1>
      </ScanGridBackground>,
    );

    expect(html).toContain('data-slot="scan-grid-background"');
    expect(html).toContain('data-slot="scan-grid-background-layer"');
    expect(html).toContain('data-slot="scan-grid-background-band"');
    expect(html).toContain('data-slot="scan-grid-background-content"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain("Server-rendered hero");
    expect(html).not.toContain("opacity:0");
    expect(html).not.toContain("transform:");
    expect(html).not.toContain("translate");
  });

  it("renders deterministic markup across repeated server renders", () => {
    const first = renderToString(
      <ScanGridBackground direction="horizontal" seed={7} tone="primary" />,
    );
    const second = renderToString(
      <ScanGridBackground direction="horizontal" seed={7} tone="primary" />,
    );

    expect(first).toBe(second);
  });

  it("renders different markup for different seeds", () => {
    const first = renderToString(<ScanGridBackground seed={7} />);
    const second = renderToString(<ScanGridBackground seed={8} />);

    expect(first).not.toBe(second);
  });

  it("renders the deterministic frozen band for animate={false}", () => {
    const html = renderToString(<ScanGridBackground animate={false} />);

    expect(html).toContain('data-reduced-motion="true"');
    expect(html).toContain('data-slot="scan-grid-background-band"');
    expect(html).not.toContain("transform:");
  });

  it("hydrates without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const container = document.createElement("div");
    container.innerHTML = renderToString(
      <ScanGridBackground>
        <h1>Hydrated hero</h1>
      </ScanGridBackground>,
    );

    await act(async () => {
      hydrateRoot(
        container,
        <ScanGridBackground>
          <h1>Hydrated hero</h1>
        </ScanGridBackground>,
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
      <ScanGridBackground animate={false} direction="horizontal" seed={4}>
        <h1>Static hero</h1>
      </ScanGridBackground>,
    );

    await act(async () => {
      hydrateRoot(
        container,
        <ScanGridBackground animate={false} direction="horizontal" seed={4}>
          <h1>Static hero</h1>
        </ScanGridBackground>,
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
