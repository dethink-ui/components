import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverFooter,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from ".";

function ServerPopover() {
  return (
    <Popover>
      <PopoverTrigger>Open server popover</PopoverTrigger>
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>Server popover</PopoverTitle>
          <PopoverDescription>
            Closed popovers hydrate without mismatch warnings.
          </PopoverDescription>
        </PopoverHeader>
        <PopoverFooter>
          <PopoverClose>Done</PopoverClose>
        </PopoverFooter>
      </PopoverContent>
    </Popover>
  );
}

describe("Popover SSR", () => {
  it("renders trigger markup on the server", () => {
    const html = renderToString(<ServerPopover />);

    expect(html).toContain('data-slot="popover"');
    expect(html).toContain('data-slot="popover-trigger"');
    expect(html).toContain("Open server popover");
    expect(html).not.toContain("Closed popovers hydrate");
  });

  it("hydrates without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const container = document.createElement("div");
    container.innerHTML = renderToString(<ServerPopover />);

    await act(async () => {
      hydrateRoot(container, <ServerPopover />);
    });

    expect(
      consoleError.mock.calls.some(([message]) =>
        String(message).toLowerCase().includes("hydration"),
      ),
    ).toBe(false);

    consoleError.mockRestore();
  });
});
