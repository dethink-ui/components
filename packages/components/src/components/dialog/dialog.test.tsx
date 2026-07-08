import { createRef, useEffect, useRef, useState } from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DethinkProvider } from "../../foundation/dethink-provider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogClose,
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
  alertDialogClassNames,
  alertDialogCloseButtonClassNames,
  alertDialogContentClassNames,
  alertDialogOverlayClassNames,
  alertDialogTriggerClassNames,
  alertDialogActionClassNames,
  alertDialogCancelClassNames,
  alertDialogCloseClassNames,
  dialogClassNames,
  dialogCloseButtonClassNames,
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
          <DialogTrigger className="custom-trigger">
            Open settings
          </DialogTrigger>
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
    expect(dialogClassNames({ className: "custom-root" })).toContain(
      "custom-root",
    );
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
    const footer = dialog.querySelector<HTMLElement>(
      '[data-slot="dialog-footer"]',
    );

    if (!footer) {
      throw new Error("Expected DialogFooter to render.");
    }

    expect(dialog).toHaveAccessibleDescription(
      "Update the default workspace for dashboards.",
    );
    expect(contentRef.current).toBe(content);
    expect(content).toHaveAttribute("data-size", "lg");
    expect(content).toHaveAttribute("data-scroll-behavior", "outside");
    expect(content).toHaveClass("custom-content");
    expect(overlay).toHaveClass("custom-overlay");
    expect(footer).toHaveClass("flex-col-reverse");
    expect(footer).toHaveClass("sm:flex-row");
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
                    <DialogDescription>
                      Controlled by external state.
                    </DialogDescription>
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

    await user.click(
      screen.getByRole("button", { name: "Open controlled dialog" }),
    );

    expect(
      screen.getByRole("dialog", { name: "Controlled dialog" }),
    ).toBeInTheDocument();
    expect(screen.getByText("open")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Close from render prop" }),
    );

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    expect(screen.getByText("closed")).toBeInTheDocument();
  });

  it("does not restore focus to the trigger when a controlled close is rejected", async () => {
    const user = userEvent.setup();
    const handleOpenChange = vi.fn();

    render(
      <Dialog open onOpenChange={handleOpenChange}>
        <DialogTrigger>Open forced dialog</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Forced dialog</DialogTitle>
            <DialogDescription>
              The parent keeps this controlled dialog open.
            </DialogDescription>
          </DialogHeader>
          <DialogClose>Try close</DialogClose>
        </DialogContent>
      </Dialog>,
    );

    const trigger = screen.getByText("Open forced dialog").closest("button");
    const closeButton = screen.getByRole("button", { name: "Try close" });

    if (!trigger) {
      throw new Error("Expected controlled dialog trigger to render.");
    }

    closeButton.focus();
    expect(closeButton).toHaveFocus();

    await user.click(closeButton);
    await new Promise((resolve) => {
      window.setTimeout(resolve, 1);
    });

    expect(handleOpenChange).toHaveBeenCalledWith(false);
    expect(
      screen.getByRole("dialog", { name: "Forced dialog" }),
    ).toBeInTheDocument();
    expect(trigger).not.toHaveFocus();
    expect(closeButton).toHaveFocus();
  });

  it("uses a custom DialogTitle id for dialog labelling", () => {
    render(
      <Dialog defaultOpen>
        <DialogTrigger>Open custom labelled dialog</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle id="custom-dialog-title">
              Custom labelled dialog
            </DialogTitle>
            <DialogDescription>
              A custom heading id remains connected to the dialog.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    );

    const dialog = screen.getByRole("dialog", {
      name: "Custom labelled dialog",
    });

    expect(dialog).toHaveAttribute("aria-labelledby", "custom-dialog-title");
  });

  it("sizes close actions by content unless an explicit size is provided", async () => {
    const user = userEvent.setup();

    render(
      <Dialog>
        <DialogTrigger>Open sizing dialog</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sizing dialog</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <DialogClose>Save changes</DialogClose>
            <DialogClose aria-label="Dismiss dialog" />
            <DialogClose size="sm">Compact close</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>,
    );

    await user.click(
      screen.getByRole("button", { name: "Open sizing dialog" }),
    );

    expect(screen.getByRole("button", { name: "Save changes" })).toHaveClass(
      "px-[var(--dt-space-4)]",
    );
    expect(
      screen.getByRole("button", { name: "Save changes" }),
    ).not.toHaveClass("w-density-control");
    expect(screen.getByRole("button", { name: "Dismiss dialog" })).toHaveClass(
      "w-density-control",
    );
    expect(screen.getByRole("button", { name: "Compact close" })).toHaveClass(
      "px-[var(--dt-space-3)]",
    );
  });

  it("can render an explicit close icon from DialogContent", async () => {
    const user = userEvent.setup();

    render(
      <Dialog>
        <DialogTrigger>Open informational dialog</DialogTrigger>
        <DialogContent
          showCloseButton
          closeButtonLabel="Dismiss workspace notice"
          closeButtonClassName="custom-close-button"
        >
          <DialogHeader data-testid="informational-dialog-header">
            <DialogTitle>Workspace notice</DialogTitle>
            <DialogDescription>
              This informational dialog closes through the top-right icon
              button.
            </DialogDescription>
          </DialogHeader>
          <div>Read-only details without footer actions.</div>
        </DialogContent>
      </Dialog>,
    );

    const trigger = screen.getByRole("button", {
      name: "Open informational dialog",
    });

    await user.click(trigger);

    const closeButton = screen.getByRole("button", {
      name: "Dismiss workspace notice",
    });

    expect(closeButton).toHaveAttribute("data-slot", "dialog-close");
    expect(closeButton).toHaveClass("custom-close-button");
    expect(closeButton).toHaveClass("absolute");
    expect(closeButton).toHaveClass("end-[var(--dt-space-3)]");
    expect(closeButton).toHaveClass("w-density-control");
    expect(
      dialogCloseButtonClassNames({ className: "custom-close-button" }),
    ).toContain("custom-close-button");
    expect(screen.getByTestId("informational-dialog-header")).toHaveClass(
      "pe-[calc(var(--dt-space-6)+var(--dt-space-8))]",
    );

    await user.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    expect(trigger).toHaveFocus();
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

    expect(
      screen.getByRole("dialog", { name: "Locked notice" }),
    ).toBeInTheDocument();
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
              <DialogDescription>
                Provider attributes cross the portal.
              </DialogDescription>
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
      throw new Error(
        "Dialog should render inside a provider-aware portal host.",
      );
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

describe("AlertDialog", () => {
  it("renders labelled alert content, composes classes, refs, slots, and closes from cancel", async () => {
    const user = userEvent.setup();
    const rootRef = createRef<HTMLDivElement>();
    const contentRef = createRef<HTMLDivElement>();

    const { container } = render(
      <DethinkProvider theme="light">
        <AlertDialog ref={rootRef} className="custom-alert-root">
          <AlertDialogTrigger className="custom-alert-trigger">
            Delete workspace
          </AlertDialogTrigger>
          <AlertDialogContent
            ref={contentRef}
            className="custom-alert-content"
            overlayClassName="custom-alert-overlay"
            scrollBehavior="outside"
            size="sm"
          >
            <AlertDialogHeader>
              <AlertDialogTitle>Delete production workspace</AlertDialogTitle>
              <AlertDialogDescription>
                This permanently removes dashboards, reports, and alerts.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction variant="destructive">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DethinkProvider>,
    );

    const root = container.querySelector('[data-slot="alert-dialog"]');
    const trigger = screen.getByRole("button", { name: "Delete workspace" });

    expect(rootRef.current).toBe(root);
    expect(root).toHaveClass("custom-alert-root");
    expect(trigger).toHaveAttribute("data-slot", "alert-dialog-trigger");
    expect(trigger).toHaveClass("custom-alert-trigger");
    expect(alertDialogClassNames({ className: "custom-alert-root" })).toContain(
      "custom-alert-root",
    );
    expect(
      alertDialogTriggerClassNames({ className: "custom-alert-trigger" }),
    ).toContain("custom-alert-trigger");
    expect(
      alertDialogOverlayClassNames({ className: "custom-alert-overlay" }),
    ).toContain("custom-alert-overlay");
    expect(
      alertDialogContentClassNames({ className: "custom-alert-content" }),
    ).toContain("custom-alert-content");
    expect(alertDialogCloseClassNames()).toContain("w-density-control");
    expect(alertDialogCancelClassNames()).toContain("border-border");
    expect(alertDialogActionClassNames()).toContain("bg-primary");

    await user.click(trigger);

    const alertDialog = await screen.findByRole("alertdialog", {
      name: "Delete production workspace",
    });
    const content = alertDialog.closest<HTMLElement>(
      '[data-slot="alert-dialog-content"]',
    );
    const overlay = alertDialog.closest<HTMLElement>(
      '[data-slot="alert-dialog-overlay"]',
    );
    const footer = alertDialog.querySelector<HTMLElement>(
      '[data-slot="alert-dialog-footer"]',
    );

    if (!footer) {
      throw new Error("Expected AlertDialogFooter to render.");
    }

    expect(alertDialog).toHaveAccessibleDescription(
      "This permanently removes dashboards, reports, and alerts.",
    );
    expect(contentRef.current).toBe(content);
    expect(content).toHaveAttribute("data-size", "sm");
    expect(content).toHaveAttribute("data-scroll-behavior", "outside");
    expect(content).toHaveClass("custom-alert-content");
    expect(overlay).toHaveClass("custom-alert-overlay");
    expect(footer).toHaveClass("flex-row");
    expect(footer).not.toHaveClass("flex-col-reverse");
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveAttribute(
      "data-slot",
      "alert-dialog-cancel",
    );
    expect(screen.getByRole("button", { name: "Delete" })).toHaveAttribute(
      "data-slot",
      "alert-dialog-action",
    );
    expect(screen.getByRole("button", { name: "Delete" })).toHaveClass(
      "bg-destructive",
    );

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    await waitFor(() => {
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("supports controlled open state and render-prop close behavior", async () => {
    const user = userEvent.setup();

    function ControlledAlertDialog() {
      const [open, setOpen] = useState(false);

      return (
        <>
          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger>Open controlled alert</AlertDialogTrigger>
            <AlertDialogContent>
              {({ close }) => (
                <>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Controlled alert</AlertDialogTitle>
                    <AlertDialogDescription>
                      The consuming app owns this confirmation state.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <button type="button" onClick={close}>
                    Close alert from render prop
                  </button>
                </>
              )}
            </AlertDialogContent>
          </AlertDialog>
          <output>{open ? "open" : "closed"}</output>
        </>
      );
    }

    render(<ControlledAlertDialog />);

    await user.click(
      screen.getByRole("button", { name: "Open controlled alert" }),
    );

    expect(
      screen.getByRole("alertdialog", { name: "Controlled alert" }),
    ).toBeInTheDocument();
    expect(screen.getByText("open")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Close alert from render prop" }),
    );

    await waitFor(() => {
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });
    expect(screen.getByText("closed")).toBeInTheDocument();
  });

  it("runs action callbacks, closes action buttons, and focuses cancel in destructive flows", async () => {
    const user = userEvent.setup();
    const handleDelete = vi.fn();

    render(
      <AlertDialog>
        <AlertDialogTrigger>Delete report</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete report</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone and removes the report from scheduled
              exports.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel autoFocus>Keep report</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onPress={handleDelete}>
              Delete report
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>,
    );

    const trigger = screen.getByRole("button", { name: "Delete report" });

    await user.click(trigger);

    const cancel = await screen.findByRole("button", { name: "Keep report" });

    await waitFor(() => {
      expect(cancel).toHaveFocus();
    });

    await user.click(
      within(
        screen.getByRole("alertdialog", { name: "Delete report" }),
      ).getByRole("button", { name: "Delete report" }),
    );

    expect(handleDelete).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("does not steal focus when a controlled consumer moves focus after close", async () => {
    const user = userEvent.setup();

    function ControlledFocusAlertDialog() {
      const [open, setOpen] = useState(false);
      const [closed, setClosed] = useState(false);
      const nextButtonRef = useRef<HTMLButtonElement>(null);

      useEffect(() => {
        if (closed) {
          nextButtonRef.current?.focus();
        }
      }, [closed]);

      return (
        <>
          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger>Open focus-managed alert</AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Focus-managed alert</AlertDialogTitle>
                <AlertDialogDescription>
                  The consuming app moves focus after confirming.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onPress={() => {
                    setOpen(false);
                    setClosed(true);
                  }}
                >
                  Confirm
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          {closed ? (
            <button ref={nextButtonRef} type="button">
              Review next item
            </button>
          ) : null}
        </>
      );
    }

    render(<ControlledFocusAlertDialog />);

    await user.click(
      screen.getByRole("button", { name: "Open focus-managed alert" }),
    );
    await user.click(screen.getByRole("button", { name: "Confirm" }));

    const nextButton = await screen.findByRole("button", {
      name: "Review next item",
    });

    await waitFor(() => {
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });
    expect(nextButton).toHaveFocus();
  });

  it("prevents outside dismissal by default while preserving Escape close requests", async () => {
    const user = userEvent.setup();
    const handleOpenChange = vi.fn();

    const { rerender } = render(
      <AlertDialog defaultOpen onOpenChange={handleOpenChange}>
        <AlertDialogTrigger>Open risky confirmation</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive workspace</AlertDialogTitle>
            <AlertDialogDescription>
              Archiving hides dashboards from the active workspace list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Archive</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>,
    );

    const alertDialog = screen.getByRole("alertdialog", {
      name: "Archive workspace",
    });
    const overlay = alertDialog.closest<HTMLElement>(
      '[data-slot="alert-dialog-overlay"]',
    );

    if (!overlay) {
      throw new Error("Expected AlertDialog to render an overlay.");
    }

    await user.click(overlay);

    expect(
      screen.getByRole("alertdialog", { name: "Archive workspace" }),
    ).toBeInTheDocument();

    alertDialog.focus();
    await user.keyboard("{Escape}");

    await waitFor(() => {
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });
    expect(handleOpenChange).toHaveBeenCalledWith(false);

    rerender(
      <AlertDialog key="locked-alert" defaultOpen>
        <AlertDialogTrigger>Open locked confirmation</AlertDialogTrigger>
        <AlertDialogContent keyboardDismissDisabled>
          <AlertDialogHeader>
            <AlertDialogTitle>Locked confirmation</AlertDialogTitle>
            <AlertDialogDescription>
              Escape is disabled, so explicit actions remain required.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>,
    );

    const lockedAlert = screen.getByRole("alertdialog", {
      name: "Locked confirmation",
    });

    lockedAlert.focus();
    await user.keyboard("{Escape}");

    expect(
      screen.getByRole("alertdialog", { name: "Locked confirmation" }),
    ).toBeInTheDocument();
  });

  it("supports visible-hidden title wiring and explicit close icon slots", async () => {
    const user = userEvent.setup();

    render(
      <AlertDialog>
        <AlertDialogTrigger>Open compact confirmation</AlertDialogTrigger>
        <AlertDialogContent
          showCloseButton
          closeButtonLabel="Dismiss compact confirmation"
          closeButtonClassName="custom-alert-close"
        >
          <AlertDialogHeader data-testid="compact-alert-header">
            <AlertDialogTitle id="compact-alert-title" visuallyHidden>
              Compact confirmation
            </AlertDialogTitle>
            <AlertDialogDescription>
              Hidden alert titles remain available to assistive technology.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>,
    );

    await user.click(
      screen.getByRole("button", { name: "Open compact confirmation" }),
    );

    const alertDialog = screen.getByRole("alertdialog", {
      name: "Compact confirmation",
    });
    const closeButton = screen.getByRole("button", {
      name: "Dismiss compact confirmation",
    });

    expect(alertDialog).toHaveAttribute(
      "aria-labelledby",
      "compact-alert-title",
    );
    expect(closeButton).toHaveAttribute("data-slot", "alert-dialog-close");
    expect(closeButton).toHaveClass("custom-alert-close");
    expect(closeButton).toHaveClass("w-density-control");
    expect(
      alertDialogCloseButtonClassNames({ className: "custom-alert-close" }),
    ).toContain("custom-alert-close");
    expect(screen.getByTestId("compact-alert-header")).toHaveClass(
      "pe-[calc(var(--dt-space-6)+var(--dt-space-8))]",
    );

    await user.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });
  });

  it("mirrors provider context onto the alert dialog portal host", () => {
    render(
      <DethinkProvider
        className="custom-alert-provider"
        data-testid="alert-dialog-provider"
        density="compact"
        dir="rtl"
        theme="dark"
      >
        <AlertDialog defaultOpen>
          <AlertDialogTrigger>Open themed alert</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Themed alert</AlertDialogTitle>
              <AlertDialogDescription>
                Provider attributes cross the alert portal.
              </AlertDialogDescription>
            </AlertDialogHeader>
          </AlertDialogContent>
        </AlertDialog>
      </DethinkProvider>,
    );

    const alertDialog = screen.getByRole("alertdialog", {
      name: "Themed alert",
    });
    const portalHost = alertDialog.closest<HTMLElement>(
      '[data-slot="alert-dialog-portal-container"]',
    );
    const provider = screen.getByTestId("alert-dialog-provider");

    if (!portalHost) {
      throw new Error(
        "AlertDialog should render inside a provider-aware portal host.",
      );
    }

    expect(document.body).toContainElement(portalHost);
    expect(provider).not.toContainElement(alertDialog);
    expect(portalHost).toHaveAttribute("data-dethink-provider", "");
    expect(portalHost).toHaveAttribute("data-theme", "dark");
    expect(portalHost).toHaveAttribute("data-density", "compact");
    expect(portalHost).toHaveAttribute("dir", "rtl");
    expect(portalHost).toHaveClass("custom-alert-provider");
  });
});
