import { StrictMode, useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from "vitest";
import { RevealButton } from "../reveal-button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogTrigger,
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from ".";

const PRESS_RESPONDER_WARNING =
  /PressResponder was rendered without a pressable child/;

let warn: MockInstance<typeof console.warn>;
beforeEach(() => {
  warn = vi.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => {
  warn.mockRestore();
});

const pressResponderWarnings = () =>
  warn.mock.calls.filter(([message]) =>
    PRESS_RESPONDER_WARNING.test(String(message)),
  );

/** A dialog opened from code, the way an app opens one from a menu item. */
function OpenedFromCode({ alert = false }: { alert?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open from code
      </button>
      {alert ? (
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogContent>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
          </AlertDialogContent>
        </AlertDialog>
      ) : (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogTitle>Create a workspace</DialogTitle>
            <DialogClose>Done</DialogClose>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

describe("dialogs without a trigger", () => {
  it.each([
    ["Dialog", false, "Create a workspace", "Done"],
    ["AlertDialog", true, "Discard changes?", "Keep editing"],
  ])(
    "%s opens and closes from code without a press-responder warning",
    async (_, alert, title, close) => {
      const user = userEvent.setup();
      render(<OpenedFromCode alert={alert} />);
      expect(pressResponderWarnings()).toEqual([]);

      await user.click(screen.getByRole("button", { name: "Open from code" }));
      expect(await screen.findByRole("heading", { name: title })).toBeTruthy();
      await user.click(screen.getByRole("button", { name: close }));
      await waitFor(() =>
        expect(screen.queryByRole("heading", { name: title })).toBeNull(),
      );
      expect(pressResponderWarnings()).toEqual([]);
    },
  );

  it("opens with defaultOpen and no trigger, without the warning", async () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Welcome</DialogTitle>
        </DialogContent>
      </Dialog>,
    );
    expect(
      await screen.findByRole("heading", { name: "Welcome" }),
    ).toBeTruthy();
    expect(pressResponderWarnings()).toEqual([]);
  });

  it("opens an AlertDialog with defaultOpen and no trigger, without the warning", async () => {
    render(
      <AlertDialog defaultOpen>
        <AlertDialogContent>
          <AlertDialogTitle>Session expired</AlertDialogTitle>
        </AlertDialogContent>
      </AlertDialog>,
    );
    expect(
      await screen.findByRole("heading", { name: "Session expired" }),
    ).toBeTruthy();
    expect(pressResponderWarnings()).toEqual([]);
  });

  it("stays quiet under StrictMode's double effects", async () => {
    const user = userEvent.setup();
    render(
      <StrictMode>
        <OpenedFromCode />
      </StrictMode>,
    );
    await user.click(screen.getByRole("button", { name: "Open from code" }));
    expect(
      await screen.findByRole("heading", { name: "Create a workspace" }),
    ).toBeTruthy();
    expect(pressResponderWarnings()).toEqual([]);
  });

  it("still warns when an uncontrolled dialog has nothing to open it", () => {
    render(
      <Dialog>
        <DialogContent>
          <DialogTitle>Unreachable</DialogTitle>
        </DialogContent>
      </Dialog>,
    );
    expect(pressResponderWarnings()).toHaveLength(1);
  });
});

describe("controlled dialogs with a trigger", () => {
  function Controlled({ trigger }: { trigger: "dialog" | "reveal" | "alert" }) {
    const [open, setOpen] = useState(false);
    if (trigger === "alert") {
      return (
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogTrigger>Delete bot</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogTitle>Delete it?</AlertDialogTitle>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
          </AlertDialogContent>
        </AlertDialog>
      );
    }
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        {trigger === "dialog" ? (
          <DialogTrigger>Open settings</DialogTrigger>
        ) : (
          <RevealButton
            icon={<span aria-hidden="true">+</span>}
            label="Open settings"
          />
        )}
        <DialogContent>
          <DialogTitle>Settings</DialogTitle>
          <DialogClose>Done</DialogClose>
        </DialogContent>
      </Dialog>
    );
  }

  it.each([
    ["DialogTrigger", "dialog", "Open settings", "Settings", "Done"],
    ["a custom pressable", "reveal", "Open settings", "Settings", "Done"],
    ["AlertDialogTrigger", "alert", "Delete bot", "Delete it?", "Keep it"],
  ] as const)(
    "keeps %s wired: it opens the dialog, reports it expanded and gets focus back",
    async (_, trigger, opener, title, close) => {
      const user = userEvent.setup();
      render(<Controlled trigger={trigger} />);
      const button = screen.getByRole("button", { name: opener });
      expect(button.getAttribute("aria-expanded")).toBe("false");

      await user.click(button);
      expect(await screen.findByRole("heading", { name: title })).toBeTruthy();
      expect(button.getAttribute("aria-expanded")).toBe("true");

      await user.click(screen.getByRole("button", { name: close }));
      await waitFor(() => expect(document.activeElement).toBe(button));
      expect(pressResponderWarnings()).toEqual([]);
    },
  );
});
