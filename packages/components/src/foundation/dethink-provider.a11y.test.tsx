import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { DethinkProvider } from "./dethink-provider";

expect.extend(toHaveNoViolations);

describe("DethinkProvider accessibility", () => {
  it("has no axe violations for the foundation wrapper", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <main>
          <h1>Foundation</h1>
          <p>Base theme and density context.</p>
        </main>
      </DethinkProvider>,
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });
});
