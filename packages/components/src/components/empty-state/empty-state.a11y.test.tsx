import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { EmptyState } from ".";

expect.extend(toHaveNoViolations);

describe("EmptyState accessibility", () => {
  it("has no axe violations for action states", async () => {
    const { container } = render(
      <main aria-label="Empty state smoke">
        <EmptyState
          title="No results"
          description="Adjust filters or create a new record."
          primaryAction={<button type="button">Create record</button>}
          secondaryAction={<a href="/docs">Read docs</a>}
        />
      </main>,
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });
});
