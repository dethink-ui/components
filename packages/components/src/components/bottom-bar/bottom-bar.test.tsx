import { act, useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToString } from "react-dom/server";
import { hydrateRoot } from "react-dom/client";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";
import {
  BottomBar,
  BottomBarHeader,
  BottomBarTrigger,
  BottomBarContent,
  type BottomBarProps,
} from ".";
import { SidebarShell, SidebarShellMain } from "../sidebar-shell";

function Example(props: BottomBarProps) {
  return (
    <BottomBar {...props}>
      <BottomBarHeader>
        Workbench
        <BottomBarTrigger />
      </BottomBarHeader>
      <BottomBarContent aria-label="Work">
        <input aria-label="Notes" />
      </BottomBarContent>
    </BottomBar>
  );
}
describe("BottomBar", () => {
  it("supports native keyboard disclosure, stable ARIA and retained form state", async () => {
    const user = userEvent.setup();
    render(<Example />);
    const trigger = screen.getByRole("button");
    const content = screen.getByRole("region", { name: "Work" });
    expect(trigger).toHaveAttribute("aria-controls", content.id);
    await user.type(screen.getByLabelText("Notes"), "Keep this");
    trigger.focus();
    await user.keyboard(" ");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(content).not.toBeVisible();
    await user.keyboard("{Enter}");
    expect(screen.getByLabelText("Notes")).toHaveValue("Keep this");
  });
  it("keeps controlled state owned by the consumer", async () => {
    const user = userEvent.setup();
    const changed = vi.fn();
    const { rerender } = render(
      <Example open={false} onOpenChange={changed} />,
    );
    await user.click(screen.getByRole("button"));
    expect(changed).toHaveBeenCalledWith(true);
    expect(screen.getByRole("button")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    rerender(<Example open onOpenChange={changed} />);
    expect(screen.getByRole("region")).toBeVisible();
  });
  it("returns focus when controlled content closes while focus is inside", async () => {
    const { rerender } = render(<Example open />);
    screen.getByLabelText("Notes").focus();
    rerender(<Example open={false} />);
    expect(screen.getByRole("button")).toHaveFocus();
  });
  it("does not steal focus from an external close action", async () => {
    function Controlled() {
      const [open, setOpen] = useState(true);
      return (
        <>
          <button onClick={() => setOpen(false)}>Close externally</button>
          <Example open={open} />
        </>
      );
    }
    const user = userEvent.setup();
    render(<Controlled />);
    await user.click(screen.getByLabelText("Notes"));
    await user.click(screen.getByRole("button", { name: "Close externally" }));
    expect(
      screen.getByRole("button", { name: "Close externally" }),
    ).toHaveFocus();
  });
  it("respects disabled and canceled triggers and custom markup", async () => {
    const user = userEvent.setup();
    render(
      <BottomBar>
        <BottomBarHeader>
          <BottomBarTrigger disabled>Disabled</BottomBarTrigger>
          <BottomBarTrigger onClick={(e) => e.preventDefault()}>
            Keep open
          </BottomBarTrigger>
        </BottomBarHeader>
        <BottomBarContent>Content</BottomBarContent>
      </BottomBar>,
    );
    await user.click(screen.getByRole("button", { name: "Disabled" }));
    await user.click(screen.getByRole("button", { name: "Keep open" }));
    expect(screen.getByRole("region")).toBeVisible();
  });
  it("isolates instances and accepts a consumer content ID", () => {
    render(
      <>
        <Example contentId="custom-work" />
        <Example />
      </>,
    );
    const triggers = screen.getAllByRole("button");
    expect(triggers[0]).toHaveAttribute("aria-controls", "custom-work");
    expect(triggers[1].getAttribute("aria-controls")).not.toBe("custom-work");
  });
  it("composes directly at shell span without losing disclosure state", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <SidebarShell motion="none">
        <SidebarShellMain>Workspace</SidebarShellMain>
        <BottomBar span="shell" defaultOpen={false}>
          <BottomBarHeader>
            <BottomBarTrigger />
          </BottomBarHeader>
          <BottomBarContent>Tasks</BottomBarContent>
        </BottomBar>
      </SidebarShell>,
    );
    expect(
      container.querySelector('[data-slot="sidebar-shell"]'),
    ).toHaveAttribute("data-has-shell-footer", "true");
    expect(
      container.querySelector(
        '[data-slot="sidebar-shell"] > [data-slot="bottom-bar"]',
      ),
    ).not.toBeNull();
    await user.click(screen.getByRole("button"));
    expect(screen.getByRole("region")).toBeVisible();
  });
  it("supports custom dimensions without coupling standalone bars to the shell", () => {
    const { container } = render(
      <Example size="lg" height={220} maxHeight="50dvh" />,
    );
    const bar = container.querySelector<HTMLElement>(
      '[data-slot="bottom-bar"]',
    )!;
    expect(bar.style.getPropertyValue("--bottom-bar-height")).toBe("220px");
    expect(bar.style.getPropertyValue("--bottom-bar-max-height")).toBe("50dvh");
  });
  it("has no axe violations when open or collapsed", async () => {
    const { container, rerender } = render(<Example />);
    expect((await axe(container)).violations).toEqual([]);
    rerender(<Example open={false} />);
    expect((await axe(container)).violations).toEqual([]);
  });
  it("hydrates server IDs without mismatches", async () => {
    const container = document.createElement("div");
    document.body.append(container);
    container.innerHTML = renderToString(<Example />);
    const error = vi.fn();
    let root: ReturnType<typeof hydrateRoot>;
    await act(async () => {
      root = hydrateRoot(container, <Example />, { onRecoverableError: error });
    });
    expect(error).not.toHaveBeenCalled();
    expect(
      container.querySelector("button")?.getAttribute("aria-controls"),
    ).toBe(container.querySelector('[role="region"]')?.id);
    await act(async () => root.unmount());
    container.remove();
  });
});
