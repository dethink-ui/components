import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from ".";

function ServerDialog() {
  return (
    <Dialog>
      <DialogTrigger>Open server dialog</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Server dialog</DialogTitle>
          <DialogDescription>Hydrates without mismatch warnings.</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

describe("Dialog SSR", () => {
  it("renders trigger markup on the server", () => {
    const html = renderToString(<ServerDialog />);

    expect(html).toContain('data-slot="dialog"');
    expect(html).toContain('data-slot="dialog-trigger"');
    expect(html).toContain("Open server dialog");
  });

  it("hydrates without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const container = document.createElement("div");
    container.innerHTML = renderToString(<ServerDialog />);

    await act(async () => {
      hydrateRoot(container, <ServerDialog />);
    });

    expect(
      consoleError.mock.calls.some(([message]) =>
        String(message).toLowerCase().includes("hydration"),
      ),
    ).toBe(false);

    consoleError.mockRestore();
  });
});
