import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { DethinkProvider } from "../../foundation/dethink-provider";
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
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from ".";

expect.extend(toHaveNoViolations);

describe("Dialog accessibility", () => {
  it("has no axe violations for a labelled dialog", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <DethinkProvider theme="light">
        <Dialog>
          <DialogTrigger>Open billing dialog</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Billing workspace</DialogTitle>
              <DialogDescription>
                Choose the workspace used for invoice filters.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose>Done</DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DethinkProvider>,
    );

    await user.click(
      screen.getByRole("button", { name: "Open billing dialog" }),
    );

    await expect(
      axe(container.ownerDocument.body),
    ).resolves.toHaveNoViolations();
  });

  it("has no axe violations when the visible title is hidden accessibly", async () => {
    const user = userEvent.setup();
    render(
      <DethinkProvider theme="light">
        <Dialog>
          <DialogTrigger>Open compact dialog</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle visuallyHidden>Compact dialog</DialogTitle>
              <DialogDescription>
                Compact surfaces still expose an accessible name.
              </DialogDescription>
            </DialogHeader>
            <DialogClose />
          </DialogContent>
        </Dialog>
      </DethinkProvider>,
    );

    await user.click(
      screen.getByRole("button", { name: "Open compact dialog" }),
    );

    expect(
      screen.getByRole("dialog", { name: "Compact dialog" }),
    ).toBeInTheDocument();
    await expect(axe(document.body)).resolves.toHaveNoViolations();
  });
});

describe("AlertDialog accessibility", () => {
  it("has no axe violations for a labelled alert dialog", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <DethinkProvider theme="light">
        <AlertDialog>
          <AlertDialogTrigger>Delete billing rule</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete billing rule</AlertDialogTitle>
              <AlertDialogDescription>
                This removes the rule from future invoice automation.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction variant="destructive">
                Delete rule
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DethinkProvider>,
    );

    await user.click(
      screen.getByRole("button", { name: "Delete billing rule" }),
    );

    expect(
      screen.getByRole("alertdialog", { name: "Delete billing rule" }),
    ).toBeInTheDocument();
    await expect(
      axe(container.ownerDocument.body),
    ).resolves.toHaveNoViolations();
  });

  it("has no axe violations when an alert title is visually hidden", async () => {
    const user = userEvent.setup();
    render(
      <DethinkProvider theme="light">
        <AlertDialog>
          <AlertDialogTrigger>Open compact alert</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle visuallyHidden>Compact alert</AlertDialogTitle>
              <AlertDialogDescription>
                Compact confirmations still expose an accessible name.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DethinkProvider>,
    );

    await user.click(
      screen.getByRole("button", { name: "Open compact alert" }),
    );

    expect(
      screen.getByRole("alertdialog", { name: "Compact alert" }),
    ).toBeInTheDocument();
    await expect(axe(document.body)).resolves.toHaveNoViolations();
  });
});
