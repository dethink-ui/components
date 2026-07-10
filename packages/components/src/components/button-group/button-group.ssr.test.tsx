import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { Button } from "../button";
import { ButtonGroup, ButtonGroupSeparator } from ".";

describe("ButtonGroup SSR", () => {
  it("renders stable group and separator state on the server", () => {
    const markup = renderToString(
      <ButtonGroup
        aria-label="Server actions"
        mode="separated"
        orientation="vertical"
      >
        <Button>First</Button>
        <ButtonGroupSeparator />
        <Button>Second</Button>
      </ButtonGroup>,
    );

    expect(markup).toContain('role="group"');
    expect(markup).toContain('data-slot="button-group"');
    expect(markup).toContain('data-mode="separated"');
    expect(markup).toContain('data-orientation="vertical"');
    expect(markup).toContain('data-slot="button-group-separator"');
  });

  it("hydrates without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const container = document.createElement("div");
    const group = (
      <ButtonGroup aria-label="Hydrated actions">
        <Button>Save</Button>
        <ButtonGroupSeparator />
        <Button>Publish</Button>
      </ButtonGroup>
    );

    container.innerHTML = renderToString(group);

    await act(async () => {
      hydrateRoot(container, group);
    });

    expect(
      consoleError.mock.calls.some(([message]) =>
        String(message).toLowerCase().includes("hydration"),
      ),
    ).toBe(false);

    consoleError.mockRestore();
  });
});
