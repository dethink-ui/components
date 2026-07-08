import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { DethinkProvider } from "../../foundation/dethink-provider";
import {
  Field,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from ".";

expect.extend(toHaveNoViolations);

describe("Field accessibility", () => {
  it("has no axe violations for visible labels, descriptions, and errors", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <main aria-label="Field accessibility smoke">
          <Field id="a11y-email" invalid required>
            <FieldLabel>Email</FieldLabel>
            <FieldControl asChild>
              <input type="email" name="email" />
            </FieldControl>
            <FieldDescription id="a11y-email-help">
              Use your work email address.
            </FieldDescription>
            <FieldError id="a11y-email-error">
              Enter a valid work email address.
            </FieldError>
          </Field>
        </main>
      </DethinkProvider>,
    );

    const input = screen.getByLabelText(/Email/);

    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-errormessage", "a11y-email-error");

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it("has no axe violations for grouped controls", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <main aria-label="Grouped field accessibility smoke">
          <FieldSet aria-describedby="notifications-help">
            <FieldLegend>Notifications</FieldLegend>
            <FieldDescription id="notifications-help">
              Choose the channels to enable.
            </FieldDescription>
            <FieldGroup>
              <Field id="notify-email">
                <FieldLabel>Email</FieldLabel>
                <FieldControl asChild>
                  <input type="checkbox" name="notifications" value="email" />
                </FieldControl>
              </Field>
              <Field id="notify-slack">
                <FieldLabel>Slack</FieldLabel>
                <FieldControl asChild>
                  <input type="checkbox" name="notifications" value="slack" />
                </FieldControl>
              </Field>
            </FieldGroup>
          </FieldSet>
        </main>
      </DethinkProvider>,
    );

    expect(
      screen.getByRole("group", { name: "Notifications" }),
    ).toHaveAttribute("data-slot", "field-set");
    expect(
      screen.getByRole("group", { name: "Notifications" }),
    ).toHaveAttribute("aria-describedby", "notifications-help");
    expect(screen.getByLabelText("Email")).toHaveAttribute("type", "checkbox");
    expect(screen.getByLabelText("Slack")).toHaveAttribute("type", "checkbox");

    await expect(axe(container)).resolves.toHaveNoViolations();
  });
});
