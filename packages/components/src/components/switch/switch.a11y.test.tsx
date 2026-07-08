import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { DethinkProvider } from "../../foundation/dethink-provider";
import {
  Field,
  FieldContent,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "../form-field";
import { Switch } from ".";

expect.extend(toHaveNoViolations);

describe("Switch accessibility", () => {
  it("has no axe violations with visible stable labels and descriptions", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <main aria-label="Switch accessibility smoke">
          <Field id="two-factor" orientation="horizontal">
            <FieldContent>
              <FieldLabel>Multi-factor authentication</FieldLabel>
              <FieldDescription>
                Require a second verification step for sign in.
              </FieldDescription>
            </FieldContent>
            <FieldControl asChild>
              <Switch name="twoFactor" value="enabled" />
            </FieldControl>
          </Field>
        </main>
      </DethinkProvider>,
    );

    const switchInput = screen.getByRole("switch", {
      name: "Multi-factor authentication",
    });

    expect(switchInput).toHaveAttribute(
      "aria-describedby",
      "two-factor-description",
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it("has no axe violations for invalid grouped switch wiring", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <main aria-label="Grouped switch accessibility smoke">
          <FieldSet aria-describedby="security-error">
            <FieldLegend>Security settings</FieldLegend>
            <FieldGroup>
              <Field id="admin-mfa" orientation="horizontal" invalid>
                <FieldContent>
                  <FieldLabel>Require admin MFA</FieldLabel>
                </FieldContent>
                <FieldControl asChild>
                  <Switch name="adminMfa" value="enabled" aria-invalid="true" />
                </FieldControl>
              </Field>
              <Field id="session-alerts" orientation="horizontal" invalid>
                <FieldContent>
                  <FieldLabel>Session alerts</FieldLabel>
                </FieldContent>
                <FieldControl asChild>
                  <Switch
                    name="sessionAlerts"
                    value="enabled"
                    aria-invalid="true"
                  />
                </FieldControl>
              </Field>
            </FieldGroup>
            <FieldError id="security-error">
              Enable at least one security setting.
            </FieldError>
          </FieldSet>
        </main>
      </DethinkProvider>,
    );

    expect(
      screen.getByRole("switch", { name: "Require admin MFA" }),
    ).toHaveAttribute("aria-invalid", "true");
    expect(
      screen.getByRole("switch", { name: "Session alerts" }),
    ).toHaveAttribute("aria-invalid", "true");

    await expect(axe(container)).resolves.toHaveNoViolations();
  });
});
