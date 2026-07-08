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
import { NumberInput } from ".";

expect.extend(toHaveNoViolations);

describe("NumberInput accessibility", () => {
  it("has no axe violations with visible labels and descriptions", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <main aria-label="NumberInput accessibility smoke">
          <Field id="seat-count" required>
            <FieldLabel>Seat count</FieldLabel>
            <FieldControl asChild>
              <NumberInput
                name="seats"
                numberMode="numeric"
                defaultValue="12"
              />
            </FieldControl>
            <FieldDescription>
              Enter the number of seats to provision.
            </FieldDescription>
          </Field>
        </main>
      </DethinkProvider>,
    );

    const input = screen.getByLabelText(/Seat count/);

    expect(input).toHaveAttribute("type", "text");
    expect(input).toHaveAttribute("inputmode", "numeric");
    expect(input).not.toHaveAttribute("role", "spinbutton");

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it("has no axe violations for invalid field wiring", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <main aria-label="Invalid NumberInput accessibility smoke">
          <Field id="monthly-budget" invalid>
            <FieldLabel>Monthly budget</FieldLabel>
            <FieldControl asChild>
              <NumberInput defaultValue="0" />
            </FieldControl>
            <FieldError>Budget must be greater than zero.</FieldError>
          </Field>
        </main>
      </DethinkProvider>,
    );

    const input = screen.getByLabelText("Monthly budget");

    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-errormessage", "monthly-budget-error");

    await expect(axe(container)).resolves.toHaveNoViolations();
  });
});
