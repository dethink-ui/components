import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "../dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../dropdown-menu";
import { SidebarMobile, SidebarMobileTrigger, SidebarProvider } from ".";

/** A drawer hosting overlays of its own, next to a page-level menu. */
function Fixture({ onPick = () => {} }: { onPick?: () => void }) {
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>Page menu</DropdownMenuTrigger>
        <DropdownMenuContent aria-label="Page menu">
          <DropdownMenuItem textValue="Page item">Page item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <SidebarProvider animate={false}>
        <SidebarMobileTrigger />
        <SidebarMobile label="Mobile navigation">
          <DropdownMenu>
            <DropdownMenuTrigger>Switch workspace</DropdownMenuTrigger>
            <DropdownMenuContent aria-label="Workspaces">
              <DropdownMenuItem textValue="Acme" onAction={onPick}>
                Acme
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog>
            <DialogTrigger>New bot</DialogTrigger>
            <DialogContent dismissible>
              <DialogTitle>Create a bot</DialogTitle>
              <input aria-label="Bot name" />
              <input aria-label="Description" />
            </DialogContent>
          </Dialog>
        </SidebarMobile>
      </SidebarProvider>
    </>
  );
}

const openDrawer = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole("button", { name: "Open sidebar" }));
  return screen.getByRole("dialog", { name: "Mobile navigation" });
};

describe("SidebarMobile with nested overlays", () => {
  it("keeps a menu opened inside the drawer usable, while the page stays inert", async () => {
    const user = userEvent.setup();
    const onPick = vi.fn();
    render(<Fixture onPick={onPick} />);
    await openDrawer(user);

    await user.click(screen.getByRole("button", { name: "Switch workspace" }));
    const item = await screen.findByRole("menuitem", { name: "Acme" });
    expect(item.closest("[inert]")).toBeNull();

    // The page-level menu's trigger is outside the drawer, so it stays inert.
    expect(
      screen
        .getByRole("button", { name: "Page menu", hidden: true })
        .closest("[inert]"),
    ).not.toBeNull();

    await user.click(item);
    expect(onPick).toHaveBeenCalledTimes(1);
  });

  it("leaves Tab and Escape inside a dialog opened from the drawer to the dialog", async () => {
    const user = userEvent.setup();
    render(<Fixture />);
    await openDrawer(user);

    await user.click(screen.getByRole("button", { name: "New bot" }));
    const dialog = await screen.findByRole("dialog", { name: "Create a bot" });
    expect(dialog.closest("[inert]")).toBeNull();

    const name = screen.getByRole("textbox", { name: "Bot name" });
    name.focus();
    await user.tab();
    expect(screen.getByRole("textbox", { name: "Description" })).toHaveFocus();

    await user.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByRole("dialog", { name: "Create a bot" })).toBeNull(),
    );
    // Only the dialog closed: the drawer is still open.
    expect(
      screen.getByRole("dialog", { name: "Mobile navigation" }),
    ).toBeInTheDocument();
  });

  it("restores the page when the drawer closes", async () => {
    const user = userEvent.setup();
    render(<Fixture />);
    await openDrawer(user);
    await user.keyboard("{Escape}");
    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: "Mobile navigation" }),
      ).toBeNull(),
    );
    expect(document.querySelector("[inert]")).toBeNull();
  });
});
