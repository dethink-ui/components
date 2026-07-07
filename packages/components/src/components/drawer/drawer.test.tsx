import { createRef, useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DethinkProvider } from "../../foundation/dethink-provider";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  drawerClassNames,
  drawerContentClassNames,
  drawerOverlayClassNames,
  drawerTriggerClassNames,
} from ".";

describe("Drawer (modal mode)", () => {
  it("renders a trigger, opens labelled content, composes classes, refs, and slots", async () => {
    const user = userEvent.setup();
    const rootRef = createRef<HTMLDivElement>();
    const contentRef = createRef<HTMLDivElement>();

    const { container } = render(
      <DethinkProvider theme="light">
        <Drawer ref={rootRef} className="custom-root" direction="right">
          <DrawerTrigger className="custom-trigger">Open cart</DrawerTrigger>
          <DrawerContent
            ref={contentRef}
            className="custom-content"
            data-testid="cart-drawer-content"
            id="cart-drawer-content"
            overlayClassName="custom-overlay"
            size="sm"
          >
            <DrawerHeader>
              <DrawerTitle>Your cart</DrawerTitle>
              <DrawerDescription>Review items before checkout.</DrawerDescription>
            </DrawerHeader>
            <div>Drawer body</div>
            <DrawerFooter>
              <DrawerClose>Done</DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </DethinkProvider>,
    );

    const root = container.querySelector('[data-slot="drawer"]');
    const trigger = screen.getByRole("button", { name: "Open cart" });

    expect(rootRef.current).toBe(root);
    expect(root).toHaveClass("custom-root");
    expect(root).toHaveAttribute("data-direction", "right");
    expect(root).toHaveAttribute("data-modal", "true");
    expect(trigger).toHaveAttribute("data-slot", "drawer-trigger");
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveClass("custom-trigger");
    expect(drawerClassNames({ className: "custom-root" })).toContain("custom-root");
    expect(drawerTriggerClassNames({ className: "custom-trigger" })).toContain(
      "custom-trigger",
    );
    expect(drawerOverlayClassNames({ className: "custom-overlay" })).toContain(
      "custom-overlay",
    );
    expect(drawerContentClassNames({ className: "custom-content" })).toContain(
      "custom-content",
    );

    await user.click(trigger);

    const dialog = await screen.findByRole("dialog", { name: "Your cart" });
    const content = screen.getByTestId("cart-drawer-content");
    const overlay = dialog.closest<HTMLElement>('[data-slot="drawer-overlay"]');
    const header = dialog.querySelector<HTMLElement>('[data-slot="drawer-header"]');
    const footer = dialog.querySelector<HTMLElement>('[data-slot="drawer-footer"]');

    if (!header) {
      throw new Error("Expected DrawerHeader to render.");
    }

    if (!footer) {
      throw new Error("Expected DrawerFooter to render.");
    }

    expect(dialog).toHaveAccessibleDescription("Review items before checkout.");
    expect(contentRef.current).toBe(content);
    expect(content).toHaveAttribute("id", "cart-drawer-content");
    expect(content).toHaveAttribute("data-direction", "right");
    expect(content).toHaveAttribute("data-modal", "true");
    expect(content).toHaveAttribute("data-slot", "drawer-content");
    expect(content).toHaveClass("custom-content");
    expect(content).toHaveClass("inset-y-0");
    expect(content).toHaveClass("right-0");
    expect(content).toHaveClass("w-80");
    expect(content).toHaveClass("origin-right");
    expect(content).toHaveClass("bg-background/95");
    expect(content).toHaveClass("backdrop-blur");
    expect(overlay).toHaveClass("custom-overlay");
    expect(overlay).toHaveClass("backdrop-blur-[2px]");
    expect(header).toHaveClass("border-b", "bg-background/95");
    expect(footer).toHaveClass("border-t", "bg-background/95");
    expect(screen.getByText("Drawer body")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Done" }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    expect(trigger).toHaveFocus();
  });

  it("supports controlled open state and render-prop close behavior", async () => {
    const user = userEvent.setup();

    function ControlledDrawer() {
      const [open, setOpen] = useState(false);

      return (
        <>
          <Drawer direction="bottom" open={open} onOpenChange={setOpen}>
            <DrawerTrigger>Open controlled drawer</DrawerTrigger>
            <DrawerContent>
              {({ close }) => (
                <>
                  <DrawerHeader>
                    <DrawerTitle>Controlled drawer</DrawerTitle>
                    <DrawerDescription>Controlled by external state.</DrawerDescription>
                  </DrawerHeader>
                  <button type="button" onClick={close}>
                    Close from render prop
                  </button>
                </>
              )}
            </DrawerContent>
          </Drawer>
          <output>{open ? "open" : "closed"}</output>
        </>
      );
    }

    render(<ControlledDrawer />);

    await user.click(screen.getByRole("button", { name: "Open controlled drawer" }));

    expect(
      screen.getByRole("dialog", { name: "Controlled drawer" }),
    ).toBeInTheDocument();
    expect(screen.getByText("open")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Close from render prop" }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    expect(screen.getByText("closed")).toBeInTheDocument();
  });

  it("supports every direction with correct anchor and sizing classes", async () => {
    const user = userEvent.setup();

    const { rerender } = render(
      <Drawer defaultOpen direction="top">
        <DrawerTrigger>Open top</DrawerTrigger>
        <DrawerContent>
          <DrawerTitle>Top drawer</DrawerTitle>
        </DrawerContent>
      </Drawer>,
    );

    expect(
      screen
        .getByRole("dialog", { name: "Top drawer" })
        .closest('[data-slot="drawer-content"]'),
    ).toHaveClass("top-0", "inset-x-0");

    rerender(
      <Drawer defaultOpen direction="bottom">
        <DrawerTrigger>Open bottom</DrawerTrigger>
        <DrawerContent>
          <DrawerTitle>Bottom drawer</DrawerTitle>
        </DrawerContent>
      </Drawer>,
    );

    expect(
      screen
        .getByRole("dialog", { name: "Bottom drawer" })
        .closest('[data-slot="drawer-content"]'),
    ).toHaveClass("bottom-0", "inset-x-0");

    rerender(
      <Drawer defaultOpen direction="left">
        <DrawerTrigger>Open left</DrawerTrigger>
        <DrawerContent>
          <DrawerTitle>Left drawer</DrawerTitle>
        </DrawerContent>
      </Drawer>,
    );

    expect(
      screen
        .getByRole("dialog", { name: "Left drawer" })
        .closest('[data-slot="drawer-content"]'),
    ).toHaveClass("left-0", "inset-y-0");

    await user.keyboard("{Escape}");
  });

  it("supports root-level fullSize and custom direction-aware dimensions", () => {
    const { rerender } = render(
      <Drawer defaultOpen direction="right" fullSize>
        <DrawerTrigger>Open full drawer</DrawerTrigger>
        <DrawerContent>
          <DrawerTitle>Full drawer</DrawerTitle>
        </DrawerContent>
      </Drawer>,
    );

    expect(
      screen
        .getByRole("dialog", { name: "Full drawer" })
        .closest('[data-slot="drawer-content"]'),
    ).toHaveClass(
      "w-[calc(100vw-(env(safe-area-inset-left)+env(safe-area-inset-right)))]",
    );

    rerender(
      <Drawer key="custom-bottom" defaultOpen direction="bottom" dimension="70dvh">
        <DrawerTrigger>Open custom drawer</DrawerTrigger>
        <DrawerContent>
          <DrawerTitle>Custom drawer</DrawerTitle>
        </DrawerContent>
      </Drawer>,
    );

    const customContent = screen
      .getByRole("dialog", { name: "Custom drawer" })
      .closest<HTMLElement>('[data-slot="drawer-content"]');

    expect(customContent).toHaveClass("h-[var(--drawer-size)]");
    expect(customContent?.style.getPropertyValue("--drawer-size")).toBe("70dvh");

    rerender(
      <Drawer
        key="content-custom-left"
        defaultOpen
        dimension="44rem"
        direction="left"
      >
        <DrawerTrigger>Open content custom drawer</DrawerTrigger>
        <DrawerContent dimension={360}>
          <DrawerTitle>Content custom drawer</DrawerTitle>
        </DrawerContent>
      </Drawer>,
    );

    const contentOverride = screen
      .getByRole("dialog", { name: "Content custom drawer" })
      .closest<HTMLElement>('[data-slot="drawer-content"]');

    expect(contentOverride).toHaveClass("w-[var(--drawer-size)]");
    expect(contentOverride?.style.getPropertyValue("--drawer-size")).toBe("360px");
  });

  it("supports uncontrolled open state, Escape close, and keyboard dismiss prevention", async () => {
    const user = userEvent.setup();
    const handleOpenChange = vi.fn();

    const { rerender } = render(
      <Drawer defaultOpen direction="right" onOpenChange={handleOpenChange}>
        <DrawerTrigger>Open notice</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Notice</DrawerTitle>
            <DrawerDescription>Escape may close this drawer.</DrawerDescription>
          </DrawerHeader>
        </DrawerContent>
      </Drawer>,
    );

    const noticeDrawer = screen.getByRole("dialog", { name: "Notice" });

    noticeDrawer.focus();
    await user.keyboard("{Escape}");

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    expect(handleOpenChange).toHaveBeenCalledWith(false);

    rerender(
      <Drawer key="locked-notice" defaultOpen direction="right">
        <DrawerTrigger>Open locked notice</DrawerTrigger>
        <DrawerContent keyboardDismissDisabled>
          <DrawerHeader>
            <DrawerTitle>Locked notice</DrawerTitle>
            <DrawerDescription>Escape is disabled.</DrawerDescription>
          </DrawerHeader>
          <DrawerClose>Close explicitly</DrawerClose>
        </DrawerContent>
      </Drawer>,
    );

    const lockedDrawer = screen.getByRole("dialog", { name: "Locked notice" });

    lockedDrawer.focus();
    await user.keyboard("{Escape}");

    expect(screen.getByRole("dialog", { name: "Locked notice" })).toBeInTheDocument();
  });

  it("mirrors provider context onto the body portal host", () => {
    render(
      <DethinkProvider
        className="custom-provider"
        data-testid="drawer-provider"
        density="compact"
        dir="rtl"
        theme="dark"
      >
        <Drawer defaultOpen direction="right">
          <DrawerTrigger>Open themed drawer</DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Themed drawer</DrawerTitle>
              <DrawerDescription>Provider attributes cross the portal.</DrawerDescription>
            </DrawerHeader>
          </DrawerContent>
        </Drawer>
      </DethinkProvider>,
    );

    const dialog = screen.getByRole("dialog", { name: "Themed drawer" });
    const portalHost = dialog.closest<HTMLElement>(
      '[data-slot="drawer-portal-container"]',
    );
    const provider = screen.getByTestId("drawer-provider");

    if (!portalHost) {
      throw new Error("Drawer should render inside a provider-aware portal host.");
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

describe("Drawer (push mode)", () => {
  it("renders inline without a portal, shifts layout via size classes, and manages focus without trapping it", async () => {
    const user = userEvent.setup();

    render(
      <div>
        <Drawer defaultOpen={false} direction="left" modal={false}>
          <DrawerTrigger>Open inspector</DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Inspector</DrawerTitle>
              <DrawerDescription>Persistent panel content.</DrawerDescription>
            </DrawerHeader>
            <button type="button">Panel action</button>
          </DrawerContent>
        </Drawer>
        <main>
          <button type="button">Outside content</button>
        </main>
      </div>,
    );

    const trigger = screen.getByRole("button", { name: "Open inspector" });
    let content = document.querySelector('[data-slot="drawer-content"]');

    expect(content).not.toBeNull();
    expect(
      document.querySelector(
        '[data-slot="drawer-portal-container"] [data-slot="drawer-content"]',
      ),
    ).toBeNull();
    expect(content).toHaveAttribute("data-state", "closed");
    expect(content).toHaveClass("w-0");
    expect(content).toHaveAttribute("inert");
    expect(
      screen.getByRole("button", { hidden: true, name: "Panel action" }),
    ).toHaveAttribute("tabindex", "-1");
    expect(screen.getByText("Outside content")).toBeInTheDocument();

    await user.tab();
    expect(trigger).toHaveFocus();

    await user.tab();
    expect(screen.getByRole("button", { name: "Outside content" })).toHaveFocus();

    await user.click(trigger);

    content = document.querySelector('[data-slot="drawer-content"]');
    expect(content).toHaveAttribute("data-state", "open");
    expect(content).not.toHaveAttribute("inert");
    expect(content).toHaveClass("w-96");
    expect(screen.getByRole("button", { name: "Panel action" })).not.toHaveAttribute(
      "tabindex",
    );

    const panel = screen.getByRole("dialog", { name: "Inspector" });

    await waitFor(() => {
      expect(panel).toHaveFocus();
    });

    expect(panel).not.toHaveAttribute("aria-modal", "true");
    expect(panel).toHaveAttribute("aria-modal", "false");

    await user.tab();
    expect(screen.getByRole("button", { name: "Panel action" })).toHaveFocus();

    await user.keyboard("{Escape}");

    await waitFor(() => {
      content = document.querySelector('[data-slot="drawer-content"]');
      expect(content).toHaveAttribute("data-state", "closed");
    });

    await user.click(screen.getByRole("button", { name: "Outside content" }));
    expect(screen.getByRole("button", { name: "Outside content" })).toHaveFocus();
  });
});
