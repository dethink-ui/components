import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { Progress, ProgressCircle } from ".";

expect.extend(toHaveNoViolations);

describe("Progress accessibility", () => {
  it("has no axe violations for linear and circular progress", async () => {
    const { container } = render(
      <main aria-label="Progress smoke">
        <Progress label="Import" value={45} showValue />
        <Progress aria-label="Syncing" indeterminate />
        <ProgressCircle label="Upload" value={75} showValue />
      </main>,
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });
});
