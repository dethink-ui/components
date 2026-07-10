import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { Sidebar } from "../sidebar";
import {
  SidebarShell,
  SidebarShellFooter,
  SidebarShellHeader,
  SidebarShellMain,
} from ".";

function ServerShell({ defaultCollapsed = false }) {
  return (
    <SidebarShell defaultCollapsed={defaultCollapsed}>
      <Sidebar aria-label="Server navigation" />
      <SidebarShellHeader>Server toolbar</SidebarShellHeader>
      <SidebarShellMain>Server content</SidebarShellMain>
      <SidebarShellFooter>Server status</SidebarShellFooter>
    </SidebarShell>
  );
}

describe("SidebarShell SSR", () => {
  it("renders stable viewport and Motion state on the server", () => {
    const expandedMarkup = renderToString(<ServerShell />);
    const collapsedMarkup = renderToString(<ServerShell defaultCollapsed />);

    expect(expandedMarkup).toContain('data-slot="sidebar-shell"');
    expect(expandedMarkup).toContain('data-layout="viewport"');
    expect(expandedMarkup).toContain('data-motion="standard"');
    expect(expandedMarkup).toContain('data-collapsed="false"');
    expect(expandedMarkup).toContain('data-slot="sidebar-shell-skip-link"');
    expect(collapsedMarkup).toContain('data-collapsed="true"');
  });

  it("hydrates without mismatch warnings or mount-time initial styles", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const container = document.createElement("div");
    const shell = <ServerShell defaultCollapsed />;
    const markup = renderToString(shell);
    container.innerHTML = markup;

    await act(async () => {
      hydrateRoot(container, shell);
    });

    expect(
      consoleError.mock.calls.some(([message]) =>
        String(message).toLowerCase().includes("hydration"),
      ),
    ).toBe(false);
    expect(markup).not.toContain("transform:");
    expect(markup).not.toContain("opacity:0");

    consoleError.mockRestore();
  });
});
