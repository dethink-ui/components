import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { Tooltip, TooltipContent, TooltipTrigger } from ".";

function ServerTooltip() {
  return (
    <Tooltip>
      <TooltipTrigger>Server tooltip trigger</TooltipTrigger>
      <TooltipContent>
        Closed tooltips hydrate without mismatch warnings.
      </TooltipContent>
    </Tooltip>
  );
}

describe("Tooltip SSR", () => {
  it("renders trigger markup on the server", () => {
    const html = renderToString(<ServerTooltip />);

    expect(html).toContain('data-slot="tooltip"');
    expect(html).toContain('data-slot="tooltip-trigger"');
    expect(html).toContain("Server tooltip trigger");
    expect(html).not.toContain("Closed tooltips hydrate");
  });

  it("hydrates without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const container = document.createElement("div");
    container.innerHTML = renderToString(<ServerTooltip />);

    await act(async () => {
      hydrateRoot(container, <ServerTooltip />);
    });

    expect(
      consoleError.mock.calls.some(([message]) =>
        String(message).toLowerCase().includes("hydration"),
      ),
    ).toBe(false);

    consoleError.mockRestore();
  });
});
