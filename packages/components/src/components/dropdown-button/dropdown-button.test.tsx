import { createRef, useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  DropdownMenuItem,
  DropdownMenuItemLabel,
  DropdownMenuLabel,
  DropdownMenuSection,
  DropdownMenuSeparator,
} from "../dropdown-menu";
import {
  DropdownButton,
  dropdownButtonClassNames,
  type DropdownButtonProps,
} from ".";

function ControlledFixture() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <DropdownButton
        label="Controlled actions"
        open={open}
        onOpenChange={setOpen}
      >
        <DropdownMenuItem>Archive report</DropdownMenuItem>
      </DropdownButton>
      <span data-testid="open-state">{open ? "open" : "closed"}</span>
    </>
  );
}

describe("DropdownButton", () => {
  it("renders one accessible menu button and reuses DropdownMenu actions", async () => {
    const user = userEvent.setup();
    const onArchive = vi.fn();
    const onDelete = vi.fn();
    const onOpenChange = vi.fn();
    const rootRef = createRef<HTMLDivElement>();

    render(
      <DropdownButton
        ref={rootRef}
        className="custom-root"
        contentClassName="custom-content"
        defaultOpen={false}
        groupClassName="custom-composite"
        label="Report actions"
        menuClassName="custom-menu"
        onOpenChange={onOpenChange}
        placement="bottom end"
        showArrow
        size="lg"
        triggerClassName="custom-trigger"
        variant="soft"
      >
        <DropdownMenuSection>
          <DropdownMenuLabel>Report</DropdownMenuLabel>
          <DropdownMenuItem onAction={onArchive}>
            Archive report
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem destructive onAction={onDelete}>
            Delete report
          </DropdownMenuItem>
        </DropdownMenuSection>
      </DropdownButton>,
    );

    const trigger = screen.getByRole("button", { name: "Report actions" });

    expect(screen.getAllByRole("button")).toHaveLength(1);
    expect(rootRef.current).toHaveAttribute("data-slot", "dropdown-button");
    expect(rootRef.current).toHaveAttribute("data-mode", "menu");
    expect(rootRef.current).toHaveAttribute("data-state", "closed");
    expect(rootRef.current).toHaveClass("custom-root");
    expect(trigger).toHaveAttribute("aria-haspopup", "true");
    expect(trigger).toHaveAttribute("data-slot", "dropdown-button-trigger");
    expect(trigger).toHaveAttribute("data-size", "lg");
    expect(trigger).toHaveAttribute("data-variant", "soft");
    expect(trigger).toHaveClass("custom-trigger");
    expect(
      document.querySelector('[data-slot="dropdown-button-composite"]'),
    ).toHaveClass("custom-composite");
    expect(
      document.querySelector('[data-slot="dropdown-button-composite"]'),
    ).toHaveAttribute("aria-label", "Report actions");

    await user.click(trigger);

    const menu = await screen.findByRole("menu");
    const content = menu.closest<HTMLElement>(
      '[data-slot="dropdown-button-content"]',
    );

    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(rootRef.current).toHaveAttribute("data-state", "open");
    expect(content).toHaveClass("custom-content");
    expect(content).toHaveAttribute("data-motion", "standard");
    expect(menu).toHaveClass("custom-menu");
    expect(
      document.querySelector('[data-slot="dropdown-menu-arrow"]'),
    ).toBeInTheDocument();
    expect(
      content?.closest('[data-slot="dropdown-button-menu-anchor"]'),
    ).toBeNull();
    expect(
      content?.closest('[data-slot="dropdown-menu-portal-container"]'),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("menuitem", { name: "Archive report" }));

    expect(onArchive).toHaveBeenCalledTimes(1);
    expect(onDelete).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(screen.queryByRole("menu")).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it("supports controlled open state, Escape dismissal, and focus return", async () => {
    const user = userEvent.setup();
    render(<ControlledFixture />);

    const trigger = screen.getByRole("button", {
      name: "Controlled actions",
    });

    expect(screen.getByTestId("open-state")).toHaveTextContent("closed");

    await user.click(trigger);
    expect(screen.getByTestId("open-state")).toHaveTextContent("open");
    expect(await screen.findByRole("menu")).toBeInTheDocument();

    await user.keyboard("{Escape}");

    await waitFor(() => {
      expect(screen.getByTestId("open-state")).toHaveTextContent("closed");
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it("keeps split primary and menu activation unambiguous", async () => {
    const user = userEvent.setup();
    const onPrimaryAction = vi.fn();
    const onMenuAction = vi.fn();

    render(
      <DropdownButton
        label="Save"
        menuLabel="More save options"
        mode="split"
        onPrimaryAction={onPrimaryAction}
      >
        <DropdownMenuItem onAction={onMenuAction}>
          Save as template
        </DropdownMenuItem>
      </DropdownButton>,
    );

    const primary = screen.getByRole("button", { name: "Save" });
    const menuTrigger = screen.getByRole("button", {
      name: "More save options",
    });

    expect(screen.getAllByRole("button")).toHaveLength(2);
    expect(primary).toHaveAttribute("data-slot", "dropdown-button-primary");
    expect(primary).not.toHaveAttribute("aria-haspopup");
    expect(menuTrigger).toHaveAttribute(
      "data-slot",
      "dropdown-button-menu-trigger",
    );
    expect(menuTrigger).toHaveAttribute("aria-haspopup", "true");

    await user.click(primary);
    expect(onPrimaryAction).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();

    primary.focus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(onPrimaryAction).toHaveBeenCalledTimes(3);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();

    await user.click(menuTrigger);
    expect(await screen.findByRole("menu")).toBeInTheDocument();
    expect(onPrimaryAction).toHaveBeenCalledTimes(3);

    await user.click(
      screen.getByRole("menuitem", { name: "Save as template" }),
    );
    expect(onMenuAction).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(menuTrigger).toHaveFocus());
  });

  it("keeps both split controls in normal document Tab order", async () => {
    const user = userEvent.setup();

    render(
      <DropdownButton
        label="Publish"
        menuLabel="More publish options"
        mode="split"
        onPrimaryAction={() => undefined}
      >
        <DropdownMenuItem>Schedule publish</DropdownMenuItem>
      </DropdownButton>,
    );

    const primary = screen.getByRole("button", { name: "Publish" });
    const menuTrigger = screen.getByRole("button", {
      name: "More publish options",
    });

    await user.tab();
    expect(primary).toHaveFocus();
    await user.tab();
    expect(menuTrigger).toHaveFocus();
    await user.tab({ shift: true });
    expect(primary).toHaveFocus();

    await user.keyboard("{ArrowRight}");
    expect(primary).toHaveFocus();
  });

  it("anchors split content width and positioning to the full composite", async () => {
    const user = userEvent.setup();

    render(
      <DropdownButton
        contentClassName="split-content"
        label="A deliberately long primary action"
        menuLabel="More long-label options"
        mode="split"
        onPrimaryAction={() => undefined}
        placement="bottom end"
      >
        <DropdownMenuItem>Alternative action</DropdownMenuItem>
      </DropdownButton>,
    );

    const composite = document.querySelector<HTMLElement>(
      '[data-slot="dropdown-button-composite"]',
    );
    const menuTrigger = screen.getByRole("button", {
      name: "More long-label options",
    });

    if (!composite) {
      throw new Error("Expected the split composite anchor.");
    }

    vi.spyOn(composite, "getBoundingClientRect").mockReturnValue({
      bottom: 40,
      height: 40,
      left: 0,
      right: 248,
      top: 0,
      width: 248,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    await user.click(menuTrigger);

    const content = (await screen.findByRole("menu")).closest<HTMLElement>(
      '[data-slot="dropdown-button-content"]',
    );
    const positioner = content?.parentElement;

    expect(content).toHaveClass("split-content");
    expect(content).toHaveClass("min-w-[var(--trigger-width)]");
    await waitFor(() => {
      expect(positioner?.style.getPropertyValue("--trigger-width")).toBe(
        "248px",
      );
    });
  });

  it("uses Motion for open chevron state and resolves reduced motion immediately", async () => {
    const user = userEvent.setup();

    render(
      <DropdownButton
        label="Export"
        menuLabel="More export options"
        mode="split"
        motionPreset="standard"
        onPrimaryAction={() => undefined}
        reducedMotion
      >
        <DropdownMenuItem>Export CSV</DropdownMenuItem>
      </DropdownButton>,
    );

    const trigger = screen.getByRole("button", {
      name: "More export options",
    });
    const icon = trigger.querySelector(
      '[data-slot="dropdown-button-trigger-icon"]',
    );

    expect(icon).not.toHaveAttribute("data-open");
    await user.click(trigger);

    expect(await screen.findByRole("menu")).toBeInTheDocument();
    expect(icon).toHaveAttribute("data-open");
    expect(trigger.closest('[data-slot="dropdown-button"]')).toHaveAttribute(
      "data-state",
      "open",
    );
  });

  it("disables the complete split composite during loading by default", async () => {
    const user = userEvent.setup();
    const onPrimaryAction = vi.fn();

    render(
      <DropdownButton
        label="Publish"
        loading
        menuLabel="More publish options"
        mode="split"
        onPrimaryAction={onPrimaryAction}
      >
        <DropdownMenuItem>Schedule publish</DropdownMenuItem>
      </DropdownButton>,
    );

    const primary = screen.getByRole("button", { name: "Publish" });
    const menuTrigger = screen.getByRole("button", {
      name: "More publish options",
    });
    const root = primary.closest('[data-slot="dropdown-button"]');

    expect(primary).toBeDisabled();
    expect(primary).toHaveAttribute("aria-busy", "true");
    expect(primary).toHaveTextContent("Publish");
    expect(menuTrigger).toBeDisabled();
    expect(root).toHaveAttribute("data-loading");
    expect(root).toHaveAttribute("data-loading-behavior", "all");
    expect(
      primary.querySelector('[data-slot="dropdown-button-busy-indicator"]'),
    ).toBeInTheDocument();
    expect(
      primary.querySelector('[data-slot="button-spinner"]'),
    ).not.toHaveClass("animate-spin");

    await user.click(primary);
    await user.click(menuTrigger);
    expect(onPrimaryAction).not.toHaveBeenCalled();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("keeps safe menu alternatives available under primary-only loading", async () => {
    const user = userEvent.setup();

    render(
      <DropdownButton
        label="Generate report"
        loading
        loadingBehavior="primary"
        menuLabel="More report options"
        mode="split"
        onPrimaryAction={() => undefined}
      >
        <DropdownMenuItem>Cancel generation</DropdownMenuItem>
      </DropdownButton>,
    );

    const primary = screen.getByRole("button", { name: "Generate report" });
    const menuTrigger = screen.getByRole("button", {
      name: "More report options",
    });

    expect(primary).toBeDisabled();
    expect(menuTrigger).toBeEnabled();
    expect(primary.closest('[data-slot="dropdown-button"]')).toHaveAttribute(
      "data-loading-behavior",
      "primary",
    );

    await user.click(menuTrigger);
    expect(
      await screen.findByRole("menuitem", { name: "Cancel generation" }),
    ).toBeInTheDocument();
  });

  it.each([
    {
      disabled: true,
      menuDisabled: false,
      menuEnabled: false,
      primaryDisabled: false,
      primaryEnabled: false,
      title: "whole composite disabled",
    },
    {
      disabled: false,
      menuDisabled: false,
      menuEnabled: true,
      primaryDisabled: true,
      primaryEnabled: false,
      title: "primary disabled independently",
    },
    {
      disabled: false,
      menuDisabled: true,
      menuEnabled: false,
      primaryDisabled: false,
      primaryEnabled: true,
      title: "menu disabled independently",
    },
  ])(
    "supports $title",
    ({
      disabled,
      menuDisabled,
      menuEnabled,
      primaryDisabled,
      primaryEnabled,
    }) => {
      render(
        <DropdownButton
          disabled={disabled}
          label="Deploy"
          menuDisabled={menuDisabled}
          menuLabel="More deployment options"
          mode="split"
          onPrimaryAction={() => undefined}
          primaryDisabled={primaryDisabled}
        >
          <DropdownMenuItem>Deploy later</DropdownMenuItem>
        </DropdownButton>,
      );

      expect(screen.getByRole("button", { name: "Deploy" })).toHaveProperty(
        "disabled",
        !primaryEnabled,
      );
      expect(
        screen.getByRole("button", { name: "More deployment options" }),
      ).toHaveProperty("disabled", !menuEnabled);
    },
  );

  it("closes controlled content and moves focus when the menu becomes unavailable", async () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <DropdownButton
        label="Approve"
        menuLabel="More approval options"
        mode="split"
        onOpenChange={onOpenChange}
        onPrimaryAction={() => undefined}
        open
      >
        <DropdownMenuItem>Approve with note</DropdownMenuItem>
      </DropdownButton>,
    );

    expect(await screen.findByRole("menu")).toBeInTheDocument();

    rerender(
      <DropdownButton
        label="Approve"
        menuDisabled
        menuLabel="More approval options"
        mode="split"
        onOpenChange={onOpenChange}
        onPrimaryAction={() => undefined}
        open
      >
        <DropdownMenuItem>Approve with note</DropdownMenuItem>
      </DropdownButton>,
    );

    await waitFor(() => {
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Approve" })).toHaveFocus();
    });
  });

  it("uses controlled primary label, icon, and handler without promoting menu actions", async () => {
    const user = userEvent.setup();
    const firstAction = vi.fn();
    const nextAction = vi.fn();
    const menuAction = vi.fn();
    const { rerender } = render(
      <DropdownButton
        label="Save"
        menuLabel="More save options"
        mode="split"
        onPrimaryAction={firstAction}
        primaryIcon={<span key="save-icon">S</span>}
      >
        <DropdownMenuItem onAction={menuAction}>
          Save as template
        </DropdownMenuItem>
      </DropdownButton>,
    );

    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(firstAction).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: "More save options" }));
    await user.click(
      await screen.findByRole("menuitem", { name: "Save as template" }),
    );
    expect(menuAction).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();

    rerender(
      <DropdownButton
        label="Publish"
        menuLabel="More publish options"
        mode="split"
        onPrimaryAction={nextAction}
        primaryIcon={<span key="publish-icon">P</span>}
      >
        <DropdownMenuItem>Schedule publish</DropdownMenuItem>
      </DropdownButton>,
    );

    const updatedPrimary = screen.getByRole("button", { name: "Publish" });
    expect(
      screen.queryByRole("button", { name: "Save" }),
    ).not.toBeInTheDocument();
    expect(
      Array.from(
        updatedPrimary.querySelectorAll(
          '[data-slot="dropdown-button-primary-icon"]',
        ),
      ).some((icon) => icon.textContent === "P"),
    ).toBe(true);

    await user.click(updatedPrimary);
    expect(nextAction).toHaveBeenCalledTimes(1);
    expect(firstAction).toHaveBeenCalledTimes(1);
  });

  it("keeps reduced-motion busy feedback static and readable", () => {
    render(
      <DropdownButton
        label="Saving changes"
        loading
        menuLabel="More saving options"
        mode="split"
        onPrimaryAction={() => undefined}
        reducedMotion
      >
        <DropdownMenuItem>Cancel save</DropdownMenuItem>
      </DropdownButton>,
    );

    const primary = screen.getByRole("button", { name: "Saving changes" });
    const busyIndicator = primary.querySelector(
      '[data-slot="dropdown-button-busy-indicator"]',
    );

    expect(primary).toHaveTextContent("Saving changes");
    expect(primary).toHaveAttribute("aria-busy", "true");
    expect(busyIndicator).toHaveStyle({ transform: "none" });
  });

  it("keeps busy feedback static when the Motion preset is none", () => {
    render(
      <DropdownButton
        label="Saving without motion"
        loading
        menuLabel="More saving options"
        mode="split"
        motionPreset="none"
        onPrimaryAction={() => undefined}
      >
        <DropdownMenuItem>Cancel save</DropdownMenuItem>
      </DropdownButton>,
    );

    const primary = screen.getByRole("button", {
      name: "Saving without motion",
    });
    const busyIndicator = primary.querySelector(
      '[data-slot="dropdown-button-busy-indicator"]',
    );

    expect(primary).toHaveAttribute("aria-busy", "true");
    expect(busyIndicator).toHaveStyle({ transform: "none" });
  });

  it("inherits arrow-key opening, typeahead, and disabled-item skipping", async () => {
    const user = userEvent.setup();
    const disabledAction = vi.fn();

    render(
      <DropdownButton label="Create item">
        <DropdownMenuItem disabled onAction={disabledAction}>
          Disabled action
        </DropdownMenuItem>
        <DropdownMenuItem>Archive project</DropdownMenuItem>
        <DropdownMenuItem textValue="Create workspace">
          <DropdownMenuItemLabel>Create workspace</DropdownMenuItemLabel>
        </DropdownMenuItem>
      </DropdownButton>,
    );

    const trigger = screen.getByRole("button", { name: "Create item" });
    trigger.focus();
    await user.keyboard("{ArrowDown}");

    expect(await screen.findByRole("menu")).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: "Archive project" }),
    ).toHaveAttribute("data-focused");

    await user.keyboard("c");

    await waitFor(() => {
      expect(
        screen.getByRole("menuitem", { name: "Create workspace" }),
      ).toHaveAttribute("data-focused");
    });
    expect(disabledAction).not.toHaveBeenCalled();
  });

  it("keeps reduced-motion state explicit and removes surface transforms", async () => {
    const user = userEvent.setup();

    render(
      <DropdownButton
        label="Reduced motion actions"
        motionPreset="standard"
        reducedMotion
      >
        <DropdownMenuItem>Open report</DropdownMenuItem>
      </DropdownButton>,
    );

    const root = document.querySelector('[data-slot="dropdown-button"]');
    await user.click(
      screen.getByRole("button", { name: "Reduced motion actions" }),
    );

    const content = await screen
      .findByRole("menu")
      .then((menu) =>
        menu.closest<HTMLElement>('[data-slot="dropdown-button-content"]'),
      );

    expect(root).toHaveAttribute("data-motion", "standard");
    expect(root).toHaveAttribute("data-reduced-motion");
    expect(content).toHaveAttribute("data-reduced-motion");
    expect(content?.style.transform).toBe("");
  });

  it("disables the menu trigger without adding a primary action", async () => {
    const user = userEvent.setup();
    render(
      <DropdownButton disabled label="Unavailable actions">
        <DropdownMenuItem>Open report</DropdownMenuItem>
      </DropdownButton>,
    );

    const trigger = screen.getByRole("button", { name: "Unavailable actions" });
    expect(trigger).toBeDisabled();
    expect(trigger.closest('[data-slot="dropdown-button"]')).toHaveAttribute(
      "data-disabled",
    );

    await user.click(trigger);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("composes root classes", () => {
    expect(dropdownButtonClassNames()).toContain("inline-flex");
    expect(dropdownButtonClassNames({ className: "consumer-class" })).toContain(
      "consumer-class",
    );
  });

  it.each(["none", "subtle", "standard"] as const)(
    "completes the %s Motion preset exit",
    async (motionPreset) => {
      const user = userEvent.setup();

      render(
        <DropdownButton
          label={`${motionPreset} actions`}
          motionPreset={motionPreset}
        >
          <DropdownMenuItem>Close through action</DropdownMenuItem>
        </DropdownButton>,
      );

      await user.click(
        screen.getByRole("button", { name: `${motionPreset} actions` }),
      );
      expect(await screen.findByRole("menu")).toBeInTheDocument();

      await user.click(
        screen.getByRole("menuitem", { name: "Close through action" }),
      );

      await waitFor(() => {
        expect(screen.queryByRole("menu")).not.toBeInTheDocument();
      });
    },
  );
});

// @ts-expect-error Menu mode rejects split-only primary action props.
const invalidMenuModeProps: DropdownButtonProps = {
  label: "Invalid direct action",
  onPrimaryAction: () => undefined,
};

// @ts-expect-error Split mode requires a localizable menuLabel.
const invalidSplitModeProps: DropdownButtonProps = {
  label: "Missing menu label",
  mode: "split",
  onPrimaryAction: () => undefined,
};

void invalidMenuModeProps;
void invalidSplitModeProps;
