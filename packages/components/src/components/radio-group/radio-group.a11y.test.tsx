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
} from "../form-field";
import { RadioGroup, RadioGroupItem } from ".";

expect.extend(toHaveNoViolations);

describe("RadioGroup accessibility", () => {
  it("has no axe violations with visible group and item labels", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <main aria-label="RadioGroup accessibility smoke">
          <FieldSet aria-describedby="plan-help">
            <FieldLegend>Plan</FieldLegend>
            <FieldDescription id="plan-help">
              Choose one billing plan.
            </FieldDescription>
            <RadioGroup name="plan" defaultValue="team">
              <FieldGroup>
                <Field id="plan-starter" orientation="horizontal">
                  <FieldControl asChild>
                    <RadioGroupItem value="starter" />
                  </FieldControl>
                  <FieldLabel>Starter</FieldLabel>
                </Field>
                <Field id="plan-team" orientation="horizontal">
                  <FieldControl asChild>
                    <RadioGroupItem value="team" />
                  </FieldControl>
                  <FieldLabel>Team</FieldLabel>
                </Field>
              </FieldGroup>
            </RadioGroup>
          </FieldSet>
        </main>
      </DethinkProvider>,
    );

    expect(screen.getByLabelText("Team")).toBeChecked();

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it("has no axe violations for invalid radio group wiring", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <main aria-label="Invalid RadioGroup accessibility smoke">
          <FieldSet aria-describedby="mode-help mode-error">
            <FieldLegend>Response mode</FieldLegend>
            <FieldDescription id="mode-help">
              Choose how responses are generated.
            </FieldDescription>
            <RadioGroup name="mode" invalid required>
              <FieldGroup>
                <Field id="mode-fast" orientation="horizontal" invalid>
                  <FieldControl asChild>
                    <RadioGroupItem value="fast" />
                  </FieldControl>
                  <FieldLabel>Fast</FieldLabel>
                </Field>
                <Field id="mode-careful" orientation="horizontal" invalid>
                  <FieldControl asChild>
                    <RadioGroupItem value="careful" />
                  </FieldControl>
                  <FieldLabel>Careful</FieldLabel>
                </Field>
              </FieldGroup>
            </RadioGroup>
            <FieldError id="mode-error">Select a response mode.</FieldError>
          </FieldSet>
        </main>
      </DethinkProvider>,
    );

    expect(screen.getByLabelText("Fast")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.getByLabelText("Careful")).toBeRequired();

    await expect(axe(container)).resolves.toHaveNoViolations();
  });
});
