import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { DethinkProvider } from "../../foundation/dethink-provider";
import { Button } from "../button";
import { Flex } from "../flex";
import { Heading, Text } from "../typography";
import { Divider, Separator } from ".";

expect.extend(toHaveNoViolations);

describe("Separator accessibility", () => {
  it("has no axe violations for semantic, decorative, and vertical separators", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <main aria-label="Separator accessibility smoke">
          <section aria-labelledby="separator-heading">
            <Heading id="separator-heading" level={1} visualLevel={3}>
              Workspace sections
            </Heading>
            <Text tone="muted">
              Native thematic breaks keep their separator semantics.
            </Text>
            <Separator />
            <Flex align="center" gap="3">
              <Button variant="outline">Export</Button>
              <Separator as="div" orientation="vertical" />
              <Button>New workflow</Button>
            </Flex>
            <Divider decorative />
          </section>
        </main>
      </DethinkProvider>,
    );

    const separators = screen.getAllByRole("separator");
    const decorativeDivider = container.querySelector(
      '[data-decorative="true"]',
    );

    expect(separators).toHaveLength(2);
    expect(separators[0]?.tagName).toBe("HR");
    expect(separators[0]).toHaveAttribute("aria-orientation", "horizontal");
    expect(separators[1]?.tagName).toBe("DIV");
    expect(separators[1]).toHaveAttribute("aria-orientation", "vertical");
    expect(decorativeDivider).toHaveAttribute("aria-hidden", "true");
    expect(decorativeDivider).not.toHaveAttribute("role");
    expect(decorativeDivider).not.toHaveAttribute("tabindex");

    await expect(axe(container)).resolves.toHaveNoViolations();
  });
});
