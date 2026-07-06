import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { Spinner } from ".";

expect.extend(toHaveNoViolations);

describe("Spinner accessibility", () => {
  it("has no axe violations for decorative and labelled states", async () => {
    const { container } = render(
      <main aria-label="Spinner smoke">
        <Spinner />
        <Spinner label="Loading billing records" />
      </main>,
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });
});
