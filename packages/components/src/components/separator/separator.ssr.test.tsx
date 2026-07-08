import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { Divider, Separator } from ".";

describe("Separator SSR", () => {
  it("renders Separator and Divider markup on the server", () => {
    expect(renderToString(<Separator />)).toContain('data-slot="separator"');
    expect(renderToString(<Divider decorative />)).toContain(
      'aria-hidden="true"',
    );
    expect(
      renderToString(
        <Separator asChild>
          <span />
        </Separator>,
      ),
    ).toContain('role="separator"');
  });

  it("hydrates without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const container = document.createElement("div");
    container.innerHTML = renderToString(
      <Separator
        orientation="vertical"
        spacing="2"
        thickness="2"
        tone="strong"
      />,
    );

    await act(async () => {
      hydrateRoot(
        container,
        <Separator
          orientation="vertical"
          spacing="2"
          thickness="2"
          tone="strong"
        />,
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
