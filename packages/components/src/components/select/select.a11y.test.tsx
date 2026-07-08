import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { DethinkProvider } from "../../foundation/dethink-provider";
import { Select, SelectItem } from ".";

expect.extend(toHaveNoViolations);

describe("Select accessibility", () => {
  it("has no axe violations for labeled field states", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <form aria-label="Workspace settings">
          <Select
            defaultValue="production"
            description="Used for deploy previews and environment filters."
            errorMessage="Choose an available workspace."
            invalid
            label="Workspace"
            name="workspace"
            required
          >
            <SelectItem value="production">Production</SelectItem>
            <SelectItem value="staging">Staging</SelectItem>
          </Select>
        </form>
      </DethinkProvider>,
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it("has no axe violations when the listbox is open", async () => {
    const user = userEvent.setup();
    render(
      <DethinkProvider theme="light">
        <Select label="Model" defaultValue="fast">
          <SelectItem value="fast">Fast</SelectItem>
          <SelectItem value="balanced">Balanced</SelectItem>
        </Select>
      </DethinkProvider>,
    );

    await user.click(screen.getByRole("button", { name: /Model/ }));

    await expect(axe(document.body)).resolves.toHaveNoViolations();
  });
});
