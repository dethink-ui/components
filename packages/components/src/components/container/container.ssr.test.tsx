import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { Container } from ".";

describe("Container SSR", () => {
  it("renders native and asChild markup on the server", () => {
    expect(
      renderToString(<Container as="main">Server container</Container>),
    ).toContain('data-slot="container"');
    expect(
      renderToString(
        <Container asChild gutter="lg" size="md">
          <a href="/docs">Docs</a>
        </Container>,
      ),
    ).toContain("<a");
  });

  it("hydrates without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const container = document.createElement("div");
    container.innerHTML = renderToString(
      <Container as="section" gutter="lg" safeArea size="lg">
        Hydrate container
      </Container>,
    );

    await act(async () => {
      hydrateRoot(
        container,
        <Container as="section" gutter="lg" safeArea size="lg">
          Hydrate container
        </Container>,
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
