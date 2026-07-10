import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { DethinkProvider } from "../../foundation/dethink-provider";
import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSection,
  DropdownMenuSeparator,
} from "../dropdown-menu";
import { DropdownButton } from ".";

expect.extend(toHaveNoViolations);

describe("DropdownButton accessibility", () => {
  it("has no axe violations for a labelled menu button and action menu", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <DethinkProvider theme="light">
        <main>
          <DropdownButton label="Invoice actions">
            <DropdownMenuSection>
              <DropdownMenuLabel>Invoice</DropdownMenuLabel>
              <DropdownMenuItem disabled>Send reminder</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem destructive>Void invoice</DropdownMenuItem>
            </DropdownMenuSection>
          </DropdownButton>
        </main>
      </DethinkProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Invoice actions" }));

    expect(await screen.findByRole("menu")).toBeInTheDocument();
    await expect(
      axe(container.ownerDocument.body),
    ).resolves.toHaveNoViolations();
  });
});
