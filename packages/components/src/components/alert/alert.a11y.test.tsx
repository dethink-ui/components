import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { Alert, Callout } from ".";

expect.extend(toHaveNoViolations);

describe("Alert accessibility", () => {
  it("has no axe violations for alert and callout states", async () => {
    const { container } = render(
      <main aria-label="Alert smoke">
        <Alert
          title="Saved"
          description="The dashboard settings were updated."
          tone="success"
        />
        <Alert
          urgency="assertive"
          title="Payment failed"
          description="Update the payment method before retrying."
          tone="destructive"
          onDismiss={() => undefined}
        />
        <Callout
          title="Import note"
          description="Large CSV imports continue in the background."
        />
      </main>,
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });
});
