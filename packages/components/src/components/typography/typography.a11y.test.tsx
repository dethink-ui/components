import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { DethinkProvider } from "../../foundation/dethink-provider";
import { Heading, Text, Typography } from ".";

expect.extend(toHaveNoViolations);

describe("Typography accessibility", () => {
  it("has no axe violations for semantic heading and text patterns", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <main aria-label="Typography accessibility smoke">
          <Heading level={1} visualLevel={2}>
            Account overview
          </Heading>
          <Text tone="muted">
            Review account activity, sync status, and pending actions.
          </Text>
          <section aria-labelledby="status-heading">
            <Heading id="status-heading" level={2} visualLevel={4}>
              Sync status
            </Heading>
            <Text as="span" tone="success" weight="medium">
              Complete
            </Text>
            <Text lineClamp={2} tone="subtle">
              Last sync finished after importing customer records, dashboard
              metrics, and billing events.
            </Text>
          </section>
          <Typography as="figcaption" variant="caption" tone="muted">
            Status tones are paired with text, not color alone.
          </Typography>
        </main>
      </DethinkProvider>,
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });
});
