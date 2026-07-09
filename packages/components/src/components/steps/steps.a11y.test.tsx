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

  it("has no axe violations for interactive and disabled steps", async () => {
    const { container } = render(
      <DethinkProvider theme="dark">
        <Steps
          interactive
          aria-label="Application progress"
          value="details"
          items={[
            { id: "account", label: "Account" },
            { id: "details", label: "Details" },
            { id: "approval", label: "Approval", disabled: true },
          ]}
        />
      </DethinkProvider>,
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it("has no axe violations for vertical progress and custom content", async () => {
    const { container } = render(
      <DethinkProvider theme="light" density="compact" dir="rtl">
        <Steps
          showProgress
          interactive
          aria-label="Deployment workflow"
          orientation="vertical"
          value="verify"
          items={[
            { id: "build", label: "Build" },
            { id: "verify", label: "Verify", status: "error" },
            { id: "release", label: "Release", optional: true },
          ]}
          renderItem={(item, state) => (
            <span>
              {item.label} · {state.status}
            </span>
          )}
        />
      </DethinkProvider>,
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });
});
