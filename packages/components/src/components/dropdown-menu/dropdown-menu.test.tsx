import { createRef, useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DethinkProvider } from "../../foundation/dethink-provider";
import {
  DropdownMenu,
  DropdownMenuArrow,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemDescription,
  DropdownMenuItemIcon,
  DropdownMenuItemLabel,
  DropdownMenuItemShortcut,
  DropdownMenuLabel,
  DropdownMenuSection,
  DropdownMenuSeparator,
  DropdownMenuSubmenu,
  DropdownMenuSubmenuContent,
  DropdownMenuTrigger,
  dropdownMenuArrowClassNames,
  dropdownMenuClassNames,
  dropdownMenuContentClassNames,
  dropdownMenuItemClassNames,
  dropdownMenuItemDescriptionClassNames,
  dropdownMenuItemIconClassNames,
  dropdownMenuItemLabelClassNames,
  dropdownMenuItemShortcutClassNames,
  dropdownMenuLabelClassNames,
  dropdownMenuMenuClassNames,
  dropdownMenuSectionClassNames,
  dropdownMenuSeparatorClassNames,
  dropdownMenuTriggerClassNames,
} from ".";

function ControlledDropdownMenuFixture() {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger>Open controlled actions</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Archive report</DropdownMenuItem>
      </DropdownMenuContent>
      <span data-testid="controlled-state">{open ? "open" : "closed"}</span>
    </DropdownMenu>
  );
}

