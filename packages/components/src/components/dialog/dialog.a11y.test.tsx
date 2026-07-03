import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { DethinkProvider } from "../../foundation/dethink-provider";
import {
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

    await user.click(screen.getByRole("button", { name: "Open billing dialog" }));

    await expect(axe(container.ownerDocument.body)).resolves.toHaveNoViolations();
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

    await user.click(screen.getByRole("button", { name: "Open compact dialog" }));

    expect(screen.getByRole("dialog", { name: "Compact dialog" })).toBeInTheDocument();
    await expect(axe(document.body)).resolves.toHaveNoViolations();
  });
});
