import {
  createRef,
  useState,
} from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
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
  dialogClassNames,
  dialogContentClassNames,
  dialogOverlayClassNames,
  dialogTriggerClassNames,
} from ".";

describe("Dialog", () => {
  it("renders a trigger, opens labelled content, composes classes, refs, and slots", async () => {
    const user = userEvent.setup();
    const rootRef = createRef<HTMLDivElement>();
    const contentRef = createRef<HTMLDivElement>();

    const { container } = render(
      <DethinkProvider theme="light">
        <Dialog ref={rootRef} className="custom-root">
          <DialogTrigger className="custom-trigger">Open settings</DialogTrigger>
          <DialogContent
            ref={contentRef}
            className="custom-content"
            overlayClassName="custom-overlay"
            scrollBehavior="outside"
            size="lg"
          >
            <DialogHeader>
              <DialogTitle>Workspace settings</DialogTitle>
              <DialogDescription>
                Update the default workspace for dashboards.
              </DialogDescription>
            </DialogHeader>
            <div>Dialog body</div>
            <DialogFooter>
              <DialogClose>Done</DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DethinkProvider>,
    );

    const root = container.querySelector('[data-slot="dialog"]');
    const trigger = screen.getByRole("button", { name: "Open settings" });

    expect(rootRef.current).toBe(root);
    expect(root).toHaveClass("custom-root");
    expect(trigger).toHaveAttribute("data-slot", "dialog-trigger");
    expect(trigger).toHaveClass("custom-trigger");
    expect(dialogClassNames({ className: "custom-root" })).toContain("custom-root");
    expect(dialogTriggerClassNames({ className: "custom-trigger" })).toContain(
      "custom-trigger",
    );
    expect(dialogOverlayClassNames({ className: "custom-overlay" })).toContain(
      "custom-overlay",
    );
    expect(dialogContentClassNames({ className: "custom-content" })).toContain(
      "custom-content",
    );

    await user.click(trigger);

    const dialog = await screen.findByRole("dialog", {
      name: "Workspace settings",
    });
    const content = dialog.closest<HTMLElement>('[data-slot="dialog-content"]');
    const overlay = dialog.closest<HTMLElement>('[data-slot="dialog-overlay"]');

    expect(dialog).toHaveAccessibleDescription(
      "Update the default workspace for dashboards.",
    );
    expect(contentRef.current).toBe(content);
    expect(content).toHaveAttribute("data-size", "lg");
    expect(content).toHaveAttribute("data-scroll-behavior", "outside");
    expect(content).toHaveClass("custom-content");
    expect(overlay).toHaveClass("custom-overlay");
    expect(screen.getByText("Dialog body")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Done" }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    expect(trigger).toHaveFocus();
  });

  it("supports controlled open state and render-prop close behavior", async () => {
    const user = userEvent.setup();

    function ControlledDialog() {
      const [open, setOpen] = useState(false);

      return (
        <>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>Open controlled dialog</DialogTrigger>
            <DialogContent>
              {({ close }) => (
                <>
                  <DialogHeader>
                    <DialogTitle>Controlled dialog</DialogTitle>
                    <DialogDescription>Controlled by external state.</DialogDescription>
                  </DialogHeader>
                  <button type="button" onClick={close}>
                    Close from render prop
                  </button>
                </>
              )}
            </DialogContent>
          </Dialog>
          <output>{open ? "open" : "closed"}</output>
        </>
      );
    }

    render(<ControlledDialog />);

    await user.click(screen.getByRole("button", { name: "Open controlled dialog" }));

    expect(screen.getByRole("dialog", { name: "Controlled dialog" })).toBeInTheDocument();
    expect(screen.getByText("open")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Close from render prop" }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    expect(screen.getByText("closed")).toBeInTheDocument();
  });

  it("supports uncontrolled open state, Escape close, and keyboard dismiss prevention", async () => {
    const user = userEvent.setup();
    const handleOpenChange = vi.fn();

    const { rerender } = render(
      <Dialog defaultOpen onOpenChange={handleOpenChange}>
        <DialogTrigger>Open notice</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notice</DialogTitle>
            <DialogDescription>Escape may close this dialog.</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    );

    const noticeDialog = screen.getByRole("dialog", { name: "Notice" });

    noticeDialog.focus();
    expect(noticeDialog).toHaveFocus();

    await user.keyboard("{Escape}");

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    expect(handleOpenChange).toHaveBeenCalledWith(false);

    rerender(
      <Dialog key="locked-notice" defaultOpen>
        <DialogTrigger>Open locked notice</DialogTrigger>
        <DialogContent keyboardDismissDisabled>
          <DialogHeader>
            <DialogTitle>Locked notice</DialogTitle>
            <DialogDescription>Escape is disabled.</DialogDescription>
          </DialogHeader>
          <DialogClose>Close explicitly</DialogClose>
        </DialogContent>
      </Dialog>,
    );

    const lockedDialog = screen.getByRole("dialog", { name: "Locked notice" });

    lockedDialog.focus();
    expect(lockedDialog).toHaveFocus();

    await user.keyboard("{Escape}");

    expect(screen.getByRole("dialog", { name: "Locked notice" })).toBeInTheDocument();
  });

  it("mirrors provider context onto the body portal host", () => {
    render(
      <DethinkProvider
        className="custom-provider"
        data-testid="dialog-provider"
        density="compact"
        dir="rtl"
        theme="dark"
      >
        <Dialog defaultOpen>
          <DialogTrigger>Open themed dialog</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Themed dialog</DialogTitle>
              <DialogDescription>Provider attributes cross the portal.</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </DethinkProvider>,
    );

    const dialog = screen.getByRole("dialog", { name: "Themed dialog" });
    const portalHost = dialog.closest<HTMLElement>(
      '[data-slot="dialog-portal-container"]',
    );
    const provider = screen.getByTestId("dialog-provider");

    if (!portalHost) {
      throw new Error("Dialog should render inside a provider-aware portal host.");
    }

    expect(document.body).toContainElement(portalHost);
    expect(provider).not.toContainElement(dialog);
    expect(portalHost).toHaveAttribute("data-dethink-provider", "");
    expect(portalHost).toHaveAttribute("data-theme", "dark");
    expect(portalHost).toHaveAttribute("data-density", "compact");
    expect(portalHost).toHaveAttribute("dir", "rtl");
    expect(portalHost).toHaveClass("custom-provider");
  });
});
