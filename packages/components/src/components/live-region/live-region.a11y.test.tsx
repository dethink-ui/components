import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { LiveRegion, LiveRegionProvider } from ".";

expect.extend(toHaveNoViolations);

describe("LiveRegion accessibility", () => {
  it("has no axe violations for provider regions", async () => {
    const { container } = render(
      <main aria-label="Live region smoke">
        <LiveRegionProvider>
          <LiveRegion visuallyHidden={false}>Status ready</LiveRegion>
        </LiveRegionProvider>
      </main>,
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });
});
