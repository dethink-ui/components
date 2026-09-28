import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { DethinkProvider } from "../../foundation/dethink-provider";
import {
  FilterBar,
  createFilter,
  createFilterCondition,
  defineFilterFields,
} from ".";

expect.extend(toHaveNoViolations);

const fields = defineFilterFields([
  { key: "title", label: "Title", type: "text" },
  {
    key: "status",
    label: "Status",
    type: "option",
    options: [
      { value: "open", label: "Open" },
      { value: "blocked", label: "Blocked" },
    ],
  },
]);

const filter = createFilter({
  combinator: "or",
  children: [
    createFilterCondition({
      field: "status",
      operator: "isAnyOf",
      value: ["open", "blocked"],
    }),
    createFilterCondition({ field: "title", operator: "contains" }),
    createFilter({
      children: [
        createFilterCondition({
          field: "title",
          operator: "isEmpty",
        }),
        createFilterCondition({
          field: "status",
          operator: "isAnyOf",
          value: ["open"],
        }),
      ],
    }),
  ],
});

function renderBar() {
  return render(
    <DethinkProvider theme="light">
      <main aria-label="FilterBar accessibility smoke">
        <FilterBar fields={fields} defaultValue={filter} resultCount={4} />
      </main>
    </DethinkProvider>,
  );
}

describe("FilterBar accessibility", () => {
  it("has no axe violations for chips, group chips and actions", async () => {
    const { container } = renderBar();

    expect(
      screen.getByRole("toolbar", { name: "Filters" }),
    ).toBeInTheDocument();
    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it("has no axe violations with the add menu and a value editor open", async () => {
    const user = userEvent.setup();
    const { baseElement } = renderBar();

    await user.click(screen.getByRole("button", { name: "Filter" }));
    await screen.findByRole("dialog", { name: "Add a filter" });
    await expect(axe(baseElement)).resolves.toHaveNoViolations();

    await user.keyboard("{Escape}");
    await user.click(
      screen.getByRole("button", { name: "Change value, Open, Blocked" }),
    );
    await screen.findByRole("listbox", { name: "Status" });
    await expect(axe(baseElement)).resolves.toHaveNoViolations();
  });
});
