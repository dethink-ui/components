import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { DethinkProvider } from "../../foundation/dethink-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemDescription,
  DropdownMenuItemIcon,
  DropdownMenuItemLabel,
  DropdownMenuItemShortcut,
  DropdownMenuLabel,
  DropdownMenuSection,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from ".";

expect.extend(toHaveNoViolations);

describe("DropdownMenu accessibility", () => {
  it("has no axe violations for a labelled action menu", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <DethinkProvider theme="light">
        <DropdownMenu>
          <DropdownMenuTrigger>Report actions</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuSection>
              <DropdownMenuLabel>Report</DropdownMenuLabel>
              <DropdownMenuItem>
                <DropdownMenuItemIcon aria-hidden="true">R</DropdownMenuItemIcon>
                <DropdownMenuItemLabel>Refresh report</DropdownMenuItemLabel>
                <DropdownMenuItemDescription>
                  Pull the latest dashboard data.
                </DropdownMenuItemDescription>
                <DropdownMenuItemShortcut>⌘R</DropdownMenuItemShortcut>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem destructive>Delete report</DropdownMenuItem>
            </DropdownMenuSection>
          </DropdownMenuContent>
        </DropdownMenu>
      </DethinkProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Report actions" }));

    expect(await screen.findByRole("menu")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Refresh report" }))
      .toBeInTheDocument();
    expect(screen.getByText("⌘R")).toHaveAttribute(
      "data-slot",
      "dropdown-menu-item-shortcut",
    );
    await expect(
      axe(container.ownerDocument.body, {
        rules: {
          region: {
            enabled: false,
          },
        },
      }),
    ).resolves.toHaveNoViolations();
  });
});
