import { render, screen, within } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { DethinkProvider } from "../../foundation/dethink-provider";
import { Heading, Text } from "../typography";
import { Grid, GridItem } from ".";

expect.extend(toHaveNoViolations);

describe("Grid accessibility", () => {
  it("has no axe violations for semantic grid patterns", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <Grid
          as="main"
          aria-label="Grid accessibility smoke"
          columns="1"
          gap="6"
        >
          <Grid as="section" aria-labelledby="grid-heading" gap="3">
            <Heading id="grid-heading" level={1} visualLevel={3}>
              Workspace overview
            </Heading>
            <Text tone="muted">
              Grid preserves the semantic element chosen by the consumer.
            </Text>
          </Grid>
          <Grid as="ul" columns="auto-fit-xs" gap="3">
            <GridItem as="li">List semantics remain native.</GridItem>
            <GridItem as="li">No ARIA role is added by default.</GridItem>
          </Grid>
          <Grid
            as="form"
            aria-label="Example grid settings form"
            columns="2"
            gap="3"
          >
            <GridItem>
              <label htmlFor="grid-filter">Filter</label>
            </GridItem>
            <GridItem minInlineSize="0">
              <input id="grid-filter" name="filter" />
            </GridItem>
          </Grid>
        </Grid>
      </DethinkProvider>,
    );

    const main = screen.getByRole("main", { name: "Grid accessibility smoke" });
    const section = screen.getByRole("region", { name: "Workspace overview" });
    const list = screen.getByRole("list");
    const listItems = within(list).getAllByRole("listitem");
    const form = screen.getByRole("form", {
      name: "Example grid settings form",
    });

    expect(main.tagName).toBe("MAIN");
    expect(section.tagName).toBe("SECTION");
    expect(list.tagName).toBe("UL");
    expect(form.tagName).toBe("FORM");
    expect(main).not.toHaveAttribute("role");
    expect(section).not.toHaveAttribute("role");
    expect(list).not.toHaveAttribute("role");
    expect(form).not.toHaveAttribute("role");
    expect(listItems.map((item) => item.tagName)).toEqual(["LI", "LI"]);
    expect(listItems.map((item) => item.textContent)).toEqual([
      "List semantics remain native.",
      "No ARIA role is added by default.",
    ]);

    await expect(axe(container)).resolves.toHaveNoViolations();
  });
});
