import { act } from "react";
import {
  Button as AriaButton,
  Dialog as AriaDialog,
  DialogTrigger as AriaDialogTrigger,
  Popover as AriaPopover,
} from "react-aria-components";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
  DethinkPortalProvider,
  useProviderPortalRoot,
} from "./provider-portal";

type ReactActEnvironment = typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT?: boolean;
};

function ClosedProviderOverlayFixture() {
  const { portalContainer, rootRef } = useProviderPortalRoot<HTMLDivElement>({
    portalSlot: "positioned-overlay-portal-container",
  });

  return (
    <div ref={rootRef} data-slot="positioned-overlay-root">
      <DethinkPortalProvider container={portalContainer}>
        <AriaDialogTrigger>
          <AriaButton data-slot="positioned-overlay-trigger">
            Open server overlay
          </AriaButton>
          <AriaPopover data-slot="positioned-overlay-popover">
            <AriaDialog aria-label="Server overlay">
              Server overlay content
            </AriaDialog>
          </AriaPopover>
        </AriaDialogTrigger>
      </DethinkPortalProvider>
    </div>
  );
}

describe("positioned overlay SSR", () => {
  it("renders closed trigger markup on the server", () => {
    const html = renderToString(<ClosedProviderOverlayFixture />);

    expect(html).toContain('data-slot="positioned-overlay-root"');
    expect(html).toContain('data-slot="positioned-overlay-trigger"');
    expect(html).toContain("Open server overlay");
    expect(html).not.toContain("Server overlay content");
  });

  it("hydrates a closed provider-routed overlay without mismatch warnings", async () => {
    const reactActEnvironment = globalThis as ReactActEnvironment;
    const previousActEnvironment =
      reactActEnvironment.IS_REACT_ACT_ENVIRONMENT;

    reactActEnvironment.IS_REACT_ACT_ENVIRONMENT = true;

    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const container = document.createElement("div");
    container.innerHTML = renderToString(<ClosedProviderOverlayFixture />);

    try {
      await act(async () => {
        hydrateRoot(container, <ClosedProviderOverlayFixture />);
      });

      expect(consoleError).not.toHaveBeenCalled();
    } finally {
      consoleError.mockRestore();
      reactActEnvironment.IS_REACT_ACT_ENVIRONMENT = previousActEnvironment;
    }
  });
});
