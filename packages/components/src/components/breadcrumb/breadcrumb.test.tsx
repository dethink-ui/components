import { forwardRef } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbOverflow,
  BreadcrumbPage,
  BreadcrumbSeparator,
  breadcrumbLinkClassNames,
} from ".";
import { getBreadcrumbRenderItems } from "./breadcrumb";

const RouterLink = forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }
>(({ to, children, ...props }, ref) => (
  <a ref={ref} href={to} {...props}>
    {children}
  </a>
));
RouterLink.displayName = "RouterLink";

const longPath = [
  { key: "home", label: "Home", href: "/" },
  { key: "workspaces", label: "Workspaces", href: "/workspaces" },
  { key: "ops", label: "Operations", href: "/workspaces/ops" },
  { key: "reports", label: "Reports", href: "/workspaces/ops/reports" },
  { key: "revenue", label: "Revenue detail" },
];

describe("Breadcrumb", () => {
  it("renders data-driven breadcrumbs as a labelled nav and ordered list", () => {
    render(
      <Breadcrumb
        items={[
          { key: "home", label: "Home", href: "/" },
          { key: "workspaces", label: "Workspaces", href: "/workspaces" },
          { key: "ops", label: "Operations" },
        ]}
      />,
    );

    const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
    const list = within(nav).getByRole("list");
    const links = within(nav).getAllByRole("link");

    expect(list.tagName).toBe("OL");
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute("href", "/");
    expect(
      within(nav)
        .getByText("Operations")
        .closest('[data-slot="breadcrumb-page"]'),
    ).toHaveAttribute("aria-current", "page");
  });

  it("supports children-driven compound anatomy", () => {
    render(
      <Breadcrumb aria-label="Settings path" separator="slash">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/settings">Settings</BreadcrumbLink>
            <BreadcrumbSeparator />
          </BreadcrumbItem>
          <BreadcrumbItem current>
            <BreadcrumbPage>Billing</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    );

    const nav = screen.getByRole("navigation", { name: "Settings path" });

    expect(within(nav).getByRole("link", { name: "Settings" })).toHaveAttribute(
      "href",
      "/settings",
    );
    expect(
      within(nav).getByText("Billing").closest('[data-slot="breadcrumb-page"]'),
    ).toHaveAttribute("aria-current", "page");
    expect(
      nav.querySelector('[data-slot="breadcrumb-separator"]'),
    ).toHaveAttribute("aria-hidden", "true");
  });

  it("renders custom ReactNode separators as decorative content", () => {
    render(
      <Breadcrumb
        separator={
          <span data-testid="custom-separator" className="font-mono">
            {"<>"}
          </span>
        }
        items={[
          { key: "home", label: "Home", href: "/" },
          { key: "library", label: "Library", href: "/library" },
          { key: "current", label: "Custom separator" },
        ]}
      />,
    );

    const separators = screen.getAllByTestId("custom-separator");

    expect(separators).toHaveLength(2);
    for (const separator of separators) {
      expect(
        separator.closest('[data-slot="breadcrumb-separator"]'),
      ).toHaveAttribute("aria-hidden", "true");
    }
  });

  it("renders current linked items with aria-current and data-current", () => {
    render(
      <Breadcrumb
        items={[
          { key: "home", label: "Home", href: "/" },
          {
            key: "billing",
            label: "Billing",
            href: "/settings/billing",
            current: true,
          },
        ]}
      />,
    );

    const current = screen.getByRole("link", { name: "Billing" });

    expect(current).toHaveAttribute("aria-current", "page");
    expect(current).toHaveAttribute("data-current", "true");
  });

  it("runs action items and avoids disabled activation", async () => {
    const user = userEvent.setup();
    const enabled = vi.fn();
    const disabled = vi.fn();

    render(
      <Breadcrumb
        items={[
          { key: "home", label: "Home", href: "/" },
          { key: "enabled", label: "Enabled", onAction: enabled },
          {
            key: "disabled",
            label: "Disabled",
            disabled: true,
            onAction: disabled,
          },
          { key: "current", label: "Current" },
        ]}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Enabled" }));
    await user.click(screen.getByRole("button", { name: "Disabled" }));

    expect(enabled).toHaveBeenCalledTimes(1);
    expect(disabled).not.toHaveBeenCalled();
  });

  it("composes router links through asChild", () => {
    render(
      <Breadcrumb aria-label="Router path">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild current>
              <RouterLink to="/projects">Projects</RouterLink>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    );

    const link = screen.getByRole("link", { name: "Projects" });

    expect(link).toHaveAttribute("href", "/projects");
    expect(link).toHaveAttribute("aria-current", "page");
    expect(link).toHaveAttribute("data-slot", "breadcrumb-link");
  });

  it("uses child aria-current for asChild current styling", () => {
    render(
      <Breadcrumb aria-label="Router current path">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <RouterLink aria-current="location" to="/projects">
                Projects
              </RouterLink>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    );

    expect(screen.getByRole("link", { name: "Projects" })).toHaveAttribute(
      "data-current",
      "true",
    );
  });

  it("collapses long paths and keeps hidden ancestors reachable", async () => {
    const user = userEvent.setup();

    render(
      <Breadcrumb
        items={longPath}
        maxItems={4}
        overflowLabel="Show full path"
      />,
    );

    const nav = screen.getByRole("navigation", { name: "Breadcrumb" });

    expect(within(nav).queryByRole("link", { name: "Workspaces" })).toBeNull();
    await user.click(
      within(nav).getByRole("button", { name: "Show full path" }),
    );

    const dialog = await screen.findByRole("dialog", {
      name: "Show full path",
    });

    expect(
      within(dialog).getByRole("link", { name: "Workspaces" }),
    ).toHaveAttribute("href", "/workspaces");
  });

  it("does not mark plain overflow-only ancestors as current by default", async () => {
    const user = userEvent.setup();

    render(
      <Breadcrumb aria-label="Manual overflow path">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
            <BreadcrumbSeparator />
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbOverflow
              label="Show hidden ancestors"
              items={[
                { key: "workspace", label: "Workspace", href: "/workspace" },
                {
                  key: "project",
                  label: "Project",
                  href: "/workspace/project",
                },
              ]}
            />
            <BreadcrumbSeparator />
          </BreadcrumbItem>
          <BreadcrumbItem current>
            <BreadcrumbPage>Revenue detail</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    );

    await user.click(
      screen.getByRole("button", { name: "Show hidden ancestors" }),
    );

    const dialog = await screen.findByRole("dialog", {
      name: "Show hidden ancestors",
    });

    expect(
      within(dialog).getByRole("link", { name: "Project" }),
    ).not.toHaveAttribute("aria-current");
    expect(
      screen
        .getByText("Revenue detail")
        .closest('[data-slot="breadcrumb-page"]'),
    ).toHaveAttribute("aria-current", "page");
  });

  it("generates stable middle, start, and end collapse windows", () => {
    const middle = getBreadcrumbRenderItems(longPath, { maxItems: 4 });
    const start = getBreadcrumbRenderItems(longPath, {
      collapseFrom: "start",
      maxItems: 4,
    });
    const end = getBreadcrumbRenderItems(longPath, {
      collapseFrom: "end",
      maxItems: 4,
    });

    expect(middle.map((entry) => entry.type)).toEqual([
      "item",
      "overflow",
      "item",
      "item",
    ]);
    expect(start.map((entry) => entry.type)).toEqual([
      "item",
      "overflow",
      "item",
      "item",
    ]);
    expect(end.map((entry) => entry.type)).toEqual([
      "item",
      "item",
      "overflow",
      "item",
    ]);
  });

  it("uses tokenized focus and truncation classes", () => {
    const className = breadcrumbLinkClassNames();

    expect(className).toContain("focus-visible:ring-ring");
    expect(className).toContain("max-w-full");
    expect(className).toContain("min-w-0");
  });
});
