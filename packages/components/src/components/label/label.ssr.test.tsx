import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { Label } from ".";

describe("Label SSR", () => {
  it("renders deterministic label markup on the server", () => {
    const markup = renderToString(
      <Label htmlFor="server-label" invalid required size="lg">
        Server label
      </Label>,
    );

    expect(markup).toContain('data-slot="label"');
    expect(markup).toContain('data-invalid="true"');
    expect(markup).toContain('data-required="true"');
    expect(markup).toContain('data-size="lg"');
    expect(markup).toContain('for="server-label"');
    expect(markup).toContain('data-slot="label-required-marker"');
    expect(markup).toContain("(required)");
  });

  it("hydrates without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const container = document.createElement("div");
    const label = (
      <div>
        <Label htmlFor="hydrate-label" optional>
          Hydrate label
        </Label>
        <input id="hydrate-label" />
      </div>
    );

    container.innerHTML = renderToString(label);

    await act(async () => {
      hydrateRoot(container, label);
    });

    expect(
      consoleError.mock.calls.some(([message]) =>
        String(message).toLowerCase().includes("hydration"),
      ),
    ).toBe(false);

    consoleError.mockRestore();
  });
});
