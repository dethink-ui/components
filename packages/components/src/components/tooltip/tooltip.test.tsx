import { act, createRef, useState } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DethinkProvider } from "../../foundation/dethink-provider";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipTrigger,
  tooltipArrowClassNames,
  tooltipArrowShapeClassNames,
  tooltipClassNames,
  tooltipContentClassNames,
  tooltipTriggerClassNames,
} from ".";

function ControlledTooltipFixture() {
  const [open, setOpen] = useState(false);

  return (
    <Tooltip open={open} delay={0} closeDelay={0} onOpenChange={setOpen}>
      <TooltipTrigger>Controlled help</TooltipTrigger>
      <TooltipContent>Controlled tooltip content</TooltipContent>
      <span data-testid="controlled-state">{open ? "open" : "closed"}</span>
    </Tooltip>
  );
}

async function advanceTimersByTime(ms: number) {
  await act(async () => {
    vi.advanceTimersByTime(ms);
  });
}

async function hoverWithPointerModality(
  user: ReturnType<typeof userEvent.setup>,
  element: Element,
) {
  fireEvent.pointerDown(document.body, { pointerType: "mouse" });
  fireEvent.mouseDown(document.body);
  await user.hover(element);
}

describe("Tooltip", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("opens supplemental content on hover through the provider portal", async () => {
    const user = userEvent.setup();
    const rootRef = createRef<HTMLDivElement>();
    const triggerRef = createRef<HTMLButtonElement>();
    const contentRef = createRef<HTMLDivElement>();
    const handleOpenChange = vi.fn();

    render(
      <DethinkProvider
        className="custom-provider"
        data-testid="tooltip-provider"
        density="compact"
        dir="rtl"
        theme="dark"
      >
        <Tooltip
          ref={rootRef}
          className="custom-tooltip-root"
          delay={0}
          closeDelay={0}
          onOpenChange={handleOpenChange}
        >
          <TooltipTrigger
            ref={triggerRef}
            aria-label="Refresh dashboard"
            className="custom-tooltip-trigger"
            size="icon"
          >
            R
          </TooltipTrigger>
          <TooltipContent
            ref={contentRef}
            className="custom-tooltip-content"
            showArrow
          >
            Refresh dashboard data
          </TooltipContent>
        </Tooltip>
      </DethinkProvider>,
    );

    const trigger = screen.getByRole("button", {
      name: "Refresh dashboard",
    });

    expect(rootRef.current).toHaveAttribute("data-slot", "tooltip");
    expect(rootRef.current).toHaveClass("custom-tooltip-root");
    expect(triggerRef.current).toBe(trigger);
    expect(trigger).toHaveAttribute("data-slot", "tooltip-trigger");
    expect(trigger).toHaveClass("custom-tooltip-trigger");
    expect(trigger).toHaveAccessibleName("Refresh dashboard");

    await hoverWithPointerModality(user, trigger);

    const tooltip = await screen.findByRole("tooltip");
    const portalHost = tooltip.closest<HTMLElement>(
      '[data-slot="tooltip-portal-container"]',
    );
    const provider = screen.getByTestId("tooltip-provider");

    if (!portalHost) {
      throw new Error("Tooltip should render inside a provider-aware portal host.");
    }

    expect(handleOpenChange).toHaveBeenCalledWith(true);
    expect(contentRef.current).toBe(tooltip);
    expect(tooltip).toHaveTextContent("Refresh dashboard data");
    expect(tooltip).toHaveClass("custom-tooltip-content");
    expect(tooltip).toHaveAttribute("data-slot", "tooltip-content");
    expect(tooltip).toHaveAttribute("data-placement");
    expect(provider).not.toContainElement(tooltip);
    expect(document.body).toContainElement(portalHost);
    expect(portalHost).toHaveAttribute("data-dethink-provider", "");
    expect(portalHost).toHaveAttribute("data-theme", "dark");
    expect(portalHost).toHaveAttribute("data-density", "compact");
    expect(portalHost).toHaveAttribute("dir", "rtl");
    expect(portalHost).toHaveClass("custom-provider");
    expect(
      document.body.querySelector('[data-slot="tooltip-arrow"]'),
    ).toBeInTheDocument();
    expect(
      document.body.querySelector('[data-slot="tooltip-arrow-shape"]'),
    ).toBeInTheDocument();
  });

  it("opens on focus and dismisses with Escape", async () => {
    const user = userEvent.setup();

    render(
      <Tooltip delay={0} closeDelay={0}>
        <TooltipTrigger>Focus help</TooltipTrigger>
        <TooltipContent>Focus-triggered supplemental text</TooltipContent>
      </Tooltip>,
    );

    await user.tab();

    expect(
      await screen.findByRole("tooltip"),
    ).toHaveTextContent("Focus-triggered supplemental text");

    await user.keyboard("{Escape}");

    await waitFor(() => {
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    });
  });

  it("supports controlled open state", async () => {
    const user = userEvent.setup();

    render(<ControlledTooltipFixture />);

    const trigger = screen.getByRole("button", { name: "Controlled help" });

    expect(screen.getByTestId("controlled-state")).toHaveTextContent("closed");

    await hoverWithPointerModality(user, trigger);

    expect(screen.getByTestId("controlled-state")).toHaveTextContent("open");
    expect(screen.getByRole("tooltip")).toHaveTextContent(
      "Controlled tooltip content",
    );
  });

  it("supports delay and honors closeDelay with fake timers", async () => {
    vi.useFakeTimers();

    try {
      render(
        <Tooltip delay={600} closeDelay={300}>
          <TooltipTrigger>Delayed help</TooltipTrigger>
          <TooltipContent>Delayed tooltip content</TooltipContent>
        </Tooltip>,
      );

      const trigger = screen.getByRole("button", { name: "Delayed help" });

      fireEvent.pointerDown(document.body, { pointerType: "mouse" });
      fireEvent.mouseDown(document.body);
      fireEvent.pointerEnter(trigger, { pointerType: "mouse" });
      fireEvent.mouseEnter(trigger);
      await advanceTimersByTime(600);
      expect(screen.getByRole("tooltip")).toHaveTextContent(
        "Delayed tooltip content",
      );

      fireEvent.pointerLeave(trigger, {
        pointerType: "mouse",
        relatedTarget: document.body,
      });
      fireEvent.mouseLeave(trigger, { relatedTarget: document.body });
      await advanceTimersByTime(299);
      expect(screen.getByRole("tooltip")).toBeInTheDocument();

      await advanceTimersByTime(1);
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it("does not show content when the tooltip behavior is disabled", async () => {
    const user = userEvent.setup();

    render(
      <Tooltip disabled delay={0} closeDelay={0}>
        <TooltipTrigger>Disabled tooltip trigger</TooltipTrigger>
        <TooltipContent>Disabled supplemental text</TooltipContent>
      </Tooltip>,
    );

    await user.hover(
      screen.getByRole("button", { name: "Disabled tooltip trigger" }),
    );

    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("renders a disabled trigger without opening", async () => {
    const user = userEvent.setup();

    render(
      <Tooltip delay={0} closeDelay={0}>
        <TooltipTrigger disabled>Unavailable help</TooltipTrigger>
        <TooltipContent>Unavailable supplemental text</TooltipContent>
      </Tooltip>,
    );

    const trigger = screen.getByRole("button", { name: "Unavailable help" });

    expect(trigger).toBeDisabled();
    await user.hover(trigger);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("composes public class helpers", () => {
    expect(tooltipClassNames({ className: "custom-root" })).toContain(
      "custom-root",
    );
    expect(tooltipTriggerClassNames({ className: "custom-trigger" })).toContain(
      "custom-trigger",
    );
    expect(tooltipContentClassNames({ className: "custom-content" })).toContain(
      "custom-content",
    );
    expect(tooltipContentClassNames()).toContain("bg-foreground");
    expect(tooltipContentClassNames()).toContain("text-background");
    expect(tooltipContentClassNames()).toContain(
      "motion-safe:data-[entering]:animate-overlay-in",
    );
    expect(tooltipContentClassNames()).toContain(
      "motion-safe:data-[exiting]:animate-overlay-out",
    );
    expect(tooltipContentClassNames()).toContain("motion-reduce:animate-none");
    expect(tooltipArrowClassNames({ className: "custom-arrow" })).toContain(
      "custom-arrow",
    );
    expect(tooltipArrowShapeClassNames()).toContain("fill-foreground");
    expect(tooltipArrowShapeClassNames()).toContain("stroke-border/40");
  });

  it("renders a stable arrow slot and forwards refs", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(<TooltipArrow ref={ref} />);
    const arrow = container.querySelector<HTMLElement>(
      '[data-slot="tooltip-arrow"]',
    );
    const shape = container.querySelector<HTMLElement>(
      '[data-slot="tooltip-arrow-shape"]',
    );

    expect(arrow).toBeInTheDocument();
    expect(ref.current).toBe(arrow);
    expect(shape).toBeInTheDocument();
    expect(shape?.tagName.toLowerCase()).toBe("svg");
    expect(shape).toHaveClass("fill-foreground");
  });
});
