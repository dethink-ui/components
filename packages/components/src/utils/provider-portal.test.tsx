import { render, screen } from "@testing-library/react";
import {
  Button as AriaButton,
  Dialog as AriaDialog,
  DialogTrigger as AriaDialogTrigger,
  Popover as AriaPopover,
} from "react-aria-components";
import { describe, expect, it } from "vitest";
import { DethinkProvider } from "../foundation/dethink-provider";
import {
  DethinkPortalProvider,
  syncDethinkPortalContainer,
  useProviderPortalRoot,
} from "./provider-portal";

function ProviderAwarePopoverFixture() {
  const { portalContainer, rootRef } = useProviderPortalRoot<HTMLDivElement>({
    portalSlot: "positioned-overlay-portal-container",
  });

  return (
    <DethinkProvider
      className="custom-provider"
      data-testid="overlay-provider"
      density="compact"
      dir="rtl"
      theme="dark"
      themeConfig={{
        fonts: {
          body: "Inter, sans-serif",
        },
      }}
    >
      <div ref={rootRef}>
        <DethinkPortalProvider container={portalContainer}>
          <AriaDialogTrigger defaultOpen>
            <AriaButton>Open overlay</AriaButton>
            <AriaPopover data-slot="positioned-overlay-popover">
              <AriaDialog aria-label="Provider overlay">
                Overlay content
              </AriaDialog>
            </AriaPopover>
          </AriaDialogTrigger>
        </DethinkPortalProvider>
      </div>
    </DethinkProvider>
  );
}

describe("provider portal utilities", () => {
  it("mirrors provider attributes, classes, and theme variables to a portal host", () => {
    const provider = document.createElement("div");
    const container = document.createElement("div");

    provider.setAttribute("data-theme", "dark");
    provider.setAttribute("data-density", "compact");
    provider.setAttribute("dir", "rtl");
    provider.className = "bg-background font-sans text-foreground custom-provider";
    provider.style.setProperty("--dt-font-body", "Inter, sans-serif");

    syncDethinkPortalContainer({
      container,
      portalSlot: "positioned-overlay-portal-container",
      provider,
    });

    expect(container).toHaveAttribute(
      "data-slot",
      "positioned-overlay-portal-container",
    );
    expect(container).toHaveAttribute("data-dethink-provider", "");
    expect(container).toHaveAttribute("data-theme", "dark");
    expect(container).toHaveAttribute("data-density", "compact");
    expect(container).toHaveAttribute("dir", "rtl");
    expect(container).toHaveClass("custom-provider");
    expect(container.style.display).toBe("contents");
    expect(container.style.getPropertyValue("--dt-font-body")).toBe(
      "Inter, sans-serif",
    );
  });

  it("routes React Aria overlays through the provider-aware portal host", () => {
    render(<ProviderAwarePopoverFixture />);

    const dialog = screen.getByRole("dialog", { name: "Provider overlay" });
    const popover = dialog.closest<HTMLElement>(
      '[data-slot="positioned-overlay-popover"]',
    );
    const portalHost = popover?.closest<HTMLElement>(
      '[data-slot="positioned-overlay-portal-container"]',
    );
    const provider = screen.getByTestId("overlay-provider");

    if (!popover || !portalHost) {
      throw new Error("Popover should render inside a provider-aware portal host.");
    }

    expect(document.body).toContainElement(portalHost);
    expect(provider).not.toContainElement(popover);
    expect(portalHost).toHaveAttribute("data-dethink-provider", "");
    expect(portalHost).toHaveAttribute("data-theme", "dark");
    expect(portalHost).toHaveAttribute("data-density", "compact");
    expect(portalHost).toHaveAttribute("dir", "rtl");
    expect(portalHost).toHaveClass("custom-provider");
    expect(portalHost.style.display).toBe("contents");
    expect(portalHost.style.getPropertyValue("--dt-font-body")).toBe(
      "Inter, sans-serif",
    );
  });
});