describe("DropdownMenu", () => {
  it("renders an action menu through the provider portal and runs item actions", async () => {
    const user = userEvent.setup();
    const handleAction = vi.fn();
    const handleOpenChange = vi.fn();
    const rootRef = createRef<HTMLDivElement>();
    const triggerRef = createRef<HTMLButtonElement>();
    const contentRef = createRef<HTMLElement>();

    render(
      <DethinkProvider
        className="custom-provider"
        data-testid="dropdown-provider"
        density="compact"
        dir="rtl"
        theme="dark"
      >
        <DropdownMenu
          ref={rootRef}
          className="custom-dropdown-root"
          onOpenChange={handleOpenChange}
        >
          <DropdownMenuTrigger
            ref={triggerRef}
            className="custom-dropdown-trigger"
          >
            Row actions
          </DropdownMenuTrigger>
          <DropdownMenuContent
            ref={contentRef}
            className="custom-dropdown-content"
            menuClassName="custom-dropdown-menu"
            showArrow
          >
            <DropdownMenuItem onAction={handleAction}>
              Open report
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem destructive>Delete report</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </DethinkProvider>,
    );

    const trigger = screen.getByRole("button", { name: "Row actions" });

    expect(rootRef.current).toHaveAttribute("data-slot", "dropdown-menu");
    expect(rootRef.current).toHaveClass("custom-dropdown-root");
    expect(triggerRef.current).toBe(trigger);
    expect(trigger).toHaveAttribute("data-slot", "dropdown-menu-trigger");
    expect(trigger).toHaveClass("custom-dropdown-trigger");

    await user.click(trigger);

    const menu = await screen.findByRole("menu");
    const content = menu.closest<HTMLElement>('[data-slot="dropdown-menu-content"]');
    const portalHost = content?.closest<HTMLElement>(
      '[data-slot="dropdown-menu-portal-container"]',
    );
    const provider = screen.getByTestId("dropdown-provider");

    if (!content || !portalHost) {
      throw new Error("DropdownMenu should render inside a provider-aware portal host.");
    }

    expect(handleOpenChange).toHaveBeenCalledWith(true);
    expect(contentRef.current).toBe(content);
    expect(content).toHaveClass("custom-dropdown-content");
    expect(content).toHaveAttribute("data-placement");
    expect(menu).toHaveAttribute("data-slot", "dropdown-menu-menu");
    expect(menu).toHaveClass("custom-dropdown-menu");
    expect(document.body).toContainElement(portalHost);
    expect(provider).not.toContainElement(content);
    expect(portalHost).toHaveAttribute("data-dethink-provider", "");
    expect(portalHost).toHaveAttribute("data-theme", "dark");
    expect(portalHost).toHaveAttribute("data-density", "compact");
    expect(portalHost).toHaveAttribute("dir", "rtl");
    expect(portalHost).toHaveClass("custom-provider");
    expect(
      document.body.querySelector('[data-slot="dropdown-menu-arrow"]'),
    ).toBeInTheDocument();
    expect(
      document.body.querySelector('[data-slot="dropdown-menu-arrow-shape"]'),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("menuitem", { name: "Open report" }));

    expect(handleAction).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });
    await waitFor(() => {
      expect(trigger).toHaveFocus();
    });
  });

  it("supports controlled open state", async () => {
    const user = userEvent.setup();

    render(<ControlledDropdownMenuFixture />);

    const trigger = screen.getByRole("button", {
      name: "Open controlled actions",
    });

    expect(screen.getByTestId("controlled-state")).toHaveTextContent("closed");

    await user.click(trigger);

    expect(screen.getByTestId("controlled-state")).toHaveTextContent("open");
    expect(screen.getByRole("menu")).toBeInTheDocument();

    await user.keyboard("{Escape}");

    await waitFor(() => {
      expect(screen.getByTestId("controlled-state")).toHaveTextContent("closed");
    });
  });

  it("supports disabled keys, disabled item props, destructive styling, and shortcuts", async () => {
    const user = userEvent.setup();
    const disabledKeyAction = vi.fn();
    const disabledPropAction = vi.fn();
    const deleteAction = vi.fn();

    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Open moderation actions</DropdownMenuTrigger>
        <DropdownMenuContent disabledKeys={["disabled-key"]}>
          <DropdownMenuSection>
            <DropdownMenuLabel>Moderation</DropdownMenuLabel>
            <DropdownMenuItem id="disabled-key" onAction={disabledKeyAction}>
              Disabled by key
            </DropdownMenuItem>
            <DropdownMenuItem disabled onAction={disabledPropAction}>
              Disabled by prop
            </DropdownMenuItem>
            <DropdownMenuItem destructive onAction={deleteAction}>
              <DropdownMenuItemIcon>D</DropdownMenuItemIcon>
              <DropdownMenuItemLabel>Delete report</DropdownMenuItemLabel>
              <DropdownMenuItemShortcut>⌘⌫</DropdownMenuItemShortcut>
            </DropdownMenuItem>
          </DropdownMenuSection>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    const disabledByKey = screen.getByRole("menuitem", {
      name: "Disabled by key",
    });
    const disabledByProp = screen.getByRole("menuitem", {
      name: "Disabled by prop",
    });
    const deleteItem = screen.getByRole("menuitem", { name: "Delete report" });

    expect(disabledByKey).toHaveAttribute("data-disabled");
    expect(disabledByProp).toHaveAttribute("data-disabled");
    expect(deleteItem).toHaveAttribute("data-destructive", "true");
    expect(screen.getByText("Moderation")).toHaveAttribute(
      "data-slot",
      "dropdown-menu-label",
    );
    expect(screen.getByText("⌘⌫")).toHaveAttribute(
      "data-slot",
      "dropdown-menu-item-shortcut",
    );

    await user.click(disabledByKey);
    await user.click(disabledByProp);
    expect(disabledKeyAction).not.toHaveBeenCalled();
    expect(disabledPropAction).not.toHaveBeenCalled();

    await user.click(deleteItem);
    expect(deleteAction).toHaveBeenCalledTimes(1);
  });

  it("opens from keyboard and exposes submenu state hooks", async () => {
    const user = userEvent.setup();

    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open keyboard actions</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSection>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuSubmenu>
              <DropdownMenuItem textValue="Move to">Move to</DropdownMenuItem>
              <DropdownMenuSubmenuContent>
                <DropdownMenuItem>Inbox</DropdownMenuItem>
                <DropdownMenuItem>Archive</DropdownMenuItem>
              </DropdownMenuSubmenuContent>
            </DropdownMenuSubmenu>
          </DropdownMenuSection>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    const trigger = screen.getByRole("button", {
      name: "Open keyboard actions",
    });

    trigger.focus();
    await user.keyboard("{Enter}");

    expect(await screen.findByRole("menu")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Duplicate" }))
      .toHaveAttribute("data-focused");
    expect(screen.getByText("Move to")).toHaveAttribute(
      "data-slot",
      "dropdown-menu-item-label",
    );
    expect(screen.queryByText("Inbox")).not.toBeInTheDocument();

    const submenuItem = screen.getByRole("menuitem", { name: "Move to" });
    expect(submenuItem).toHaveAttribute("data-has-submenu");

    await user.keyboard("{ArrowDown}{ArrowRight}");

    expect(await screen.findByText("Inbox")).toBeVisible();
    expect(submenuItem).toHaveAttribute("data-open");
  });

  it("composes class helpers", () => {
    expect(dropdownMenuClassNames({ className: "custom-root" })).toContain(
      "custom-root",
    );
    expect(dropdownMenuTriggerClassNames({ className: "custom-trigger" }))
      .toContain("custom-trigger");
    expect(dropdownMenuContentClassNames({ className: "custom-content" }))
      .toContain("custom-content");
    expect(dropdownMenuContentClassNames()).toContain("bg-background");
    expect(dropdownMenuContentClassNames()).toContain(
      "motion-safe:data-[entering]:animate-overlay-in",
    );
    expect(dropdownMenuMenuClassNames({ className: "custom-menu" })).toContain(
      "custom-menu",
    );
    expect(dropdownMenuItemClassNames({ className: "custom-item" })).toContain(
      "custom-item",
    );
    expect(dropdownMenuItemClassNames()).toContain("data-[focused]:bg-muted");
    expect(dropdownMenuItemIconClassNames()).toContain("text-muted-foreground");
    expect(dropdownMenuItemLabelClassNames()).toContain("truncate");
    expect(dropdownMenuItemDescriptionClassNames()).toContain(
      "text-muted-foreground",
    );
    expect(dropdownMenuItemShortcutClassNames()).toContain("font-mono");
    expect(dropdownMenuLabelClassNames()).toContain("uppercase");
    expect(dropdownMenuSeparatorClassNames()).toContain("bg-border");
    expect(dropdownMenuSectionClassNames()).toContain("grid");
    expect(dropdownMenuArrowClassNames({ className: "custom-arrow" }))
      .toContain("custom-arrow");
  });

  it("renders stable item anatomy slots", () => {
    const iconRef = createRef<HTMLSpanElement>();
    const labelRef = createRef<HTMLElement>();
    const descriptionRef = createRef<HTMLElement>();
    const shortcutRef = createRef<HTMLElement>();
    const arrowRef = createRef<HTMLDivElement>();
    const { container } = render(
      <>
        <DropdownMenuItemIcon ref={iconRef}>I</DropdownMenuItemIcon>
        <DropdownMenuItemLabel ref={labelRef}>Label</DropdownMenuItemLabel>
        <DropdownMenuItemDescription ref={descriptionRef}>
          Description
        </DropdownMenuItemDescription>
        <DropdownMenuItemShortcut ref={shortcutRef}>⌘K</DropdownMenuItemShortcut>
        <DropdownMenuArrow ref={arrowRef} className="custom-arrow" />
      </>,
    );

    expect(iconRef.current).toHaveAttribute(
      "data-slot",
      "dropdown-menu-item-icon",
    );
    expect(labelRef.current).toHaveAttribute(
      "data-slot",
      "dropdown-menu-item-label",
    );
    expect(descriptionRef.current).toHaveAttribute(
      "data-slot",
      "dropdown-menu-item-description",
    );
    expect(shortcutRef.current).toHaveAttribute(
      "data-slot",
      "dropdown-menu-item-shortcut",
    );
    expect(arrowRef.current).toHaveAttribute("data-slot", "dropdown-menu-arrow");
    expect(container.querySelector('[data-slot="dropdown-menu-arrow-shape"]'))
      .toBeInTheDocument();
  });
});
