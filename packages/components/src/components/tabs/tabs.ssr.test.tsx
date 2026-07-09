import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { Tabs, TabsList, TabsPanel, TabsTrigger } from ".";

function ServerTabs() {
  return (
    <Tabs defaultValue="billing" motionPreset="none" variant="pill">
      <TabsList aria-label="Settings sections">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="billing">Billing</TabsTrigger>
      </TabsList>
      <TabsPanel value="overview">Overview panel</TabsPanel>
      <TabsPanel value="billing">Billing panel</TabsPanel>
    </Tabs>
  );
}

describe("Tabs SSR", () => {
  it("renders tabs and selected panel markup on the server", () => {
    const markup = renderToString(<ServerTabs />);

    expect(markup).toContain('data-slot="tabs"');
    expect(markup).toContain('data-slot="tabs-list"');
    expect(markup).toContain('role="tablist"');
    expect(markup).toContain('role="tab"');
    expect(markup).toContain('aria-selected="true"');
    expect(markup).toContain('data-slot="tabs-active-layer"');
    expect(markup).toContain('data-reduced-motion="true"');
    expect(markup).toContain('role="tabpanel"');
    expect(markup).toContain("Billing panel");
    expect(markup).not.toContain("Overview panel");
  });

  it("hydrates without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const container = document.createElement("div");
    container.innerHTML = renderToString(<ServerTabs />);

    await act(async () => {
      hydrateRoot(container, <ServerTabs />);
    });

    expect(
      consoleError.mock.calls.some(([message]) =>
        String(message).toLowerCase().includes("hydration"),
      ),
    ).toBe(false);

    consoleError.mockRestore();
  });
});
