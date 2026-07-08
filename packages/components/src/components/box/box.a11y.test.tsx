import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { DethinkProvider } from "../../foundation/dethink-provider";
import { Heading, Text } from "../typography";
import { Box } from ".";

expect.extend(toHaveNoViolations);

describe("Box accessibility", () => {
  it("has no axe violations for semantic wrapper patterns", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <Box as="main" aria-label="Box accessibility smoke" p="4">
          <Box
            as="section"
            aria-labelledby="box-heading"
            border="default"
            p="4"
            radius="md"
          >
            <Heading id="box-heading" level={1} visualLevel={3}>
              Account summary
            </Heading>
            <Text tone="muted">
              Box preserves the semantic element chosen by the consumer.
            </Text>
          </Box>
          <Box as="ul" m="none" p="none">
            <Box as="li">List semantics remain native.</Box>
            <Box as="li">No ARIA role is added by default.</Box>
          </Box>
        </Box>
      </DethinkProvider>,
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });
});
