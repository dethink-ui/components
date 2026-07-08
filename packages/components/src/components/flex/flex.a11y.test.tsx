import { render, screen, within } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { DethinkProvider } from "../../foundation/dethink-provider";
import { Heading, Text } from "../typography";
import { Flex, FlexItem } from ".";

expect.extend(toHaveNoViolations);

describe("Flex accessibility", () => {
  it("has no axe violations for semantic flex patterns", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <Flex
          as="main"
          aria-label="Flex accessibility smoke"
          direction="column"
          gap="6"
        >
          <Flex
            as="section"
            aria-labelledby="flex-heading"
            direction="column"
            gap="3"
          >
            <Heading id="flex-heading" level={1} visualLevel={3}>
              Integration filters
            </Heading>
            <Text tone="muted">
              Flex preserves the semantic element chosen by the consumer.
            </Text>
          </Flex>
          <Flex as="ul" direction="column" gap="2">
            <FlexItem as="li">List semantics remain native.</FlexItem>
            <FlexItem as="li">No ARIA role is added by default.</FlexItem>
          </Flex>
          <Flex
            as="form"
            aria-label="Example flex filter form"
            gap="3"
            wrap="wrap"
          >
            <FlexItem minInlineSize="0">
              <label htmlFor="flex-filter">Filter</label>
            </FlexItem>
            <FlexItem grow="1" minInlineSize="0">
              <input id="flex-filter" name="filter" />
            </FlexItem>
          </Flex>
        </Flex>
      </DethinkProvider>,
    );

    const main = screen.getByRole("main", { name: "Flex accessibility smoke" });
    const section = screen.getByRole("region", { name: "Integration filters" });
    const list = screen.getByRole("list");
    const listItems = within(list).getAllByRole("listitem");
    const form = screen.getByRole("form", { name: "Example flex filter form" });

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
