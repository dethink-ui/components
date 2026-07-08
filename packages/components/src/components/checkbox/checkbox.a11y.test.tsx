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
import { Checkbox } from ".";

expect.extend(toHaveNoViolations);

describe("Checkbox accessibility", () => {
  it("has no axe violations with visible labels and descriptions", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <main aria-label="Checkbox accessibility smoke">
          <Field id="product-updates" orientation="horizontal">
            <FieldControl asChild>
              <Checkbox name="updates" value="product" />
            </FieldControl>
            <FieldLabel>Product updates</FieldLabel>
            <FieldDescription>Send monthly release notes.</FieldDescription>
          </Field>
        </main>
      </DethinkProvider>,
    );

    const checkbox = screen.getByLabelText("Product updates");

    expect(checkbox).toHaveAttribute(
      "aria-describedby",
      "product-updates-description",
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it("has no axe violations for invalid grouped checkbox wiring", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <main aria-label="Grouped checkbox accessibility smoke">
          <FieldSet aria-describedby="channels-help channels-error">
            <FieldLegend>Notification channels</FieldLegend>
            <FieldDescription id="channels-help">
              Choose at least one alert channel.
            </FieldDescription>
            <FieldGroup>
              <Field id="channel-email" orientation="horizontal" invalid>
                <FieldControl asChild>
                  <Checkbox name="channels" value="email" aria-invalid="true" />
                </FieldControl>
                <FieldLabel>Email</FieldLabel>
              </Field>
              <Field id="channel-slack" orientation="horizontal" invalid>
                <FieldControl asChild>
                  <Checkbox name="channels" value="slack" aria-invalid="true" />
                </FieldControl>
                <FieldLabel>Slack</FieldLabel>
              </Field>
            </FieldGroup>
            <FieldError id="channels-error">
              Select at least one alert channel.
            </FieldError>
          </FieldSet>
        </main>
      </DethinkProvider>,
    );

    expect(screen.getByLabelText("Email")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.getByLabelText("Slack")).toHaveAttribute(
      "aria-invalid",
      "true",
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it("has no axe violations for mixed state", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <main aria-label="Mixed checkbox accessibility smoke">
          <Field id="select-all" orientation="horizontal">
            <FieldControl asChild>
              <Checkbox defaultChecked="indeterminate" />
            </FieldControl>
            <FieldLabel>Select all permissions</FieldLabel>
          </Field>
        </main>
      </DethinkProvider>,
    );

    expect(screen.getByLabelText("Select all permissions")).toHaveAttribute(
      "aria-checked",
      "mixed",
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });
});
