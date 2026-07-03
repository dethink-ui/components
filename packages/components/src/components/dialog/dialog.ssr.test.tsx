import { act } from "react";
import { waitFor } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
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

function ServerAlertDialog() {
  return (
    <AlertDialog>
      <AlertDialogTrigger>Open server alert</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Server alert</AlertDialogTitle>
          <AlertDialogDescription>
            Alert dialog hydrates without mismatch warnings.
          </AlertDialogDescription>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function ServerOpenAlertDialog() {
  return (
    <AlertDialog defaultOpen>
      <AlertDialogTrigger>Open compact server alert</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle visuallyHidden>Compact server alert</AlertDialogTitle>
          <AlertDialogDescription>
            Visually hidden alert titles hydrate with rendered content.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
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

  it("keeps default-open alert content out of server markup until hydration", () => {
    const html = renderToString(<ServerOpenAlertDialog />);

    expect(html).toContain('data-slot="alert-dialog"');
    expect(html).toContain('aria-expanded="true"');
    expect(html).not.toContain('role="alertdialog"');
  });

  it("hydrates default-open alertdialog content with a visually hidden title", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const container = document.createElement("div");
    document.body.appendChild(container);
    container.innerHTML = renderToString(<ServerOpenAlertDialog />);
    let root: ReturnType<typeof hydrateRoot> | undefined;

    await act(async () => {
      root = hydrateRoot(container, <ServerOpenAlertDialog />);
    });

    await waitFor(() => {
      const alertDialog = document.body.querySelector<HTMLElement>(
        '[role="alertdialog"]',
      );
      const labelledBy = alertDialog?.getAttribute("aria-labelledby");
      const title = labelledBy ? document.getElementById(labelledBy) : null;

      expect(alertDialog).toBeInTheDocument();
      expect(alertDialog).toHaveAttribute("data-slot", "alert-dialog-panel");
      expect(title).toHaveAttribute("data-slot", "alert-dialog-title");
      expect(title).toHaveTextContent("Compact server alert");
    });

    expect(
      consoleError.mock.calls.some(([message]) =>
        String(message).toLowerCase().includes("hydration"),
      ),
    ).toBe(false);

    consoleError.mockRestore();
    await act(async () => {
      root?.unmount();
    });
    container.remove();
    document.body.removeAttribute("aria-hidden");
    document.documentElement.removeAttribute("style");
  });
});

describe("AlertDialog SSR", () => {
  it("renders trigger markup on the server", () => {
    const html = renderToString(<ServerAlertDialog />);

    expect(html).toContain('data-slot="alert-dialog"');
    expect(html).toContain('data-slot="alert-dialog-trigger"');
    expect(html).toContain("Open server alert");
  });

  it("hydrates without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const container = document.createElement("div");
    container.innerHTML = renderToString(<ServerAlertDialog />);

    await act(async () => {
      hydrateRoot(container, <ServerAlertDialog />);
    });

    expect(
      consoleError.mock.calls.some(([message]) =>
        String(message).toLowerCase().includes("hydration"),
      ),
    ).toBe(false);

    consoleError.mockRestore();
  });
});
