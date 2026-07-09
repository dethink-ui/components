import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { DethinkProvider } from "../../foundation/dethink-provider";
import { Steps } from ".";

expect.extend(toHaveNoViolations);

describe("Steps accessibility", () => {
  it("has no axe violations for a labelled process indicator", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <Steps
          aria-label="Workspace setup"
          value="permissions"
          items={[
            { id: "account", label: "Account" },
            { id: "permissions", label: "Permissions" },
            { id: "review", label: "Review", optional: true },
          ]}
        />
      </DethinkProvider>,
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });
});
