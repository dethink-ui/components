import { act, useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToString } from "react-dom/server";
import { hydrateRoot } from "react-dom/client";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";
import { Sidebar, SidebarMobile, SidebarProvider } from "../sidebar";
import { SidebarActivity, type SidebarActivityItem } from ".";

const items: SidebarActivityItem[] = [
  { id: "run", title: "Indexing", status: "running", progress: 62 },
  {
    id: "review",
    title: "Brief",
    status: "attention",
    action: { label: "Review brief", href: "/review" },
  },
];

describe("SidebarActivity", () => {
  it("shows status, progress and native links without announcing progress ticks", () => {
    const fixture = (progress: number) => (
      <SidebarProvider>
        <Sidebar>
          <SidebarActivity items={[{ ...items[0], progress }, items[1]]} />
        </Sidebar>
      </SidebarProvider>
    );
    const { rerender } = render(fixture(62));
    expect(
      screen.getByRole("progressbar", { name: "Indexing progress" }),
    ).toHaveAttribute("value", "62");
    expect(screen.getByRole("link", { name: "Review brief" })).toHaveAttribute(
      "href",
      "/review",
    );
    const summary = screen.getByRole("status").textContent;
    rerender(fixture(150));
    expect(screen.getByRole("progressbar")).toHaveAttribute("value", "100");
    expect(screen.getByRole("status")).toHaveTextContent(summary!);
    rerender(fixture(Number.NaN));
    expect(screen.getByRole("progressbar")).not.toHaveAttribute("value");
  });

  it("expands collapsed details and transfers keyboard focus", async () => {
    const user = userEvent.setup();
    render(
      <SidebarProvider defaultCollapsed>
        <Sidebar>
          <SidebarActivity items={items} label="Background work" />
        </Sidebar>
      </SidebarProvider>,
    );
    await user.click(screen.getByRole("button", { name: /Open activity/ }));
    expect(
      screen.getByRole("region", { name: "Background work" }),
    ).toHaveFocus();
    expect(screen.getByRole("link", { name: "Review brief" })).toBeVisible();
  });

  it("waits for controlled expansion before focusing", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const fixture = (collapsed: boolean) => (
      <SidebarProvider collapsed={collapsed} onCollapsedChange={onChange}>
        <Sidebar>
          <SidebarActivity items={items} />
        </Sidebar>
      </SidebarProvider>
    );
    const { rerender } = render(fixture(true));
    await user.click(screen.getByRole("button", { name: /Open activity/ }));
    expect(onChange).toHaveBeenCalledWith(false);
    expect(
      screen.queryByRole("region", { name: "Activity" }),
    ).not.toBeInTheDocument();
    rerender(fixture(false));
    expect(screen.getByRole("region", { name: "Activity" })).toHaveFocus();
  });

  it("supports custom empty/localized content and status transitions from actions", async () => {
    const user = userEvent.setup();
    function Fixture() {
      const [complete, setComplete] = useState(false);
      return (
        <SidebarProvider>
          <Sidebar>
            <SidebarActivity
              statusLabels={{ complete: "Done" }}
              items={[
                {
                  id: "job",
                  title: "Import",
                  status: complete ? "complete" : "attention",
                  action: {
                    label: "Resume import",
                    onAction: () => setComplete(true),
                  },
                },
              ]}
            />
          </Sidebar>
        </SidebarProvider>
      );
    }
    const { unmount } = render(<Fixture />);
    await user.click(screen.getByRole("button", { name: "Resume import" }));
    expect(screen.getByRole("status")).toHaveTextContent("1 done");
    unmount();
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarActivity
            items={[]}
            emptyMessage="Nothing pending"
            formatSummary={() => "No pending jobs"}
          />
        </Sidebar>
      </SidebarProvider>,
    );
    expect(screen.getByText("Nothing pending")).toBeVisible();
    expect(screen.getByRole("status")).toHaveTextContent("No pending jobs");
  });

  it("offers an informational permanent rail or a consumer-owned details action", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    const fixture = (handler?: () => void) => (
      <SidebarProvider variant="rail">
        <Sidebar>
          <SidebarActivity items={items} onOpen={handler} />
        </Sidebar>
      </SidebarProvider>
    );
    const { rerender } = render(fixture());
    expect(screen.getByRole("img", { name: /Activity:/ })).toBeVisible();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    rerender(fixture(onOpen));
    await user.click(screen.getByRole("button", { name: /Open activity/ }));
    expect(onOpen).toHaveBeenCalledOnce();
  });

  it("keeps mobile activity expanded when desktop is collapsed", () => {
    render(
      <SidebarProvider defaultCollapsed defaultMobileOpen animate={false}>
        <SidebarMobile label="Mobile">
          <SidebarActivity items={items} />
        </SidebarMobile>
      </SidebarProvider>,
    );
    expect(screen.getByRole("region", { name: "Activity" })).toBeVisible();
    expect(
      screen.queryByRole("button", { name: /Open activity/ }),
    ).not.toBeInTheDocument();
  });

  it.each([false, true])(
    "has no axe violations with collapsed=%s",
    async (collapsed) => {
      const { container } = render(
        <SidebarProvider collapsed={collapsed}>
          <Sidebar>
            <SidebarActivity items={items} />
          </Sidebar>
        </SidebarProvider>,
      );
      expect((await axe(container)).violations).toEqual([]);
    },
  );

  it("hydrates the public composition without mismatch warnings", async () => {
    const fixture = (
      <SidebarProvider>
        <Sidebar>
          <SidebarActivity items={items} />
        </Sidebar>
      </SidebarProvider>
    );
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const container = document.createElement("div");
    container.innerHTML = renderToString(fixture);
    let root: ReturnType<typeof hydrateRoot>;
    await act(async () => {
      root = hydrateRoot(container, fixture);
    });
    expect(error).not.toHaveBeenCalled();
    await act(async () => root.unmount());
    error.mockRestore();
  });
});
