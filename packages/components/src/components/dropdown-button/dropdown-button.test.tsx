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

const invalidMenuModeProps: DropdownButtonProps = {
  label: "Invalid direct action",
  // @ts-expect-error Menu mode rejects split-only primary action props.
  onPrimaryAction: () => undefined,
};

void invalidMenuModeProps;
