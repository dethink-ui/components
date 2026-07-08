import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { Stack } from ".";

describe("Stack SSR", () => {
  it("renders native and asChild markup on the server", () => {
    expect(renderToString(<Stack as="section">Server stack</Stack>)).toContain(
      'data-slot="stack"',
    );
    expect(
      renderToString(
        <Stack asChild gap="4">
          <a href="/docs">Docs</a>
        </Stack>,
      ),
    ).toContain("<a");
  });

  it("hydrates without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const container = document.createElement("div");
    container.innerHTML = renderToString(
      <Stack
        as="section"
        direction="horizontal"
        gap="4"
        justify="between"
        wrap="wrap"
      >
        Hydrate stack
      </Stack>,
    );

    await act(async () => {
      hydrateRoot(
        container,
        <Stack
          as="section"
          direction="horizontal"
          gap="4"
          justify="between"
          wrap="wrap"
        >
          Hydrate stack
        </Stack>,
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
