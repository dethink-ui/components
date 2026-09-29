import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { DethinkProvider } from "../../foundation/dethink-provider";
import { createFilter, createFilterCondition } from ".";
import { QueryInput } from "./query-input";
import { queryFields } from "./filter-query.fixtures";

expect.extend(toHaveNoViolations);

function setup() {
  const user = userEvent.setup();
  const { container } = render(
    <DethinkProvider>
      <QueryInput
        fields={queryFields}
        defaultValue={createFilter({
          children: [
            createFilterCondition({
              field: "status",
              operator: "isAnyOf",
              value: ["open"],
            }),
          ],
        })}
      />
    </DethinkProvider>,
  );

  return {
    container,
    input: screen.getByRole("combobox", { name: "Filter query" }),
    user,
  };
}

describe("QueryInput accessibility", () => {
  it("has no axe violations at rest", async () => {
    const { container } = setup();

    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations with suggestions open", async () => {
    const { container, input, user } = setup();

    await user.type(input, " a");
    await user.keyboard("{ArrowDown}");

    expect(input).toHaveAttribute("aria-expanded", "true");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations while showing an error", async () => {
    const { container, input, user } = setup();

    await user.type(input, " (a{Enter}");

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Close the parenthesis",
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
