import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from ".";

function ServerDropdownMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>Open server actions</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Archive report</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

describe("DropdownMenu SSR", () => {
  it("renders trigger markup on the server", () => {
    const html = renderToString(<ServerDropdownMenu />);

    expect(html).toContain('data-slot="dropdown-menu"');
    expect(html).toContain('data-slot="dropdown-menu-trigger"');
    expect(html).toContain("Open server actions");
    expect(html).not.toContain("Archive report");
  });

  it("hydrates without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const container = document.createElement("div");
    container.innerHTML = renderToString(<ServerDropdownMenu />);

    await act(async () => {
      hydrateRoot(container, <ServerDropdownMenu />);
    });

    expect(
      consoleError.mock.calls.some(([message]) =>
        String(message).toLowerCase().includes("hydration"),
      ),
    ).toBe(false);

    consoleError.mockRestore();
  });
});
