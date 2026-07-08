import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { DethinkProvider } from "../../foundation/dethink-provider";
import {
  Field,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "../form-field";
import { Input } from ".";

expect.extend(toHaveNoViolations);

describe("Input accessibility", () => {
  it("has no axe violations with visible labels and descriptions", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <main aria-label="Input accessibility smoke">
          <Field id="workspace-name" required>
            <FieldLabel>Workspace name</FieldLabel>
            <FieldControl asChild>
              <Input name="workspace" placeholder="Acme Operations" />
            </FieldControl>
            <FieldDescription>
              This name appears in shared reports.
            </FieldDescription>
          </Field>
        </main>
      </DethinkProvider>,
    );

    const input = screen.getByLabelText(/Workspace name/);

    expect(input).toHaveAttribute(
      "aria-describedby",
      "workspace-name-description",
    );
    expect(input).toBeRequired();

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it("has no axe violations for invalid field wiring", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <main aria-label="Invalid input accessibility smoke">
          <Field id="billing-email" invalid>
            <FieldLabel>Billing email</FieldLabel>
            <FieldControl asChild>
              <Input type="email" defaultValue="billing" />
            </FieldControl>
            <FieldError>Enter a valid billing email.</FieldError>
          </Field>
        </main>
      </DethinkProvider>,
    );

    const input = screen.getByLabelText("Billing email");

    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-errormessage", "billing-email-error");

    await expect(axe(container)).resolves.toHaveNoViolations();
  });
});
