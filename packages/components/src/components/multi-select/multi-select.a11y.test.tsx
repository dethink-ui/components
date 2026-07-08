import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { DethinkProvider } from "../../foundation/dethink-provider";
import { MultiSelect, MultiSelectItem } from ".";

expect.extend(toHaveNoViolations);

describe("MultiSelect accessibility", () => {
  it("has no axe violations for labeled field states and removable chips", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <form aria-label="Workspace settings">
          <MultiSelect
            defaultValue={["production"]}
            description="Used for deploy previews and environment filters."
            errorMessage="Choose at least one available workspace."
            invalid
            label="Workspaces"
            name="workspaces"
            required
          >
            <MultiSelectItem value="production">Production</MultiSelectItem>
            <MultiSelectItem value="staging">Staging</MultiSelectItem>
          </MultiSelect>
        </form>
      </DethinkProvider>,
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it("has no axe violations when the listbox is open", async () => {
    const user = userEvent.setup();
    render(
      <DethinkProvider theme="light">
        <MultiSelect label="Models" defaultValue={["fast"]}>
          <MultiSelectItem value="fast">Fast</MultiSelectItem>
          <MultiSelectItem value="balanced">Balanced</MultiSelectItem>
        </MultiSelect>
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
