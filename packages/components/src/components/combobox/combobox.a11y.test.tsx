import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { DethinkProvider } from "../../foundation/dethink-provider";
import { Combobox, ComboboxItem } from ".";

expect.extend(toHaveNoViolations);

describe("Combobox accessibility", () => {
  it("has no axe violations for labeled field states", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <form aria-label="Workspace settings">
          <Combobox
            defaultValue="production"
            description="Used for deploy previews and environment filters."
            errorMessage="Choose an available workspace."
            invalid
            label="Workspace"
            name="workspace"
            required
          >
            <ComboboxItem value="production">Production</ComboboxItem>
            <ComboboxItem value="staging">Staging</ComboboxItem>
          </Combobox>
        </form>
      </DethinkProvider>,
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it("has no axe violations when the listbox is open", async () => {
    const user = userEvent.setup();
    render(
      <DethinkProvider theme="light">
        <Combobox label="Model" defaultValue="fast">
          <ComboboxItem value="fast">Fast</ComboboxItem>
          <ComboboxItem value="balanced">Balanced</ComboboxItem>
        </Combobox>
      </DethinkProvider>,
    );

    await user.click(screen.getByRole("button", { name: /Show options/ }));

    await expect(
      axe(document.body, {
        rules: {
          region: {
            enabled: false,
          },
        },
      }),
    ).resolves.toHaveNoViolations();
  });
});
