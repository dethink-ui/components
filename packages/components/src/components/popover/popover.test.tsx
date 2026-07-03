import { createRef, useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DethinkProvider } from "../../foundation/dethink-provider";
import {
  Popover,
  PopoverArrow,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverFooter,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
  popoverArrowClassNames,
  popoverClassNames,
  popoverCloseClassNames,
  popoverContentClassNames,
  popoverDescriptionClassNames,
  popoverFooterClassNames,
  popoverHeaderClassNames,
  popoverPanelClassNames,
  popoverTitleClassNames,
  popoverTriggerClassNames,
} from ".";

function ControlledPopoverFixture() {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>Open controlled popover</PopoverTrigger>
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>Controlled workspace filters</PopoverTitle>
          <PopoverDescription>
            The consumer owns this open state.
          </PopoverDescription>
        </PopoverHeader>
        <PopoverFooter>
          <PopoverClose>Close controlled popover</PopoverClose>
        </PopoverFooter>
      </PopoverContent>
      <span data-testid="controlled-state">{open ? "open" : "closed"}</span>
    </Popover>
  );
}

describe("Popover", () => {
  it("renders an accessible popover through the provider portal and closes from a close button", async () => {
    const user = userEvent.setup();
    const handleOpenChange = vi.fn();
    const rootRef = createRef<HTMLDivElement>();
    const triggerRef = createRef<HTMLButtonElement>();
    const contentRef = createRef<HTMLElement>();

    render(
      <DethinkProvider
        className="custom-provider"
        data-testid="popover-provider"
        density="compact"
        dir="rtl"
        theme="dark"
      >
        <Popover
          ref={rootRef}
          className="custom-popover-root"
          onOpenChange={handleOpenChange}
        >
          <PopoverTrigger
            ref={triggerRef}
            className="custom-popover-trigger"
            variant="outline"
          >
            Open filters
          </PopoverTrigger>
          <PopoverContent
            ref={contentRef}
            className="custom-popover-content"
            panelClassName="custom-popover-panel"
            showArrow
          >
            <PopoverHeader className="custom-popover-header">
              <PopoverTitle>Workspace filters</PopoverTitle>
              <PopoverDescription>
                Tune the dashboard query before running it.
              </PopoverDescription>
            </PopoverHeader>
            <PopoverFooter>
              <PopoverClose className="custom-popover-close">
                Apply filters
              </PopoverClose>
            </PopoverFooter>
          </PopoverContent>
        </Popover>
      </DethinkProvider>,
    );

    const trigger = screen.getByRole("button", { name: "Open filters" });

    expect(rootRef.current).toHaveAttribute("data-slot", "popover");
    expect(rootRef.current).toHaveClass("custom-popover-root");
    expect(triggerRef.current).toBe(trigger);
    expect(trigger).toHaveAttribute("data-slot", "popover-trigger");
    expect(trigger).toHaveClass("custom-popover-trigger");

    await user.click(trigger);

    const dialog = await screen.findByRole("dialog", {
      name: "Workspace filters",
    });
    const content = dialog.closest<HTMLElement>('[data-slot="popover-content"]');
    const panel = dialog.closest<HTMLElement>('[data-slot="popover-panel"]');
    const portalHost = content?.closest<HTMLElement>(
      '[data-slot="popover-portal-container"]',
    );
    const provider = screen.getByTestId("popover-provider");

    if (!content || !panel || !portalHost) {
      throw new Error("Popover should render inside a provider-aware portal host.");
    }

    expect(handleOpenChange).toHaveBeenCalledWith(true);
    expect(contentRef.current).toBe(content);
    expect(content).toHaveClass("custom-popover-content");
    expect(content).toHaveAttribute("data-placement");
    expect(panel).toHaveClass("custom-popover-panel");
    expect(screen.getByText("Tune the dashboard query before running it."))
      .toHaveAttribute("data-slot", "popover-description");
    expect(document.body).toContainElement(portalHost);
    expect(provider).not.toContainElement(content);
    expect(portalHost).toHaveAttribute("data-dethink-provider", "");
    expect(portalHost).toHaveAttribute("data-theme", "dark");
    expect(portalHost).toHaveAttribute("data-density", "compact");
    expect(portalHost).toHaveAttribute("dir", "rtl");
    expect(portalHost).toHaveClass("custom-provider");
    expect(screen.getByText("Workspace filters")).toHaveAttribute(
      "data-slot",
      "popover-title",
    );
    expect(
      document.body.querySelector('[data-slot="popover-arrow"]'),
    ).toBeInTheDocument();
    expect(
      document.body.querySelector('[data-slot="popover-arrow-shape"]'),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Apply filters" }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    await expect(trigger).toHaveFocus();
  });

  it("supports controlled open state", async () => {
    const user = userEvent.setup();

    render(<ControlledPopoverFixture />);

    const trigger = screen.getByRole("button", {
      name: "Open controlled popover",
    });

    expect(screen.getByTestId("controlled-state")).toHaveTextContent("closed");

    await user.click(trigger);

    expect(screen.getByTestId("controlled-state")).toHaveTextContent("open");
    expect(
      screen.getByRole("dialog", { name: "Controlled workspace filters" }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Close controlled popover" }),
    );

    await waitFor(() => {
      expect(screen.getByTestId("controlled-state")).toHaveTextContent("closed");
    });
  });

  it("keeps Escape disabled only when an explicit close path exists", async () => {
    const user = userEvent.setup();

    render(
      <Popover defaultOpen>
        <PopoverTrigger>Open locked popover</PopoverTrigger>
        <PopoverContent keyboardDismissDisabled>
          <PopoverHeader>
            <PopoverTitle>Locked popover</PopoverTitle>
            <PopoverDescription>
              Escape is disabled for this workflow.
            </PopoverDescription>
          </PopoverHeader>
          <PopoverClose>Close explicitly</PopoverClose>
        </PopoverContent>
      </Popover>,
    );

    const dialog = screen.getByRole("dialog", { name: "Locked popover" });

    dialog.focus();
    await user.keyboard("{Escape}");

    expect(
      screen.getByRole("dialog", { name: "Locked popover" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Close explicitly" }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("does not close from a disabled close button", async () => {
    const user = userEvent.setup();

    render(
      <Popover defaultOpen>
        <PopoverTrigger>Open disabled close popover</PopoverTrigger>
        <PopoverContent>
          <PopoverHeader>
            <PopoverTitle>Disabled close popover</PopoverTitle>
            <PopoverDescription>
              Disabled close actions cannot dismiss the surface.
            </PopoverDescription>
          </PopoverHeader>
          <PopoverClose disabled>Disabled close</PopoverClose>
        </PopoverContent>
      </Popover>,
    );

    const closeButton = screen.getByRole("button", { name: "Disabled close" });

    expect(closeButton).toBeDisabled();
    await user.click(closeButton);
    expect(
      screen.getByRole("dialog", { name: "Disabled close popover" }),
    ).toBeInTheDocument();
  });

  it("preserves React Aria trigger labelling when no title is rendered", async () => {
    const user = userEvent.setup();

    render(
      <Popover>
        <PopoverTrigger>Open trigger-labelled popover</PopoverTrigger>
        <PopoverContent>
          <PopoverDescription>
            The trigger remains the accessible name when no title is present.
          </PopoverDescription>
          <PopoverClose>Close</PopoverClose>
        </PopoverContent>
      </Popover>,
    );

    await user.click(
      screen.getByRole("button", { name: "Open trigger-labelled popover" }),
    );

    expect(
      await screen.findByRole("dialog", {
        name: "Open trigger-labelled popover",
      }),
    ).toBeInTheDocument();
  });

  it("does not open from a disabled trigger", async () => {
    const user = userEvent.setup();

    render(
      <Popover>
        <PopoverTrigger disabled>Open disabled popover</PopoverTrigger>
        <PopoverContent>
          <PopoverTitle>Disabled popover</PopoverTitle>
        </PopoverContent>
      </Popover>,
    );

    const trigger = screen.getByRole("button", {
      name: "Open disabled popover",
    });

    expect(trigger).toBeDisabled();
    await user.click(trigger);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("composes public class helpers", () => {
    expect(popoverClassNames({ className: "custom-root" })).toContain(
      "custom-root",
    );
    expect(popoverTriggerClassNames({ className: "custom-trigger" })).toContain(
      "custom-trigger",
    );
    expect(popoverContentClassNames({ className: "custom-content" })).toContain(
      "custom-content",
    );
    expect(popoverContentClassNames()).toContain("bg-background");
    expect(popoverContentClassNames()).toContain("focus-visible:outline-ring");
    expect(popoverContentClassNames()).toContain(
      "motion-safe:data-[entering]:animate-popover-in",
    );
    expect(popoverContentClassNames()).toContain(
      "motion-safe:data-[exiting]:animate-popover-out",
    );
    expect(popoverPanelClassNames({ className: "custom-panel" })).toContain(
      "custom-panel",
    );
    expect(popoverPanelClassNames()).toContain("focus-visible:outline-ring");
    expect(popoverArrowClassNames()).toContain(
      "data-[placement=bottom]:rotate-180",
    );
    expect(popoverHeaderClassNames({ className: "custom-header" })).toContain(
      "custom-header",
    );
    expect(popoverFooterClassNames({ className: "custom-footer" })).toContain(
      "custom-footer",
    );
    expect(
      popoverTitleClassNames({
        className: "custom-title",
        visuallyHidden: true,
      }),
    ).toContain("sr-only");
    expect(
      popoverDescriptionClassNames({ className: "custom-description" }),
    ).toContain("custom-description");
    expect(popoverCloseClassNames({ className: "custom-close" })).toContain(
      "custom-close",
    );
  });

  it("renders a manually placed arrow with popover slots", () => {
    const { container } = render(<PopoverArrow className="custom-arrow" />);

    expect(container.querySelector('[data-slot="popover-arrow"]'))
      .toBeInTheDocument();
    expect(container.querySelector('[data-slot="popover-arrow-shape"]'))
      .toBeInTheDocument();
    expect(container.querySelector('[data-slot="popover-arrow"]'))
      .toHaveClass("custom-arrow");
  });
});
